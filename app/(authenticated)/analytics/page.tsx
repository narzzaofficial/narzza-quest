'use client';
import { useState } from 'react';

import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Loader2, Activity, Clock, Zap, Target, BarChart2, Flame } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useXPHistory } from '@/hooks/useXPHistory';
import { XPHistory } from '@/components/life-log/XPHistory';
import { ChartTip } from '@/components/analytics/ChartTip';
import { StatCard } from '@/components/analytics/StatCard';
import { ChartCard } from '@/components/analytics/ChartCard';
import { ActivityHeatmap } from '@/components/analytics/ActivityHeatmap';
import { ExpGrowthChart } from '@/components/analytics/ExpGrowthChart';
import { FinanceAnalytics } from '@/components/analytics/FinanceAnalytics';
import { HABIT_ICON_MAP, HABIT_ICON_COLORS } from '@/components/life-log/activityMeta';
import { FaBullseye } from 'react-icons/fa6';
import OnboardingTour from '@/components/system/OnboardingTour';
import { ANALYTICS_TOUR_STEPS } from '@/constants/onboardingTours';

export default function AnalyticsPage() {
    const [tab, setTab] = useState<'life' | 'finance'>('life');
    const { profile } = useAuth();
    const { days, loading: xpLoading, totalEarned, totalPenalty, totalNet, maxAbs } = useXPHistory(profile?.uid);
    const {
        loading, activities,
        moodEnergyData, categoryData, peakHoursData, bestDayData,
        radarData, expData, moodVsQuestData, habitRate,
        totalHoursLogged, avgMood, peakHour, questsDone,
        periodComparison, goalAlignment, habitStreaks,
    } = useAnalytics(profile?.uid, profile?.goal?.focusAreas);

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
            <OnboardingTour tourKey="analytics" steps={ANALYTICS_TOUR_STEPS} />
            <header data-tour="analytics-header" className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-ink">Analytics</h1>
                    <p className="text-ink-muted text-sm mt-0.5">Pola hidup & finansialmu</p>
                </div>
                <div className="flex bg-surface-2 p-1 rounded-xl shadow-sm border border-line">
                    <button
                        onClick={() => setTab('life')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'life' ? 'bg-brand text-white shadow-card' : 'text-ink-muted hover:text-ink hover:bg-surface-3'}`}
                    >
                        Life Analytics
                    </button>
                    <button
                        onClick={() => setTab('finance')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'finance' ? 'bg-brand text-white shadow-card' : 'text-ink-muted hover:text-ink hover:bg-surface-3'}`}
                    >
                        Finance Analytics
                    </button>
                </div>
            </header>

            {tab === 'finance' ? (
                <FinanceAnalytics />
            ) : (
                <>
                    <div data-tour="analytics-stats" className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard icon={Activity} label="Jam Tercatat" value={`${totalHoursLogged}j`} sub="30 hari" trend={{ pct: periodComparison.hoursPct, periodLabel: 'vs minggu lalu' }} />
                        <StatCard icon={Zap} label="Rata-rata Mood" value={avgMood} sub="(1-5)" color="text-xp" bg="bg-xp-soft" trend={{ pct: periodComparison.moodPct, periodLabel: 'vs minggu lalu' }} />
                        <StatCard icon={Clock} label="Peak Hour" value={peakHour} sub="paling aktif" color="text-purple-600" bg="bg-purple-50" />
                        <StatCard icon={Target} label="Quest Selesai" value={questsDone} sub="total" color="text-success" bg="bg-success-soft" />
                    </div>

                    {goalAlignment && (
                        <ChartCard title="Goal Alignment" sub={`Fokus kamu: ${goalAlignment.focusAreas.join(', ')}`}>
                            <div className="flex items-center gap-6">
                                <p className="text-4xl font-extrabold text-brand">{goalAlignment.pct}%</p>
                                <div className="flex-1">
                                    <div className="h-3 bg-surface-2 rounded-full overflow-hidden border border-line">
                                        <div className="h-full rounded-full bg-brand transition-all duration-700" style={{ width: `${goalAlignment.pct}%` }} />
                                    </div>
                                    <p className="text-ink-muted text-xs mt-2">
                                        {goalAlignment.alignedHours}j dari {goalAlignment.totalHours}j total aktivitas sejalan dengan fokus yang kamu tulis di goal.
                                    </p>
                                </div>
                            </div>
                        </ChartCard>
                    )}

                    {habitStreaks.length > 0 && (
                        <ChartCard title="Streak Habit" sub="Konsistensi tiap habit yang kamu lacak">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {habitStreaks.map(h => {
                                    const HabitIcon = HABIT_ICON_MAP[h.icon] ?? FaBullseye;
                                    const iconColor = HABIT_ICON_COLORS[h.icon] ?? '#ef4444';
                                    return (
                                        <div key={h.habitId} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-line">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconColor + '20' }}>
                                                <HabitIcon className="w-4 h-4" style={{ color: iconColor }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-ink truncate">{h.name}</p>
                                                <p className="text-ink-muted text-xs">Terlama: {h.longest} hari</p>
                                            </div>
                                            <p className="flex items-center gap-1 text-lg font-extrabold text-brand whitespace-nowrap">
                                                <Flame className="w-4 h-4" /> {h.current}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </ChartCard>
                    )}

                    <div data-tour="analytics-charts" className="space-y-6">
                    {noActivity && (
                        <div className="glass rounded-card shadow-card p-8 text-center">
                            <BarChart2 className="w-10 h-10 text-ink-muted mx-auto mb-3" />
                            <p className="text-ink font-bold">Belum ada data aktivitas</p>
                            <p className="text-ink-muted text-sm mt-1">Mulai catat aktivitasmu di <span className="text-brand font-semibold">Life Log</span> untuk melihat analitik di sini.</p>
                        </div>
                    )}

                    {!noActivity && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ChartCard title="Mood & Energi" sub="Rata-rata harian (skala 1-5)">
                                <ResponsiveContainer width="100%" height={200} minWidth={1} minHeight={1} style={{ touchAction: 'pan-y' }}>
                                    <LineChart data={moodEnergyData}>
                                        <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                        <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={20} />
                                        <Tooltip content={<ChartTip />} isAnimationActive={false} />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                        <Line type="monotone" dataKey="mood" name="Mood" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="energy" name="Energi" stroke="#10b981" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="Distribusi Waktu" sub="Jam per kategori, 30 hari">
                                {categoryData.length === 0 ? (
                                    <p className="text-ink-muted text-sm py-8 text-center">Belum ada data</p>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <ResponsiveContainer width="60%" height={200} minWidth={1} minHeight={1} style={{ touchAction: 'pan-y' }}>
                                            <PieChart>
                                                <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                                                    {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                                </Pie>
                                                <Tooltip formatter={(v) => [`${Number(v).toFixed(1)} jam`]} isAnimationActive={false} />
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

                    {!noActivity && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ChartCard title="Peak Hours" sub="Jam kamu paling sering mulai aktivitas">
                                <ResponsiveContainer width="100%" height={180} minWidth={1} minHeight={1} style={{ touchAction: 'pan-y' }}>
                                    <BarChart data={peakHoursData} barSize={8}>
                                        <XAxis dataKey="hour" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
                                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={20} allowDecimals={false} />
                                        <Tooltip content={<ChartTip />} cursor={false} isAnimationActive={false} />
                                        <Bar dataKey="count" name="Aktivitas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="Hari Terbaik" sub="Hari dalam seminggu yang paling aktif">
                                <ResponsiveContainer width="100%" height={180} minWidth={1} minHeight={1} style={{ touchAction: 'pan-y' }}>
                                    <BarChart data={bestDayData} barSize={24}>
                                        <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={20} allowDecimals={false} />
                                        <Tooltip content={<ChartTip />} cursor={false} isAnimationActive={false} />
                                        <Bar dataKey="count" name="Aktivitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>
                    )}

                    {!noActivity && (
                        <ChartCard title="Activity Heatmap" sub="6 bulan lalu · hari ini · 6 bulan ke depan">
                            <ActivityHeatmap activities={activities} />
                        </ChartCard>
                    )}

                    {!noActivity && (
                        <ExpGrowthChart data={expData} />
                    )}
                    </div>

                    <div data-tour="analytics-radar" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Strength Radar" sub="Kekuatanmu berdasarkan quest yang diselesaikan">
                            {radarData.every(r => r.score === 0) ? (
                                <p className="text-ink-muted text-sm py-8 text-center">Selesaikan quest untuk melihat kekuatanmu</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={220} minWidth={1} minHeight={1} style={{ touchAction: 'pan-y' }}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="#e3e9f3" />
                                        <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#586484' }} />
                                        <Radar dataKey="score" name="Strength" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                                        <Tooltip content={<ChartTip />} isAnimationActive={false} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>

                        {habitRate !== null && (
                            <ChartCard title="Habit Completion" sub="Tingkat penyelesaian habit 12 minggu terakhir">
                                <div className="flex items-center gap-6 h-full py-4">
                                    <div className="text-center">
                                        <p className="text-5xl font-extrabold text-success">{habitRate}%</p>
                                        <p className="text-ink-muted text-xs mt-1">Completion Rate</p>
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-surface-2 rounded-full overflow-hidden border border-line">
                                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${habitRate}%`, background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' }} />
                                        </div>
                                        <p className="text-ink-muted text-xs mt-2 flex items-center gap-1">
                                            {habitRate >= 80 ? <><Flame className="w-3.5 h-3.5 text-danger shrink-0" /> Konsistensi luar biasa!</> :
                                                habitRate >= 60 ? '👍 Cukup bagus, terus tingkatkan!' :
                                                    habitRate >= 40 ? '⚡ Masih perlu usaha lebih.' :
                                                        '💪 Mulai bangun konsistensi sekarang.'}
                                        </p>
                                    </div>
                                </div>
                            </ChartCard>
                        )}
                    </div>

                    {moodVsQuestData.length > 0 && (
                        <ChartCard title="Mood vs Output" sub="Korelasi rata-rata mood dengan quest selesai per hari">
                            <ResponsiveContainer width="100%" height={200} minWidth={1} minHeight={1} style={{ touchAction: 'pan-y' }}>
                                <LineChart data={moodVsQuestData}>
                                    <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                    <YAxis yAxisId="mood" domain={[1, 5]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={20} />
                                    <YAxis yAxisId="quests" orientation="right" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={20} allowDecimals={false} />
                                    <Tooltip content={<ChartTip />} isAnimationActive={false} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    <Line yAxisId="mood" type="monotone" dataKey="mood" name="Mood" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                    <Line yAxisId="quests" type="monotone" dataKey="quests" name="Quest" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    )}

                    <div data-tour="analytics-xp-history">
                        <XPHistory
                            days={days}
                            loading={xpLoading}
                            totalEarned={totalEarned}
                            totalPenalty={totalPenalty}
                            totalNet={totalNet}
                            maxAbs={maxAbs}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
