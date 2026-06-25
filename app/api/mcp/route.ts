import { z } from "zod";
import { createMcpHandler } from "mcp-handler";
import { withMcpAuth } from "better-auth/plugins";
import { auth } from "@/lib/auth";
import admin, { adminDb, adminAuth } from "@/lib/firebase-admin";
import { generateQuestDrafts, type QuestGenContext } from "@/lib/ai/questGenerator";
import { reviewQuestSubmission, type QuestReviewContext } from "@/lib/ai/questReviewer";
import { formatGoal } from "@/constants/goal";
import { AI_GM_ID } from "@/constants/ai";
import { calculateLevel, getCumulativeExp, LEVEL_TITLES, type GoalProfile } from "@/types";

// Mirrors the constants in lib/db.ts's approveQuest (not exported from there).
const MAX_HEARTS = 5;
const COMPLETIONS_PER_HEART_RECOVERY = 3;

function textResult(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

/**
 * Maps the logged-in Better Auth user to their Firestore uid by email match
 * against Firebase Auth — no manual uid lookup/config needed per user.
 */
async function resolveFirestoreUid(betterAuthUserId: string): Promise<string> {
    const ctx = await auth.$context;
    const user = await ctx.adapter.findOne<{ email: string }>({
        model: "user",
        where: [{ field: "id", value: betterAuthUserId }],
    });
    if (!user?.email) throw new Error("Better Auth user has no email on record.");
    const fbUser = await adminAuth.getUserByEmail(user.email);
    return fbUser.uid;
}

const handler = withMcpAuth(auth, async (req, session) => {
    const uid = await resolveFirestoreUid(session.userId as string);

    const mcpHandler = createMcpHandler(
        (server) => {
            server.tool(
                "get_profile",
                "Get the player's level, EXP, streak, hearts, and title.",
                {},
                async () => {
                    const snap = await adminDb.collection("users").doc(uid).get();
                    if (!snap.exists) return textResult({ error: "Profile not found." });
                    const { level, exp, expToNextLevel, title, streak, hearts, totalQuestsCompleted, totalHoursWorked } = snap.data() as Record<string, unknown>;
                    return textResult({ level, exp, expToNextLevel, title, streak, hearts, totalQuestsCompleted, totalHoursWorked });
                },
            );

            server.tool(
                "get_active_quests",
                "List the player's quests that are still pending or in progress.",
                {},
                async () => {
                    const snap = await adminDb
                        .collection("quests")
                        .where("assignedTo", "==", uid)
                        .where("status", "in", ["pending", "in_progress"])
                        .limit(50)
                        .get();
                    const quests = snap.docs.map((d) => {
                        const { title, description, category, difficulty, expReward, deadline, status } = d.data() as Record<string, unknown>;
                        return { id: d.id, title, description, category, difficulty, expReward, deadline, status };
                    });
                    return textResult({ quests });
                },
            );

            server.tool(
                "generate_quest",
                "Ask the AI Game Master to generate new quest(s) tailored to the player's level, streak, active story arc, and long-term goal — mirrors the in-app 'Generate Quest' button. Saves them as pending quests assigned to the player.",
                { count: z.number().int().min(1).max(4).default(1) },
                { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
                async ({ count }) => {
                    const [userSnap, arcSnap] = await Promise.all([
                        adminDb.collection("users").doc(uid).get(),
                        adminDb.collection("storyArcs").where("uid", "==", uid).where("status", "==", "active").orderBy("startDate", "desc").limit(1).get(),
                    ]);
                    if (!userSnap.exists) return textResult({ error: "Profile not found." });
                    const profile = userSnap.data() as Record<string, unknown>;
                    const arc = arcSnap.docs[0]?.data() as Record<string, unknown> | undefined;

                    const ctx: QuestGenContext = {
                        displayName: (profile.displayName as string) ?? "Hero",
                        level: profile.level as number,
                        title: profile.title as string,
                        streak: (profile.streak as number) ?? 0,
                        totalQuestsCompleted: (profile.totalQuestsCompleted as number) ?? 0,
                        memorySummary: formatGoal(profile.goal as GoalProfile | undefined) || undefined,
                        count,
                        arcTheme: arc?.theme as string | undefined,
                        arcNarrative: arc?.narrative as string | undefined,
                        arcWeeklyGoals: arc?.weeklyGoals as string[] | undefined,
                        aiSettings: profile.aiSettings as QuestGenContext["aiSettings"],
                    };

                    const drafts = await generateQuestDrafts(ctx);
                    const now = new Date().toISOString();
                    const deadline = (() => {
                        const d = new Date();
                        d.setHours(23, 59, 59, 0);
                        return d.toISOString();
                    })();
                    const batch = adminDb.batch();
                    const refs = drafts.map(() => adminDb.collection("quests").doc());
                    drafts.forEach((d, i) => {
                        batch.set(refs[i], {
                            ...d,
                            deadline,
                            status: "pending",
                            assignedTo: uid,
                            createdBy: AI_GM_ID,
                            createdAt: now,
                            updatedAt: now,
                        });
                    });
                    await batch.commit();
                    return textResult({ success: true, quests: drafts.map((d, i) => ({ id: refs[i].id, ...d })) });
                },
            );

            server.tool(
                "submit_quest",
                "Submit one of the player's pending/in-progress quests as completed, with a short note about what was done. This only marks it submitted for review — it does not grant EXP; review_quest (or in-app review) does that.",
                { questId: z.string().min(1), note: z.string().min(1).max(2000) },
                { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
                async ({ questId, note }) => {
                    const questRef = adminDb.collection("quests").doc(questId);
                    const snap = await questRef.get();
                    if (!snap.exists || (snap.data() as Record<string, unknown>).assignedTo !== uid) {
                        return textResult({ error: "Quest not found." });
                    }
                    const status = (snap.data() as Record<string, unknown>).status;
                    if (status !== "pending" && status !== "in_progress") {
                        return textResult({ error: `Quest is already "${status}", cannot submit.` });
                    }
                    const now = new Date().toISOString();
                    await questRef.update({
                        status: "submitted",
                        submissionNote: note,
                        submissionUrls: [],
                        submittedAt: now,
                        updatedAt: now,
                    });
                    return textResult({ success: true });
                },
            );

            server.tool(
                "review_quest",
                "Have the AI Game Master review one of the player's submitted quests, using the same rubric as the in-app solo-mode auto-review. On approval, grants EXP/streak/hearts and logs a journal entry. On rejection, returns feedback without granting EXP.",
                { questId: z.string().min(1), hasProof: z.boolean().default(false) },
                { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
                async ({ questId, hasProof }) => {
                    const questRef = adminDb.collection("quests").doc(questId);
                    const [questSnap, userSnap] = await Promise.all([questRef.get(), adminDb.collection("users").doc(uid).get()]);
                    if (!questSnap.exists || (questSnap.data() as Record<string, unknown>).assignedTo !== uid) {
                        return textResult({ error: "Quest not found." });
                    }
                    const quest = questSnap.data() as Record<string, unknown>;
                    if (quest.status !== "submitted") {
                        return textResult({ error: `Quest is "${quest.status}", not awaiting review.` });
                    }
                    if (!userSnap.exists) return textResult({ error: "Profile not found." });
                    const profile = userSnap.data() as Record<string, unknown>;

                    const reviewCtx: QuestReviewContext = {
                        title: quest.title as string,
                        description: quest.description as string,
                        difficulty: quest.difficulty as string,
                        expReward: quest.expReward as number,
                        submissionNote: (quest.submissionNote as string) ?? "",
                        hasProof,
                        playerLevel: profile.level as number,
                        goalSummary: formatGoal(profile.goal as GoalProfile | undefined) || undefined,
                        aiSettings: profile.aiSettings as QuestReviewContext["aiSettings"],
                    };
                    const review = await reviewQuestSubmission(reviewCtx);
                    const now = new Date().toISOString();

                    if (review.decision === "reject") {
                        await questRef.update({ status: "rejected", reviewedAt: now, reviewNote: review.feedback, updatedAt: now });
                        return textResult({ decision: "reject", feedback: review.feedback });
                    }

                    // Approve — ports lib/db.ts's approveQuest to the Admin SDK (same leveling/streak/hearts math, reused via @/types).
                    const expReward = quest.expReward as number;
                    const totalExpEarned = expReward + review.bonusExp;
                    const currentCumulative = getCumulativeExp({ level: profile.level as number, exp: profile.exp as number });
                    const { level, exp, expToNextLevel } = calculateLevel(currentCumulative + totalExpEarned);
                    const newTitle = LEVEL_TITLES[Math.min(level, 10)] || "Mythic Legend";
                    const moneyToAdd = (quest.moneyReward as number) || 0;

                    const todayStr = now.slice(0, 10);
                    const lastActive = (profile.lastActiveDate as string) || "";
                    let newStreak = (profile.streak as number) || 0;
                    if (lastActive !== todayStr) {
                        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
                        newStreak = lastActive === yesterday ? newStreak + 1 : 1;
                    }

                    const currentHearts = (profile.hearts as number) ?? MAX_HEARTS;
                    let nextHearts = currentHearts;
                    let nextRecoveryStreak = (profile.heartRecoveryStreak as number) || 0;
                    const submittedAt = quest.submittedAt as string | undefined;
                    const deadline = quest.deadline as string;
                    const completedOnTime = !!submittedAt && new Date(submittedAt).getTime() <= new Date(deadline).getTime();
                    if (completedOnTime) {
                        nextRecoveryStreak += 1;
                        if (nextHearts < MAX_HEARTS && nextRecoveryStreak >= COMPLETIONS_PER_HEART_RECOVERY) {
                            nextHearts += 1;
                            nextRecoveryStreak = 0;
                        }
                    }

                    const batch = adminDb.batch();
                    batch.update(questRef, { status: "approved", reviewedAt: now, reviewNote: review.feedback, bonusExp: review.bonusExp, updatedAt: now });

                    const userUpdatePayload: Record<string, unknown> = {
                        level,
                        exp,
                        expToNextLevel,
                        title: newTitle,
                        totalQuestsCompleted: ((profile.totalQuestsCompleted as number) || 0) + 1,
                        totalHoursWorked: ((profile.totalHoursWorked as number) || 0) + ((quest.timeWorkedSeconds as number) || 0) / 3600,
                        streak: newStreak,
                        lastActiveDate: todayStr,
                        hearts: nextHearts,
                        heartRecoveryStreak: nextRecoveryStreak,
                        missStrikeCount: completedOnTime ? 0 : (profile.missStrikeCount as number) || 0,
                    };
                    if (moneyToAdd > 0) {
                        userUpdatePayload[`balances.${quest.createdBy}`] = admin.firestore.FieldValue.increment(moneyToAdd);
                    }
                    batch.update(adminDb.collection("users").doc(uid), userUpdatePayload);
                    await batch.commit();

                    await adminDb.collection("journals").add({
                        questId,
                        questTitle: quest.title,
                        content: (quest.submissionNote as string) || "",
                        imageUrl: (quest.submissionImageUrl as string) || null,
                        timeWorkedSeconds: (quest.timeWorkedSeconds as number) || 0,
                        expEarned: totalExpEarned,
                        moneyEarned: moneyToAdd,
                        createdAt: now,
                        authorId: uid,
                    });

                    return textResult({ decision: "approve", feedback: review.feedback, expEarned: totalExpEarned, level, exp, expToNextLevel });
                },
            );

            server.tool(
                "get_finance_summary",
                "Get a summary of the player's financial assets (balances) and active goals.",
                {},
                async () => {
                    const [assetsSnap, goalsSnap] = await Promise.all([
                        adminDb.collection("financial_assets").where("uid", "==", uid).orderBy("createdAt", "asc").get(),
                        adminDb.collection("financial_goals").where("uid", "==", uid).orderBy("createdAt", "desc").get(),
                    ]);
                    const assets = assetsSnap.docs.map((d) => {
                        const { name, type, balance, currency } = d.data() as Record<string, unknown>;
                        return { id: d.id, name, type, balance, currency };
                    });
                    const goals = goalsSnap.docs
                        .map((d) => d.data() as Record<string, unknown>)
                        .filter((g) => g.status === "active")
                        .map((g) => ({ title: g.title, targetAmount: g.targetAmount, currentAmount: g.currentAmount, currency: g.currency }));
                    return textResult({ assets, goals });
                },
            );

            server.tool(
                "get_recent_transactions",
                "List the player's most recent financial transactions.",
                { count: z.number().int().min(1).max(50).default(10) },
                async ({ count }) => {
                    const snap = await adminDb
                        .collection("financial_transactions")
                        .where("uid", "==", uid)
                        .orderBy("timestamp", "desc")
                        .limit(count)
                        .get();
                    const transactions = snap.docs.map((d) => {
                        const { type, amount, category, merchant, title, date } = d.data() as Record<string, unknown>;
                        return { id: d.id, type, amount, category, merchant, title, date };
                    });
                    return textResult({ transactions });
                },
            );

            server.tool(
                "get_recent_journals",
                "List the player's most recent journal entries.",
                { count: z.number().int().min(1).max(50).default(10) },
                async ({ count }) => {
                    const snap = await adminDb
                        .collection("journals")
                        .where("authorId", "==", uid)
                        .orderBy("createdAt", "desc")
                        .limit(count)
                        .get();
                    const journals = snap.docs.map((d) => {
                        const { content, questTitle, expEarned, createdAt } = d.data() as Record<string, unknown>;
                        return { content, questTitle, expEarned, createdAt };
                    });
                    return textResult({ journals });
                },
            );

            server.tool(
                "get_personal_journals",
                "List the player's most recent private personal journal entries (separate from quest journals).",
                { count: z.number().int().min(1).max(50).default(10) },
                async ({ count }) => {
                    const snap = await adminDb
                        .collection("personal_journals")
                        .where("uid", "==", uid)
                        .orderBy("createdAt", "desc")
                        .limit(count)
                        .get();
                    const journals = snap.docs.map((d) => {
                        const { content, mood, visibility, createdAt } = d.data() as Record<string, unknown>;
                        return { id: d.id, content, mood, visibility, createdAt };
                    });
                    return textResult({ journals });
                },
            );

            server.tool(
                "get_habits",
                "List the player's tracked habits along with their completion logs over the last 14 days.",
                {},
                async () => {
                    const today = new Date();
                    const fromDate = new Date(today.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
                    const toDate = today.toISOString().slice(0, 10);
                    const [habitsSnap, logsSnap] = await Promise.all([
                        adminDb.collection("habits").where("uid", "==", uid).orderBy("createdAt", "asc").get(),
                        adminDb.collection("habitLogs").where("uid", "==", uid).where("date", ">=", fromDate).where("date", "<=", toDate).get(),
                    ]);
                    const habits = habitsSnap.docs.map((d) => {
                        const { name, icon, category, targetDays } = d.data() as Record<string, unknown>;
                        return { id: d.id, name, icon, category, targetDays };
                    });
                    const logs = logsSnap.docs.map((d) => {
                        const { habitId, date, completed } = d.data() as Record<string, unknown>;
                        return { habitId, date, completed };
                    });
                    return textResult({ habits, recentLogs: logs });
                },
            );

            server.tool(
                "get_activity_log",
                "List the player's logged daily activities (mood, energy, category) over a recent period.",
                { days: z.number().int().min(1).max(30).default(7) },
                async ({ days }) => {
                    const today = new Date();
                    const from = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000).toISOString();
                    const to = today.toISOString();
                    const snap = await adminDb
                        .collection("activities")
                        .where("uid", "==", uid)
                        .where("createdAt", ">=", from)
                        .where("createdAt", "<=", to)
                        .orderBy("createdAt", "asc")
                        .get();
                    const activities = snap.docs.map((d) => {
                        const { title, category, mood, energy, note, startTime, endTime } = d.data() as Record<string, unknown>;
                        return { id: d.id, title, category, mood, energy, note, startTime, endTime };
                    });
                    return textResult({ activities });
                },
            );

            server.tool(
                "get_goal_and_arc",
                "Get the player's long-term aspiration/focus areas and their currently active story arc.",
                {},
                async () => {
                    const [userSnap, arcSnap] = await Promise.all([
                        adminDb.collection("users").doc(uid).get(),
                        adminDb.collection("storyArcs").where("uid", "==", uid).where("status", "==", "active").orderBy("startDate", "desc").limit(1).get(),
                    ]);
                    const goal = (userSnap.data() as Record<string, unknown> | undefined)?.goal ?? null;
                    const arcDoc = arcSnap.docs[0];
                    const activeArc = arcDoc
                        ? (() => {
                              const { title, theme, narrative, weeklyGoals, startDate, endDate, questsCompleted } = arcDoc.data() as Record<string, unknown>;
                              return { title, theme, narrative, weeklyGoals, startDate, endDate, questsCompleted };
                          })()
                        : null;
                    return textResult({ goal, activeArc });
                },
            );

            const activityCategory = z.enum(["work", "learning", "health", "social", "personal", "rest", "commute"]);

            server.tool(
                "log_activity",
                "Log a completed activity entry (title, category, mood, energy, optional duration in minutes). Does not affect any other in-progress activity.",
                {
                    title: z.string().min(1).max(200),
                    category: activityCategory,
                    mood: z.number().int().min(1).max(5),
                    energy: z.number().int().min(1).max(5),
                    note: z.string().max(1000).optional(),
                    durationMinutes: z.number().int().min(0).max(1440).default(0),
                },
                { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
                async ({ title, category, mood, energy, note, durationMinutes }) => {
                    const startTime = new Date();
                    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
                    const ref = await adminDb.collection("activities").add({
                        uid,
                        title,
                        category,
                        mood,
                        energy,
                        note: note ?? null,
                        startTime: startTime.toISOString(),
                        endTime: durationMinutes > 0 ? endTime.toISOString() : null,
                        createdAt: startTime.toISOString(),
                    });
                    return textResult({ success: true, id: ref.id });
                },
            );

            server.tool(
                "complete_habit",
                "Mark one of the player's habits as completed (or not) for a given date (defaults to today).",
                {
                    habitId: z.string().min(1),
                    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
                    completed: z.boolean().default(true),
                },
                { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
                async ({ habitId, date, completed }) => {
                    const habitSnap = await adminDb.collection("habits").doc(habitId).get();
                    if (!habitSnap.exists || (habitSnap.data() as Record<string, unknown>).uid !== uid) {
                        return textResult({ error: "Habit not found." });
                    }
                    const day = date ?? new Date().toISOString().slice(0, 10);
                    const logId = `${uid}_${habitId}_${day}`;
                    await adminDb.collection("habitLogs").doc(logId).set(
                        { id: logId, uid, habitId, date: day, completed, createdAt: new Date().toISOString() },
                        { merge: true },
                    );
                    return textResult({ success: true });
                },
            );

            server.tool(
                "add_personal_journal",
                "Create a new private personal journal entry for the player.",
                {
                    content: z.string().min(1).max(5000),
                    mood: z.number().int().min(1).max(5).optional(),
                },
                { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
                async ({ content, mood }) => {
                    const now = new Date().toISOString();
                    const ref = await adminDb.collection("personal_journals").add({
                        uid,
                        content,
                        visibility: "private",
                        mood: mood ?? null,
                        createdAt: now,
                        updatedAt: now,
                    });
                    return textResult({ success: true, id: ref.id });
                },
            );

            server.tool(
                "start_activity",
                "Start a new in-progress activity (a live timer). Automatically ends any other activity the player currently has running.",
                {
                    title: z.string().min(1).max(200),
                    category: activityCategory,
                    mood: z.number().int().min(1).max(5),
                    energy: z.number().int().min(1).max(5),
                    note: z.string().max(1000).optional(),
                },
                { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
                async ({ title, category, mood, energy, note }) => {
                    const now = new Date().toISOString();
                    const openSnap = await adminDb.collection("activities").where("uid", "==", uid).where("endTime", "==", null).limit(1).get();
                    const batch = adminDb.batch();
                    openSnap.docs.forEach((d) => batch.update(d.ref, { endTime: now }));
                    const newRef = adminDb.collection("activities").doc();
                    batch.set(newRef, { uid, title, category, mood, energy, note: note ?? null, startTime: now, endTime: null, createdAt: now });
                    await batch.commit();
                    return textResult({ success: true, id: newRef.id });
                },
            );

            server.tool(
                "end_current_activity",
                "End the player's currently in-progress activity, if any.",
                {},
                { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
                async () => {
                    const now = new Date().toISOString();
                    const openSnap = await adminDb.collection("activities").where("uid", "==", uid).where("endTime", "==", null).limit(1).get();
                    if (openSnap.empty) return textResult({ error: "No activity is currently in progress." });
                    await openSnap.docs[0].ref.update({ endTime: now });
                    const { title } = openSnap.docs[0].data() as Record<string, unknown>;
                    return textResult({ success: true, title, endTime: now });
                },
            );

            server.tool(
                "log_transaction",
                "Record an income or expense transaction against one of the player's financial assets (wallets/accounts), updating its balance. Use get_finance_summary first to find the right assetId.",
                {
                    assetId: z.string().min(1),
                    type: z.enum(["income", "expense"]),
                    amount: z.number().positive(),
                    category: z.string().min(1).max(50),
                    title: z.string().min(1).max(200),
                    merchant: z.string().max(200).optional(),
                    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
                },
                { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
                async ({ assetId, type, amount, category, title, merchant, date }) => {
                    const assetRef = adminDb.collection("financial_assets").doc(assetId);
                    const assetSnap = await assetRef.get();
                    if (!assetSnap.exists || (assetSnap.data() as Record<string, unknown>).uid !== uid) {
                        return textResult({ error: "Asset not found." });
                    }
                    const now = new Date();
                    const day = date ?? now.toISOString().slice(0, 10);
                    const batch = adminDb.batch();
                    const txRef = adminDb.collection("financial_transactions").doc();
                    batch.set(txRef, {
                        uid,
                        assetId,
                        amount,
                        type,
                        category,
                        title,
                        merchant: merchant ?? null,
                        date: day,
                        timestamp: now.toISOString(),
                        createdAt: now.toISOString(),
                    });
                    batch.update(assetRef, {
                        balance: admin.firestore.FieldValue.increment(type === "expense" ? -amount : amount),
                        updatedAt: now.toISOString(),
                    });
                    await batch.commit();
                    return textResult({ success: true, id: txRef.id });
                },
            );

            server.tool(
                "add_financial_goal",
                "Create a new financial savings goal for the player.",
                {
                    title: z.string().min(1).max(200),
                    targetAmount: z.number().positive(),
                    currency: z.string().min(1).max(10).default("IDR"),
                    deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
                },
                { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
                async ({ title, targetAmount, currency, deadline }) => {
                    const now = new Date().toISOString();
                    const ref = await adminDb.collection("financial_goals").add({
                        uid,
                        title,
                        targetAmount,
                        currentAmount: 0,
                        currency,
                        deadline: deadline ?? null,
                        status: "active",
                        createdAt: now,
                        updatedAt: now,
                    });
                    return textResult({ success: true, id: ref.id });
                },
            );

            const workTaskStatus = z.enum(["todo", "in_progress", "done", "blocked"]);

            server.tool(
                "get_work_tasks",
                "List the player's work tasks, optionally filtered by status (defaults to todo/in_progress/blocked, i.e. not yet done).",
                { status: workTaskStatus.optional() },
                async ({ status }) => {
                    let q: admin.firestore.Query = adminDb.collection("workTasks").where("uid", "==", uid);
                    q = status ? q.where("status", "==", status) : q.where("status", "in", ["todo", "in_progress", "blocked"]);
                    const snap = await q.limit(50).get();
                    const tasks = snap.docs.map((d) => {
                        const { title, description, project, priority, status, deadline } = d.data() as Record<string, unknown>;
                        return { id: d.id, title, description, project, priority, status, deadline };
                    });
                    return textResult({ tasks });
                },
            );

            server.tool(
                "create_work_task",
                "Create a new work task for the player.",
                {
                    title: z.string().min(1).max(200),
                    description: z.string().max(2000).optional(),
                    project: z.string().max(200).optional(),
                    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
                    deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
                },
                { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
                async ({ title, description, project, priority, deadline }) => {
                    const now = new Date().toISOString();
                    const ref = await adminDb.collection("workTasks").add({
                        uid,
                        title,
                        description: description ?? null,
                        project: project ?? null,
                        priority,
                        status: "todo",
                        deadline: deadline ?? null,
                        createdAt: now,
                        updatedAt: now,
                    });
                    return textResult({ success: true, id: ref.id });
                },
            );

            server.tool(
                "update_work_task_status",
                "Update the status of one of the player's work tasks.",
                { taskId: z.string().min(1), status: workTaskStatus },
                { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
                async ({ taskId, status }) => {
                    const taskRef = adminDb.collection("workTasks").doc(taskId);
                    const taskSnap = await taskRef.get();
                    if (!taskSnap.exists || (taskSnap.data() as Record<string, unknown>).uid !== uid) {
                        return textResult({ error: "Task not found." });
                    }
                    const now = new Date().toISOString();
                    await taskRef.update({ status, updatedAt: now, ...(status === "done" ? { completedAt: now } : {}) });
                    return textResult({ success: true });
                },
            );

            server.tool(
                "get_spending_summary",
                "Get an aggregated summary of income/expense totals and spending-by-category over a recent period (e.g. 'how much did I spend on food this month'), grouped by currency.",
                { days: z.number().int().min(1).max(365).default(30) },
                async ({ days }) => {
                    const now = new Date();
                    const from = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000).toISOString();
                    const to = now.toISOString();
                    // Reuses the same uid+timestamp(desc) index as get_recent_transactions instead of
                    // a uid+timestamp-range query, which would need a new Firestore composite index —
                    // filters the date range in JS instead.
                    const [assetsSnap, txSnap] = await Promise.all([
                        adminDb.collection("financial_assets").where("uid", "==", uid).get(),
                        adminDb.collection("financial_transactions").where("uid", "==", uid).orderBy("timestamp", "desc").limit(1000).get(),
                    ]);
                    const currencyByAsset = new Map(assetsSnap.docs.map((d) => [d.id, (d.data() as Record<string, unknown>).currency as string]));

                    const byCurrency = new Map<string, { totalIncome: number; totalExpense: number; byCategory: Map<string, number> }>();
                    for (const d of txSnap.docs) {
                        const { assetId, amount, type, category, timestamp } = d.data() as Record<string, unknown>;
                        if ((timestamp as string) < from || (timestamp as string) > to) continue;
                        const currency = currencyByAsset.get(assetId as string) ?? "IDR";
                        if (!byCurrency.has(currency)) byCurrency.set(currency, { totalIncome: 0, totalExpense: 0, byCategory: new Map() });
                        const s = byCurrency.get(currency)!;
                        if (type === "income") {
                            s.totalIncome += amount as number;
                        } else if (type === "expense") {
                            s.totalExpense += amount as number;
                            s.byCategory.set(category as string, (s.byCategory.get(category as string) ?? 0) + (amount as number));
                        }
                    }

                    const summary = Array.from(byCurrency.entries()).map(([currency, s]) => ({
                        currency,
                        totalIncome: s.totalIncome,
                        totalExpense: s.totalExpense,
                        net: s.totalIncome - s.totalExpense,
                        byCategory: Array.from(s.byCategory.entries())
                            .map(([category, total]) => ({ category, total }))
                            .sort((a, b) => b.total - a.total),
                    }));

                    return textResult({ from: from.slice(0, 10), to: to.slice(0, 10), summary });
                },
            );

            server.tool(
                "delete_transaction",
                "Delete one of the player's financial transactions and revert its effect on the related asset/goal balances.",
                { transactionId: z.string().min(1) },
                { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
                async ({ transactionId }) => {
                    const txRef = adminDb.collection("financial_transactions").doc(transactionId);
                    const txSnap = await txRef.get();
                    if (!txSnap.exists || (txSnap.data() as Record<string, unknown>).uid !== uid) {
                        return textResult({ error: "Transaction not found." });
                    }
                    const tx = txSnap.data() as Record<string, unknown>;
                    const now = new Date().toISOString();
                    const batch = adminDb.batch();
                    batch.delete(txRef);

                    const amount = tx.amount as number;
                    const revertAmount = tx.type === "income" ? -amount : amount;
                    batch.update(adminDb.collection("financial_assets").doc(tx.assetId as string), {
                        balance: admin.firestore.FieldValue.increment(revertAmount),
                        updatedAt: now,
                    });

                    if (tx.type === "transfer") {
                        const received = (tx.toAmount as number | undefined) ?? amount;
                        if (tx.toAssetId) {
                            batch.update(adminDb.collection("financial_assets").doc(tx.toAssetId as string), {
                                balance: admin.firestore.FieldValue.increment(-received),
                                updatedAt: now,
                            });
                        } else if (tx.toGoalId) {
                            batch.update(adminDb.collection("financial_goals").doc(tx.toGoalId as string), {
                                currentAmount: admin.firestore.FieldValue.increment(-received),
                                updatedAt: now,
                            });
                        }
                    }

                    await batch.commit();
                    return textResult({ success: true });
                },
            );

            server.tool(
                "delete_activity",
                "Delete one of the player's logged activity entries.",
                { activityId: z.string().min(1) },
                { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
                async ({ activityId }) => {
                    const ref = adminDb.collection("activities").doc(activityId);
                    const snap = await ref.get();
                    if (!snap.exists || (snap.data() as Record<string, unknown>).uid !== uid) {
                        return textResult({ error: "Activity not found." });
                    }
                    await ref.delete();
                    return textResult({ success: true });
                },
            );

            server.tool(
                "delete_personal_journal",
                "Delete one of the player's private personal journal entries.",
                { journalId: z.string().min(1) },
                { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
                async ({ journalId }) => {
                    const ref = adminDb.collection("personal_journals").doc(journalId);
                    const snap = await ref.get();
                    if (!snap.exists || (snap.data() as Record<string, unknown>).uid !== uid) {
                        return textResult({ error: "Journal entry not found." });
                    }
                    await ref.delete();
                    return textResult({ success: true });
                },
            );
        },
        {},
        { basePath: "/api" },
    );

    return mcpHandler(req);
});

export { handler as GET, handler as POST, handler as DELETE };
