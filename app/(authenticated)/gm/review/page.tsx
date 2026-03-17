'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToSubmissions, approveQuest, rejectQuest, getUserProfile, getLinkedProfiles } from '@/lib/db';
import { Quest } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import {
  CheckCircle2,
  XCircle,
  Paperclip,
  FileText,
  MessageSquare,
  Coffee,
  Search,
  User,
  ExternalLink,
  Award,
  Wallet // Icon untuk uang
} from 'lucide-react';

export default function GMReviewPage() {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  const [heroMap, setHeroMap] = useState<Record<string, string>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (profile && profile.role === 'gm') {
      if (profile.partnerIds && profile.partnerIds.length > 0) {
        getLinkedProfiles(profile.partnerIds).then(heroes => {
          const map: Record<string, string> = {};
          heroes.forEach(h => { map[h.uid] = h.displayName; });
          setHeroMap(map);
        });
      }

      const unsubscribe = subscribeToSubmissions(profile.uid, (fetchedSubmissions) => {
        setSubmissions(fetchedSubmissions);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [profile]);

  const handleApprove = async (quest: Quest) => {
    setIsProcessing(true);
    try {
      const heroProfile = await getUserProfile(quest.assignedTo);
      if (!heroProfile) throw new Error("Profil Hero tidak ditemukan");

      // Fungsi approveQuest akan menangani penambahan uang di dalamnya
      const result = await approveQuest(
        quest.id,
        quest,
        heroProfile,
        reviewNote || 'Kerja bagus! Terus pertahankan fokusmu.',
        0
      );

      const bountyText = quest.moneyReward ? ` & Rp ${quest.moneyReward.toLocaleString('id-ID')}` : '';
      setToastMessage(`Sukses! ${heroMap[quest.assignedTo] || 'Hero'} mendapatkan +${result.expEarned} EXP${bountyText}.`);
      setShowToast(true);
      setReviewingId(null);
      setReviewNote('');
    } catch (error) {
      console.error("Gagal approve:", error);
      alert("Terjadi kesalahan saat menyetujui quest.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (quest: Quest) => {
    if (!reviewNote.trim()) {
      alert("Tuliskan alasan penolakan di catatan review agar Hero bisa memperbaikinya!");
      return;
    }

    setIsProcessing(true);
    try {
      await rejectQuest(quest.id, reviewNote, profile ? {
        toUid: quest.assignedTo,
        fromUid: profile.uid,
        fromName: profile.displayName,
        questTitle: quest.title,
      } : undefined);
      setToastMessage('Quest dikembalikan ke Hero untuk direvisi.');
      setShowToast(true);
      setReviewingId(null);
      setReviewNote('');
    } catch (error) {
      console.error("Gagal reject:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center font-bold text-purple-600">Memeriksa kotak pos guild...</div>;
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8 relative overflow-hidden text-slate-800"
      style={{
        background: 'linear-gradient(135deg, #F8FAFC 0%, #F3E8FF 100%)',
        fontFamily: 'var(--font-nunito), sans-serif'
      }}
    >
      <div className="max-w-6xl mx-auto space-y-6 relative z-10 pt-4">

        <header className="mb-6">
          <p className="text-rose-500 text-sm tracking-widest uppercase mb-1 font-bold">Game Master Panel</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-1 text-purple-950" style={{ fontFamily: 'var(--font-playfair), serif' }}>
            Review Laporan
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">Validasi tugas dari anggota guild-mu dan berikan persetujuan EXP.</p>
        </header>

        {submissions.length === 0 ? (
          <Card className="text-center py-16 bg-white shadow-sm border-purple-50 flex flex-col items-center justify-center">
            <Coffee className="w-16 h-16 text-slate-200 mb-4" strokeWidth={1.5} />
            <h3 className="text-xl font-bold text-purple-900 mb-2">Semua Laporan Sudah Direview</h3>
            <p className="text-slate-500 text-sm">Hero sedang sibuk menyelesaikan misinya. Silakan bersantai sejenak!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {submissions.map((sub) => (
              <Card key={sub.id} className="flex flex-col border-l-4 border-l-rose-400 overflow-hidden bg-white shadow-sm border-y border-r border-slate-100 transition-all !p-5">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-extrabold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 uppercase tracking-wider">
                        Rank {sub.difficulty}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 uppercase tracking-wider">
                        <User className="w-3 h-3" />
                        {heroMap[sub.assignedTo] || 'Hero Tidak Diketahui'}
                      </span>
                      {/* NEW: BADGE UANG JIKA ADA */}
                      {sub.moneyReward && sub.moneyReward > 0 ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 tracking-wider">
                          <Wallet className="w-3 h-3" /> Rp {sub.moneyReward.toLocaleString('id-ID')}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-purple-950 leading-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                      {sub.title}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 whitespace-nowrap">
                    {new Date(sub.submittedAt!).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-3">
                  <div className="flex items-center gap-2 mb-1.5 text-purple-600">
                    <FileText className="w-4 h-4" />
                    <p className="text-[10px] font-extrabold uppercase tracking-widest">Jurnal Hero</p>
                  </div>
                  <p className="text-slate-700 font-medium text-sm italic mb-3 leading-relaxed">"{sub.submissionNote}"</p>

                  {(sub.submissionUrls?.length || sub.submissionImageUrl) && (
                    <div className="pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-2 mb-2 text-emerald-600">
                        <Paperclip className="w-4 h-4" />
                        <p className="text-[10px] font-extrabold uppercase tracking-widest">
                          Bukti Lampiran ({sub.submissionUrls?.length || 1})
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {sub.submissionUrls && sub.submissionUrls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 shadow-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors hover:border-emerald-200"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-500" /> File {idx + 1}
                          </a>
                        ))}

                        {!sub.submissionUrls && sub.submissionImageUrl && (
                          <a
                            href={sub.submissionImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 shadow-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors hover:border-emerald-200"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-500" /> Buka Bukti
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {reviewingId === sub.id ? (
                  <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-100 mt-1 animate-[fadeIn_0.2s_ease-out]">
                    <div className="flex items-center gap-2 mb-2 text-rose-700">
                      <MessageSquare className="w-4 h-4" />
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest">Catatan dari GM</label>
                    </div>
                    <textarea
                      rows={2}
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="Kasih pujian atau alasan revisi di sini..."
                      className="w-full bg-white border border-rose-200 rounded-lg p-2.5 text-sm text-rose-900 focus:ring-2 focus:ring-rose-400 focus:outline-none mb-3 resize-none font-medium"
                    />
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setReviewingId(null)} disabled={isProcessing} className="text-slate-500">
                        Batal
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleReject(sub)} isLoading={isProcessing} className="border-rose-300 text-rose-600 hover:bg-rose-100 flex items-center justify-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" /> Tolak & Revisi
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => handleApprove(sub)} isLoading={isProcessing} className="bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm border-none text-white flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve (+{sub.expReward})
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-1">
                    <span className="text-pink-600 font-extrabold text-xs bg-pink-50 px-3 py-1.5 rounded-lg border border-pink-100 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> +{sub.expReward} EXP
                    </span>
                    <Button variant="primary" size="sm" onClick={() => setReviewingId(sub.id)} className="flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white shadow-sm rounded-lg px-4 py-1.5">
                      <Search className="w-3.5 h-3.5" /> Review
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
      <Toast isVisible={showToast} onClose={() => setShowToast(false)} message={toastMessage} type="success" />
    </div>
  );
}