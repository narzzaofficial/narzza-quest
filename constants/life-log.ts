export const ENERGY_LABELS = ['Habis', 'Rendah', 'Cukup', 'Tinggi', 'Full'] as const;

export function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export function formatDuration(min: number) {
    if (min < 60) return `${min} mnt`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h} jam ${m} mnt` : `${h} jam`;
}
