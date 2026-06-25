'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types';

/** Editable profile + AI-settings form state, synced from the loaded profile. */
export function useProfileForm(
    profile: UserProfile | null,
    saveProfile: (displayName: string, aiSettings?: UserProfile['aiSettings']) => Promise<void>
) {
    const [displayName, setDisplayName] = useState('');
    const [useOpenRouter, setUseOpenRouter] = useState(false);
    const [openRouterApiKey, setOpenRouterApiKey] = useState('');
    const [openRouterModel, setOpenRouterModel] = useState('');

    useEffect(() => {
        if (!profile) return;
        setDisplayName(profile.displayName || '');
        setUseOpenRouter(profile.aiSettings?.useOpenRouter || false);
        setOpenRouterApiKey(profile.aiSettings?.openRouterApiKey || '');
        setOpenRouterModel(profile.aiSettings?.openRouterModel || '');
    }, [profile]);

    async function saveForm(): Promise<void> {
        await saveProfile(displayName, { useOpenRouter, openRouterApiKey, openRouterModel });
    }

    return {
        displayName, setDisplayName,
        useOpenRouter, setUseOpenRouter,
        openRouterApiKey, setOpenRouterApiKey,
        openRouterModel, setOpenRouterModel,
        saveForm,
    };
}
