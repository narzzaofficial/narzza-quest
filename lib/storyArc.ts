const ARC_DURATION_DAYS = 14;

/** Days remaining + progress percentage for a story arc (zeroed out when not active). */
export function computeArcProgress(endDate: string, isActive: boolean): { daysRemaining: number; progressPct: number } {
    if (!isActive) return { daysRemaining: 0, progressPct: 0 };
    const daysRemaining = Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000));
    const daysElapsed = ARC_DURATION_DAYS - daysRemaining;
    const progressPct = Math.min(100, (daysElapsed / ARC_DURATION_DAYS) * 100);
    return { daysRemaining, progressPct };
}
