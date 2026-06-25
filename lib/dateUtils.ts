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

// ── Shared Indonesian-locale display formatters ───────────────────
// Input dates from a plain YYYY-MM-DD use 'T12:00:00Z' (local noon) so the
// formatted day never shifts when the browser's timezone is behind UTC.

/** "Senin, 5 Januari 2026" */
export function formatFullDateID(dateStr: string): string {
    return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
}

/** "5 Jan 2026" */
export function formatShortDateID(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "5 Jan" (no year) — for compact deadline chips. */
export function formatDeadlineShort(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

/** "5 Jan 2026, 14.30" — full date + time. */
export function formatDateTimeID(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** "14.30" — time only. */
export function formatTimeOnlyID(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' });
}
