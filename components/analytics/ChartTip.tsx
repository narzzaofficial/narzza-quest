'use client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ChartTip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-line glass px-3 py-2 shadow-pop text-xs">
            {label && <p className="font-bold text-ink mb-1">{label}</p>}
            {payload.map((p: { name: string; value: number; color: string }, i: number) => (
                <p key={i} style={{ color: p.color }} className="font-semibold">
                    {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
                </p>
            ))}
        </div>
    );
}
