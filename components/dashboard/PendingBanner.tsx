'use client';

export function PendingBanner({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <div className="bg-warn-soft border border-warn/20 text-warn rounded-card px-4 py-3 text-sm font-semibold">
            {count} laporan/tugas menunggu sinkronisasi offline — otomatis terkirim saat online.
        </div>
    );
}
