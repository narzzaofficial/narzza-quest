'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { saveUserGoal } from '@/lib/db';
import { hasGoal } from '@/constants/goal';

export interface GoalInput {
    aspiration: string;
    focusAreas: string[];
    timeframe?: string;
}

/** Read/write the user's North Star goal. */
export function useGoal() {
    const { profile, refreshProfile } = useAuth();
    const goal = profile?.goal ?? null;
    const [saving, setSaving] = useState(false);

    const save = async (data: GoalInput) => {
        if (!profile) return;
        setSaving(true);
        try {
            await saveUserGoal(profile.uid, data);
            await refreshProfile();
        } finally {
            setSaving(false);
        }
    };

    return { goal, hasGoal: hasGoal(goal), saving, save };
}
