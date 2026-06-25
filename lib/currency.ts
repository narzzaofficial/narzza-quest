/** Formats an integer amount as "Rp 12.345" (id-ID grouping, no decimals). */
export function formatRupiah(value: number): string {
    return `Rp ${value.toLocaleString('id-ID')}`;
}
