import { MAX_LEVEL } from "@/constants/game";
import type { UserProfile } from "@/types";

/**
 * EXP required to advance FROM `level` to the next level.
 * Grows exponentially (1.5x per level).
 */
export function getExpToNextLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * Convert a total cumulative EXP value into level + progress within that level.
 */
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
        if (level >= MAX_LEVEL) break;
    }
    return {
        level,
        exp: remainingExp,
        expToNextLevel: getExpToNextLevel(level),
    };
}

/**
 * Reconstruct a player's total cumulative EXP from their current level + in-level exp.
 */
export function getCumulativeExp(profile: Pick<UserProfile, "level" | "exp">): number {
    let total = 0;
    for (let i = 1; i < profile.level; i++) {
        total += getExpToNextLevel(i);
    }
    return total + profile.exp;
}
