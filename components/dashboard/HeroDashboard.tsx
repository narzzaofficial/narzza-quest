'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis,
    ComposedChart, Bar, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
} from 'recharts';
import {
    Flame, Trophy, Clock, CheckCircle2, Swords, ScrollText,
    BookOpen, Sparkles, ChevronRight, Compass, Loader2, BarChart2, TrendingUp,
} from 'lucide-react';
import { useAIGameMaster } from '@/hooks/useAIGameMaster';
import { useGMMessages } from '@/hooks/useGMMessages';
import { useActivityLog } from '@/hooks/useActivityLog';
import { useAnimatedPercent } from '@/hooks/useAnimatedPercent';
import { GRAD } from '@/constants/ui';
import { GMBanner } from '@/components/gm/GMBanner';
import { ArcCard } from '@/components/gm/ArcCard';
import { PendingBanner } from '@/components/dashboard/PendingBanner';
import { MenuGrid } from '@/components/dashboard/MenuGrid';
import { ChartTooltip } from '@/components/dashboard/ChartTooltip';
import { getAvatarUrl } from '@/lib/avatar';
import type { useDashboard } from '@/hooks/useDashboard';
import OnboardingTour from '@/components/system/OnboardingTour';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import { DASHBOARD_TOUR_STEPS } from '@/constants/onboardingTours';
import { DUMMY_ACTIVITY_7D, DUMMY_STORY_ARC, DUMMY_ARC_QUESTS } from '@/constants/onboardingPreviewData';
import Badge from '@/components/ui/Badge';

type DashboardData = ReturnType<typeof useDashboard>;

export function HeroDashboard({ d }: { d: DashboardData }) {
    const profile = d.profile!;
    const hasActivity = d.activity7d.some((p) => p.exp > 0 || p.penalty > 0);
    const { run: isOnboarding } = useOnboardingTour('dashboard', DASHBOARD_TOUR_STEPS);
    const showDummyActivity = isOnboarding && !hasActivity;
    const [chartType, setChartType] = useState<'bar' | 'line'>('line');
    const { displayPct, smoothPct } = useAnimatedPercent(d.expPercent);
    const ai = useAIGameMaster();
    const showDummyArc = isOnboarding && !ai.storyArc.arc;
    const gm = useGMMessages(profile.uid);
    const activityLog = useActivityLog(profile.uid);

    const { totalMinutesToday } = activityLog;
    const jamAktifLabel = totalMinutesToday >= 60
        ? `${(totalMinutesToday / 60).toFixed(1)}h`
        : totalMinutesToday > 0 ? `${Math.round(totalMinutesToday)}m` : '—';

    const stats = [
        { label: 'Quest Selesai', value: profile.totalQuestsCompleted || 0, icon: CheckCircle2, grad: GRAD.brand },
        { label: 'Jam Aktif Hari Ini', value: jamAktifLabel, icon: Clock, grad: GRAD.sky },
        { label: 'Day Streak', value: d.streak, icon: Flame, grad: GRAD.amber },
        { label: 'Total Level', value: profile.level || 1, icon: Trophy, grad: GRAD.green },
    ];

    const actions = [
        { href: '/quest-board', tag: 'Misi Aktif', title: 'Quest Board', desc: 'Lihat & submit semua misi dari GM', icon: ScrollText, grad: GRAD.brand },
        { href: '/guild-quest', tag: 'Kompetisi', title: 'Guild Quest', desc: 'Quest terbuka — siapa cepat, dia dapat', icon: Swords, grad: GRAD.sky },
        { href: '/journal', tag: 'Catatan', title: 'Jurnal', desc: 'Catat perjalananmu sebagai adventurer', icon: BookOpen, grad: GRAD.green },
    ];

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <OnboardingTour tourKey="dashboard" steps={DASHBOARD_TOUR_STEPS} />
            <PendingBanner count={d.pendingCount} />

            {gm.latestHighPriority && (
                <GMBanner message={gm.latestHighPriority} onDismiss={gm.markRead} />
            )}

            {/* Mobile Hero */}
            <div className="md:hidden space-y-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full overflow-hidden ring-4 ring-sky-50">
                            <img src={getAvatarUrl(profile.avatar, profile.displayName)} alt={profile.displayName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Selamat belajar,</p>
                            <h1 className="text-xl font-extrabold text-slate-900">{profile.displayName}</h1>
                        </div>
                    </div>
                    <div className="bg-[#eff6ff] text-[#3b82f6] px-4 py-1.5 rounded-xl font-extrabold text-sm">
                        Lv.{profile.level || 1}
                    </div>
                </div>

                <div className="bg-white rounded-[24px] p-5 shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="relative w-[150px] h-[150px] shrink-0">
                            <svg className="w-full h-full -rotate-90 transform drop-shadow-sm" viewBox="0 0 160 160">
                                <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 70}
                                    strokeDashoffset={(2 * Math.PI * 70) - ((smoothPct / 100) * (2 * Math.PI * 70))}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                                <span className="text-[44px] leading-none font-black text-slate-900 tracking-tight">{profile.level || 1}</span>
                                <span className="text-[#3b82f6] text-xs font-bold mt-1 px-2 text-center leading-tight truncate w-full">{profile.title || 'Pemula'}</span>
                                <span className="text-slate-400 text-[11px] mt-0.5">{displayPct}% ke level {(profile.level || 1) + 1}</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-slate-900 font-extrabold text-[17px] leading-tight mb-2.5">Terus belajar dan jadi versi terbaikmu!</h3>
                            <p className="text-slate-400 text-[13px] font-medium leading-relaxed">Konsistensi hari ini,<br />prestasi esok hari.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero banner */}
            <header data-tour="hero-banner" className="hidden md:block relative overflow-hidden rounded-card p-6 md:p-7 text-white shadow-card" style={{ backgroundImage: GRAD.brand }}>
                <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/15 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-20 left-10 w-52 h-52 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-5">
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden ring-4 ring-white/40 bg-white/20">
                            <img src={getAvatarUrl(profile.avatar, profile.displayName)} alt={profile.displayName} className="w-full h-full object-cover" />
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

            {/* Menu Grid */}
            <MenuGrid role="hero" />

            {/* XP + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <section data-tour="xp-card" className="hidden md:block glass rounded-card p-5 shadow-card">
                    <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-1">Experience</p>
                    <p className="text-ink font-bold text-sm mb-1">Level {profile.level || 1} → {(profile.level || 1) + 1}</p>
                    <div className="relative mx-auto" style={{ height: 180 }}>
                        <ResponsiveContainer width="100%" height={180} minWidth={1} minHeight={1}>
                            <RadialBarChart innerRadius="74%" outerRadius="100%" data={[{ value: d.expPercent }]} startAngle={90} endAngle={-270}>
                                <defs>
                                    <linearGradient id="radialGrad" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#4f7cff" />
                                        <stop offset="100%" stopColor="#38bdf8" />
                                    </linearGradient>
                                </defs>
                                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                                <RadialBar background={{ fill: 'var(--color-surface-2)' }} dataKey="value" cornerRadius={20} fill="url(#radialGrad)" animationBegin={0} animationDuration={800} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-extrabold text-ink">{displayPct}%</span>
                            <span className="text-ink-muted text-[10px] uppercase tracking-widest font-bold">Progress</span>
                        </div>
                    </div>
                    <p className="text-center text-ink-soft text-xs mt-1">
                        {profile.exp || 0} / {profile.expToNextLevel || 100} EXP · butuh <span className="text-brand font-bold">{d.expRemaining}</span> lagi
                    </p>
                </section>

                <section data-tour="activity-card" className="relative glass rounded-card p-5 shadow-card lg:col-span-2">
                    {showDummyActivity && <Badge variant="B" className="absolute top-3 right-3 z-10">Contoh</Badge>}
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-0.5">Aktivitas</p>
                            <p className="text-ink font-bold text-sm">EXP 7 Hari Terakhir</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Chart type toggle */}
                            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-2 border border-line">
                                <button
                                    onClick={() => setChartType('bar')}
                                    className={`p-1.5 rounded-md transition-all ${chartType === 'bar' ? 'bg-surface shadow-sm text-brand' : 'text-ink-muted hover:text-ink'}`}
                                    title="Bar chart"
                                >
                                    <BarChart2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setChartType('line')}
                                    className={`p-1.5 rounded-md transition-all ${chartType === 'line' ? 'bg-surface shadow-sm text-brand' : 'text-ink-muted hover:text-ink'}`}
                                    title="Line chart"
                                >
                                    <TrendingUp className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-ink-muted">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-brand inline-block" />Dapat</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-danger inline-block" />Penalti</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative" style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height={200} minWidth={1} minHeight={1}>
                            <ComposedChart data={showDummyActivity ? DUMMY_ACTIVITY_7D : d.activity7d} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
                                <defs>
                                    <linearGradient id="expLineGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="penLineGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.15} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
                                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }} allowDecimals={false} width={32} />
                                <ReferenceLine y={0} stroke="var(--color-line-strong)" strokeWidth={1} />
                                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-line-strong)', strokeWidth: 1 }} />
                                {chartType === 'bar' ? (
                                    <>
                                        <Bar dataKey="exp" name="Dapat" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                        <Bar dataKey="penalty" name="Penalti" fill="#ef4444" radius={[0, 0, 4, 4]} maxBarSize={32} />
                                    </>
                                ) : (
                                    <Area type="monotone" dataKey="exp" name="Dapat" stroke="#3b82f6" strokeWidth={2.5} fill="url(#expLineGrad)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                        {!hasActivity && !showDummyActivity && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-ink-muted text-sm font-semibold">Belum ada aktivitas minggu ini</p>
                                <p className="text-ink-muted/70 text-xs">Selesaikan quest untuk mulai mengisi grafik</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Stats row */}
            <section data-tour="stats-row" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div data-tour="story-arc-card" className="relative">
                {showDummyArc && <Badge variant="B" className="absolute top-3 right-3 z-10">Contoh</Badge>}
                <ArcCard
                    arc={showDummyArc ? DUMMY_STORY_ARC : ai.storyArc.arc}
                    loading={showDummyArc ? false : ai.storyArc.loading}
                    generating={showDummyArc ? false : ai.storyArc.generating}
                    daysRemaining={showDummyArc ? 11 : ai.storyArc.daysRemaining}
                    progressPct={showDummyArc ? 21 : ai.storyArc.progressPct}
                    justCompleted={showDummyArc ? null : ai.storyArc.justCompleted}
                    onDismissCompleted={ai.storyArc.dismissCompleted}
                    arcQuests={showDummyArc
                        ? DUMMY_ARC_QUESTS
                        : ai.storyArc.arc
                            ? ai.aiQuests
                                .filter(q => (q.createdAt || '') >= ai.storyArc.arc!.startDate)
                                .map(q => ({ id: q.id, title: q.title, status: q.status }))
                            : []}
                />
            </div>

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
                        data-tour="generate-quest-btn"
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
            <section data-tour="quick-actions">
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
