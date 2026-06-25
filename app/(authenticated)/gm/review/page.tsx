'use client';

import React from 'react';
import {
    CheckCircle2,
    XCircle,
    Paperclip,
    FileText,
    MessageSquare,
    Coffee,
    Search,
    User,
    ExternalLink,
    Award,
    Wallet,
    Loader2,
} from 'lucide-react';
import { useGMReview } from '@/hooks/useGMReview';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import EmptyState from '@/components/ui/EmptyState';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import type { Quest } from '@/types';

export default function GMReviewPage() {
    const r = useGMReview();
    const { loading, submissions, toast, setToast } = r;

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <PageHeader
                icon={<Search className="w-6 h-6 text-white" />}
                title="Review Laporan"
                subtitle="Validasi tugas dari hero & berikan persetujuan EXP."
                badge="GM Panel"
            />

            {submissions.length === 0 ? (
                <EmptyState icon={Coffee} title="Semua laporan sudah direview" desc="Hero sedang sibuk menyelesaikan misinya. Santai sejenak!" />
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {submissions.map((sub) => (
                        <ReviewCard key={sub.id} sub={sub} r={r} />
                    ))}
                </div>
            )}

            <Toast isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} message={toast.message} type="success" />
        </div>
    );
}

type ReviewData = ReturnType<typeof useGMReview>;

function ReviewCard({ sub, r }: { sub: Quest; r: ReviewData }) {
    const urls = sub.submissionUrls;
    return (
        <GlassCard className="p-5 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <DifficultyBadge difficulty={sub.difficulty} />
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-brand bg-brand-soft px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <User className="w-3 h-3" /> {r.heroMap[sub.assignedTo] || 'Hero'}
                        </span>
                        {sub.moneyReward && sub.moneyReward > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-success bg-success-soft px-2 py-0.5 rounded-full">
                                <Wallet className="w-3 h-3" /> Rp {sub.moneyReward.toLocaleString('id-ID')}
                            </span>
                        ) : null}
                    </div>
                    <h3 className="text-lg font-extrabold text-ink leading-tight">{sub.title}</h3>
                </div>
                {sub.submittedAt && (
                    <span className="text-[11px] font-bold text-ink-muted bg-surface-2 px-2.5 py-1 rounded-lg whitespace-nowrap">
                        {new Date(sub.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>

            <div className="bg-surface-2 p-4 rounded-xl mb-3">
                <div className="flex items-center gap-2 mb-1.5 text-brand">
                    <FileText className="w-4 h-4" />
                    <p className="text-[10px] font-extrabold uppercase tracking-widest">Catatan Hero</p>
                </div>
                <p className="text-ink-soft font-medium text-sm italic mb-3 leading-relaxed">&ldquo;{sub.submissionNote}&rdquo;</p>

                {(urls?.length || sub.submissionImageUrl) && (
                    <div className="pt-3 border-t border-line">
                        <div className="flex items-center gap-2 mb-2 text-success">
                            <Paperclip className="w-4 h-4" />
                            <p className="text-[10px] font-extrabold uppercase tracking-widest">Bukti Lampiran ({urls?.length || 1})</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {urls
                                ? urls.map((url, idx) => (
                                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-lg text-xs font-bold text-ink-soft border border-line hover:text-brand transition-colors">
                                        <ExternalLink className="w-3.5 h-3.5 text-success" /> File {idx + 1}
                                    </a>
                                ))
                                : sub.submissionImageUrl && (
                                    <a href={sub.submissionImageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-lg text-xs font-bold text-ink-soft border border-line hover:text-brand transition-colors">
                                        <ExternalLink className="w-3.5 h-3.5 text-success" /> Buka Bukti
                                    </a>
                                )}
                        </div>
                    </div>
                )}
            </div>

            {r.reviewingId === sub.id ? (
                <div className="bg-brand-soft p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2 text-brand">
                        <MessageSquare className="w-4 h-4" />
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest">Catatan dari GM</label>
                    </div>
                    <textarea
                        rows={2}
                        value={r.reviewNote}
                        onChange={(e) => r.setReviewNote(e.target.value)}
                        placeholder="Kasih pujian atau alasan revisi…"
                        className="w-full bg-surface border border-line rounded-lg p-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/15 mb-3 resize-none font-medium"
                    />
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => r.setReviewingId(null)} disabled={r.isProcessing}>Batal</Button>
                        <button onClick={() => r.reject(sub)} disabled={r.isProcessing} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-line text-danger px-4 py-2 text-sm font-bold hover:bg-danger-soft disabled:opacity-60">
                            <XCircle className="w-3.5 h-3.5" /> Tolak & Revisi
                        </button>
                        <button onClick={() => r.approve(sub)} disabled={r.isProcessing} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-success text-white px-4 py-2 text-sm font-bold hover:brightness-95 disabled:opacity-60">
                            {r.isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Approve (+{sub.expReward})
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex justify-between items-center pt-3 border-t border-line">
                    <span className="inline-flex items-center gap-1 text-brand font-extrabold text-xs bg-brand-soft px-3 py-1.5 rounded-lg">
                        <Award className="w-3.5 h-3.5" /> +{sub.expReward} EXP
                    </span>
                    <button onClick={() => r.setReviewingId(sub.id)} className="inline-flex items-center gap-1.5 rounded-xl bg-brand text-white px-4 py-2 text-sm font-bold hover:bg-brand-hover transition-colors">
                        <Search className="w-3.5 h-3.5" /> Review
                    </button>
                </div>
            )}
        </GlassCard>
    );
}
