'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToQuests } from '@/lib/db';
import { Quest } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Map,
    X,
    Clock,
    CircleDot,
    CheckCircle2,
    ArrowRightCircle,
    AlertCircle,
    Circle
} from 'lucide-react';

export default function CalendarGridPage() {
    const { profile, loading } = useAuth();
    const [quests, setQuests] = useState<Quest[]>([]);
    const [isLoadingQuests, setIsLoadingQuests] = useState(true);

    // State untuk kalender & Modal
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null); // State Pop-up

    useEffect(() => {
        if (profile) {
            const unsubscribe = subscribeToQuests(profile.uid, (fetchedQuests) => {
                setQuests(fetchedQuests);
                setIsLoadingQuests(false);
            });
            return () => unsubscribe();
        } else {
            setIsLoadingQuests(false);
        }
    }, [profile]);

    // Mengelompokkan misi berdasarkan format YYYY-MM-DD
    const groupedQuests = quests.reduce((acc, quest) => {
        const dateObj = new Date(quest.deadline);
        const offset = dateObj.getTimezoneOffset() * 60000;
        const localDate = new Date(dateObj.getTime() - offset);
        const dateKey = localDate.toISOString().split('T')[0];

        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(quest);
        return acc;
    }, {} as Record<string, Quest[]>);

    // Navigasi Bulan
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Perhitungan Grid
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Helper UI Status
    const getQuestColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'submitted': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'in_progress': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'submitted': return <ArrowRightCircle className="w-4 h-4 text-amber-500" />;
            case 'in_progress': return <CircleDot className="w-4 h-4 text-purple-500" />;
            case 'rejected': return <AlertCircle className="w-4 h-4 text-rose-500" />;
            default: return <Circle className="w-4 h-4 text-slate-300" />;
        }
    };

    if (loading || isLoadingQuests) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-purple-600">Memuat Kalender...</div>;
    }

    // Data quest untuk modal (jika ada tanggal yang diklik)
    const modalQuests = selectedDateKey ? groupedQuests[selectedDateKey] || [] : [];
    const formattedModalDate = selectedDateKey ? new Date(selectedDateKey).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';

    return (
        <div
            className="min-h-screen p-4 md:p-6 lg:p-8 relative overflow-hidden text-slate-800 flex flex-col"
            style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #F3E8FF 100%)',
                fontFamily: 'var(--font-nunito), sans-serif'
            }}
        >
            <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col relative z-10">

                <header className="mb-4 lg:mb-6 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
                    <div>
                        <p className="text-purple-500 text-xs tracking-[0.2em] uppercase mb-1 font-extrabold flex items-center justify-center md:justify-start gap-2">
                            <Map className="w-4 h-4" /> Campaign Roadmap
                        </p>
                        <h1 className="text-2xl md:text-4xl font-bold text-purple-950" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            Kalender Perencanaan
                        </h1>
                    </div>

                    <div className="flex items-center justify-center gap-2 md:gap-4 bg-white p-1.5 md:p-2 rounded-2xl border border-purple-100 shadow-sm">
                        <button onClick={prevMonth} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={goToToday} className="flex items-center gap-2 px-2 md:px-4 py-2 font-bold text-purple-900 hover:bg-purple-50 rounded-xl transition-colors w-36 md:w-40 justify-center text-sm md:text-base">
                            <CalendarIcon className="w-4 h-4 text-purple-500" />
                            {monthNames[month]} {year}
                        </button>
                        <button onClick={nextMonth} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <Card className="bg-white/80 backdrop-blur-sm shadow-sm border-purple-100 flex-1 flex flex-col overflow-hidden">
                    {/* Header Hari */}
                    <div className="grid grid-cols-7 border-b border-purple-100 bg-purple-50/50 flex-shrink-0">
                        {dayNames.map((day, idx) => (
                            <div key={day} className={`p-2 md:p-3 text-center text-[10px] md:text-sm font-extrabold uppercase tracking-widest ${idx === 0 || idx === 6 ? 'text-pink-500' : 'text-purple-600'}`}>
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Grid Kotak Tanggal */}
                    <div className="grid grid-cols-7 bg-slate-50 gap-px border-b border-purple-100 flex-1">

                        {blanks.map((blank) => (
                            <div key={`blank-${blank}`} className="bg-white p-1 md:p-2 opacity-30 h-16 md:h-24 lg:h-[105px]" />
                        ))}

                        {days.map((day) => {
                            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const dayQuests = groupedQuests[dateKey] || [];
                            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                            // Batasi tampilan maksimal 2 quest agar kotak tidak melar (overflow)
                            const displayQuests = dayQuests.slice(0, 2);
                            const remainingCount = dayQuests.length - 2;

                            return (
                                <div
                                    key={day}
                                    onClick={() => setSelectedDateKey(dateKey)}
                                    className={`bg-white p-1 md:p-2 border-r border-b border-purple-50 hover:bg-purple-50/60 cursor-pointer transition-colors h-20 md:h-24 lg:h-[105px] flex flex-col overflow-hidden ${isToday ? 'bg-purple-50/40' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-0.5 md:mb-1">
                                        <span className={`inline-flex items-center justify-center w-5 h-5 md:w-7 md:h-7 rounded-full text-[10px] md:text-sm font-bold ${isToday ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500'}`}>
                                            {day}
                                        </span>
                                    </div>

                                    {/* Area Pita Misi / Quests (Scroll dinonaktifkan agar bersih) */}
                                    <div className="space-y-0.5 md:space-y-1 mt-1 flex-1 overflow-hidden pointer-events-none">
                                        {displayQuests.map((quest) => (
                                            <div
                                                key={quest.id}
                                                className={`text-[8px] md:text-[10px] lg:text-xs font-bold px-1 md:px-1.5 py-0.5 md:py-1 rounded-md md:rounded-lg border truncate leading-tight ${getQuestColor(quest.status)}`}
                                            >
                                                {new Date(quest.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {quest.title}
                                            </div>
                                        ))}
                                        {remainingCount > 0 && (
                                            <div className="text-[8px] md:text-[10px] font-black text-slate-400 text-center mt-0.5">
                                                +{remainingCount} lainnya
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

            </div>

            {/* ─── POP-UP MODAL (Klik Tanggal) ─── */}
            {selectedDateKey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedDateKey(null)}>
                    <div
                        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()} // Mencegah klik tembus ke belakang
                    >
                        {/* Modal Header */}
                        <div className="p-6 bg-purple-50 border-b border-purple-100 flex justify-between items-start relative">
                            <div>
                                <p className="text-purple-500 font-extrabold text-[10px] tracking-widest uppercase mb-1">Daftar Misi</p>
                                <h2 className="text-xl font-bold text-purple-950 leading-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                    {formattedModalDate}
                                </h2>
                            </div>
                            <button onClick={() => setSelectedDateKey(null)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {modalQuests.length === 0 ? (
                                <div className="text-center py-8">
                                    <CalendarIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-400 font-bold">Hari ini bebas misi!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {modalQuests.map((quest) => (
                                        <div key={quest.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col gap-2">
                                            <div className="flex justify-between items-start">
                                                <Badge variant={quest.status} className="capitalize text-[10px]">
                                                    {quest.status.replace('_', ' ')}
                                                </Badge>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(quest.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-sm leading-snug">{quest.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getStatusIcon(quest.status)}
                                                <span className="text-[10px] font-bold uppercase text-slate-500">
                                                    Rank {quest.difficulty} • +{quest.expReward} EXP
                                                </span>
                                            </div>
                                        </div>
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