'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/types';
import Card from '@/components/ui/Card';
import { Trophy, Medal, Crown, Star, Sparkles } from 'lucide-react';

export default function LeaderboardPage() {
    const { profile, loading: authLoading } = useAuth();
    const [leaders, setLeaders] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // Mengambil top 50 user berdasarkan EXP terbanyak
                const q = query(
                    collection(db, 'users'),
                    orderBy('exp', 'desc'),
                    limit(50)
                );

                const querySnapshot = await getDocs(q);
                const usersData: UserProfile[] = [];

                querySnapshot.forEach((doc) => {
                    usersData.push(doc.data() as UserProfile);
                });

                setLeaders(usersData);
            } catch (error) {
                console.error("Gagal menarik data leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (authLoading || loading) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-amber-600">Menyusun Peringkat Guild...</div>;
    }

    return (
        <div
            className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden text-slate-800"
            style={{
                background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FDE68A 100%)',
                fontFamily: 'var(--font-nunito), sans-serif'
            }}
        >
            {/* Background Ornaments */}
            <div className="absolute top-0 right-0 w-[30rem] md:w-[40rem] h-[30rem] md:h-[40rem] bg-amber-300/20 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[20rem] md:w-[30rem] h-[20rem] md:h-[30rem] bg-orange-300/20 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />

            <div className="max-w-3xl lg:max-w-4xl mx-auto relative z-10 pt-4 md:pt-8">

                <header className="mb-10 md:mb-14 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_10px_30px_rgba(245,158,11,0.3)] mb-4 md:mb-6 border-4 border-white transform hover:scale-105 transition-transform duration-300">
                        <Trophy className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <p className="text-amber-600 text-[10px] md:text-xs tracking-[0.3em] uppercase mb-2 font-extrabold flex items-center justify-center gap-1.5 md:gap-2">
                        <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" /> Hall of Fame
                    </p>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-950 mb-3" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Guild Leaderboard
                    </h1>
                    <p className="text-amber-700/80 font-medium text-sm md:text-base mt-2 md:mt-3 max-w-sm md:max-w-xl mx-auto px-4">
                        Peringkat para pahlawan berdasarkan dedikasi dan EXP yang dikumpulkan. Siapa yang menduduki takhta tertinggi minggu ini?
                    </p>
                </header>

                <div className="space-y-3 md:space-y-4">
                    {leaders.map((user, index) => {
                        const isMe = profile?.uid === user.uid;
                        const rank = index + 1;

                        // Styling khusus untuk Top 3
                        let rankStyle = "bg-white border-slate-100 text-slate-600";
                        let RankIcon = <span className="font-black text-lg md:text-xl text-slate-400">{rank}</span>;

                        if (rank === 1) {
                            rankStyle = "bg-gradient-to-r from-amber-100 to-yellow-50 border-amber-300 shadow-[0_10px_20px_rgba(245,158,11,0.15)] transform md:scale-[1.02] z-10";
                            RankIcon = <Crown className="w-6 h-6 md:w-8 md:h-8 text-amber-500 drop-shadow-sm" />;
                        } else if (rank === 2) {
                            rankStyle = "bg-gradient-to-r from-slate-100 to-gray-50 border-slate-300 shadow-sm";
                            RankIcon = <Medal className="w-5 h-5 md:w-7 md:h-7 text-slate-400" />;
                        } else if (rank === 3) {
                            rankStyle = "bg-gradient-to-r from-orange-100 to-orange-50 border-orange-200 shadow-sm";
                            RankIcon = <Medal className="w-5 h-5 md:w-7 md:h-7 text-orange-400" />;
                        }

                        return (
                            <Card
                                key={user.uid}
                                className={`flex items-center p-3 sm:p-4 md:p-5 transition-all duration-300 border-2 ${rankStyle} ${isMe ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
                            >
                                {/* Posisi Ranking */}
                                <div className="w-10 sm:w-12 md:w-16 flex justify-center items-center flex-shrink-0">
                                    {RankIcon}
                                </div>

                                {/* Avatar */}
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden shadow-sm flex-shrink-0 border-2 ${rank === 1 ? 'border-amber-400' : 'border-white'}`}>
                                    <img
                                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=fef3c7&color=d97706&bold=true`}
                                        alt={user.displayName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Info User */}
                                <div className="ml-3 sm:ml-4 md:ml-6 flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 md:gap-2 mb-0.5">
                                        <h2 className="text-base sm:text-lg md:text-xl font-bold truncate text-slate-800" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                            {user.displayName}
                                        </h2>
                                        {isMe && (
                                            <span className="bg-purple-100 text-purple-700 text-[8px] md:text-[9px] font-black uppercase tracking-wider px-1.5 md:px-2 py-0.5 rounded-md flex-shrink-0">
                                                Kamu
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 md:gap-1.5 truncate">
                                        <Star className={`w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0 ${rank === 1 ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                                        <span className="truncate">Lv. {user.level || 1} {user.title || 'Hero'}</span>
                                    </p>
                                </div>

                                {/* Skor EXP */}
                                <div className="text-right ml-2 sm:ml-4 flex-shrink-0">
                                    <p className={`text-xl sm:text-2xl md:text-3xl font-black leading-none mb-1 ${rank === 1 ? 'text-amber-600' : 'text-slate-700'}`}>
                                        {user.exp || 0}
                                    </p>
                                    <p className="text-[8px] sm:text-[9px] md:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total EXP</p>
                                </div>
                            </Card>
                        );
                    })}

                    {leaders.length === 0 && !loading && (
                        <div className="text-center py-12 md:py-16 opacity-50 bg-white/50 rounded-3xl border-2 border-dashed border-amber-200">
                            <Trophy className="w-10 h-10 md:w-12 md:h-12 text-amber-900 mx-auto mb-3" />
                            <p className="font-bold text-amber-900 text-sm md:text-base">Belum ada Hero di Guild ini.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}