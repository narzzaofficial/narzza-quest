'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuestDetail } from '@/hooks/useQuestDetail';
import { isAIQuest, AI_GM } from '@/constants/ai';
import { CATEGORY_LABEL } from '@/constants/ui';
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
    const {
        profile, quest, loading, submissionNote, setSubmissionNote,
        selectedFiles, selectFiles, removeFile, isSubmitting, uploadProgress,
        hasQueuedSubmission, acceptQuest, submit,
    } = useQuestDetail(id as string | undefined);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        selectFiles(e.target.files);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit();
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
                    <Button onClick={acceptQuest} isLoading={isSubmitting} size="lg" className="w-full md:w-auto">
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
