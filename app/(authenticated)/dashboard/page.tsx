'use client';

import React from 'react';
import Link from 'next/link';
import {
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';
import {
    Flame,
    Trophy,
    Clock,
    CheckCircle2,
    Swords,
    ScrollText,
    BookOpen,
    Sparkles,
    ChevronRight,
    Crown,
    Users,
    Compass,
    Loader2,
} from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAIQuests } from '@/hooks/useAIQuests';
import type { UserProfile } from '@/types';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function avatarFor(name: string) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
    )}&background=e9f1ff&color=3b82f6&bold=true&size=200`;
}

const GRAD = {
    brand: 'linear-gradient(135deg, #4f7cff 0%, #38bdf8 100%)',
    sky: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
    amber: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    green: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
};

function PendingBanner({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <div className="bg-warn-soft border border-warn/20 text-warn rounded-card px-4 py-3 text-sm font-semibold">
            {count} laporan/tugas menunggu sinkronisasi offline — otomatis terkirim saat online.
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-line glass px-3 py-2 shadow-pop text-xs">
            <p className="font-bold text-ink mb-0.5">{label}</p>
            <p className="text-brand font-semibold">{payload[0].value} EXP</p>
        </div>
    );
}

// ──────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────

export default function DashboardPage() {
    const d = useDashboard();

    if (d.loading || !d.profile) return <DashboardSkeleton />;
    if (d.profile.role === 'gm') return <GMDashboard d={d} />;
    return <HeroDashboard d={d} />;
}

type DashboardData = ReturnType<typeof useDashboard>;

// ──────────────────────────────────────────────
// Hero Dashboard
// ──────────────────────────────────────────────

function HeroDashboard({ d }: { d: DashboardData }) {
    const profile = d.profile!;
    const hasActivity = d.activity7d.some((p) => p.exp > 0);
    const ai = useAIQuests(profile);

    const stats = [
        { label: 'Quest Selesai', value: profile.totalQuestsCompleted || 0, icon: CheckCircle2, grad: GRAD.brand },
        { label: 'Jam Fokus', value: `${(profile.totalHoursWorked || 0).toFixed(1)}h`, icon: Clock, grad: GRAD.sky },
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
            <PendingBanner count={d.pendingCount} />

            {/* ── Hero banner ── */}
            <header
                className="relative overflow-hidden rounded-card p-6 md:p-7 text-white shadow-card"
                style={{ backgroundImage: GRAD.brand }}
            >
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
                        <p className="text-white/80 text-sm font-medium mt-0.5">“{profile.title || 'Rookie Adventurer'}”</p>
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

            {/* ── XP + Activity ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Level progress radial */}
                <section className="glass rounded-card p-5 shadow-card">
                    <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-1">Experience</p>
                    <p className="text-ink font-bold text-sm mb-1">Level {profile.level || 1} → {(profile.level || 1) + 1}</p>
                    <div className="relative mx-auto" style={{ height: 180 }}>
                        <ResponsiveContainer width="100%" height={180}>
                            <RadialBarChart
                                innerRadius="74%"
                                outerRadius="100%"
                                data={[{ value: d.expPercent }]}
                                startAngle={90}
                                endAngle={-270}
                            >
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

                {/* 7-day activity */}
                <section className="glass rounded-card p-5 shadow-card lg:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-0.5">Aktivitas</p>
                            <p className="text-ink font-bold text-sm">EXP 7 Hari Terakhir</p>
                        </div>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundImage: GRAD.brand }}>
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="relative" style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={d.activity7d} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
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

            {/* ── Stats row ── */}
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

            {/* ── AI Game Master ── */}
            <section className="glass rounded-card p-5 md:p-6 shadow-card">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundImage: GRAD.brand }}>
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-brand text-[10px] uppercase tracking-widest font-bold">AI Game Master</p>
                        <h3 className="text-ink font-extrabold text-lg">Minta misi yang pas buatmu hari ini</h3>
                        <p className="text-ink-soft text-sm">AI bakal lihat level, streak & jurnalmu lalu nyusun quest yang menantang tapi achievable.</p>
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
                        {ai.error ? (
                            <p className="text-danger font-semibold">⚠ {ai.error}</p>
                        ) : (
                            <p className="text-success font-semibold">
                                ✓ {ai.createdCount} quest baru dibuat!{' '}
                                <Link href="/quest-board" className="text-brand underline underline-offset-2">
                                    Buka Quest Board
                                </Link>
                            </p>
                        )}
                    </div>
                )}
            </section>

            {/* ── Quick actions ── */}
            <section>
                <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-3">Quick Actions</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {actions.map((a) => (
                        <Link
                            key={a.href}
                            href={a.href}
                            className="group glass rounded-card p-5 shadow-card hover:shadow-pop hover:-translate-y-0.5 transition-all"
                        >
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

            {/* ── No partner state ── */}
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

// ──────────────────────────────────────────────
// GM Dashboard
// ──────────────────────────────────────────────

function GMDashboard({ d }: { d: DashboardData }) {
    const profile = d.profile!;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <PendingBanner count={d.pendingCount} />

            <header
                className="relative overflow-hidden rounded-card p-6 md:p-7 text-white shadow-card"
                style={{ backgroundImage: GRAD.brand }}
            >
                <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/15 blur-2xl pointer-events-none" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 ring-1 ring-white/30 flex items-center justify-center shrink-0">
                            <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Selamat datang, GM {profile.displayName}</h1>
                            <p className="text-white/80 text-sm">Pantau progres anggota guild-mu hari ini.</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/gm/guild-quest" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 ring-1 ring-white/25 px-5 py-3 font-bold text-sm text-white hover:bg-white/25 transition-colors">
                            <Swords className="w-4 h-4" /> Guild Quest
                        </Link>
                        <Link
                            href="/gm/quests"
                            aria-disabled={!d.hasPartner}
                            className={`inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-sm text-brand shadow-card hover:bg-white/90 transition-colors ${!d.hasPartner ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            Buat Quest Baru
                        </Link>
                    </div>
                </div>
            </header>

            <div>
                <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-3">Pantauan Hero</p>
                {!d.hasPartner ? (
                    <div className="glass rounded-card border border-dashed border-line p-12 text-center shadow-card max-w-2xl mx-auto">
                        <Compass className="w-9 h-9 text-ink-muted mx-auto mb-3" />
                        <p className="text-ink font-bold text-lg mb-1">Guild Masih Kosong</p>
                        <p className="text-ink-soft text-sm mb-5">Belum ada Hero yang bisa kamu pantau dan beri tugas.</p>
                        <Link href="/network" className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 font-bold text-sm text-white hover:bg-brand-hover transition-colors">
                            <Users className="w-4 h-4" /> Undang Hero Sekarang
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {d.linkedPartners.map((hero) => (
                            <HeroCard key={hero.uid} hero={hero} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function HeroCard({ hero }: { hero: UserProfile }) {
    const pct = Math.min(100, Math.round(((hero.exp || 0) / (hero.expToNextLevel || 100)) * 100));
    return (
        <div className="glass rounded-card p-5 shadow-card flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-brand/15 bg-surface mb-3">
                <img src={hero.avatar || avatarFor(hero.displayName)} alt={hero.displayName} className="w-full h-full object-cover" />
            </div>
            <h3 className="font-bold text-lg text-ink">{hero.displayName}</h3>
            <p className="text-ink-muted text-xs mb-4 truncate w-full px-2">{hero.email}</p>
            <div className="w-full rounded-xl bg-surface-2 p-3 mb-4">
                <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-2">Level {hero.level || 1}</p>
                <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundImage: GRAD.brand }} />
                </div>
                <p className="text-ink-soft text-[10px] font-bold mt-2">{hero.exp || 0} / {hero.expToNextLevel || 100} EXP</p>
            </div>
            <Link href="/gm/hero-profile" className="w-full inline-flex items-center justify-center gap-1 rounded-xl border border-line px-4 py-2 text-xs font-bold text-brand hover:bg-brand-soft transition-colors">
                Lihat Dossier <ChevronRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    );
}

// ──────────────────────────────────────────────
// Skeleton
// ──────────────────────────────────────────────

function DashboardSkeleton() {
    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-[3px] border-brand border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-ink-muted font-bold tracking-widest text-xs uppercase">Memuat data petualangan…</p>
                </div>
            </div>
        </div>
    );
}
