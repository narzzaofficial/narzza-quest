'use client';

import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    AreaChart, Area,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Loader2, TrendingUp, Activity, Clock, Zap, Target, BarChart2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ChartTip } from '@/components/analytics/ChartTip';
import { StatCard } from '@/components/analytics/StatCard';
import { ChartCard } from '@/components/analytics/ChartCard';
import { ActivityHeatmap } from '@/components/analytics/ActivityHeatmap';

export default function AnalyticsPage() {
    const { profile } = useAuth();
    const {
        loading, activities,
        moodEnergyData, categoryData, peakHoursData, bestDayData,
        radarData, expData, moodVsQuestData, habitRate,
        totalHoursLogged, avgMood, peakHour, questsDone,
    } = useAnalytics(profile?.uid);

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
            <header>
                <h1 className="text-2xl font-extrabold text-ink">Analytics</h1>
                <p className="text-ink-muted text-sm mt-0.5">Pola hidupmu dalam 30 hari terakhir</p>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Activity} label="Jam Tercatat"   value={`${totalHoursLogged}j`} sub="30 hari" />
                <StatCard icon={Zap}      label="Rata-rata Mood" value={avgMood}                 sub="(1–5)"  color="text-xp"      bg="bg-xp-soft" />
                <StatCard icon={Clock}    label="Peak Hour"      value={peakHour}                sub="paling aktif" color="text-purple-600" bg="bg-purple-50" />
                <StatCard icon={Target}   label="Quest Selesai"  value={questsDone}              sub="total"  color="text-success" bg="bg-success-soft" />
            </div>

            {noActivity && (
                <div className="glass rounded-card shadow-card p-8 text-center">
                    <BarChart2 className="w-10 h-10 text-ink-muted mx-auto mb-3" />
                    <p className="text-ink font-bold">Belum ada data aktivitas</p>
                    <p className="text-ink-muted text-sm mt-1">Mulai catat aktivitasmu di <span className="text-brand font-semibold">Life Log</span> untuk melihat analitik di sini.</p>
                </div>
            )}

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

                    <ChartCard title="Distribusi Waktu" sub="Jam per kategori, 30 hari">
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

            {!noActivity && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Peak Hours" sub="Jam kamu paling sering mulai aktivitas">
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={peakHoursData} barSize={8}>
                                <XAxis dataKey="hour" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
                                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={20} allowDecimals={false} />
                                <Tooltip content={<ChartTip />} />
                                <Bar dataKey="count" name="Aktivitas" fill="#f59e0b" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Hari Terbaik" sub="Hari dalam seminggu yang paling aktif">
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

            {!noActivity && (
                <ChartCard title="Activity Heatmap" sub="6 bulan lalu · hari ini · 6 bulan ke depan">
                    <ActivityHeatmap activities={activities} />
                </ChartCard>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Strength Radar" sub="Kekuatanmu berdasarkan quest yang diselesaikan">
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

                <ChartCard title="EXP Growth" sub="Kumulatif EXP yang kamu kumpulkan">
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

            {moodVsQuestData.length > 0 && (
                <ChartCard title="Mood vs Output" sub="Korelasi rata-rata mood dengan quest selesai per hari">
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={moodVsQuestData}>
                            <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                            <YAxis yAxisId="mood"   domain={[1,5]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={20} />
                            <YAxis yAxisId="quests" orientation="right" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={20} allowDecimals={false} />
                            <Tooltip content={<ChartTip />} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Line yAxisId="mood"   type="monotone" dataKey="mood"   name="Mood"  stroke="#3b82f6" strokeWidth={2} dot={false} />
                            <Line yAxisId="quests" type="monotone" dataKey="quests" name="Quest" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}

            {habitRate !== null && (
                <ChartCard title="Habit Completion" sub="Tingkat penyelesaian habit 12 minggu terakhir">
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-5xl font-extrabold text-success">{habitRate}%</p>
                            <p className="text-ink-muted text-xs mt-1">Completion Rate</p>
                        </div>
                        <div className="flex-1">
                            <div className="h-4 bg-surface-2 rounded-full overflow-hidden border border-line">
                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${habitRate}%`, background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' }} />
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
