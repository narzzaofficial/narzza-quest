'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
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
        if (!file.type.startsWith('image/')) {
            throw new Error('File harus berupa gambar.');
        }
        setIsUploading(true);
        try {
            const ext = file.name.split('.').pop() ?? 'jpg';
            const storageRef = ref(storage, `avatars/${profile.uid}/avatar.${ext}`);
            const snapshot = await uploadBytes(storageRef, file, { contentType: file.type });
            const url = await getDownloadURL(snapshot.ref);
            await updateDoc(doc(db, 'users', profile.uid), { avatar: url });
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
