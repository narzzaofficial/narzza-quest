'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    AreaChart, Area,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Loader2, TrendingUp, Activity, Clock, Zap, Target, BarChart2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getActivitiesRange, getHabitLogs, getJournals } from '@/lib/db';
import { subscribeToQuests } from '@/lib/db';
import { isAIQuest } from '@/constants/ai';
import type { ActivityEntry, Quest, JournalEntry, HabitLog } from '@/types';

// ── Helpers ────────────────────────────────────────────────────

function dateRange(days: number): { from: string; to: string } {
    const to = new Date();
    const from = new Date(Date.now() - days * 86_400_000);
    return {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
    };
}

function dateKey(iso: string) { return iso.split('T')[0]; }

const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];

const CAT_COLORS: Record<string, string> = {
    work:     '#3b82f6',
    learning: '#a855f7',
    health:   '#f43f5e',
    social:   '#f59e0b',
    personal: '#14b8a6',
    rest:     '#6366f1',
    commute:  '#f97316',
};
const CAT_LABELS: Record<string, string> = {
    work:'Kerja', learning:'Belajar', health:'Kesehatan',
    social:'Sosial', personal:'Personal', rest:'Istirahat', commute:'Perjalanan',
};

const DIFF_WEIGHT: Record<string, number> = { E:1, D:2, C:3, B:4, A:5, S:6 };
const QUEST_CATEGORIES = ['daily','weekly','main','side'] as const;
const QUEST_CAT_LABELS: Record<string, string> = { daily:'Daily', weekly:'Weekly', main:'Main', side:'Side' };

function durationHours(e: ActivityEntry): number {
    const end = e.endTime ? new Date(e.endTime) : new Date();
    return (end.getTime() - new Date(e.startTime).getTime()) / 3_600_000;
}

// ── Chart tooltip ──────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-line glass px-3 py-2 shadow-pop text-xs">
            {label && <p className="font-bold text-ink mb-1">{label}</p>}
            {payload.map((p: { name: string; value: number; color: string }, i: number) => (
                <p key={i} style={{ color: p.color }} className="font-semibold">
                    {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
                </p>
            ))}
        </div>
    );
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'text-brand', bg = 'bg-brand-soft' }: {
    icon: React.ElementType; label: string; value: string | number; sub?: string;
    color?: string; bg?: string;
}) {
    return (
        <div className="glass rounded-card shadow-card p-4">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center ${color} mb-3`}>
                <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-extrabold text-ink">{value}</p>
            <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mt-0.5">{label}</p>
            {sub && <p className="text-ink-soft text-xs mt-1">{sub}</p>}
        </div>
    );
}

// ── Section card ──────────────────────────────────────────────
function ChartCard({ title, sub, children, accentColor = '#4f7cff #38bdf8' }: {
    title: string; sub?: string; children: React.ReactNode; accentColor?: string;
}) {
    const [from, to] = accentColor.split(' ');
    return (
        <div className="glass rounded-card shadow-card">
            <div className="p-5">
                <h3 className="text-ink font-extrabold text-base">{title}</h3>
                {sub && <p className="text-ink-muted text-xs mt-0.5 mb-4">{sub}</p>}
                {!sub && <div className="mb-4" />}
                {children}
            </div>
        </div>
    );
}

// ── Heatmap ───────────────────────────────────────────────────
function ActivityHeatmap({ activities }: { activities: ActivityEntry[] }) {
    const weeks = 12;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const countByDate: Record<string, number> = {};
    activities.forEach(a => {
        const k = dateKey(a.startTime);
        countByDate[k] = (countByDate[k] ?? 0) + 1;
    });

    const maxCount = Math.max(1, ...Object.values(countByDate));

    // Build grid: weeks columns × 7 rows (Sun..Sat)
    const cells: { date: string; count: number }[][] = Array.from({ length: weeks }, (_, wi) =>
        Array.from({ length: 7 }, (_, di) => {
            const d = new Date(today);
            d.setDate(today.getDate() - ((weeks - 1 - wi) * 7 + (today.getDay() - di + 7) % 7));
            const k = d.toISOString().split('T')[0];
            return { date: k, count: countByDate[k] ?? 0 };
        })
    );

    const intensity = (count: number) => {
        if (count === 0) return 'bg-surface-2 border-line';
        const pct = count / maxCount;
        if (pct < 0.25) return 'bg-brand/20 border-brand/10';
        if (pct < 0.5)  return 'bg-brand/40 border-brand/20';
        if (pct < 0.75) return 'bg-brand/65 border-brand/30';
        return 'bg-brand border-brand/50';
    };

    return (
        <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-max">
                {/* Day labels */}
                <div className="flex flex-col gap-1 mr-1">
                    {DAYS_ID.map(d => (
                        <div key={d} className="w-3 h-3 text-[8px] text-ink-muted font-bold flex items-center">{d[0]}</div>
                    ))}
                </div>
                {cells.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                        {week.map(cell => (
                            <div
                                key={cell.date}
                                title={`${cell.date}: ${cell.count} aktivitas`}
                                className={`w-3 h-3 rounded-sm border ${intensity(cell.count)}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────
export default function AnalyticsPage() {
    const { profile } = useAuth();
    const [activities, setActivities] = useState<ActivityEntry[]>([]);
    const [quests, setQuests] = useState<Quest[]>([]);
    const [journals, setJournals] = useState<JournalEntry[]>([]);
    const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?.uid) return;
        const { from, to } = dateRange(30);
        const { from: hFrom, to: hTo } = dateRange(84); // 12 weeks

        Promise.all([
            getActivitiesRange(profile.uid, from, to),
            getJournals(profile.uid),
            getHabitLogs(profile.uid, hFrom, hTo),
        ]).then(([acts, jnls, hlogs]) => {
            setActivities(acts);
            setJournals(jnls);
            setHabitLogs(hlogs);
            setLoading(false);
        }).catch(() => setLoading(false));

        const unsub = subscribeToQuests(profile.uid, setQuests);
        return () => unsub();
    }, [profile?.uid]);

    // ── Aggregations ───────────────────────────────────────────

    // 1. Mood & Energy timeline (30 days)
    const moodEnergyData = useMemo(() => {
        const byDate: Record<string, { moods: number[]; energies: number[] }> = {};
        activities.forEach(a => {
            const k = dateKey(a.startTime);
            if (!byDate[k]) byDate[k] = { moods: [], energies: [] };
            byDate[k].moods.push(a.mood);
            byDate[k].energies.push(a.energy);
        });
        return Object.entries(byDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, v]) => {
                const d = new Date(date);
                return {
                    label: `${d.getDate()} ${MONTHS_ID[d.getMonth()]}`,
                    mood: parseFloat((v.moods.reduce((s, x) => s + x, 0) / v.moods.length).toFixed(1)),
                    energy: parseFloat((v.energies.reduce((s, x) => s + x, 0) / v.energies.length).toFixed(1)),
                };
            });
    }, [activities]);

    // 2. Activity breakdown (hours per category)
    const categoryData = useMemo(() => {
        const hours: Record<string, number> = {};
        activities.forEach(a => {
            hours[a.category] = (hours[a.category] ?? 0) + durationHours(a);
        });
        return Object.entries(hours)
            .filter(([, h]) => h > 0)
            .map(([cat, h]) => ({ name: CAT_LABELS[cat] ?? cat, value: parseFloat(h.toFixed(1)), color: CAT_COLORS[cat] ?? '#888' }))
            .sort((a, b) => b.value - a.value);
    }, [activities]);

    // 3. Peak hours (activities per hour of day)
    const peakHoursData = useMemo(() => {
        const counts = Array.from({ length: 24 }, (_, i) => ({ hour: `${String(i).padStart(2,'0')}:00`, count: 0 }));
        activities.forEach(a => {
            const h = new Date(a.startTime).getHours();
            counts[h].count++;
        });
        return counts.filter((_, i) => i >= 5 && i <= 23); // trim midnight–4am
    }, [activities]);

    // 4. Best day of week
    const bestDayData = useMemo(() => {
        const counts = DAYS_ID.map(d => ({ day: d, count: 0, hours: 0 }));
        activities.forEach(a => {
            const dow = new Date(a.startTime).getDay();
            counts[dow].count++;
            counts[dow].hours += durationHours(a);
        });
        return counts;
    }, [activities]);

    // 5. Strength radar (quest difficulty × category)
    const radarData = useMemo(() => {
        const approved = quests.filter(q => q.status === 'approved');
        return QUEST_CATEGORIES.map(cat => {
            const catQuests = approved.filter(q => q.category === cat);
            const score = catQuests.reduce((s, q) => s + (DIFF_WEIGHT[q.difficulty] ?? 1), 0);
            return { category: QUEST_CAT_LABELS[cat], score };
        });
    }, [quests]);

    // 6. EXP growth (cumulative from journals, last 30 days)
    const expData = useMemo(() => {
        const { from } = dateRange(30);
        const recent = journals.filter(j => (j.createdAt ?? '') >= from);
        const byDate: Record<string, number> = {};
        recent.forEach(j => {
            const k = dateKey(j.createdAt ?? '');
            byDate[k] = (byDate[k] ?? 0) + (j.expEarned ?? 0);
        });
        let cumulative = 0;
        return Object.entries(byDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, exp]) => {
                cumulative += exp;
                const d = new Date(date);
                return { label: `${d.getDate()} ${MONTHS_ID[d.getMonth()]}`, exp, cumulative };
            });
    }, [journals]);

    // 7. Mood vs Quest output
    const moodVsQuestData = useMemo(() => {
        const aiApproved = quests.filter(q => q.status === 'approved' && isAIQuest(q.createdBy));
        const byDate: Record<string, number> = {};
        aiApproved.forEach(q => {
            const k = dateKey(q.updatedAt ?? '');
            byDate[k] = (byDate[k] ?? 0) + 1;
        });
        return moodEnergyData.map(d => ({
            ...d,
            quests: byDate[d.label] ?? 0,
        })).filter(d => d.quests > 0 || d.mood > 0);
    }, [moodEnergyData, quests]);

    // 8. Habit completion rate (last 12 weeks)
    const habitRate = useMemo(() => {
        if (!habitLogs.length) return null;
        const completed = habitLogs.filter(l => l.completed).length;
        return Math.round((completed / habitLogs.length) * 100);
    }, [habitLogs]);

    // ── Summary stats ──────────────────────────────────────────
    const totalHoursLogged = useMemo(() =>
        activities.reduce((s, a) => s + durationHours(a), 0).toFixed(0), [activities]);

    const avgMood = useMemo(() => {
        if (!activities.length) return '-';
        const avg = activities.reduce((s, a) => s + a.mood, 0) / activities.length;
        return avg.toFixed(1);
    }, [activities]);

    const peakHour = useMemo(() => {
        if (!peakHoursData.length) return '-';
        const max = peakHoursData.reduce((m, h) => h.count > m.count ? h : m, peakHoursData[0]);
        return max.count > 0 ? max.hour : '-';
    }, [peakHoursData]);

    const questsDone = quests.filter(q => q.status === 'approved').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
        );
    }

    const noActivity = activities.length === 0;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <header>
                <h1 className="text-2xl font-extrabold text-ink">Analytics</h1>
                <p className="text-ink-muted text-sm mt-0.5">Pola hidupmu dalam 30 hari terakhir</p>
            </header>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Activity}   label="Jam Tercatat"  value={`${totalHoursLogged}j`}  sub="30 hari" />
                <StatCard icon={Zap}        label="Rata-rata Mood" value={avgMood}                  sub="(1–5)" color="text-xp" bg="bg-xp-soft" />
                <StatCard icon={Clock}      label="Peak Hour"     value={peakHour}                  sub="paling aktif" color="text-purple-600" bg="bg-purple-50" />
                <StatCard icon={Target}     label="Quest Selesai" value={questsDone}                sub="total" color="text-success" bg="bg-success-soft" />
            </div>

            {noActivity && (
                <div className="glass rounded-card shadow-card p-8 text-center">
                    <BarChart2 className="w-10 h-10 text-ink-muted mx-auto mb-3" />
                    <p className="text-ink font-bold">Belum ada data aktivitas</p>
                    <p className="text-ink-muted text-sm mt-1">Mulai catat aktivitasmu di <span className="text-brand font-semibold">Life Log</span> untuk melihat analitik di sini.</p>
                </div>
            )}

            {/* Row 1: Mood + Energy | Category Breakdown */}
            {!noActivity && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Mood & Energi" sub="Rata-rata harian (skala 1–5)">
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={moodEnergyData}>
                                <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={20} />
                                <Tooltip content={<ChartTip />} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Line type="monotone" dataKey="mood"   name="Mood"   stroke="#3b82f6" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="energy" name="Energi" stroke="#10b981" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Distribusi Waktu" sub="Jam per kategori, 30 hari" accentColor="#a855f7 #ec4899">
                        {categoryData.length === 0 ? (
                            <p className="text-ink-muted text-sm py-8 text-center">Belum ada data</p>
                        ) : (
                            <div className="flex items-center gap-4">
                                <ResponsiveContainer width="60%" height={200}>
                                    <PieChart>
                                        <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                                            {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                        </Pie>
                                        <Tooltip formatter={(v) => [`${Number(v).toFixed(1)} jam`]} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex-1 space-y-1.5">
                                    {categoryData.map(c => (
                                        <div key={c.name} className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                                            <span className="text-xs text-ink-soft flex-1">{c.name}</span>
                                            <span className="text-xs font-bold text-ink">{c.value}j</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </ChartCard>
                </div>
            )}

            {/* Row 2: Peak Hours | Best Day */}
            {!noActivity && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Peak Hours" sub="Jam kamu paling sering mulai aktivitas" accentColor="#f59e0b #fbbf24">
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={peakHoursData} barSize={8}>
                                <XAxis dataKey="hour" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
                                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={20} allowDecimals={false} />
                                <Tooltip content={<ChartTip />} />
                                <Bar dataKey="count" name="Aktivitas" fill="#f59e0b" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Hari Terbaik" sub="Hari dalam seminggu yang paling aktif" accentColor="#10b981 #34d399">
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={bestDayData} barSize={24}>
                                <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={20} allowDecimals={false} />
                                <Tooltip content={<ChartTip />} />
                                <Bar dataKey="count" name="Aktivitas" fill="#10b981" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            )}

            {/* Row 3: Activity Heatmap */}
            {!noActivity && (
                <ChartCard title="Activity Heatmap" sub="Intensitas aktivitas 12 minggu terakhir">
                    <ActivityHeatmap activities={activities} />
                </ChartCard>
            )}

            {/* Row 4: Strength Radar | EXP Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Strength Radar" sub="Kekuatanmu berdasarkan quest yang diselesaikan" accentColor="#6366f1 #a855f7">
                    {radarData.every(r => r.score === 0) ? (
                        <p className="text-ink-muted text-sm py-8 text-center">Selesaikan quest untuk melihat kekuatanmu</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#e3e9f3" />
                                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#586484' }} />
                                <Radar dataKey="score" name="Strength" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                                <Tooltip content={<ChartTip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                <ChartCard title="EXP Growth" sub="Kumulatif EXP yang kamu kumpulkan" accentColor="#f59e0b #fbbf24">
                    {expData.length === 0 ? (
                        <p className="text-ink-muted text-sm py-8 text-center">Belum ada data EXP</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={expData}>
                                <defs>
                                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
                                <Tooltip content={<ChartTip />} />
                                <Area type="monotone" dataKey="cumulative" name="Total EXP" stroke="#f59e0b" fill="url(#expGrad)" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>
            </div>

            {/* Row 5: Mood vs Quest Output */}
            {moodVsQuestData.length > 0 && (
                <ChartCard title="Mood vs Output" sub="Korelasi rata-rata mood dengan quest selesai per hari">
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={moodVsQuestData}>
                            <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                            <YAxis yAxisId="mood"   domain={[1,5]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={20} />
                            <YAxis yAxisId="quests" orientation="right" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={20} allowDecimals={false} />
                            <Tooltip content={<ChartTip />} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Line yAxisId="mood"   type="monotone" dataKey="mood"   name="Mood"   stroke="#3b82f6" strokeWidth={2} dot={false} />
                            <Line yAxisId="quests" type="monotone" dataKey="quests" name="Quest"  stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}

            {/* Row 6: Habit Rate */}
            {habitRate !== null && (
                <ChartCard title="Habit Completion" sub="Tingkat penyelesaian habit 12 minggu terakhir" accentColor="#10b981 #34d399">
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-5xl font-extrabold text-success">{habitRate}%</p>
                            <p className="text-ink-muted text-xs mt-1">Completion Rate</p>
                        </div>
                        <div className="flex-1">
                            <div className="h-4 bg-surface-2 rounded-full overflow-hidden border border-line">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${habitRate}%`, background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' }}
                                />
                            </div>
                            <p className="text-ink-muted text-xs mt-2">
                                {habitRate >= 80 ? '🔥 Konsistensi luar biasa!' :
                                 habitRate >= 60 ? '👍 Cukup bagus, terus tingkatkan!' :
                                 habitRate >= 40 ? '⚡ Masih perlu usaha lebih.' :
                                 '💪 Mulai bangun konsistensi sekarang.'}
                            </p>
                        </div>
                    </div>
                </ChartCard>
            )}
        </div>
    );
}
