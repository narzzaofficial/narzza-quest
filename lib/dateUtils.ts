/**
 * Convert any Date or UTC ISO string to a local YYYY-MM-DD string.
 * Uses the browser/runtime's local timezone — so WIB (UTC+7) users
 * see dates in their timezone, not UTC.
 */
export function localDateStr(input: Date | string): string {
    const d = typeof input === 'string' ? new Date(input) : input;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/** Today's local date as YYYY-MM-DD */
export function todayLocal(): string {
    return localDateStr(new Date());
}

/** N days ago local date as YYYY-MM-DD */
export function daysAgoLocal(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return localDateStr(d);
}
