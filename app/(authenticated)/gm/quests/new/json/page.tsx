'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createQuest, getLinkedProfiles } from '@/lib/db';
import { UserProfile } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

const VALID_DIFFICULTIES = new Set(['E', 'D', 'C', 'B', 'A', 'S']);
const VALID_CATEGORIES = new Set(['daily', 'weekly', 'main', 'side']);

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
                const playersOnly = heroes.filter((hero) => hero.role === 'player');
                setLinkedHeroes(playersOnly);
                if (playersOnly.length > 0) setAssignedTo(playersOnly[0].uid);
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
            if (Array.isArray(container.quests)) {
                items = container.quests;
            } else if (Array.isArray(container.tasks)) {
                items = container.tasks.map((task) => ({ title: String(task) }));
            }
        }

        if (items.length === 0) throw new Error('Gunakan array quest, atau object dengan key "quests"/"tasks".');

        return items.map((item, index) => {
            const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
            const title = typeof item === 'string'
                ? item.trim()
                : typeof row.title === 'string'
                    ? row.title.trim()
                    : typeof row.task === 'string'
                        ? row.task.trim()
                        : '';

            const description = typeof row.description === 'string' ? row.description : 'Selesaikan quest ini dengan baik.';
            const motivation = typeof row.motivation === 'string' ? row.motivation : '';
            const expReward = typeof row.expReward === 'number' ? row.expReward : 50;
            const moneyReward = typeof row.moneyReward === 'number' ? row.moneyReward : 0;
            const difficulty = typeof row.difficulty === 'string' && VALID_DIFFICULTIES.has(row.difficulty) ? row.difficulty : 'E';
            const category = typeof row.category === 'string' && VALID_CATEGORIES.has(row.category) ? row.category : 'daily';
            const deadlineText = typeof row.deadline === 'string' && row.deadline.trim() ? row.deadline : '';
            const itemAssignedTo = typeof row.assignedTo === 'string' && row.assignedTo.trim() ? row.assignedTo : assignedTo;
            const tasks = Array.isArray(row.tasks) ? row.tasks.filter((task) => typeof task === 'string') as string[] : [];

            if (!title) throw new Error(`Quest #${index + 1} belum ada title/task.`);
            if (!deadlineText) throw new Error(`Quest #${index + 1} belum ada deadline.`);
            if (!itemAssignedTo) throw new Error(`Quest #${index + 1} belum ada assignedTo.`);
            if (!Number.isFinite(expReward) || expReward < 10) throw new Error(`Quest #${index + 1} expReward minimal 10.`);

            const parsedDeadline = new Date(deadlineText);
            if (Number.isNaN(parsedDeadline.getTime())) throw new Error(`Deadline quest #${index + 1} tidak valid.`);

            const checklist = tasks.length > 0 ? `\n\nChecklist:\n${tasks.map((task, taskIdx) => `${taskIdx + 1}. ${task}`).join('\n')}` : '';
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
            await Promise.all(
                quests.map((quest) =>
                    createQuest(
                        { ...quest, createdBy: profile.uid },
                        { uid: profile.uid, displayName: profile.displayName }
                    )
                )
            );
            setToastMessage(`${quests.length} quest berhasil disebarkan dari JSON!`);
            setShowToast(true);
            setTimeout(() => router.push('/gm/quests'), 1500);
        } catch (error) {
            setJsonError(error instanceof Error ? error.message : 'Gagal memproses JSON.');
            setIsSubmitting(false);
        }
    };

    if (loadingHeroes) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-purple-600">Memuat form JSON...</div>;
    }

    return (
        <div
            className="min-h-screen p-4 md:p-8 relative overflow-hidden text-slate-800"
            style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #F3E8FF 100%)',
                fontFamily: 'var(--font-nunito), sans-serif',
            }}
        >
            <div className="max-w-3xl mx-auto pt-4">
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-purple-950" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Buat Quest via JSON ⚡
                    </h1>
                    <p className="text-slate-500 mt-2">Tanpa field tambahan. Semua data diisi lewat JSON.</p>
                </header>

                <Card className="p-6 md:p-8 bg-white border-purple-100 shadow-[0_10px_40px_rgba(168,85,247,0.08)]">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="block text-sm font-extrabold text-purple-900 uppercase tracking-widest">
                            Hero Tujuan Default
                        </label>
                        <select
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            className="w-full p-3 rounded-xl border border-purple-200 bg-white font-bold text-purple-800"
                        >
                            <option value="" disabled>-- Pilih Hero --</option>
                            {linkedHeroes.map((hero) => (
                                <option key={hero.uid} value={hero.uid}>{hero.displayName} (Lv. {hero.level})</option>
                            ))}
                        </select>

                        <textarea
                            value={jsonText}
                            onChange={(e) => setJsonText(e.target.value)}
                            rows={14}
                            className="w-full p-3 rounded-xl border border-purple-200 bg-purple-50/40 font-medium text-slate-700"
                            placeholder={`[
  {
    "title": "Workout Pagi",
    "description": "Cardio ringan",
    "tasks": ["Lari 20 menit", "Stretching 10 menit"],
    "deadline": "2026-03-20T08:00:00.000Z",
    "expReward": 60,
    "moneyReward": 25000,
    "motivation": "Semangat ya ✨",
    "difficulty": "D",
    "category": "daily"
  }
]`}
                        />

                        <p className="text-xs text-purple-600">
                            Field per item: <span className="font-bold">title/task, description, tasks, deadline, expReward, moneyReward, motivation, difficulty, category, assignedTo</span>.
                        </p>

                        {jsonError && <p className="text-rose-600 font-bold text-sm">{jsonError}</p>}

                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={() => router.push('/gm/quests')} className="border-slate-300 text-slate-700">
                                Batal
                            </Button>
                            <Button type="submit" isLoading={isSubmitting} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 border-none text-white">
                                Sebarkan JSON Quest ✨
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
            <Toast isVisible={showToast} onClose={() => setShowToast(false)} message={toastMessage} type="success" />
        </div>
    );
}
