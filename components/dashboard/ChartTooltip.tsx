'use client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-line glass px-3 py-2 shadow-pop text-xs">
            <p className="font-bold text-ink mb-0.5">{label}</p>
            <p className="text-brand font-semibold">{payload[0].value} EXP</p>
        </div>
    );
}
