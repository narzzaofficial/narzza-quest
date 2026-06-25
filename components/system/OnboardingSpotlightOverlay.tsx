'use client';

import { useEffect, useId, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

interface SpotlightPadding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

interface SpotlightRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface Props {
    target: string;
    placement?: string;
    padding: SpotlightPadding;
    radius: number;
    onDismiss: () => void;
}

const OVERLAY_COLOR = 'rgba(15, 23, 42, 0.62)';
const BLUR_FILTER = 'blur(10px)';
// Must stay above page content with its own stacking context (e.g. any `position: relative`
// element rendered later in the DOM than this overlay), and below Joyride's own zIndex (10000).
const OVERLAY_Z_INDEX = 9999;

/** Blurs everything except the active tour target, with a precise rounded-rect cutout that stays sharp. */
export default function OnboardingSpotlightOverlay({ target, placement, padding, radius, onDismiss }: Props) {
    const isCentered = placement === 'center' || target === 'body';
    const [rect, setRect] = useState<SpotlightRect | null>(null);
    const maskId = `onboarding-spotlight-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

    useEffect(() => {
        // Centered steps have no real target to measure — the render branch below
        // already ignores `rect` whenever `isCentered` is true, so there's nothing to sync here.
        if (isCentered) return;

        const recalc = () => {
            const el = document.querySelector(target);
            if (!el) {
                setRect(null);
                return;
            }
            const r = el.getBoundingClientRect();
            setRect({
                top: r.top - padding.top,
                left: r.left - padding.left,
                width: r.width + padding.left + padding.right,
                height: r.height + padding.top + padding.bottom,
            });
        };

        const raf = requestAnimationFrame(recalc);
        window.addEventListener('resize', recalc);
        window.addEventListener('scroll', recalc, true);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', recalc);
            window.removeEventListener('scroll', recalc, true);
        };
    }, [target, padding.top, padding.right, padding.bottom, padding.left, isCentered]);

    const fullScreenStyle: CSSProperties = {
        position: 'fixed',
        inset: 0,
        zIndex: OVERLAY_Z_INDEX,
        backgroundColor: OVERLAY_COLOR,
        backdropFilter: BLUR_FILTER,
        WebkitBackdropFilter: BLUR_FILTER,
        pointerEvents: 'auto',
    };

    // Render straight into <body> so `position: fixed` always measures against the real
    // viewport, instead of an ancestor that happens to set `filter`/`backdrop-filter`/`transform`
    // (which turns into the containing block for fixed descendants per the CSS spec — any
    // `.glass` card up the tree would otherwise clip this overlay short of the real screen edges).
    if (typeof document === 'undefined') return null;

    if (isCentered || !rect) {
        return createPortal(<div style={fullScreenStyle} onClick={onDismiss} />, document.body);
    }

    return createPortal(
        <>
            <svg width="0" height="0" style={{ position: 'fixed' }} aria-hidden="true">
                <defs>
                    <mask id={maskId} maskContentUnits="userSpaceOnUse">
                        <rect x="-2000" y="-2000" width="100000" height="100000" fill="white" />
                        <rect x={rect.left} y={rect.top} width={rect.width} height={rect.height} rx={radius} fill="black" />
                    </mask>
                </defs>
            </svg>
            <div
                style={{
                    ...fullScreenStyle,
                    mask: `url(#${maskId})`,
                    WebkitMask: `url(#${maskId})`,
                }}
                onClick={onDismiss}
            />
            <div
                className="fixed pointer-events-none"
                style={{
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    zIndex: OVERLAY_Z_INDEX,
                    borderRadius: radius,
                    boxShadow: '0 0 0 2px var(--color-brand), 0 0 0 6px rgba(59, 130, 246, 0.18)',
                }}
            />
        </>,
        document.body
    );
}
