'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createQuest, getLinkedProfiles } from '@/lib/db';
import { QuestCategory, QuestDifficulty, UserProfile } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { Zap, Loader2 } from 'lucide-react';

const VALID_DIFFICULTIES: readonly QuestDifficulty[] = ['E', 'D', 'C', 'B', 'A', 'S'];
const VALID_CATEGORIES: readonly QuestCategory[] = ['daily', 'weekly', 'main', 'side'];
const field = 'w-full p-3 rounded-xl border border-line bg-surface text-ink font-bold outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition';

export default function CreateQuestJsonPage() {
    const { profile } = useAuth();
    const router = useRouter();

    const [linkedHeroes, setLinkedHeroes] = useState<UserProfile[]>([]);
    const [loadingHeroes, setLoadingHeroes] = useState(true);
    const [assignedTo, setAssignedTo] = useState('');
    const [jsonText, setJsonText] = useState('');
    const [jsonError, setJsonError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('Quest JSON berhasil disebarkan!');

    useEffect(() => {
        const loadHeroes = async () => {
            if (profile?.partnerIds && profile.partnerIds.length > 0) {
                const heroes = await getLinkedProfiles(profile.partnerIds);
                const players = heroes.filter((hero) => hero.role === 'player');
                setLinkedHeroes(players);
                if (players.length > 0) setAssignedTo(players[0].uid);
            }
            setLoadingHeroes(false);
        };
        loadHeroes();
    }, [profile]);

    const parsePayload = () => {
        let parsed: unknown;
        try {
            parsed = JSON.parse(jsonText);
        } catch {
            throw new Error('JSON tidak valid.');
        }

        let items: unknown[] = [];
        if (Array.isArray(parsed)) {
            items = parsed;
        } else if (parsed && typeof parsed === 'object') {
            const container = parsed as Record<string, unknown>;
            if (Array.isArray(container.quests)) items = container.quests;
            else if (Array.isArray(container.tasks)) items = container.tasks.map((task) => ({ title: String(task) }));
        }

        if (items.length === 0) throw new Error('Gunakan array quest, atau object dengan key "quests"/"tasks".');

        return items.map((item, index) => {
            const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
            const title = typeof item === 'string'
                ? item.trim()
                : typeof row.title === 'string' ? row.title.trim() : typeof row.task === 'string' ? row.task.trim() : '';
            const description = typeof row.description === 'string' ? row.description : 'Selesaikan quest ini dengan baik.';
            const motivation = typeof row.motivation === 'string' ? row.motivation : '';
            const expReward = typeof row.expReward === 'number' ? row.expReward : 50;
            const moneyReward = typeof row.moneyReward === 'number' ? row.moneyReward : 0;
            const difficulty: QuestDifficulty = typeof row.difficulty === 'string' && VALID_DIFFICULTIES.includes(row.difficulty as QuestDifficulty) ? (row.difficulty as QuestDifficulty) : 'E';
            const category: QuestCategory = typeof row.category === 'string' && VALID_CATEGORIES.includes(row.category as QuestCategory) ? (row.category as QuestCategory) : 'daily';
            const deadlineText = typeof row.deadline === 'string' && row.deadline.trim() ? row.deadline : '';
            const itemAssignedTo = typeof row.assignedTo === 'string' && row.assignedTo.trim() ? row.assignedTo : assignedTo;
            const tasks = Array.isArray(row.tasks) ? (row.tasks.filter((task) => typeof task === 'string') as string[]) : [];

            if (!title) throw new Error(`Quest #${index + 1} belum ada title/task.`);
            if (!deadlineText) throw new Error(`Quest #${index + 1} belum ada deadline.`);
            if (!itemAssignedTo) throw new Error(`Quest #${index + 1} belum ada assignedTo.`);
            if (!Number.isFinite(expReward) || expReward < 10) throw new Error(`Quest #${index + 1} expReward minimal 10.`);

            const parsedDeadline = new Date(deadlineText);
            if (Number.isNaN(parsedDeadline.getTime())) throw new Error(`Deadline quest #${index + 1} tidak valid.`);

            const checklist = tasks.length > 0 ? `\n\nChecklist:\n${tasks.map((task, i) => `${i + 1}. ${task}`).join('\n')}` : '';
            return {
                title,
                description: `${description}${checklist}`,
                motivation,
                expReward: Math.round(expReward),
                moneyReward: Math.max(0, Math.round(moneyReward)),
                difficulty,
                category,
                deadline: parsedDeadline.toISOString(),
                status: 'pending' as const,
                assignedTo: itemAssignedTo,
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setJsonError('');
        if (!jsonText.trim()) return setJsonError('Paste JSON dulu ya.');
        setIsSubmitting(true);
        try {
            const quests = parsePayload();
            await Promise.all(quests.map((quest) => createQuest({ ...quest, createdBy: profile.uid }, { uid: profile.uid, displayName: profile.displayName })));
            setToastMessage(`${quests.length} quest berhasil disebarkan dari JSON!`);
            setShowToast(true);
            setTimeout(() => router.push('/gm/quests'), 1500);
        } catch (error) {
            setJsonError(error instanceof Error ? error.message : 'Gagal memproses JSON.');
            setIsSubmitting(false);
        }
    };

    if (loadingHeroes) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>;
    }

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
            <PageHeader
                grad="sky"
                icon={<Zap className="w-6 h-6 text-white" />}
                title="Quest via JSON"
                subtitle="Buat banyak quest sekaligus lewat JSON batch."
            />

            <GlassCard className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-extrabold text-ink-soft uppercase tracking-widest mb-2">Hero Tujuan Default</label>
                        <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={field}>
                            <option value="" disabled>-- Pilih Hero --</option>
                            {linkedHeroes.map((hero) => <option key={hero.uid} value={hero.uid}>{hero.displayName} (Lv. {hero.level})</option>)}
                        </select>
                    </div>

                    <textarea
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        rows={14}
                        className="w-full p-3 rounded-xl border border-line bg-surface-2 font-mono text-sm text-ink outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition"
                        placeholder={`[
  {
    "title": "Workout Pagi",
    "description": "Cardio ringan",
    "tasks": ["Lari 20 menit", "Stretching 10 menit"],
    "deadline": "2026-03-20T08:00:00.000Z",
    "expReward": 60,
    "moneyReward": 25000,
    "difficulty": "D",
    "category": "daily"
  }
]`}
                    />

                    <p className="text-xs text-ink-muted">
                        Field per item: <span className="font-bold text-ink-soft">title/task, description, tasks, deadline, expReward, moneyReward, motivation, difficulty, category, assignedTo</span>.
                    </p>

                    {jsonError && <p className="text-danger font-bold text-sm">{jsonError}</p>}

                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => router.push('/gm/quests')}>Batal</Button>
                        <Button type="submit" variant="primary" isLoading={isSubmitting} className="flex-1">Sebarkan JSON Quest ✨</Button>
                    </div>
                </form>
            </GlassCard>

            <Toast isVisible={showToast} onClose={() => setShowToast(false)} message={toastMessage} type="success" />
        </div>
    );
}
