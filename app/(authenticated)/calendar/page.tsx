'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Map,
    X,
    Clock,
    Loader2,
} from 'lucide-react';
import { useCalendar } from '@/hooks/useCalendar';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import type { Quest } from '@/types';

const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const RIBBON: Record<string, string> = {
    approved: 'bg-success-soft text-success',
    submitted: 'bg-brand-soft text-brand',
    in_progress: 'bg-warn-soft text-warn',
    rejected: 'bg-danger-soft text-danger',
};

export default function CalendarPage() {
    const { profile, loading, isLoadingQuests, heroMap, groupedQuests } = useCalendar();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

    if (loading || isLoadingQuests) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
        );
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const modalQuests = selectedDateKey ? groupedQuests[selectedDateKey] || [] : [];
    const formattedModalDate = selectedDateKey
        ? new Date(selectedDateKey).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : '';

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-5">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="text-brand text-[10px] tracking-[0.2em] uppercase font-extrabold flex items-center gap-2 mb-1">
                        <Map className="w-4 h-4" /> Campaign Roadmap
                    </p>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-ink">Kalender Perencanaan</h1>
                </div>

                <div className="flex items-center gap-2 glass p-1.5 rounded-2xl shadow-card">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 text-ink-muted hover:text-brand hover:bg-surface-2 rounded-xl transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="flex items-center gap-2 px-3 md:px-4 py-2 font-bold text-ink hover:bg-surface-2 rounded-xl transition-colors w-36 md:w-44 justify-center text-sm">
                        <CalendarIcon className="w-4 h-4 text-brand" />
                        {monthNames[month]} {year}
                    </button>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 text-ink-muted hover:text-brand hover:bg-surface-2 rounded-xl transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Grid */}
            <GlassCard className="overflow-hidden">
                <div className="grid grid-cols-7 border-b border-line bg-surface-2">
                    {dayNames.map((day, idx) => (
                        <div key={day} className={`p-2 md:p-3 text-center text-[10px] md:text-sm font-extrabold uppercase tracking-widest ${idx === 0 || idx === 6 ? 'text-brand' : 'text-ink-soft'}`}>
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7">
                    {blanks.map((b) => (
                        <div key={`blank-${b}`} className="border-r border-b border-line bg-surface-2/40 h-20 md:h-24 lg:h-[110px]" />
                    ))}

                    {days.map((day) => {
                        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const dayQuests = groupedQuests[dateKey] || [];
                        const today = new Date();
                        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                        const display = dayQuests.slice(0, 2);
                        const remaining = dayQuests.length - 2;

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDateKey(dateKey)}
                                className={`text-left border-r border-b border-line p-1 md:p-2 hover:bg-brand-soft/50 transition-colors h-20 md:h-24 lg:h-[110px] flex flex-col overflow-hidden ${isToday ? 'bg-brand-soft/40' : 'bg-surface'}`}
                            >
                                <span className={`inline-flex items-center justify-center w-5 h-5 md:w-7 md:h-7 rounded-full text-[10px] md:text-sm font-bold ${isToday ? 'bg-brand text-white shadow-sm' : 'text-ink-soft'}`}>
                                    {day}
                                </span>
                                <div className="space-y-0.5 md:space-y-1 mt-1 flex-1 overflow-hidden">
                                    {display.map((quest) => (
                                        <div key={quest.id} className={`text-[8px] md:text-[10px] lg:text-xs font-bold px-1 md:px-1.5 py-0.5 rounded-md truncate leading-tight ${RIBBON[quest.status] || 'bg-surface-2 text-ink-soft'}`}>
                                            {new Date(quest.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} {quest.title}
                                        </div>
                                    ))}
                                    {remaining > 0 && <div className="text-[8px] md:text-[10px] font-black text-ink-muted text-center">+{remaining} lainnya</div>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </GlassCard>

            {/* Modal */}
            {selectedDateKey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm" onClick={() => setSelectedDateKey(null)}>
                    <div className="bg-surface w-full max-w-md rounded-card shadow-pop overflow-hidden flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 bg-brand-soft border-b border-line flex justify-between items-start">
                            <div>
                                <p className="text-brand font-extrabold text-[10px] tracking-widest uppercase mb-1">Daftar Misi</p>
                                <h2 className="text-lg font-extrabold text-ink leading-tight">{formattedModalDate}</h2>
                            </div>
                            <button onClick={() => setSelectedDateKey(null)} className="p-2 text-ink-muted hover:text-danger rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto custom-scrollbar">
                            {modalQuests.length === 0 ? (
                                <div className="text-center py-8">
                                    <CalendarIcon className="w-10 h-10 text-ink-muted mx-auto mb-3" />
                                    <p className="text-ink-soft font-bold">Hari ini bebas misi!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {modalQuests.map((quest) => (
                                        <ModalQuest key={quest.id} quest={quest} heroName={profile?.role === 'gm' && quest.assignedTo ? heroMap[quest.assignedTo] || quest.assignedTo : undefined} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ModalQuest({ quest, heroName }: { quest: Quest; heroName?: string }) {
    return (
        <Link
            href={`/quest-board/${quest.id}`}
            className="group p-4 rounded-xl border border-line bg-surface-2 hover:bg-brand-soft hover:border-brand/30 transition-colors flex flex-col gap-2"
        >
            <div className="flex justify-between items-start">
                <StatusBadge status={quest.status} />
                <div className="flex items-center gap-1 text-[10px] font-bold text-ink-soft bg-surface px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3" />
                    {new Date(quest.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
            <h3 className="font-bold text-ink text-sm leading-snug group-hover:text-brand transition-colors">{quest.title}</h3>
            <div className="flex items-center gap-2">
                <DifficultyBadge difficulty={quest.difficulty} />
                <span className="text-[10px] font-bold uppercase text-ink-muted">+{quest.expReward} EXP</span>
                <ChevronRight className="w-4 h-4 text-ink-muted ml-auto group-hover:text-brand transition-colors" />
            </div>
            {heroName && (
                <div className="flex items-center gap-1.5 bg-brand-soft px-2.5 py-1.5 rounded-lg">
                    <span className="text-[10px] font-black text-brand uppercase tracking-wide">Hero:</span>
                    <span className="text-[10px] font-bold text-ink">{heroName}</span>
                </div>
            )}
        </Link>
    );
}
