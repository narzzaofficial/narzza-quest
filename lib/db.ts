import {
    doc, getDoc, setDoc, updateDoc,
    collection, addDoc, query, where,
    orderBy, getDocs, onSnapshot, limit,
    writeBatch, deleteField, arrayUnion,
    increment
} from "firebase/firestore";

import { db } from "./firebase";
import {
    UserProfile, Quest, JournalEntry, Notification,
    QuestStatus, calculateLevel, LEVEL_TITLES, getExpToNextLevel
} from "@/types";

// ─────────────────────────────────────────
// USER
// ─────────────────────────────────────────

export async function createUserProfile(
    uid: string,
    data: Partial<UserProfile>
): Promise<UserProfile> {
    const profile: UserProfile = {
        uid,
        email: data.email || "",
        displayName: data.displayName || "Hero",
        role: data.role || "player",
        level: 1,
        exp: 0,
        expToNextLevel: 100,
        title: "Rookie Adventurer",
        streak: 0,
        lastActiveDate: new Date().toISOString().split("T")[0],
        totalQuestsCompleted: 0,
        totalHoursWorked: 0,
        createdAt: new Date().toISOString(),
        ...data,
    };
    await setDoc(doc(db, "users", uid), profile);
    return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(
    uid: string,
    data: Partial<UserProfile>
): Promise<void> {
    await updateDoc(doc(db, "users", uid), { ...data });
}

export async function sendPartnerRequest(senderUid: string, receiverEmail: string): Promise<string | null> {
    const senderSnap = await getDoc(doc(db, "users", senderUid));
    const sender = senderSnap.data() as UserProfile;

    const q = query(collection(db, "users"), where("email", "==", receiverEmail));
    const snap = await getDocs(q);
    if (snap.empty) return null; // Email tidak ditemukan

    const receiver = snap.docs[0].data() as UserProfile;

    // Update profil penerima dengan data request dari pengirim
    await updateDoc(doc(db, "users", receiver.uid), {
        pendingPartnerRequest: {
            uid: sender.uid,
            email: sender.email,
            displayName: sender.displayName
        }
    });
    return receiver.uid;
}

export async function acceptPartnerRequest(receiverUid: string, senderUid: string): Promise<void> {
    const batch = writeBatch(db);

    // Update penerima: masukkan senderUid ke DALAM ARRAY partnerIds
    batch.update(doc(db, "users", receiverUid), {
        partnerIds: arrayUnion(senderUid), // arrayUnion akan menambah data tanpa menduplikat
        pendingPartnerRequest: deleteField()
    });

    // Update pengirim: masukkan receiverUid ke DALAM ARRAY partnerIds
    batch.update(doc(db, "users", senderUid), {
        partnerIds: arrayUnion(receiverUid)
    });

    await batch.commit();
}

export async function rejectPartnerRequest(receiverUid: string): Promise<void> {
    await updateDoc(doc(db, "users", receiverUid), {
        pendingPartnerRequest: deleteField()
    });
}

// ─────────────────────────────────────────
// QUESTS
// ─────────────────────────────────────────

export async function createQuest(
    questData: Omit<Quest, "id" | "createdAt" | "updatedAt">
): Promise<string> {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, "quests"), {
        ...questData,
        createdAt: now,
        updatedAt: now,
    });
    return docRef.id;
}

export async function getPlayerQuests(playerUid: string): Promise<Quest[]> {
    const q = query(
        collection(db, "quests"),
        where("assignedTo", "==", playerUid),
        orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quest));
}

export async function updateQuestStatus(
    questId: string,
    status: QuestStatus,
    extra?: Partial<Quest>
): Promise<void> {
    await updateDoc(doc(db, "quests", questId), {
        status,
        updatedAt: new Date().toISOString(),
        ...extra,
    });
}

export const submitQuest = async (questId: string, note: string, urls: string[] = []) => {
    try {
        const questRef = doc(db, 'quests', questId);
        await updateDoc(questRef, {
            status: 'submitted',
            submissionNote: note,
            submissionUrls: urls, // <-- Simpan array URL ke Firebase
            submittedAt: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error("Error submitting quest:", error);
        throw error;
    }
};

export const getQuestById = async (questId: string): Promise<Quest | null> => {
    try {
        const questRef = doc(db, 'quests', questId);
        const questSnap = await getDoc(questRef);

        if (questSnap.exists()) {
            return { id: questSnap.id, ...questSnap.data() } as Quest;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching quest by ID:", error);
        return null;
    }
};

export async function approveQuest(
    questId: string,
    quest: Quest,
    playerProfile: UserProfile,
    reviewNote: string,
    bonusExp: number = 0
): Promise<{ level: number; exp: number; expToNextLevel: number; expEarned: number }> {
    const totalExpEarned = quest.expReward + bonusExp;
    const currentCumulative = getCumulativeExp(playerProfile);
    const newCumulative = currentCumulative + totalExpEarned;
    const { level, exp, expToNextLevel } = calculateLevel(newCumulative);
    const title = LEVEL_TITLES[Math.min(level, 10)] || "Mythic Legend";

    const moneyToAdd = quest.moneyReward || 0;

    const batch = writeBatch(db);

    batch.update(doc(db, "quests", questId), {
        status: "approved",
        reviewedAt: new Date().toISOString(),
        reviewNote,
        bonusExp,
        updatedAt: new Date().toISOString(),
    });

    // 2. Siapkan data yang akan di-update ke profil Hero
    const userUpdatePayload: any = {
        level,
        exp,
        expToNextLevel,
        title,
        totalQuestsCompleted: playerProfile.totalQuestsCompleted + 1,
        totalHoursWorked: playerProfile.totalHoursWorked + (quest.timeWorkedSeconds || 0) / 3600,
    };

    // 💰 3. MAGIC TRICK: Jika ada uangnya, tambahkan ke Dompet khusus GM pemberi quest
    if (moneyToAdd > 0) {
        // Ini akan otomatis membuat/menambah field "balances.UID_GM" dengan aman
        userUpdatePayload[`balances.${quest.createdBy}`] = increment(moneyToAdd);
    }

    batch.update(doc(db, "users", playerProfile.uid), userUpdatePayload);

    await batch.commit();

    // 4. Catat juga ke Journal sebagai "Struk / Bukti Transaksi"
    await addDoc(collection(db, "journals"), {
        questId,
        questTitle: quest.title,
        content: quest.submissionNote || "",
        imageUrl: quest.submissionImageUrl || null,
        timeWorkedSeconds: quest.timeWorkedSeconds || 0,
        expEarned: totalExpEarned,
        moneyEarned: moneyToAdd, // 💰 Catat pemasukan di jurnal
        createdAt: new Date().toISOString(),
        authorId: playerProfile.uid,
    });

    return { level, exp, expToNextLevel, expEarned: totalExpEarned };
}

function getCumulativeExp(profile: UserProfile): number {
    let total = 0;
    for (let i = 1; i < profile.level; i++) {
        total += getExpToNextLevel(i);
    }
    return total + profile.exp;
}

export async function rejectQuest(
    questId: string,
    reviewNote: string
): Promise<void> {
    await updateQuestStatus(questId, "rejected", {
        reviewedAt: new Date().toISOString(),
        reviewNote,
    });
}

// ─────────────────────────────────────────
// REALTIME SUBSCRIPTIONS
// ─────────────────────────────────────────

export function subscribeToQuests(
    playerUid: string,
    callback: (quests: Quest[]) => void
) {
    const q = query(
        collection(db, "quests"),
        where("assignedTo", "==", playerUid),
        orderBy("createdAt", "desc"),
        limit(20)
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quest)));
    });
}

export function subscribeToSubmissions(
    gmUid: string,
    callback: (quests: Quest[]) => void
) {
    const q = query(
        collection(db, "quests"),
        where("createdBy", "==", gmUid),
        where("status", "==", "submitted"),
        orderBy("submittedAt", "desc")
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quest)));
    });
}

// ─────────────────────────────────────────
// JOURNALS
// ─────────────────────────────────────────

export async function getJournals(playerUid: string): Promise<JournalEntry[]> {
    const q = query(
        collection(db, "journals"),
        where("authorId", "==", playerUid),
        orderBy("createdAt", "desc"),
        limit(30)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as JournalEntry));
}

// ─────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────

export async function sendNotification(
    notif: Omit<Notification, "id" | "createdAt" | "isRead">
): Promise<void> {
    await addDoc(collection(db, "notifications"), {
        ...notif,
        isRead: false,
        createdAt: new Date().toISOString(),
    });
}

export async function getNotifications(uid: string): Promise<Notification[]> {
    const q = query(
        collection(db, "notifications"),
        where("toUid", "==", uid),
        orderBy("createdAt", "desc"),
        limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
}

export async function markNotificationRead(notifId: string): Promise<void> {
    await updateDoc(doc(db, "notifications", notifId), { isRead: true });
}

export function subscribeToNotifications(
    uid: string,
    callback: (notifs: Notification[]) => void
) {
    const q = query(
        collection(db, "notifications"),
        where("toUid", "==", uid),
        where("isRead", "==", false),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification)));
    });
}

// ─── FUNGSI UNTUK MENGAMBIL BANYAK PROFIL SEKALIGUS ───
export async function getLinkedProfiles(uids: string[]): Promise<UserProfile[]> {
    if (!uids || uids.length === 0) return [];

    // Firestore 'in' query mendukung maksimal 10 item per request. 
    // Kita potong-potong (chunk) agar aman kalau member guild-nya banyak.
    const chunks = [];
    for (let i = 0; i < uids.length; i += 10) {
        chunks.push(uids.slice(i, i + 10));
    }

    let profiles: UserProfile[] = [];
    for (const chunk of chunks) {
        const q = query(collection(db, "users"), where("uid", "in", chunk));
        const snap = await getDocs(q);
        profiles = [...profiles, ...snap.docs.map(d => d.data() as UserProfile)];
    }

    return profiles;
}

// ─────────────────────────────────────────
// WITHDRAWALS (PENCAIRAN DANA)
// ─────────────────────────────────────────

// 1. Hero mengajukan penarikan
export async function createWithdrawalRequest(heroProfile: UserProfile, gmUid: string, amount: number) {
    const batch = writeBatch(db);

    // Potong saldo hero (menggunakan increment negatif)
    const userRef = doc(db, 'users', heroProfile.uid);
    batch.update(userRef, {
        [`balances.${gmUid}`]: increment(-amount)
    });

    // Buat dokumen pencairan
    const wdRef = doc(collection(db, 'withdrawals'));
    batch.set(wdRef, {
        heroUid: heroProfile.uid,
        gmUid: gmUid,
        heroName: heroProfile.displayName,
        amount: amount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    await batch.commit();

    // Kirim notifikasi ke GM
    await sendNotification({
        toUid: gmUid,
        fromUid: heroProfile.uid,
        fromName: heroProfile.displayName,
        type: 'reminder',
        title: '💸 Tagihan Pencairan Baru',
        message: `${heroProfile.displayName} meminta pencairan Rp ${amount.toLocaleString('id-ID')}. Mohon segera upload bukti transfer.`
    });
}

// 2. GM mengunggah bukti transfer
export async function submitWithdrawalProof(withdrawalId: string, proofUrl: string) {
    await updateDoc(doc(db, "withdrawals", withdrawalId), {
        status: 'transfer_submitted',
        proofUrl: proofUrl,
        updatedAt: new Date().toISOString(),
    });
}

// 3. Hero menyetujui atau menolak bukti transfer
export async function resolveWithdrawal(
    withdrawalId: string, 
    action: 'approve' | 'reject', 
    rejectNote: string = ""
) {
    if (action === 'approve') {
        await updateDoc(doc(db, "withdrawals", withdrawalId), {
            status: 'completed',
            updatedAt: new Date().toISOString(),
            note: "Terkonfirmasi oleh Hero."
        });
    } else {
        // Kalau di-reject, status kembali ke pending agar GM bisa upload ulang
        await updateDoc(doc(db, "withdrawals", withdrawalId), {
            status: 'pending',
            updatedAt: new Date().toISOString(),
            note: rejectNote, // Alasan kenapa ditolak (misal: "Gambar burem" atau "Uang belum masuk")
            proofUrl: null // Hapus bukti yang salah
        });
    }
}

// Realtime listener untuk Hero (melihat status penarikannya)
export function subscribeToHeroWithdrawals(heroUid: string, callback: (wds: any[]) => void) {
    const q = query(collection(db, "withdrawals"), where("heroUid", "==", heroUid), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}

// Realtime listener untuk GM (melihat tagihan dari Hero)
export function subscribeToGMWithdrawals(gmUid: string, callback: (wds: any[]) => void) {
    const q = query(collection(db, "withdrawals"), where("gmUid", "==", gmUid), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}