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
}

export type QuestCategory = 'daily' | 'weekly' | 'main' | 'side';
export type QuestStatus = "pending" | "in_progress" | "submitted" | "approved" | "rejected" | "active";
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
    type: "quest_assigned" | "quest_approved" | "quest_rejected" | "encouragement" | "reminder";
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
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

export const LEVEL_TITLES: Record<number, string> = {
    1: "Rookie Adventurer",
    2: "Apprentice",
    3: "Journeyman",
    4: "Skilled Fighter",
    5: "Elite Warrior",
    6: "Expert Strategist",
    7: "Master Tactician",
    8: "Grand Champion",
    9: "Legendary Hero",
    10: "Mythic Legend",
};

export const DIFFICULTY_EXP: Record<QuestDifficulty, number> = {
    E: 50,
    D: 100,
    C: 200,
    B: 350,
    A: 500,
    S: 1000,
};

export function getExpToNextLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function calculateLevel(totalExp: number): {
    level: number;
    exp: number;
    expToNextLevel: number;
} {
    let level = 1;
    let remainingExp = totalExp;
    while (remainingExp >= getExpToNextLevel(level)) {
        remainingExp -= getExpToNextLevel(level);
        level++;
        if (level >= 10) break;
    }
    return {
        level,
        exp: remainingExp,
        expToNextLevel: getExpToNextLevel(level),
    };
}