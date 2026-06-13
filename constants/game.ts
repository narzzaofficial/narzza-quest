import type { QuestDifficulty } from "@/types";

// ─────────────────────────────────────────
// LEVELING TABLES
// ─────────────────────────────────────────

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

export const MAX_LEVEL = 10;

export const DIFFICULTY_EXP: Record<QuestDifficulty, number> = {
    E: 50,
    D: 100,
    C: 200,
    B: 350,
    A: 500,
    S: 1000,
};

// ─────────────────────────────────────────
// GAME BALANCE (hearts / deadline discipline)
// ─────────────────────────────────────────

export const MAX_HEARTS = 5;
export const MISSES_PER_HEART_LOSS = 3;
export const COMPLETIONS_PER_HEART_RECOVERY = 3;
export const MIN_DEADLINE_PENALTY_EXP = 10;
export const DEADLINE_PENALTY_RATE = 0.2; // 20% of quest exp reward
