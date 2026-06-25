'use client';

import { X } from 'lucide-react';
import type { TooltipRenderProps } from 'react-joyride';

export default function OnboardingTourTooltip({
    backProps, closeProps, index, isLastStep, primaryProps, size, skipProps, step, tooltipProps,
}: TooltipRenderProps) {
    const showBack = index > 0 && step.buttons.includes('back');
    const showSkip = !isLastStep && step.buttons.includes('skip');

    return (
        <div
            {...tooltipProps}
            className="w-[min(360px,calc(100vw-2rem))] rounded-card border border-line bg-surface p-5 shadow-pop"
        >
            <div className="flex items-start justify-between gap-3">
                {step.title && <h3 className="text-base font-extrabold text-ink leading-snug">{step.title}</h3>}
                {step.buttons.includes('close') && (
                    <button
                        {...closeProps}
                        className="-mr-1 -mt-1 shrink-0 rounded-lg p-1 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="mt-2 text-sm leading-relaxed text-ink-soft">{step.content}</div>

            {size > 1 && (
                <div className="mt-4 flex items-center gap-1">
                    {Array.from({ length: size }).map((_, i) => (
                        <span
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${i <= index ? 'bg-brand' : 'bg-surface-2'}`}
                        />
                    ))}
                </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                    {showSkip && (
                        <button {...skipProps} className="text-xs font-bold text-ink-muted transition-colors hover:text-ink">
                            {step.locale.skip}
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {showBack && (
                        <button
                            {...backProps}
                            className="rounded-xl px-3 py-2 text-xs font-bold text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
                        >
                            {step.locale.back}
                        </button>
                    )}
                    <button
                        {...primaryProps}
                        className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-card transition-colors hover:bg-brand-hover"
                    >
                        {isLastStep ? step.locale.last : step.locale.next}
                    </button>
                </div>
            </div>
        </div>
    );
}
