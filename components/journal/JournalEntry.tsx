'use client';

import { useState } from 'react';
import { Calendar, MessageSquare, Award, Feather, Wallet, Sparkles, Pencil, Loader2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import { CATEGORY_LABEL } from '@/constants/ui';
import { updateQuestReflection } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';
import type { Quest } from '@/types';

export function JournalEntry({ quest }: { quest: Quest }) {
    const { profile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [note, setNote] = useState(quest.submissionNote || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentQuest, setCurrentQuest] = useState<Quest>(quest);

    const handleSave = async () => {
        if (!note.trim()) {
            setIsEditing(false);
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/ai/review-quest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: currentQuest.title,
                    description: currentQuest.description,
                    difficulty: currentQuest.difficulty,
                    expReward: currentQuest.expReward,
                    submissionNote: note,
                    hasProof: !!currentQuest.submissionUrls?.length,
                    playerLevel: profile?.level,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Gagal mereview');

            const aiReview = data.feedback || 'Kerja bagus!';

            await updateQuestReflection(currentQuest.id, note, aiReview);
            
            setCurrentQuest(prev => ({
                ...prev,
                submissionNote: note,
                reviewNote: aiReview,
            }));
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert('Gagal menyimpan refleksi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isOwner = profile?.uid === currentQuest.assignedTo;

    return (
        <GlassCard className="p-5">
            <div className="flex items-start gap-3 mb-3">
                <DifficultyBadge difficulty={currentQuest.difficulty} className="px-2.5 py-1 text-sm" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-2 text-ink-soft">
                    {CATEGORY_LABEL[currentQuest.category]}
                </span>
                <span className="text-xs font-bold text-ink-muted flex items-center gap-1 ml-auto">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(currentQuest.reviewedAt || currentQuest.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
            </div>

            <h3 className="text-lg font-extrabold text-ink mb-1.5">{currentQuest.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm font-bold text-brand flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> +{currentQuest.expReward + (currentQuest.bonusExp || 0)} EXP
                </span>
                {currentQuest.moneyReward && currentQuest.moneyReward > 0 ? (
                    <span className="bg-success-soft text-success font-black text-[10px] px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                        <Wallet className="w-3 h-3" /> Rp {currentQuest.moneyReward.toLocaleString('id-ID')}
                    </span>
                ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-surface-2 px-4 py-3.5 rounded-xl flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-ink-muted">
                            <Feather className="w-3.5 h-3.5" />
                            <p className="text-[10px] font-bold uppercase tracking-wider">Catatanmu</p>
                        </div>
                        {isOwner && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-brand flex items-center gap-1 hover:opacity-80 transition-opacity"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase">Edit</span>
                            </button>
                        )}
                    </div>
                    {isEditing ? (
                        <div className="flex flex-col flex-1 gap-2 mt-1">
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Tulis refleksimu tentang quest ini..."
                                className="w-full bg-surface border border-line rounded-lg p-3 text-sm text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand flex-1 min-h-[80px] resize-y"
                                disabled={isSubmitting}
                            />
                            <div className="flex items-center gap-2 justify-end mt-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setNote(currentQuest.submissionNote || '');
                                    }}
                                    disabled={isSubmitting}
                                    className="px-3 py-1.5 text-xs font-bold text-ink-muted hover:text-ink transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSubmitting || !note.trim()}
                                    className="px-4 py-1.5 text-xs font-bold bg-brand text-white rounded-full hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                                    Simpan & Review AI
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-ink-soft font-medium text-sm leading-relaxed whitespace-pre-line flex-1">
                            {currentQuest.submissionNote || (
                                <span className="italic text-ink-muted">Tidak ada catatan.</span>
                            )}
                        </p>
                    )}
                </div>

                <div className="bg-brand-soft border border-brand/15 px-4 py-3.5 rounded-xl flex flex-col">
                    <div className="flex items-center gap-1.5 mb-2 text-brand">
                        {currentQuest.createdBy === 'ai-gm' ? <Sparkles className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                        <p className="text-[10px] font-bold uppercase tracking-wider">
                            {currentQuest.createdBy === 'ai-gm' ? 'Catatan AI' : 'Review GM'}
                        </p>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        {isSubmitting ? (
                            <div className="flex items-center gap-2 text-brand animate-pulse py-2">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-bold">AI sedang menganalisis refleksimu...</span>
                            </div>
                        ) : (
                            <p className="text-ink font-medium text-sm leading-relaxed whitespace-pre-line">
                                {currentQuest.reviewNote || 'Kerja bagus!'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}

