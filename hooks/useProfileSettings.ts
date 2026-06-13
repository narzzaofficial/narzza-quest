'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB

/** Profile settings logic: avatar upload + display name save. */
export function useProfileSettings() {
    const { profile, loading, refreshProfile } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    async function uploadAvatar(file: File): Promise<void> {
        if (!profile) return;
        if (file.size > MAX_AVATAR_BYTES) {
            throw new Error('Ukuran file terlalu besar! Maksimal 2MB.');
        }
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Gagal mengunggah gambar.');
            const data = await res.json();
            await updateDoc(doc(db, 'users', profile.uid), { avatar: data.url });
            await refreshProfile();
        } finally {
            setIsUploading(false);
        }
    }

    async function saveName(displayName: string): Promise<void> {
        if (!profile) return;
        setIsSaving(true);
        try {
            await updateDoc(doc(db, 'users', profile.uid), { displayName });
            await refreshProfile();
        } finally {
            setIsSaving(false);
        }
    }

    return { profile, loading, isSaving, isUploading, uploadAvatar, saveName };
}
