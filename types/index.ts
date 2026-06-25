export type UserRole = "player" | "gm" | "superadmin";


export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
    partnerIds?: string[]; // GANTI JADI ARRAY INI
    pendingPartnerRequest?: {
        uid: string;
        email: string;
        displayName: string;
        avatar?: string;
    };
    avatar?: string;
    level: number;
    exp: number;
    expToNextLevel: number;
    title: string;
    streak: number;
    lastActiveDate: string;
    totalQuestsCompleted: number;
    balances?: Record<string, number>;
    totalHoursWorked: number;
    createdAt: string;

    // North Star — user's long-term goal, primary anchor for the AI
    goal?: GoalProfile;

    // Badge tracking timestamps
    lastQuestCheck?: Date | null;
    lastJournalCheck?: Date | null;
    lastArenaCheck?: Date | null;
    lastNetworkCheck?: Date | null;
    lastHeroCheck?: Date | null;
    lastSubmissionCheck?: Date | null;

    // GM specific fields
    needsEncouragement?: boolean;

    // Deadline discipline system
    hearts?: number;
    missStrikeCount?: number;
    heartRecoveryStreak?: number;

    // AI Configuration (OpenRouter)
    aiSettings?: {
        useOpenRouter: boolean;
        openRouterApiKey: string;
        openRouterModel: string;
    };

    // Telegram notifications/reports
    telegramChatId?: string;

    // Per-page onboarding tours the user has already seen (e.g. "dashboard", "ai-gm")
    completedOnboardingTours?: string[];
}

export interface GoalProfile {
    aspiration: string;     // free text: "mau jadi apa & kenapa"
    focusAreas: string[];   // tags: coding, bahasa, fitness…
    timeframe?: string;     // e.g. "6 bulan"
    updatedAt: string;
}

export type QuestCategory = 'daily' | 'weekly' | 'main' | 'side';
export type QuestStatus = "pending" | "in_progress" | "submitted" | "approved" | "rejected" | "active" | "missed";
export type QuestDifficulty = "E" | "D" | "C" | "B" | "A" | "S";

export interface Quest {
    id: string;
    title: string;
    description: string;
    category: QuestCategory;
    difficulty: QuestDifficulty;
    expReward: number;
    deadline: string;
    status: QuestStatus;
    createdBy: string;
    motivation: string;
    assignedTo: string;
    createdAt: string;
    updatedAt: string;
    submittedAt?: string;
    submissionNote?: string;
    submissionImageUrl?: string | null;
    submissionUrls?: string[];
    timeWorkedSeconds?: number;
    moneyReward?: number;
    reviewedAt?: string;
    reviewNote?: string;
    bonusExp?: number;
    needsReview?: boolean; // GM flag untuk quest yang perlu review
    missedAt?: string;
    deadlinePenaltyExp?: number;
}

export interface JournalEntry {
    id: string;
    uid: string; // Author/owner uid
    questId?: string;
    questTitle?: string;
    content: string;
    imageUrl?: string;
    timeWorkedSeconds: number;
    expEarned: number;
    createdAt: string;
    authorId: string;
}

export interface PersonalJournal {
    id: string;
    uid: string;
    content: string;
    mood?: 1 | 2 | 3 | 4 | 5;
    visibility?: 'private' | 'gm';
    createdAt: string;
    updatedAt: string;
}

export type TimelineItem = 
    | { type: 'quest', data: Quest, sortDate: number }
    | { type: 'personal', data: PersonalJournal, sortDate: number };


export interface Notification {
    id: string;
    toUid: string;
    fromUid: string;
    fromName: string;
    type:
        | "quest_assigned"
        | "quest_approved"
        | "quest_rejected"
        | "quest_created"
        | "encouragement"
        | "reminder"
        | "withdrawal_requested"
        | "withdrawal_transferred"
        | "withdrawal_confirmed"
        | "withdrawal_rejected"
        | "guild_quest_open"    // GM → all heroes: quest publik dibuka
        | "guild_quest_claimed"; // hero → GM: hero mengambil quest publik
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    refId?: string; // optional reference ID (e.g. withdrawalId, questId)
}

// ─────────────────────────────────────────
// GUILD QUEST (Public / Open Quest)
// ─────────────────────────────────────────

export type GuildQuestStatus = 'open' | 'closed';

export interface GuildQuest {
    id: string;
    title: string;
    description: string;
    motivation?: string;
    category: QuestCategory;
    difficulty: QuestDifficulty;
    expReward: number;
    moneyReward?: number;
    deadline: string;
    createdBy: string;       // GM uid
    createdByName: string;   // GM display name
    maxClaims: number;       // Max hero yang bisa ambil
    claimedBy: string[];     // Array hero uid yang sudah ambil
    status: GuildQuestStatus;
    createdAt: string;
    updatedAt: string;
}

// ─────────────────────────────────────────
// WITHDRAWAL
// ─────────────────────────────────────────

export type WithdrawalStatus = 'pending' | 'transfer_submitted' | 'completed';

export interface Withdrawal {
    id: string;
    heroUid: string;
    gmUid: string;
    heroName: string; // Biar GM gampang lihat siapa yang narik
    amount: number;
    status: WithdrawalStatus;
    proofUrl?: string; // Link foto bukti transfer dari GM
    note?: string; // Pesan penolakan dari Hero (jika ada)
    createdAt: string;
    updatedAt: string;
}

// Battle/Arena types
export interface Battle {
    id: string;
    participants: string[]; // Array of user UIDs
    status: 'pending' | 'active' | 'completed';
    challengerId: string;
    challengedId: string;
    createdAt: string;
    completedAt?: string;
}

// Connection/Network types
export interface Connection {
    id: string;
    fromUid: string;
    toUid: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

// Submission types (for GM review)
export interface Submission {
    id: string;
    questId: string;
    userId: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    reviewedAt?: string;
    note?: string;
}

// ─────────────────────────────────────────
// Re-exports (moved to constants/ and lib/ for separation of concerns).
// Kept here so existing `@/types` imports keep working.
// ─────────────────────────────────────────
export { LEVEL_TITLES, DIFFICULTY_EXP, MAX_LEVEL } from "@/constants/game";
export { getExpToNextLevel, calculateLevel, getCumulativeExp } from "@/lib/leveling";

// ─────────────────────────────────────────
// AI GAME MASTER (memory + daily review)
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// GM PROACTIVE MESSAGES
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// STORY ARC
// ─────────────────────────────────────────

export interface StoryArc {
    id: string;
    uid: string;
    arcNumber: number;          // 1, 2, 3…
    title: string;              // "Arc I: Fondasi Petualang"
    theme: string;              // tema singkat, dipakai di quest generator
    narrative: string;          // GM opening narration
    weeklyGoals: string[];      // 2 weekly goals
    startDate: string;          // YYYY-MM-DD
    endDate: string;            // YYYY-MM-DD (startDate + 14 hari)
    status: 'active' | 'completed';
    questsCompleted: number;    // approved quests during arc
    completedAt?: string;
}

export type GMMessageType =
    | 'streak_warning'
    | 'idle_warning'
    | 'quest_deadline'
    | 'welcome_back'
    | 'level_up'
    | 'daily_check';

export interface GMMessage {
    id: string;
    uid: string;
    type: GMMessageType;
    content: string;          // AI-generated message text
    createdAt: string;
    isRead: boolean;
    priority: 'high' | 'normal';
}

export interface AIMemory {
    uid: string;
    summary: string;       // short narrative the AI keeps about the user
    insights: string[];    // bullet facts/patterns
    updatedAt: string;
}

export interface DailyReview {
    uid: string;
    date: string;          // YYYY-MM-DD
    summary: string;
    wins: string[];
    focus: string[];       // suggestions for tomorrow
    encouragement: string;
    questsCompleted: number;
    expEarned: number;
    createdAt: string;
}

// ─────────────────────────────────────────
// LIFE LOG — Activity Tracker
// ─────────────────────────────────────────

export type ActivityCategory =
    | 'work'
    | 'learning'
    | 'health'
    | 'social'
    | 'personal'
    | 'rest'
    | 'commute';

export interface ActivityEntry {
    id: string;
    uid: string;
    title: string;
    category: ActivityCategory;
    mood: 1 | 2 | 3 | 4 | 5;
    energy: 1 | 2 | 3 | 4 | 5;
    note?: string;
    startTime: string;   // ISO — when activity started
    endTime?: string;    // ISO — undefined = currently active
    createdAt: string;
}

// ─────────────────────────────────────────
// WORK TASKS — Company / External Tasks
// ─────────────────────────────────────────

export type WorkTaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type WorkTaskStatus   = 'todo' | 'in_progress' | 'done' | 'blocked';

export interface WorkTask {
    id: string;
    uid: string;
    title: string;
    description?: string;
    project?: string;
    assignedBy?: string;
    priority: WorkTaskPriority;
    status: WorkTaskStatus;
    deadline?: string;
    estimatedHours?: number;
    actualHours?: number;
    blocker?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

// ─────────────────────────────────────────
// USER SITUATION — AI Context Snapshot
// ─────────────────────────────────────────

export type UserStatusType = 'busy' | 'normal' | 'relaxed' | 'on_leave' | 'sick';
export type WorkloadLevel   = 'high' | 'medium' | 'low';

export interface UserSituation {
    uid: string;
    currentStatus: UserStatusType;
    weekFocus: string;
    workload: WorkloadLevel;
    activeProjects: string[];
    contextNote: string;       // free text injected into AI
    updatedAt: string;
}

// ─────────────────────────────────────────
// HABITS
// ─────────────────────────────────────────

export interface Habit {
    id: string;
    uid: string;
    name: string;
    icon: string;              // emoji e.g. "🏋️"
    category: ActivityCategory;
    targetDays: number[];      // 0=Sun..6=Sat, empty = every day
    createdAt: string;
}

export interface HabitLog {
    id: string;
    uid: string;
    habitId: string;
    date: string;              // YYYY-MM-DD
    completed: boolean;
    createdAt: string;
}

// ─────────────────────────────────────────
// LIFE FINANCE — Asset & Expense Tracking
// ─────────────────────────────────────────

export type AssetType = 'bank' | 'ewallet' | 'investment' | 'cash' | 'crypto';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type GoalStatus = 'active' | 'achieved';

export interface FinancialAsset {
    id: string;
    uid: string;
    name: string;
    type: AssetType;
    balance: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
}

export interface FinancialTransaction {
    id: string;
    uid: string;
    assetId: string;           // The asset involved
    toAssetId?: string;        // Target asset (only used if type is 'transfer')
    toGoalId?: string;         // Target financial goal (only used if type is 'transfer')
    amount: number;            // Amount in asset's currency (deducted/added to asset)
    toAmount?: number;         // Amount received in target asset (for cross-currency transfers)
    transferFee?: number;      // Transfer fee amount
    transferFeeType?: 'add_to_source' | 'deduct_from_target'; // How the fee was applied
    originalAmount?: number;   // The amount entered by user in txCurrency
    originalCurrency?: string; // The currency selected by user for the transaction
    type: TransactionType;
    category: string;          // Main category e.g. Food, Transport
    merchant?: string;         // Payee / Store name
    tags?: string[];           // Additional labels e.g. 'impulse-buy', 'need'
    context?: string;          // Emotion/reason e.g. 'stress-relief'
    isRecurring?: boolean;     // Monthly bills flag
    title: string;             // Short description
    date: string;              // YYYY-MM-DD
    timestamp: string;         // ISO date/time for peak hour analysis
    createdAt: string;
}

export interface FinancialGoal {
    id: string;
    uid: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    currency: string;
    deadline?: string;         // YYYY-MM-DD
    status: GoalStatus;
    createdAt: string;
    updatedAt: string;
}
