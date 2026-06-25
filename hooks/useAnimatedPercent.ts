'use client';

import { useEffect, useRef, useState } from 'react';

/** Animates a 0-100 value toward `target` with an ease-out cubic curve. */
export function useAnimatedPercent(target: number, duration = 1200) {
    const [displayPct, setDisplayPct] = useState(0);
    const [smoothPct, setSmoothPct] = useState(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const start = performance.now();
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
            setSmoothPct(eased * target);
            setDisplayPct(Math.round(eased * target));
            if (t < 1) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [target, duration]);

    return { displayPct, smoothPct };
}
