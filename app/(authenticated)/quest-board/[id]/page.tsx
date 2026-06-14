'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { getQuestById, submitQuest } from '@/lib/db';
import { runAIReview } from '@/hooks/useAIReview';
import { enqueueOfflineItem, getQueuedSubmitForQuest, upsertOfflineSubmitItem } from '@/lib/offlineQueue';
import { isAIQuest, AI_GM } from '@/constants/ai';
import { CATEGORY_LABEL } from '@/constants/ui';
import { Quest } from '@/types';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Award,
    UploadCloud,
    FileText,
    X,
    Image as ImageIcon,
    CheckCircle2,
    ExternalLink,
    MessageSquare,
    PlayCircle,
    RefreshCcw,
    Bot,
    Loader2,
} from 'lucide-react';

export default function QuestDetailPage() {
    const { id } = useParams();
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
        if (id) {
            getQuestById(id as string).then((data) => {
                setQuest(data);
                if (data?.status === 'rejected') setSubmissionNote(data.submissionNote || '');
                setLoading(false);
            });
        }
    }, [id]);

    useEffect(() => {
        const loadQueuedSubmission = async () => {
            if (!id) return;
            const queued = await getQueuedSubmitForQuest(id as string);
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

    const handleAcceptQuest = async () => {
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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    };

    const removeFile = (indexToRemove: number) => {
        setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

            // ── Solo auto-review: AI quests get reviewed instantly ──
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

    if (loading)
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
        );
    if (!quest)
        return <div className="min-h-[60vh] flex items-center justify-center font-bold text-danger">Quest tidak ditemukan.</div>;

    const fromAI = isAIQuest(quest.createdBy);
    const isRevising = quest.status === 'rejected';
    const showUploadForm = (quest.status === 'in_progress' || isRevising) && profile?.role === 'player';
    const canSubmitNow = navigator.onLine ? selectedFiles.length > 0 : selectedFiles.length > 0 || hasQueuedSubmission;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-brand font-bold hover:text-brand-hover transition-colors">
                <ArrowLeft className="w-5 h-5" /> Kembali ke Quest Board
            </button>

            <div className="grid lg:grid-cols-2 gap-6 items-start">
            {/* ── Detail card (kiri) ── */}
            <GlassCard className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <DifficultyBadge difficulty={quest.difficulty} className="px-2.5 py-1 text-sm" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-2 text-ink-soft">
                        {CATEGORY_LABEL[quest.category]}
                    </span>
                    <StatusBadge status={quest.status} />
                    {fromAI && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full bg-brand-soft text-brand">
                            <Bot className="w-3 h-3" /> {AI_GM.name}
                        </span>
                    )}
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-ink mb-4 leading-snug">{quest.title}</h1>

                <div className="flex flex-wrap gap-5 mb-6 text-sm font-bold text-ink-soft border-b border-line pb-6">
                    <div className="flex items-center gap-2"><Award className="w-5 h-5 text-brand" /><span className="text-brand">+{quest.expReward} EXP</span></div>
                    <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-ink-muted" /><span>{new Date(quest.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                    <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-ink-muted" /><span>{new Date(quest.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span></div>
                </div>

                <div className="text-ink-soft leading-relaxed mb-6">
                    <h3 className="text-lg font-bold text-ink mb-2 flex items-center gap-2"><FileText className="w-5 h-5" /> Deskripsi Misi</h3>
                    <p className="whitespace-pre-wrap">{quest.description}</p>
                </div>

                {quest.motivation && (
                    <div className="bg-brand-soft border border-brand/15 rounded-card p-5">
                        <h4 className="text-sm font-extrabold text-brand uppercase tracking-widest mb-2 flex items-center gap-2">
                            {fromAI ? <Bot className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                            {fromAI ? 'Pesan AI Game Master' : 'Pesan Khusus GM'}
                        </h4>
                        <p className="text-ink font-semibold italic">&ldquo;{quest.motivation}&rdquo;</p>
                    </div>
                )}
            </GlassCard>

            {/* ── Kolom kanan: aksi & arsip ── */}
            <div className="space-y-6">
            {/* ── Accept (pending) ── */}
            {quest.status === 'pending' && profile?.role === 'player' && (
                <GlassCard className="p-8 text-center">
                    <h3 className="text-xl font-extrabold text-ink mb-2">Misi Ini Menunggumu!</h3>
                    <p className="text-ink-soft mb-6">Terima misi ini untuk mulai mengumpulkan bukti penyelesaian.</p>
                    <Button onClick={handleAcceptQuest} isLoading={isSubmitting} size="lg" className="w-full md:w-auto">
                        <PlayCircle className="w-5 h-5 mr-2" /> Mulai Petualangan
                    </Button>
                </GlassCard>
            )}

            {/* ── Upload / re-submit ── */}
            {showUploadForm && (
                <GlassCard className="p-6 md:p-8">
                    {isRevising && (
                        <div className="mb-6 p-4 bg-danger-soft border-l-4 border-danger rounded-r-xl">
                            <p className="text-danger font-black flex items-center gap-2 text-sm uppercase mb-1"><X className="w-4 h-4" /> Alasan Perbaikan:</p>
                            <p className="text-ink font-semibold italic">&ldquo;{quest.reviewNote || 'Silakan perbaiki bukti laporanmu.'}&rdquo;</p>
                        </div>
                    )}

                    <h2 className="text-2xl font-extrabold text-ink mb-2 flex items-center gap-2">
                        {isRevising ? <RefreshCcw className="w-6 h-6 text-warn" /> : <UploadCloud className="w-6 h-6 text-brand" />}
                        {isRevising ? 'Kirim Ulang Bukti' : 'Laporkan Penyelesaian'}
                    </h2>
                    {fromAI && (
                        <p className="text-ink-soft text-sm mb-6 flex items-center gap-1.5">
                            <Bot className="w-4 h-4 text-brand" /> AI Game Master akan otomatis me-review begitu kamu submit.
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className={fromAI ? '' : 'mt-4'}>
                        <div className="mb-6">
                            <label className="block text-sm font-extrabold text-ink-soft mb-2 uppercase tracking-widest">Catatan Penyelesaian</label>
                            <textarea
                                required
                                rows={4}
                                value={submissionNote}
                                onChange={(e) => setSubmissionNote(e.target.value)}
                                placeholder="Ceritakan progresmu…"
                                className="w-full p-4 rounded-xl border border-line bg-surface text-ink placeholder:text-ink-muted outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 font-medium resize-none transition"
                            />
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-extrabold text-ink-soft mb-2 uppercase tracking-widest">Bukti Penyelesaian</label>
                            {hasQueuedSubmission && (
                                <p className="text-xs font-bold text-warn mb-3">
                                    Sudah ada submit offline untuk quest ini — tombol kirim akan memperbarui draft sebelumnya.
                                </p>
                            )}
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-line rounded-xl cursor-pointer bg-surface-2 hover:bg-brand-soft transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-ink-soft">
                                    <UploadCloud className="w-10 h-10 mb-2 text-brand" />
                                    <p className="mb-1 text-sm font-bold">Pilih file bukti</p>
                                    <p className="text-xs opacity-70">PNG, JPG, PDF, ZIP (maks. 5MB/file)</p>
                                </div>
                                <input type="file" multiple className="hidden" onChange={handleFileSelect} />
                            </label>

                            {selectedFiles.length > 0 && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-surface border border-line rounded-xl">
                                            <div className="flex items-center gap-3 overflow-hidden text-ink-soft">
                                                {file.type.includes('image') ? <ImageIcon className="w-5 h-5 shrink-0" /> : <FileText className="w-5 h-5 shrink-0" />}
                                                <span className="text-sm font-bold truncate">{file.name}</span>
                                            </div>
                                            <button type="button" onClick={() => removeFile(index)} className="text-ink-muted hover:text-danger"><X className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={!canSubmitNow} size="lg" className="w-full">
                            {isSubmitting ? uploadProgress || 'Memproses…' : (
                                <><CheckCircle2 className="w-5 h-5 mr-2" /> {hasQueuedSubmission ? 'Update Draft Offline' : isRevising ? 'Kirim Revisi' : fromAI ? 'Submit & Review AI' : 'Serahkan ke GM'}</>
                            )}
                        </Button>
                    </form>
                </GlassCard>
            )}

            {/* ── Archive / history ── */}
            {quest.status !== 'in_progress' && quest.status !== 'pending' && quest.status !== 'rejected' && (
                <div className="space-y-5">
                    <GlassCard className="p-6">
                        <h3 className="text-sm font-extrabold text-ink-muted uppercase tracking-widest mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Laporanmu</h3>
                        <p className="text-ink-soft font-medium mb-4 leading-relaxed whitespace-pre-line">{quest.submissionNote || 'Tidak ada catatan.'}</p>
                        {quest.submissionUrls && quest.submissionUrls.length > 0 && (
                            <div className="border-t border-line pt-4 flex flex-wrap gap-3">
                                {quest.submissionUrls.map((url, idx) => (
                                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-surface px-4 py-2 rounded-xl text-sm font-bold text-ink-soft border border-line hover:text-brand transition-colors">
                                        <ExternalLink className="w-4 h-4" /> File {idx + 1}
                                    </a>
                                ))}
                            </div>
                        )}
                    </GlassCard>

                    {quest.reviewNote && quest.status === 'approved' && (
                        <GlassCard className="p-6 md:p-8">
                            <h3 className="text-lg font-extrabold text-brand mb-3 flex items-center gap-2">
                                {fromAI ? <Bot className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                                {fromAI ? 'Catatan AI Game Master' : 'Balasan dari Game Master'}
                            </h3>
                            <div className="bg-brand-soft p-4 rounded-xl border border-brand/15">
                                <p className="text-ink font-medium leading-relaxed whitespace-pre-line">{quest.reviewNote}</p>
                            </div>
                        </GlassCard>
                    )}
                </div>
            )}
            </div>
            </div>
        </div>
    );
}
