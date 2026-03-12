'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { getQuestById, submitQuest } from '@/lib/db';
import { Quest } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Award,
    UploadCloud,
    FileText,
    X,
    Image as ImageIcon,
    CheckCircle2,
    ExternalLink,
    MessageSquare,
    Heart,
    PlayCircle,
    RefreshCcw,
    AlertCircle
} from 'lucide-react';

export default function QuestDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { profile } = useAuth();

    const [quest, setQuest] = useState<Quest | null>(null);
    const [loading, setLoading] = useState(true);

    // Form State
    const [submissionNote, setSubmissionNote] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // Status State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    useEffect(() => {
        if (id) {
            getQuestById(id as string).then(data => {
                setQuest(data);
                // Jika statusnya rejected, isi otomatis catatan lama untuk mempermudah revisi
                if (data?.status === 'rejected') {
                    setSubmissionNote(data.submissionNote || '');
                }
                setLoading(false);
            });
        }
    }, [id]);

    const handleAcceptQuest = async () => {
        if (!quest) return;
        setIsSubmitting(true);
        try {
            const questRef = doc(db, 'quests', quest.id);
            await updateDoc(questRef, { status: 'in_progress' });
            setQuest({ ...quest, status: 'in_progress' });
        } catch (error) {
            console.error("Gagal mengambil quest:", error);
            alert("Gagal memulai quest.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (indexToRemove: number) => {
        setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quest || !profile) return;

        setIsSubmitting(true);
        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < selectedFiles.length; i++) {
                setUploadProgress(`Mengunggah bukti ${i + 1} dari ${selectedFiles.length}...`);
                const file = selectedFiles[i];
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                if (!res.ok) throw new Error(`Gagal upload file ${file.name}`);
                const data = await res.json();
                uploadedUrls.push(data.url);
            }

            setUploadProgress('Menyimpan laporan ke markas...');
            await submitQuest(quest.id, submissionNote, uploadedUrls);

            alert("Laporan berhasil dikirim ke GM!");
            router.push('/quest-board');
        } catch (error) {
            console.error("Gagal submit:", error);
            alert("Terjadi kesalahan saat mengunggah laporan.");
        } finally {
            setIsSubmitting(false);
            setUploadProgress('');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-purple-600">Mengambil detail quest...</div>;
    if (!quest) return <div className="min-h-screen flex items-center justify-center font-bold text-rose-500">Quest tidak ditemukan.</div>;

    // LOGIKA FORM: Muncul jika In Progress atau Rejected
    const isRevising = quest.status === 'rejected';
    const showUploadForm = (quest.status === 'in_progress' || isRevising) && profile?.role === 'player';

    return (
        <div className="min-h-screen p-4 md:p-8 relative overflow-hidden text-slate-800" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #F3E8FF 100%)', fontFamily: 'var(--font-nunito), sans-serif' }}>
            <div className="max-w-3xl mx-auto relative z-10 pt-4">

                <button onClick={() => router.back()} className="flex items-center gap-2 text-purple-600 font-bold mb-6 hover:text-purple-800 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Kembali ke Papan Quest
                </button>

                {/* ─── KARTU DETAIL QUEST UTAMA (DESAIN AWAL) ─── */}
                <Card className="p-6 md:p-8 bg-white border-purple-100 shadow-[0_10px_40px_rgba(168,85,247,0.08)] mb-8">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge variant={quest.difficulty}>Rank {quest.difficulty}</Badge>
                        <Badge variant={quest.category}>{quest.category}</Badge>
                        <Badge variant={quest.status}>{quest.status.replace('_', ' ').toUpperCase()}</Badge>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-purple-950 mb-4 leading-snug" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        {quest.title}
                    </h1>

                    <div className="flex flex-wrap gap-6 mb-8 text-sm font-bold text-slate-500 border-b border-slate-100 pb-6">
                        <div className="flex items-center gap-2"><Award className="w-5 h-5 text-pink-500" /><span className="text-pink-600">Reward: +{quest.expReward} EXP</span></div>
                        <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-400" /><span>Deadline: {new Date(quest.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                        <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-purple-400" /><span>{new Date(quest.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span></div>
                    </div>

                    <div className="prose prose-purple max-w-none text-slate-700 font-medium leading-relaxed mb-6">
                        <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            <FileText className="w-5 h-5" /> Deskripsi Misi
                        </h3>
                        <p className="whitespace-pre-wrap">{quest.description}</p>
                    </div>

                    {quest.motivation && (
                        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-5 mt-6 relative overflow-hidden">
                            <Heart className="absolute -right-2 -bottom-2 w-16 h-16 text-pink-200 opacity-50" />
                            <h4 className="text-sm font-extrabold text-pink-600 uppercase tracking-widest mb-2 flex items-center gap-2 relative z-10">
                                <MessageSquare className="w-4 h-4" /> Pesan Khusus GM
                            </h4>
                            <p className="text-pink-900 font-bold italic relative z-10">"{quest.motivation}"</p>
                        </div>
                    )}
                </Card>

                {/* ─── TOMBOL MULAI (JIKA PENDING) ─── */}
                {quest.status === 'pending' && profile?.role === 'player' && (
                    <div className="text-center bg-purple-50 p-8 rounded-3xl border border-purple-200 shadow-sm animate-[fadeIn_0.5s_ease-out]">
                        <h3 className="text-xl font-bold text-purple-900 mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>Misi Ini Menunggumu!</h3>
                        <p className="text-slate-600 font-medium mb-6">Terima misi ini untuk mulai mengumpulkan bukti penyelesaian.</p>
                        <Button onClick={handleAcceptQuest} isLoading={isSubmitting} className="bg-purple-600 text-white px-8 py-4 text-lg w-full md:w-auto">
                            <PlayCircle className="w-5 h-5 mr-2" /> Mulai Petualangan
                        </Button>
                    </div>
                )}

                {/* ─── FORM UPLOAD / RE-SUBMIT (DESAIN MEWAH) ─── */}
                {showUploadForm && (
                    <Card className="p-6 md:p-8 bg-white border-pink-100 shadow-lg animate-[fadeIn_0.5s_ease-out]">
                        {isRevising && (
                            <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-400 rounded-r-xl">
                                <p className="text-rose-700 font-black flex items-center gap-2 text-sm uppercase mb-1"><X className="w-4 h-4" /> Alasan Perbaikan:</p>
                                <p className="text-rose-900 font-bold italic">"{quest.reviewNote || 'Silakan perbaiki bukti laporanmu.'}"</p>
                            </div>
                        )}

                        <h2 className="text-2xl font-bold text-purple-950 mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            {isRevising ? <RefreshCcw className="w-6 h-6 text-amber-500" /> : <UploadCloud className="w-6 h-6 text-pink-500" />}
                            {isRevising ? 'Kirim Ulang Bukti' : 'Laporkan Penyelesaian'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label className="block text-sm font-extrabold text-slate-700 mb-2 uppercase tracking-widest">Jurnal Petualangan (Catatan)</label>
                                <textarea required rows={4} value={submissionNote} onChange={(e) => setSubmissionNote(e.target.value)} placeholder="Ceritakan progresmu..." className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-400 font-bold text-slate-700 resize-none" />
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-extrabold text-slate-700 mb-2 uppercase tracking-widest">Bukti Penyelesaian</label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-200 border-dashed rounded-xl cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-purple-600">
                                            <UploadCloud className="w-10 h-10 mb-2" />
                                            <p className="mb-1 text-sm font-bold">Pilih beberapa file bukti baru</p>
                                            <p className="text-xs font-medium opacity-70">PNG, JPG, PDF, ZIP (Maks. 5MB/file)</p>
                                        </div>
                                        <input type="file" multiple className="hidden" onChange={handleFileSelect} />
                                    </label>
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                                <div className="flex items-center gap-3 overflow-hidden text-slate-600">
                                                    {file.type.includes('image') ? <ImageIcon className="w-5 h-5 shrink-0" /> : <FileText className="w-5 h-5 shrink-0" />}
                                                    <span className="text-sm font-bold truncate">{file.name}</span>
                                                </div>
                                                <button type="button" onClick={() => removeFile(index)} className="text-rose-400 hover:text-rose-600"><X className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={selectedFiles.length === 0} className="w-full py-4 text-lg bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg flex items-center justify-center gap-2">
                                {isSubmitting ? uploadProgress : <><CheckCircle2 className="w-5 h-5" /> {isRevising ? 'Kirim Revisi' : 'Serahkan ke GM'}</>}
                            </Button>
                        </form>
                    </Card>
                )}

                {/* ─── HISTORY & BALASAN SURAT GM (DESAIN AWAL DENGAN IKON HATI) ─── */}
                {quest.status !== 'in_progress' && quest.status !== 'pending' && quest.status !== 'rejected' && (
                    <div className="space-y-6 mt-8 animate-[fadeIn_0.5s_ease-out]">
                        <Card className="p-6 bg-slate-50 border border-slate-200 shadow-sm relative overflow-hidden">
                            <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText className="w-4 h-4" /> Laporanmu</h3>
                            <p className="text-slate-700 font-bold mb-6 italic">"{quest.submissionNote || 'Tidak ada catatan.'}"</p>
                            {quest.submissionUrls && (
                                <div className="border-t border-slate-200 pt-4 flex flex-wrap gap-3">
                                    {quest.submissionUrls.map((url, idx) => (
                                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm font-bold text-slate-700 border border-slate-200 hover:text-purple-600 transition-colors shadow-sm">
                                            <ExternalLink className="w-4 h-4" /> File {idx + 1}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </Card>

                        {quest.reviewNote && quest.status === 'approved' && (
                            <Card className="p-6 md:p-8 bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 shadow-md relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 opacity-10 text-rose-500">
                                    <Heart className="w-32 h-32 fill-current" />
                                </div>
                                <h3 className="text-lg font-extrabold text-pink-600 mb-3 flex items-center gap-2 relative z-10" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                    <MessageSquare className="w-5 h-5" /> Balasan dari Game Master 💌
                                </h3>
                                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-pink-100 relative z-10">
                                    <p className="text-purple-900 font-bold leading-relaxed text-lg italic">"{quest.reviewNote}"</p>
                                </div>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}