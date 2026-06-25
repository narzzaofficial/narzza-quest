'use client';

import { useEffect, useState } from 'react';
import { EVENTS, STATUS, type EventData, type Step } from 'react-joyride';
import { useAuth } from '@/hooks/useAuth';
import { useGoal } from '@/hooks/useGoal';
import { markOnboardingTourSeen } from '@/lib/db';

/** Drives a per-page product tour and persists completion (per `tourKey`) on the profile once it ends. */
export function useOnboardingTour(tourKey: string, steps: Step[]) {
    const { profile, refreshProfile } = useAuth();
    const { hasGoal } = useGoal();
    const [isDesktop, setIsDesktop] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(min-width: 768px)').matches;
    });

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)');
        const onChange = () => setIsDesktop(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    const alreadySeen = profile?.completedOnboardingTours?.includes(tourKey) ?? false;
    const run = Boolean(isDesktop && profile && profile.role === 'player' && hasGoal && !alreadySeen);

    const handleEvent = (data: EventData) => {
        if (data.type !== EVENTS.TOUR_END) return;
        if (data.status !== STATUS.FINISHED && data.status !== STATUS.SKIPPED) return;
        if (!profile) return;
        void markOnboardingTourSeen(profile.uid, tourKey).then(refreshProfile);
    };

    return { steps, run, handleEvent };
}
