'use client';

import { useState } from 'react';
import { Activity, Plus, Clock, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLog } from '@/hooks/useActivityLog';
import { useActivityHistory } from '@/hooks/useActivityHistory';
import { useHabits } from '@/hooks/useHabits';
import { useWorkTasks } from '@/hooks/useWorkTasks';
import { useSituation } from '@/hooks/useSituation';
import { GRAD } from '@/constants/ui';
import { formatDuration } from '@/constants/life-log';
import { LogForm }             from '@/components/life-log/LogForm';
import { CurrentActivityCard } from '@/components/life-log/CurrentActivityCard';
import { TimelineEntry }       from '@/components/life-log/TimelineEntry';
import { HabitRow }            from '@/components/life-log/HabitRow';
import { AddHabitForm }        from '@/components/life-log/AddHabitForm';
import { ActivityHistory }     from '@/components/life-log/ActivityHistory';
import { SituationRoom } from '@/components/ai-gm/SituationRoom';
import { WorkTasksSection } from '@/components/ai-gm/WorkTasksSection';
import OnboardingTour from '@/components/system/OnboardingTour';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import { LIFE_LOG_TOUR_STEPS } from '@/constants/onboardingTours';
import { DUMMY_TIMELINE_ENTRIES, DUMMY_ACTIVITY_HISTORY_DAYS } from '@/constants/onboardingPreviewData';
import Badge from '@/components/ui/Badge';

export default function LifeLogPage() {
    const { profile } = useAuth();
    const {
        entries, currentActivity, saving, switchActivity, stopCurrent, getDurationMinutes,
        completedEntries, totalMinutesToday, avgMood,
    } = useActivityLog(profile?.uid);
    // Not destructured: `habits` shares its own field name (`habits.habits`),
    // so pulling it apart would force confusing renames of every field.
    const habits  = useHabits(profile?.uid);
    const { days: historyDays, loading: historyLoading, getDurationMinutes: getHistoryDurationMinutes } = useActivityHistory(profile?.uid);
    const wt  = useWorkTasks(profile?.uid);
    const sit = useSituation(profile?.uid);
    const { run: isOnboarding } = useOnboardingTour('life-log', LIFE_LOG_TOUR_STEPS);
    const showDummyTimeline = isOnboarding && completedEntries.length === 0;
    const showDummyHistory  = isOnboarding && historyDays.length === 0;

    const [showLogForm,   setShowLogForm]   = useState(false);
    const [showHabitForm, setShowHabitForm] = useState(false);

    const handleSwitch = async (data: Parameters<typeof switchActivity>[0]) => {
        await switchActivity(data);
        setShowLogForm(false);
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <OnboardingTour tourKey="life-log" steps={LIFE_LOG_TOUR_STEPS} />
            <header data-tour="life-log-header" className="relative overflow-hidden rounded-card p-6 md:p-7 text-white shadow-card" style={{ backgroundImage: GRAD.brand }}>
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
                                ? `${formatDuration(totalMinutesToday)} tercatat hari ini · ${entries.length} aktivitas`
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

            <div data-tour="life-log-current">
                {currentActivity && !showLogForm ? (
                    <CurrentActivityCard
                        entry={currentActivity}
                        duration={getDurationMinutes(currentActivity)}
                        onSwitch={() => setShowLogForm(true)}
                        onStop={stopCurrent}
                        saving={saving}
                    />
                ) : showLogForm ? (
                    <section className="glass rounded-card shadow-card p-5 md:p-6">
                        <h2 className="text-ink font-extrabold text-lg mb-4">
                            {currentActivity ? 'Ganti Aktivitas' : 'Mulai Aktivitas Baru'}
                        </h2>
                        <LogForm
                            onSave={handleSwitch}
                            onCancel={() => setShowLogForm(false)}
                            saving={saving}
                            label={currentActivity ? 'Ganti Sekarang' : 'Mulai Sekarang'}
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
                                <Activity className="w-4 h-4" /> Mulai Catat
                            </button>
                        </div>
                    </section>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div data-tour="life-log-situation"><SituationRoom sit={sit} /></div>
                <div data-tour="life-log-tasks"><WorkTasksSection wt={wt} /></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section data-tour="life-log-timeline" className="relative glass rounded-card shadow-card">
                    {showDummyTimeline && <Badge variant="B" className="absolute top-4 right-4 z-10">Contoh</Badge>}
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
                        {showDummyTimeline ? (
                            <div className="space-y-0">
                                {DUMMY_TIMELINE_ENTRIES.map((e) => (
                                    <TimelineEntry key={e.id} entry={e} duration={getDurationMinutes(e)} />
                                ))}
                            </div>
                        ) : completedEntries.length === 0 ? (
                            <p className="text-ink-muted text-sm py-4 text-center">Belum ada aktivitas selesai hari ini.</p>
                        ) : (
                            <div className="space-y-0">
                                {[...completedEntries].reverse().map((e) => (
                                    <TimelineEntry key={e.id} entry={e} duration={getDurationMinutes(e)} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section data-tour="life-log-habits" className="glass rounded-card shadow-card">
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
                                        style={{ width: `${(habits.todayCount / habits.todayTotal) * 100}%`, background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' }}
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
                            <p className="text-ink-muted text-sm py-4 text-center">Belum ada habit. Klik + untuk tambah.</p>
                        ) : (
                            <div className="space-y-3">
                                {habits.habits.map((h) => (
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

            <div data-tour="life-log-history" className="relative">
                {showDummyHistory && <Badge variant="B" className="absolute top-0 right-0 z-10">Contoh</Badge>}
                <ActivityHistory
                    days={showDummyHistory ? DUMMY_ACTIVITY_HISTORY_DAYS : historyDays}
                    loading={historyLoading}
                    habits={habits.habits}
                    getDurationMinutes={getHistoryDurationMinutes}
                />
            </div>
        </div>
    );
}
