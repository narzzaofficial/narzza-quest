'use client';

import { useEffect } from 'react';

const INTERACTIVE = 'button, a, [role="button"], [role="tab"], [role="checkbox"], label[for], input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"]';

function vibrate(ms: number) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(ms);
    }
}

/**
 * Adds tactile haptic feedback to all interactive elements via event delegation.
 * Uses short 12ms pulse for nav/links and 20ms for action buttons.
 * Silently no-ops on devices without Vibration API (iOS, desktop).
 */
export function HapticProvider() {
    useEffect(() => {
        function handlePointerDown(e: PointerEvent) {
            if (e.pointerType === 'mouse') return;
            const target = (e.target as Element)?.closest(INTERACTIVE);
            if (!target) return;

            const isAction =
                target.tagName === 'BUTTON' ||
                target.getAttribute('type') === 'submit' ||
                target.getAttribute('role') === 'button';

            vibrate(isAction ? 20 : 12);
        }

        document.addEventListener('pointerdown', handlePointerDown, { passive: true });
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, []);

    return null;
}
