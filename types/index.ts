export type UserRole = "player" | "gm";


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
