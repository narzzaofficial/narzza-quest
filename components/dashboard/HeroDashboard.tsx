'use client';

import Link from 'next/link';
import {
    ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis,
    AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
    Flame, Trophy, Clock, CheckCircle2, Swords, ScrollText,
    BookOpen, Sparkles, ChevronRight, Compass, Loader2,
} from 'lucide-react';
import { useAIGameMaster } from '@/hooks/useAIGameMaster';
import { useGMMessages } from '@/hooks/useGMMessages';
import { useActivityLog } from '@/hooks/useActivityLog';
import { GRAD } from '@/constants/ui';
import { GMBanner } from '@/components/gm/GMBanner';
import { ArcCard } from '@/components/gm/ArcCard';
import { PendingBanner } from '@/components/dashboard/PendingBanner';
import { ChartTooltip } from '@/components/dashboard/ChartTooltip';
import type { useDashboard } from '@/hooks/useDashboard';

type DashboardData = ReturnType<typeof useDashboard>;

function avatarFor(name: string) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e9f1ff&color=3b82f6&bold=true&size=200`;
}

export function HeroDashboard({ d }: { d: DashboardData }) {
    const profile    = d.profile!;
    const hasActivity = d.activity7d.some((p) => p.exp > 0);
    const ai         = useAIGameMaster();
    const gm         = useGMMessages(profile.uid);
    const activityLog = useActivityLog(profile.uid);

    const totalMinutesToday = activityLog.entries.reduce(
        (sum, e) => sum + activityLog.getDurationMinutes(e), 0
    );
    const jamAktifLabel = totalMinutesToday >= 60
        ? `${(totalMinutesToday / 60).toFixed(1)}h`
        : totalMinutesToday > 0 ? `${Math.round(totalMinutesToday)}m` : '—';

    const stats = [
        { label: 'Quest Selesai',      value: profile.totalQuestsCompleted || 0, icon: CheckCircle2, grad: GRAD.brand },
        { label: 'Jam Aktif Hari Ini', value: jamAktifLabel,                     icon: Clock,        grad: GRAD.sky   },
        { label: 'Day Streak',         value: d.streak,                          icon: Flame,        grad: GRAD.amber },
        { label: 'Total Level',        value: profile.level || 1,                icon: Trophy,       grad: GRAD.green },
    ];

    const actions = [
        { href: '/quest-board',  tag: 'Misi Aktif', title: 'Quest Board', desc: 'Lihat & submit semua misi dari GM',           icon: ScrollText, grad: GRAD.brand },
        { href: '/guild-quest',  tag: 'Kompetisi',  title: 'Guild Quest', desc: 'Quest terbuka — siapa cepat, dia dapat',      icon: Swords,     grad: GRAD.sky   },
        { href: '/journal',      tag: 'Catatan',    title: 'Jurnal',      desc: 'Catat perjalananmu sebagai adventurer',       icon: BookOpen,   grad: GRAD.green },
    ];

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <PendingBanner count={d.pendingCount} />

            {gm.latestHighPriority && (
                <GMBanner message={gm.latestHighPriority} onDismiss={gm.markRead} />
            )}

            {/* Hero banner */}
            <header className="relative overflow-hidden rounded-card p-6 md:p-7 text-white shadow-card" style={{ backgroundImage: GRAD.brand }}>
                <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/15 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-20 left-10 w-52 h-52 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-5">
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden ring-4 ring-white/40 bg-white/20">
                            <img src={profile.avatar || avatarFor(profile.displayName)} alt={profile.displayName} className="w-full h-full object-cover" />
                        </div>
                        <span className="absolute -bottom-2 -right-2 bg-white text-brand text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-card">
                            LV {profile.level || 1}
                        </span>
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <p className="text-white/70 text-[10px] tracking-[0.25em] uppercase font-bold mb-1">Hero Active</p>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{profile.displayName}</h1>
                        <p className="text-white/80 text-sm font-medium mt-0.5">&ldquo;{profile.title || 'Rookie Adventurer'}&rdquo;</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-white/15 backdrop-blur-sm px-5 py-3 ring-1 ring-white/25">
                        <Flame className="w-6 h-6 text-white" />
                        <div className="leading-none">
                            <p className="text-2xl font-extrabold text-white">{d.streak}</p>
                            <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold mt-0.5">Streak</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* XP + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <section className="glass rounded-card p-5 shadow-card">
                    <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-1">Experience</p>
                    <p className="text-ink font-bold text-sm mb-1">Level {profile.level || 1} → {(profile.level || 1) + 1}</p>
                    <div className="relative mx-auto" style={{ height: 180 }}>
                        <ResponsiveContainer width="100%" height={180}>
                            <RadialBarChart innerRadius="74%" outerRadius="100%" data={[{ value: d.expPercent }]} startAngle={90} endAngle={-270}>
                                <defs>
                                    <linearGradient id="radialGrad" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#4f7cff" />
                                        <stop offset="100%" stopColor="#38bdf8" />
                                    </linearGradient>
                                </defs>
                                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                                <RadialBar background={{ fill: 'var(--color-surface-2)' }} dataKey="value" cornerRadius={20} fill="url(#radialGrad)" />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-extrabold text-ink">{d.expPercent}%</span>
                            <span className="text-ink-muted text-[10px] uppercase tracking-widest font-bold">Progress</span>
                        </div>
                    </div>
                    <p className="text-center text-ink-soft text-xs mt-1">
                        {profile.exp || 0} / {profile.expToNextLevel || 100} EXP · butuh <span className="text-brand font-bold">{d.expRemaining}</span> lagi
                    </p>
                </section>

                <section className="glass rounded-card p-5 shadow-card lg:col-span-2">
                    <div className="mb-3">
                        <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-0.5">Aktivitas</p>
                        <p className="text-ink font-bold text-sm">EXP 7 Hari Terakhir</p>
                    </div>
                    <div className="relative" style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={d.activity7d} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
                                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }} allowDecimals={false} width={32} />
                                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-line-strong)' }} />
                                <Area type="monotone" dataKey="exp" stroke="#3b82f6" strokeWidth={2.5} fill="url(#xpFill)" />
                            </AreaChart>
                        </ResponsiveContainer>
                        {!hasActivity && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-ink-muted text-sm font-semibold">Belum ada aktivitas minggu ini</p>
                                <p className="text-ink-muted/70 text-xs">Selesaikan quest untuk mulai mengisi grafik ✨</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Stats row */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="glass rounded-card p-4 shadow-card">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm" style={{ backgroundImage: s.grad }}>
                            <s.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-extrabold text-ink">{s.value}</p>
                        <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mt-0.5">{s.label}</p>
                    </div>
                ))}
            </section>

            {/* Story Arc */}
            <ArcCard
                arc={ai.storyArc.arc}
                loading={ai.storyArc.loading}
                generating={ai.storyArc.generating}
                daysRemaining={ai.storyArc.daysRemaining}
                progressPct={ai.storyArc.progressPct}
                justCompleted={ai.storyArc.justCompleted}
                onDismissCompleted={ai.storyArc.dismissCompleted}
                onRegenerateArc={() => ai.storyArc.generateNewArc()}
                activeQuestCount={ai.active.length}
                arcQuests={ai.storyArc.arc
                    ? ai.aiQuests
                        .filter(q => (q.createdAt || '') >= ai.storyArc.arc!.startDate)
                        .map(q => ({ id: q.id, title: q.title, status: q.status }))
                    : []}
            />

            {/* AI Game Master */}
            <section className="glass rounded-card p-5 md:p-6 shadow-card">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundImage: GRAD.brand }}>
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-brand text-[10px] uppercase tracking-widest font-bold">AI Game Master</p>
                        <h3 className="text-ink font-extrabold text-lg">Minta misi yang pas buatmu hari ini</h3>
                        <p className="text-ink-soft text-sm">
                            Quest dibuat berdasarkan arc aktif{ai.storyArc.arc ? ` (${ai.storyArc.arc.theme})` : ''}, level, streak, dan konteks hidupmu.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => ai.generate()}
                        disabled={ai.generating}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-white font-bold shadow-card hover:bg-brand-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {ai.generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {ai.generating ? 'Membuat…' : 'Generate Quest'}
                    </button>
                </div>
                {(ai.createdCount > 0 || ai.error) && (
                    <div className="mt-4 pt-4 border-t border-line text-sm">
                        {ai.error
                            ? <p className="text-danger font-semibold">⚠ {ai.error}</p>
                            : <p className="text-success font-semibold">✓ {ai.createdCount} quest baru dibuat!{' '}<Link href="/quest-board" className="text-brand underline underline-offset-2">Buka Quest Board</Link></p>
                        }
                    </div>
                )}
            </section>

            {/* Quick actions */}
            <section>
                <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-3">Quick Actions</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {actions.map((a) => (
                        <Link key={a.href} href={a.href} className="group glass rounded-card p-5 shadow-card hover:shadow-pop hover:-translate-y-0.5 transition-all">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm" style={{ backgroundImage: a.grad }}>
                                <a.icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold">{a.tag}</p>
                            <h3 className="text-ink font-extrabold text-lg mb-0.5">{a.title}</h3>
                            <p className="text-ink-soft text-xs mb-3">{a.desc}</p>
                            <span className="inline-flex items-center gap-1 text-brand font-bold text-xs group-hover:gap-2 transition-all">
                                Buka <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {!d.hasPartner && (
                <section className="glass rounded-card p-6 text-center shadow-card">
                    <Compass className="w-8 h-8 text-ink-muted mx-auto mb-2" />
                    <p className="text-ink font-bold mb-1">Belum terhubung dengan Game Master</p>
                    <p className="text-ink-soft text-sm mb-4">Hubungkan akunmu dengan GM untuk mulai menerima quest.</p>
                    <Link href="/network" className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 font-bold text-sm text-white hover:bg-brand-hover transition-colors">
                        Cari GM
                    </Link>
                </section>
            )}
        </div>
    );
}
