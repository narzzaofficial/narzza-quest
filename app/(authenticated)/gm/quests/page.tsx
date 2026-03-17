'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Quest } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

export default function GMQuestListPage() {
    const { profile } = useAuth();
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // 1. FETCH REALTIME SEMUA QUEST BUATAN GM INI
    useEffect(() => {
        if (profile && profile.role === 'gm') {
            const q = query(
                collection(db, 'quests'),
                where('createdBy', '==', profile.uid),
                orderBy('createdAt', 'desc')
            );

            const unsubscribe = onSnapshot(q, (snap) => {
                const fetchedQuests = snap.docs.map(d => ({ id: d.id, ...d.data() } as Quest));
                setQuests(fetchedQuests);
                setLoading(false);
            });

            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, [profile]);

    // 2. FUNGSI HAPUS QUEST
    const handleDelete = async (questId: string) => {
        if (window.confirm("Yakin ingin menghapus quest ini secara permanen?")) {
            try {
                await deleteDoc(doc(db, 'quests', questId));
                setToastMessage('Quest berhasil dihapus dari sistem!');
                setShowToast(true);
            } catch (error) {
                console.error("Gagal menghapus quest:", error);
                alert("Gagal menghapus quest. Coba lagi.");
            }
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-purple-600">Mengambil daftar quest dari guild...</div>;
    }

    return (
        <div
            className="min-h-screen p-4 md:p-8 relative overflow-hidden text-slate-800"
            style={{
                background: 'linear-gradient(135deg, #FFF0F5 0%, #F3E8FF 50%, #E0F2FE 100%)',
                fontFamily: 'var(--font-nunito), sans-serif'
            }}
        >
            <div className="max-w-5xl mx-auto relative z-10 space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pt-4 mb-8">
                    <div>
                        <p className="text-pink-500 text-sm tracking-widest uppercase mb-1 font-bold">Game Master Panel</p>
                        <h1 className="text-4xl font-bold text-purple-950" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            Quest Management
                        </h1>
                    </div>
                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                        <Link href="/gm/quests/new" className="w-full md:w-auto">
                            <Button variant="primary" className="w-full md:w-auto shadow-lg shadow-purple-500/20">
                                ➕ Buat Quest Baru
                            </Button>
                        </Link>
                        <Link href="/gm/quests/new/json" className="w-full md:w-auto">
                            <Button variant="outline" className="w-full md:w-auto border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                ⚡ Form JSON Batch
                            </Button>
                        </Link>
                    </div>
                </header>

                {quests.length === 0 ? (
                    <Card className="p-10 text-center shadow-[0_10px_40px_rgba(168,85,247,0.08)] border-purple-100">
                        <span className="text-4xl block mb-3 opacity-50">📜</span>
                        <p className="text-slate-500 font-medium">Belum ada quest yang dibuat. Klik "Buat Quest Baru" untuk mulai.</p>
                    </Card>
                ) : (
                    <>
                        {/* ─── TAMPILAN DESKTOP (TABEL) ─── */}
                        <Card className="hidden md:block p-0 overflow-hidden shadow-[0_10px_40px_rgba(168,85,247,0.08)] border-purple-100">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 text-purple-900">
                                        <th className="p-5 font-bold uppercase tracking-wider text-xs">Judul Quest</th>
                                        <th className="p-5 font-bold uppercase tracking-wider text-xs">Rank & Kategori</th>
                                        <th className="p-5 font-bold uppercase tracking-wider text-xs">Status</th>
                                        <th className="p-5 font-bold uppercase tracking-wider text-xs">Deadline</th>
                                        <th className="p-5 font-bold uppercase tracking-wider text-xs text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-50 bg-white">
                                    {quests.map((q) => (
                                        <tr key={q.id} className="hover:bg-purple-50/30 transition-colors">
                                            <td className="p-5 font-bold text-slate-800">
                                                {q.title}
                                                <div className="text-xs text-pink-500 mt-1 font-extrabold">+{q.expReward} EXP</div>
                                            </td>
                                            <td className="p-5 space-y-2">
                                                <Badge variant={q.difficulty}>Rank {q.difficulty}</Badge>
                                                <br />
                                                <Badge variant={q.category}>{q.category}</Badge>
                                            </td>
                                            <td className="p-5">
                                                <Badge variant={q.status}>
                                                    {q.status.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="p-5 text-slate-500 font-medium text-sm">
                                                {new Date(q.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="p-5 text-right space-x-2">
                                                <button
                                                    onClick={() => handleDelete(q.id)}
                                                    disabled={q.status === 'approved'}
                                                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 font-bold text-sm px-4 py-2 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>

                        {/* ─── TAMPILAN MOBILE (KARTU BERTUMPUK) ─── */}
                        <div className="md:hidden space-y-4">
                            {quests.map((q) => (
                                <Card key={q.id} className="p-5 shadow-sm border-purple-100 flex flex-col gap-3 relative overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-purple-950 text-lg leading-tight mb-1">{q.title}</h3>
                                            <span className="text-xs font-extrabold text-pink-500">+{q.expReward} EXP</span>
                                        </div>
                                        {/* Tombol Hapus Pojok Kanan Atas */}
                                        <button
                                            onClick={() => handleDelete(q.id)}
                                            disabled={q.status === 'approved'}
                                            className="text-slate-300 hover:text-rose-500 disabled:opacity-0 transition-colors"
                                            aria-label="Hapus Quest"
                                        >
                                            <span className="text-xl">×</span>
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant={q.difficulty}>Rank {q.difficulty}</Badge>
                                        <Badge variant={q.category}>{q.category}</Badge>
                                        <Badge variant={q.status}>{q.status.replace('_', ' ').toUpperCase()}</Badge>
                                    </div>

                                    <div className="mt-2 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium flex items-center gap-2">
                                        <span>⏱️</span>
                                        {new Date(q.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>
            <Toast isVisible={showToast} onClose={() => setShowToast(false)} message={toastMessage} type="success" />
        </div>
    );
}
