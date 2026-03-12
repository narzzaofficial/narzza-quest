'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToQuests } from '@/lib/db';
import { Quest } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
    CalendarDays,
    Map,
    Clock,
    CircleDot,
    CheckCircle2,
    Circle,
    ArrowRightCircle,
    AlertCircle
} from 'lucide-react';

export default function CalendarPage() {
    const { profile, loading } = useAuth();
    const [quests, setQuests] = useState<Quest[]>([]);
    const [isLoadingQuests, setIsLoadingQuests] = useState(true);

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

    // Mengelompokkan misi berdasarkan tanggal Deadline
    const groupedQuests = quests.reduce((acc, quest) => {
        const dateObj = new Date(quest.deadline);
        // Ambil format YYYY-MM-DD untuk key sorting
        const dateKey = dateObj.toISOString().split('T')[0];

        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(quest);
        return acc;
    }, {} as Record<string, Quest[]>);

    // Mengurutkan tanggal dari yang terdekat hingga terjauh
    const sortedDates = Object.keys(groupedQuests).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Helper untuk memformat tanggal
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Helper ikon berdasarkan status
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
        return <div className="min-h-screen flex items-center justify-center font-bold text-purple-600">Memetakan perjalanan...</div>;
    }

    return (
        <div
            className="min-h-screen p-4 md:p-8 relative overflow-hidden text-slate-800"
            style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #F3E8FF 100%)',
                fontFamily: 'var(--font-nunito), sans-serif'
            }}
        >
            <div className="max-w-4xl mx-auto relative z-10 pt-4">

                <header className="mb-10 text-center md:text-left">
                    <p className="text-purple-500 text-xs tracking-[0.2em] uppercase mb-2 font-extrabold flex items-center justify-center md:justify-start gap-2">
                        <Map className="w-4 h-4" /> Campaign Roadmap
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold text-purple-950" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Kalender Perencanaan
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 max-w-xl">
                        Peta perjalanan misimu. Pantau tenggat waktu dan rencanakan strategimu untuk menyelesaikan setiap tugas tepat waktu.
                    </p>
                </header>

                {sortedDates.length === 0 ? (
                    <Card className="text-center py-16 bg-white/50 border border-slate-200 rounded-3xl border-dashed shadow-sm">
                        <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
                        <h3 className="text-xl font-bold text-slate-600 mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>Timeline Kosong</h3>
                        <p className="text-slate-500 text-sm">Belum ada misi yang dijadwalkan di masa depan.</p>
                    </Card>
                ) : (
                    <div className="relative border-l-2 border-purple-200 ml-3 md:ml-6 space-y-12 pb-10">
                        {sortedDates.map((dateKey, index) => (
                            <div key={dateKey} className="relative pl-6 md:pl-10">

                                {/* Timeline Dot (Node) */}
                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-purple-500 ring-4 ring-purple-50 shadow-sm" />

                                {/* Date Header */}
                                <div className="mb-4">
                                    <h2 className="text-lg font-bold text-purple-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                        {formatDate(dateKey)}
                                    </h2>
                                </div>

                                {/* Quests for this Date */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {groupedQuests[dateKey].map((quest) => (
                                        <Card key={quest.id} className="p-5 bg-white border border-purple-50 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group">
                                            <div className="flex justify-between items-start mb-3">
                                                <Badge variant={quest.status} className="capitalize">
                                                    {quest.status.replace('_', ' ')}
                                                </Badge>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(quest.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>

                                            <h3 className="font-bold text-slate-800 leading-snug mb-1 group-hover:text-purple-700 transition-colors">
                                                {quest.title}
                                            </h3>

                                            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-50">
                                                {getStatusIcon(quest.status)}
                                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                                    Rank {quest.difficulty} • +{quest.expReward} EXP
                                                </span>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}