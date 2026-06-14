'use client';

import React, { useState } from 'react';
import {
    Briefcase, BookOpen, Heart, Users, User, Moon, Car,
    Plus, StopCircle, Clock, Zap, Smile, Trash2, Check, Loader2, Activity,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLog } from '@/hooks/useActivityLog';
import { useHabits } from '@/hooks/useHabits';
import type { ActivityCategory, ActivityEntry } from '@/types';

// ── Constants ──────────────────────────────────────────────────

const CATEGORIES: { value: ActivityCategory; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
    { value: 'work',     label: 'Kerja',    icon: <Briefcase className="w-4 h-4" />, color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { value: 'learning', label: 'Belajar',  icon: <BookOpen  className="w-4 h-4" />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { value: 'health',   label: 'Kesehatan',icon: <Heart     className="w-4 h-4" />, color: 'text-rose-600',   bg: 'bg-rose-50'   },
    { value: 'social',   label: 'Sosial',   icon: <Users     className="w-4 h-4" />, color: 'text-amber-600',  bg: 'bg-amber-50'  },
    { value: 'personal', label: 'Personal', icon: <User      className="w-4 h-4" />, color: 'text-teal-600',   bg: 'bg-teal-50'   },
    { value: 'rest',     label: 'Istirahat',icon: <Moon      className="w-4 h-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { value: 'commute',  label: 'Perjalanan',icon:<Car       className="w-4 h-4" />, color: 'text-orange-600', bg: 'bg-orange-50' },
];

const MOODS = ['😫','😔','😊','😄','🔥'] as const;
const ENERGY_LABELS = ['Habis','Rendah','Cukup','Tinggi','Full'] as const;

function catMeta(cat: ActivityCategory) {
    return CATEGORIES.find(c => c.value === cat) ?? CATEGORIES[0];
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(min: number) {
    if (min < 60) return `${min} mnt`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h} jam ${m} mnt` : `${h} jam`;
}

// ── Log Form ───────────────────────────────────────────────────

interface LogFormProps {
    onSave: (data: { title: string; category: ActivityCategory; mood: 1|2|3|4|5; energy: 1|2|3|4|5; note?: string }) => void;
    onCancel?: () => void;
    saving: boolean;
    label?: string;
}

function LogForm({ onSave, onCancel, saving, label = 'Mulai Aktivitas' }: LogFormProps) {
    const [title, setTitle]       = useState('');
    const [category, setCategory] = useState<ActivityCategory>('work');
    const [mood, setMood]         = useState<1|2|3|4|5>(3);
    const [energy, setEnergy]     = useState<1|2|3|4|5>(3);
    const [note, setNote]         = useState('');

    const submit = () => {
        if (!title.trim()) return;
        onSave({ title: title.trim(), category, mood, energy, note: note.trim() || undefined });
    };

    return (
        <div className="space-y-4">
            {/* Title */}
            <div>
                <label className="text-ink-muted text-[10px] font-bold uppercase tracking-widest block mb-1.5">Lagi ngapain?</label>
                <input
                    autoFocus
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    placeholder="Contoh: Coding fitur auth, Rapat standup, Gym..."
                    className="w-full px-4 py-3 rounded-xl border border-line bg-surface-2 text-ink placeholder:text-ink-muted text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                />
            </div>

            {/* Category */}
            <div>
                <label className="text-ink-muted text-[10px] font-bold uppercase tracking-widest block mb-2">Kategori</label>
                <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map(c => (
                        <button
                            key={c.value}
                            onClick={() => setCategory(c.value)}
                            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                                category === c.value
                                    ? `${c.bg} ${c.color} border-current shadow-sm`
                                    : 'border-line text-ink-muted hover:bg-surface-2'
                            }`}
                        >
                            {c.icon}
                            <span className="text-[10px]">{c.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Mood + Energy row */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-ink-muted text-[10px] font-bold uppercase tracking-widest block mb-2">
                        Mood <span className="text-base">{MOODS[mood - 1]}</span>
                    </label>
                    <div className="flex gap-1.5">
                        {([1,2,3,4,5] as const).map(v => (
                            <button
                                key={v}
                                onClick={() => setMood(v)}
                                className={`flex-1 text-lg py-1.5 rounded-lg border transition-all ${
                                    mood === v ? 'bg-brand-soft border-brand/30 shadow-sm' : 'border-line hover:bg-surface-2'
                                }`}
                            >
                                {MOODS[v - 1]}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-ink-muted text-[10px] font-bold uppercase tracking-widest block mb-2">
                        Energi <span className="text-brand font-extrabold">{ENERGY_LABELS[energy - 1]}</span>
                    </label>
                    <div className="flex gap-1.5">
                        {([1,2,3,4,5] as const).map(v => (
                            <button
                                key={v}
                                onClick={() => setEnergy(v)}
                                className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                    energy === v ? 'bg-brand text-white border-brand shadow-sm' : 'border-line text-ink-muted hover:bg-surface-2'
                                }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Note */}
            <div>
                <label className="text-ink-muted text-[10px] font-bold uppercase tracking-widest block mb-1.5">Catatan (opsional)</label>
                <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Ada yang ingin dicatat?"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-line bg-surface-2 text-ink placeholder:text-ink-muted text-sm resize-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {onCancel && (
                    <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-line text-ink-soft text-sm font-bold hover:bg-surface-2 transition">
                        Batal
                    </button>
                )}
                <button
                    onClick={submit}
                    disabled={!title.trim() || saving}
                    className="flex-1 py-3 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-hover disabled:opacity-40 transition flex items-center justify-center gap-2"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                    {label}
                </button>
            </div>
        </div>
    );
}

// ── Activity Card (current) ────────────────────────────────────

function CurrentActivityCard({
    entry,
    duration,
    onSwitch,
    onStop,
    saving,
}: {
    entry: ActivityEntry;
    duration: number;
    onSwitch: () => void;
    onStop: () => void;
    saving: boolean;
}) {
    const meta = catMeta(entry.category);
    return (
        <div className="rounded-card shadow-card bg-surface glass">
            <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center ${meta.color} shrink-0`}>
                        {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-ink-muted text-[10px] font-bold uppercase tracking-widest">Aktivitas Sekarang</p>
                        <h2 className="text-ink font-extrabold text-base leading-tight truncate">{entry.title}</h2>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${meta.bg} ${meta.color}`}>{meta.label}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-ink-soft">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-semibold">{formatDuration(duration)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-ink-soft">
                        <span>Mood</span>
                        <span className="text-base">{MOODS[entry.mood - 1]}</span>
                    </div>
                    <div className="flex items-center gap-1 text-ink-soft">
                        <Zap className="w-3.5 h-3.5 text-brand" />
                        <span className="font-semibold text-brand">{ENERGY_LABELS[entry.energy - 1]}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onSwitch}
                        disabled={saving}
                        className="flex-1 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-hover disabled:opacity-40 transition"
                    >
                        Ganti Aktivitas
                    </button>
                    <button
                        onClick={onStop}
                        disabled={saving}
                        className="px-4 py-2.5 rounded-xl border border-line text-ink-soft hover:bg-danger-soft hover:text-danger hover:border-danger/20 text-sm font-bold transition flex items-center gap-1.5"
                    >
                        <StopCircle className="w-4 h-4" />
                        Stop
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Timeline Entry ─────────────────────────────────────────────

function TimelineEntry({ entry, duration }: { entry: ActivityEntry; duration: number }) {
    const meta = catMeta(entry.category);
    return (
        <div className="flex gap-3 group">
            <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-lg ${meta.bg} ${meta.color} flex items-center justify-center shrink-0`}>
                    {meta.icon}
                </div>
                <div className="w-px flex-1 bg-line mt-1" />
            </div>
            <div className="flex-1 pb-4 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-ink font-bold text-sm truncate">{entry.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-ink-muted text-xs">{formatTime(entry.startTime)}</span>
                            {entry.endTime && <span className="text-ink-muted text-xs">→ {formatTime(entry.endTime)}</span>}
                            <span className="text-brand text-xs font-semibold">{formatDuration(duration)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm">{MOODS[entry.mood - 1]}</span>
                        <span className="text-[10px] font-bold text-ink-muted">{ENERGY_LABELS[entry.energy - 1]}</span>
                    </div>
                </div>
                {entry.note && (
                    <p className="text-ink-muted text-xs mt-1 italic">"{entry.note}"</p>
                )}
            </div>
        </div>
    );
}

// ── Habit Row ──────────────────────────────────────────────────

function HabitRow({ name, icon, completed, onToggle, onDelete }: {
    name: string; icon: string; completed: boolean;
    onToggle: () => void; onDelete: () => void;
}) {
    return (
        <div className="flex items-center gap-3 group">
            <button
                onClick={onToggle}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                    completed
                        ? 'bg-brand border-brand text-white'
                        : 'border-line hover:border-brand'
                }`}
            >
                {completed && <Check className="w-3.5 h-3.5" />}
            </button>
            <span className="text-base">{icon}</span>
            <span className={`flex-1 text-sm font-semibold ${completed ? 'line-through text-ink-muted' : 'text-ink'}`}>
                {name}
            </span>
            <button
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 p-1 text-ink-muted hover:text-danger transition-all"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

// ── Add Habit Form ─────────────────────────────────────────────

const HABIT_EMOJIS = ['🏋️','📚','🧘','🏃','💊','🥗','💧','✍️','🎯','💻','🎸','🌿'];

function AddHabitForm({ onAdd, onCancel, saving }: {
    onAdd: (name: string, icon: string) => void;
    onCancel: () => void;
    saving: boolean;
}) {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('🎯');

    return (
        <div className="bg-surface-2 rounded-xl p-4 space-y-3 border border-line">
            <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nama habit (contoh: Olahraga 30 menit)"
                className="w-full px-3 py-2.5 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
            />
            <div>
                <p className="text-ink-muted text-[10px] font-bold uppercase tracking-widest mb-2">Pilih ikon</p>
                <div className="flex flex-wrap gap-2">
                    {HABIT_EMOJIS.map(e => (
                        <button
                            key={e}
                            onClick={() => setIcon(e)}
                            className={`text-xl p-1.5 rounded-lg border transition-all ${icon === e ? 'border-brand bg-brand-soft' : 'border-line hover:bg-surface'}`}
                        >
                            {e}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={onCancel} className="flex-1 py-2 rounded-lg border border-line text-ink-soft text-sm font-bold hover:bg-surface transition">Batal</button>
                <button
                    onClick={() => name.trim() && onAdd(name.trim(), icon)}
                    disabled={!name.trim() || saving}
                    className="flex-1 py-2 rounded-lg bg-brand text-white text-sm font-bold disabled:opacity-40 transition"
                >
                    Tambah
                </button>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────

const GRAD_BRAND = 'linear-gradient(135deg, #4f7cff 0%, #38bdf8 100%)';

export default function LifeLogPage() {
    const { profile } = useAuth();
    const log = useActivityLog(profile?.uid);
    const habits = useHabits(profile?.uid);

    const [showLogForm, setShowLogForm] = useState(false);
    const [showHabitForm, setShowHabitForm] = useState(false);

    const handleSwitch = async (data: Parameters<typeof log.switchActivity>[0]) => {
        await log.switchActivity(data);
        setShowLogForm(false);
    };

    const completedEntries = log.entries.filter(e => !!e.endTime);
    const totalMinutesToday = log.entries.reduce((sum, e) => sum + log.getDurationMinutes(e), 0);
    const avgMood = log.entries.length
        ? (log.entries.reduce((s, e) => s + e.mood, 0) / log.entries.length).toFixed(1)
        : null;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

            {/* ── Gradient header (match AI GM) ── */}
            <header
                className="relative overflow-hidden rounded-card p-6 md:p-7 text-white shadow-card"
                style={{ backgroundImage: GRAD_BRAND }}
            >
                <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/15 blur-2xl pointer-events-none" />
                <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 ring-1 ring-white/30 flex items-center justify-center shrink-0">
                        <Activity className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Catatan Hidup</p>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">Life Log</h1>
                        <p className="text-white/75 text-sm mt-0.5">
                            {totalMinutesToday > 0
                                ? `${formatDuration(totalMinutesToday)} tercatat hari ini · ${log.entries.length} aktivitas`
                                : 'Belum ada aktivitas. Mulai catat sekarang!'}
                        </p>
                    </div>
                    {avgMood && (
                        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                            <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Mood Hari Ini</span>
                            <span className="text-white text-2xl font-extrabold">{avgMood}/5</span>
                        </div>
                    )}
                </div>
            </header>

            {/* ── Current Activity / Log Form ── */}
            {log.currentActivity && !showLogForm ? (
                <CurrentActivityCard
                    entry={log.currentActivity}
                    duration={log.getDurationMinutes(log.currentActivity)}
                    onSwitch={() => setShowLogForm(true)}
                    onStop={log.stopCurrent}
                    saving={log.saving}
                />
            ) : showLogForm ? (
                <section className="glass rounded-card shadow-card p-5 md:p-6">
                    <h2 className="text-ink font-extrabold text-lg mb-4">
                        {log.currentActivity ? 'Ganti Aktivitas' : 'Mulai Aktivitas Baru'}
                    </h2>
                    <LogForm
                        onSave={handleSwitch}
                        onCancel={() => setShowLogForm(false)}
                        saving={log.saving}
                        label={log.currentActivity ? 'Ganti Sekarang' : 'Mulai Sekarang'}
                    />
                </section>
            ) : (
                <section className="glass rounded-card shadow-card">
                    <div className="p-6 flex flex-col items-center gap-3 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-brand-soft flex items-center justify-center">
                            <Plus className="w-7 h-7 text-brand" />
                        </div>
                        <div>
                            <p className="text-ink font-extrabold text-base">Catat Aktivitas Sekarang</p>
                            <p className="text-ink-muted text-sm mt-0.5">Lagi ngapain? Coding, meeting, gym, istirahat...</p>
                        </div>
                        <button
                            onClick={() => setShowLogForm(true)}
                            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-white text-sm font-bold hover:bg-brand-hover shadow-card transition-colors"
                        >
                            <Activity className="w-4 h-4" />
                            Mulai Catat
                        </button>
                    </div>
                </section>
            )}

            {/* ── Timeline + Habits: 2-col on large ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Timeline Hari Ini */}
                <section className="glass rounded-card shadow-card">
                    <div className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-brand-soft flex items-center justify-center shrink-0">
                                <Clock className="w-4 h-4 text-brand" />
                            </div>
                            <div>
                                <p className="text-brand text-[10px] uppercase tracking-widest font-bold">Hari Ini</p>
                                <h2 className="text-ink font-extrabold text-base leading-tight">Timeline</h2>
                            </div>
                        </div>
                        {completedEntries.length === 0 ? (
                            <p className="text-ink-muted text-sm py-4 text-center">
                                Belum ada aktivitas selesai hari ini.
                            </p>
                        ) : (
                            <div className="space-y-0">
                                {[...completedEntries].reverse().map(e => (
                                    <TimelineEntry key={e.id} entry={e} duration={log.getDurationMinutes(e)} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Habits */}
                <section className="glass rounded-card shadow-card">
                    <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-success-soft flex items-center justify-center shrink-0">
                                    <Zap className="w-4 h-4 text-success" />
                                </div>
                                <div>
                                    <p className="text-success text-[10px] uppercase tracking-widest font-bold">Kebiasaan</p>
                                    <h2 className="text-ink font-extrabold text-base leading-tight">Habit Harian</h2>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowHabitForm(!showHabitForm)}
                                className="p-2 rounded-xl border border-line text-ink-muted hover:bg-brand-soft hover:text-brand transition"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {habits.todayTotal > 0 && (
                            <div>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-ink-muted font-semibold">{habits.todayCount}/{habits.todayTotal} selesai</span>
                                    <span className="text-success font-bold">{Math.round((habits.todayCount / habits.todayTotal) * 100)}%</span>
                                </div>
                                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden border border-line">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${(habits.todayCount / habits.todayTotal) * 100}%`,
                                            background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {showHabitForm && (
                            <AddHabitForm
                                onAdd={(name, icon) => {
                                    habits.add({ name, icon, category: 'personal' });
                                    setShowHabitForm(false);
                                }}
                                onCancel={() => setShowHabitForm(false)}
                                saving={habits.saving}
                            />
                        )}

                        {habits.loading ? (
                            <div className="flex items-center gap-2 text-ink-muted text-sm py-2">
                                <Loader2 className="w-4 h-4 animate-spin text-brand" /> Memuat habits...
                            </div>
                        ) : habits.habits.length === 0 ? (
                            <p className="text-ink-muted text-sm py-4 text-center">
                                Belum ada habit. Klik + untuk tambah.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {habits.habits.map(h => (
                                    <HabitRow
                                        key={h.id}
                                        name={h.name}
                                        icon={h.icon}
                                        completed={habits.isCompleted(h.id)}
                                        onToggle={() => habits.toggle(h.id)}
                                        onDelete={() => habits.remove(h.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
