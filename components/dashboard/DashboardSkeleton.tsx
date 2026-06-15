'use client';

export function DashboardSkeleton() {
    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-[3px] border-brand border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-ink-muted font-bold tracking-widest text-xs uppercase">Memuat data petualangan…</p>
                </div>
            </div>
        </div>
    );
}
