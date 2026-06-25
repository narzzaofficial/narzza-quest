'use client';

import { STATUS, useJoyride, type Step } from 'react-joyride';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import OnboardingTourTooltip from '@/components/system/OnboardingTourTooltip';
import OnboardingSpotlightOverlay from '@/components/system/OnboardingSpotlightOverlay';

const locale = {
    back: 'Kembali',
    close: 'Tutup',
    last: 'Selesai',
    next: 'Lanjut',
    skip: 'Lewati',
};

interface Props {
    /** Unique key persisted on the profile once this tour is finished/skipped (e.g. "dashboard", "ai-gm"). */
    tourKey: string;
    steps: Step[];
}

export default function OnboardingTour({ tourKey, steps: tourSteps }: Props) {
    const { steps, run, handleEvent } = useOnboardingTour(tourKey, tourSteps);

    const { controls, state, step, Tour } = useJoyride({
        steps,
        run,
        continuous: true,
        scrollToFirstStep: true,
        locale,
        onEvent: handleEvent,
        tooltipComponent: OnboardingTourTooltip,
        options: {
            hideOverlay: true,
            skipBeacon: true,
            arrowColor: 'var(--color-surface)',
            zIndex: 10000,
            buttons: ['back', 'skip', 'close', 'primary'],
        },
    });

    const showOverlay = state.status === STATUS.RUNNING && step && typeof step.target === 'string';

    return (
        <>
            {showOverlay && step && (
                <OnboardingSpotlightOverlay
                    target={step.target as string}
                    placement={step.placement}
                    padding={step.spotlightPadding}
                    radius={step.spotlightRadius}
                    onDismiss={() => controls.close()}
                />
            )}
            {Tour}
        </>
    );
}
