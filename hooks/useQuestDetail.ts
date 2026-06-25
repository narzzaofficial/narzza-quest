'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { getQuestById, submitQuest } from '@/lib/db';
import { runAIReview } from './useAIReview';
import { enqueueOfflineItem, getQueuedSubmitForQuest, upsertOfflineSubmitItem } from '@/lib/offlineQueue';
import { isAIQuest } from '@/constants/ai';
import type { Quest } from '@/types';

/** Quest detail page logic: fetch, accept, file selection, submit (with offline-queue fallback + AI auto-review). */
export function useQuestDetail(id: string | undefined) {
    const router = useRouter();
    const { profile, refreshProfile } = useAuth();

    const [quest, setQuest] = useState<Quest | null>(null);
    const [loading, setLoading] = useState(true);

    const [submissionNote, setSubmissionNote] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [hasQueuedSubmission, setHasQueuedSubmission] = useState(false);

    useEffect(() => {
        if (!id) return;
        getQuestById(id).then((data) => {
            setQuest(data);
            if (data?.status === 'rejected') setSubmissionNote(data.submissionNote || '');
            setLoading(false);
        });
    }, [id]);

    useEffect(() => {
        const loadQueuedSubmission = async () => {
            if (!id) return;
            const queued = await getQueuedSubmitForQuest(id);
            if (queued) {
                setHasQueuedSubmission(true);
                setSubmissionNote(queued.submissionNote || '');
                setSelectedFiles([]);
            } else {
                setHasQueuedSubmission(false);
            }
        };
        const onQueueUpdated = () => { void loadQueuedSubmission(); };
        void loadQueuedSubmission();
        window.addEventListener('offline-queue-updated', onQueueUpdated as EventListener);
        return () => window.removeEventListener('offline-queue-updated', onQueueUpdated as EventListener);
    }, [id]);

    const acceptQuest = async () => {
        if (!quest) return;
        if (new Date(quest.deadline).getTime() <= Date.now()) {
            alert('Quest ini sudah melewati deadline dan tidak bisa diambil lagi.');
            setQuest({ ...quest, status: 'missed' });
            return;
        }
        setIsSubmitting(true);
        try {
            await updateDoc(doc(db, 'quests', quest.id), { status: 'in_progress' });
            setQuest({ ...quest, status: 'in_progress' });
        } catch (error) {
            console.error('Gagal mengambil quest:', error);
            if (!navigator.onLine) {
                const idToken = await auth.currentUser?.getIdToken();
                if (!idToken) {
                    alert('Sesi login tidak ditemukan. Silakan login ulang saat online.');
                    return;
                }
                await enqueueOfflineItem({ type: 'accept_quest', questId: quest.id, idToken, createdAt: Date.now() });
                setQuest({ ...quest, status: 'in_progress' });
                alert("Kamu sedang offline. Status 'mulai quest' disimpan dan akan disinkron saat online.");
            } else {
                alert('Gagal memulai quest.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectFiles = (files: FileList | null) => {
        if (files) setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
    };

    const removeFile = (indexToRemove: number) => {
        setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const submit = async () => {
        if (!quest || !profile) return;

        const queueSubmission = async () => {
            const idToken = await auth.currentUser?.getIdToken();
            if (!idToken) throw new Error('Sesi login tidak ditemukan. Silakan login ulang saat online.');
            const existingQueued = await getQueuedSubmitForQuest(quest.id);
            const queuedFiles =
                selectedFiles.length > 0
                    ? selectedFiles.map((file) => ({ name: file.name, type: file.type, lastModified: file.lastModified, blob: file }))
                    : existingQueued?.files || [];
            if (queuedFiles.length === 0) throw new Error('Minimal ada 1 file bukti agar bisa disimpan offline.');
            await upsertOfflineSubmitItem({ type: 'submit_quest', questId: quest.id, idToken, submissionNote, files: queuedFiles, createdAt: Date.now() });
            setHasQueuedSubmission(true);
        };

        setIsSubmitting(true);
        try {
            if (!navigator.onLine) {
                try {
                    await queueSubmission();
                    alert('Kamu offline. Laporan disimpan dan akan otomatis di-upload saat online.');
                    router.push('/quest-board');
                } catch (queueError) {
                    alert(queueError instanceof Error ? queueError.message : 'Gagal menyimpan laporan offline.');
                }
                return;
            }

            const uploadedUrls: string[] = [];
            for (let i = 0; i < selectedFiles.length; i++) {
                setUploadProgress(`Mengunggah bukti ${i + 1} dari ${selectedFiles.length}...`);
                const file = selectedFiles[i];
                const formData = new FormData();
                formData.append('file', file);
                formData.append('questId', quest.id);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                if (!res.ok) throw new Error(`Gagal upload file ${file.name}`);
                const data = await res.json();
                uploadedUrls.push(data.url);
            }

            setUploadProgress('Menyimpan laporan…');
            await submitQuest(quest.id, submissionNote, uploadedUrls);

            // Solo auto-review: AI quests get reviewed instantly
            if (isAIQuest(quest.createdBy)) {
                setUploadProgress('AI Game Master sedang me-review…');
                try {
                    const outcome = await runAIReview(
                        { ...quest, submissionUrls: uploadedUrls },
                        submissionNote,
                        profile,
                        uploadedUrls.length > 0
                    );
                    await refreshProfile?.();
                    if (outcome.decision === 'approve') {
                        alert(`✅ AI Game Master menyetujui!\n+${outcome.expEarned} EXP\n\n"${outcome.feedback}"`);
                    } else {
                        alert(`📝 AI Game Master minta revisi:\n\n"${outcome.feedback}"`);
                    }
                } catch (reviewErr) {
                    alert('Quest tersubmit, tapi auto-review AI gagal: ' + (reviewErr instanceof Error ? reviewErr.message : 'error'));
                }
                router.push('/quest-board');
                return;
            }

            alert('Laporan berhasil dikirim ke GM!');
            router.push('/quest-board');
        } catch (error) {
            console.error('Gagal submit:', error);
            if (!navigator.onLine) {
                try {
                    await queueSubmission();
                    alert('Koneksi terputus. Laporan disimpan dan akan otomatis di-upload saat online.');
                    router.push('/quest-board');
                } catch (queueError) {
                    alert(queueError instanceof Error ? queueError.message : 'Gagal menyimpan laporan offline.');
                }
            } else {
                alert('Terjadi kesalahan saat mengunggah laporan.');
            }
        } finally {
            setIsSubmitting(false);
            setUploadProgress('');
        }
    };

    return {
        profile,
        quest,
        loading,
        submissionNote,
        setSubmissionNote,
        selectedFiles,
        selectFiles,
        removeFile,
        isSubmitting,
        uploadProgress,
        hasQueuedSubmission,
        acceptQuest,
        submit,
    };
}
