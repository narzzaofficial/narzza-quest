'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { Camera, Save, UserCircle, Mail, Type, Award, Lock, Loader2 } from 'lucide-react';

export default function ProfilePage() {
    const { profile, refreshProfile, loading } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [displayName, setDisplayName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false); // State khusus upload foto
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.displayName || '');
        }
    }, [profile]);

    // ─── FUNGSI UPLOAD FOTO PROFIL ───
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile) return;

        // Validasi ukuran (misal maks 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert("Ukuran file terlalu besar! Maksimal 2MB.");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            // 1. Upload ke DigitalOcean via API Route kamu
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error("Gagal mengunggah gambar");

            const data = await res.json();
            const newAvatarUrl = data.url;

            // 2. Update field 'avatar' di Firestore
            const userRef = doc(db, 'users', profile.uid);
            await updateDoc(userRef, { avatar: newAvatarUrl });

            // 3. Refresh data agar sidebar & UI langsung berubah
            await refreshProfile();

            setToastMessage('Foto profil berhasil diperbarui! 📸');
            setShowToast(true);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Gagal mengganti foto profil.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', profile.uid);
            await updateDoc(userRef, { displayName });
            await refreshProfile();
            setToastMessage('Profil berhasil diperbarui! ✨');
            setShowToast(true);
        } catch (error) {
            console.error("Gagal update profil:", error);
            alert("Terjadi kesalahan saat menyimpan profil.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center font-bold text-purple-600">
                Memuat profil...
            </div>
        );
    }

    const avatarUrl = profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=fce7f3&color=db2777&bold=true&size=200`;

    return (
        <div
            className="min-h-screen p-6 md:p-10"
            style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #F3E8FF 100%)',
                fontFamily: 'var(--font-nunito), sans-serif'
            }}
        >
            <div className="max-w-md mx-auto">

                <header className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-purple-950 flex items-center justify-center gap-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        <UserCircle className="w-6 h-6 text-purple-500" /> Pengaturan Profil
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Sesuaikan identitasmu di dunia Life Quest.</p>
                </header>

                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(168,85,247,0.10)] border border-purple-100 overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400" />

                    {/* Avatar dengan Fitur Klik untuk Upload */}
                    <div className="flex justify-center -mt-10 mb-3">
                        <div
                            className="relative group cursor-pointer"
                            onClick={() => !isUploading && fileInputRef.current?.click()}
                        >
                            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-md bg-white relative">
                                {isUploading ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-purple-50">
                                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                                    </div>
                                ) : (
                                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                )}

                                {/* Overlay saat Hover */}
                                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>

                            {/* Ikon Kamera Kecil di Pojok */}
                            <span className="absolute bottom-1 right-1 bg-pink-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-110">
                                <Camera className="w-3.5 h-3.5" />
                            </span>

                            {/* Hidden Input File */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    <div className="text-center mb-5 px-4">
                        <h2 className="text-lg font-bold text-purple-950 truncate" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            {profile.displayName}
                        </h2>
                        <p className="text-pink-500 font-bold text-sm flex items-center justify-center gap-1 mt-0.5">
                            {profile.role === 'gm' ? <Award className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-slate-300" />}
                            {profile.role === 'gm' ? 'Game Master' : profile.title || `Lv. ${profile.level || 1} Hero`}
                        </p>
                    </div>

                    <form onSubmit={handleSave}>
                        <div className="px-6 pb-6 space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-px flex-1 bg-purple-100" />
                                <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-widest">Detail Akun</span>
                                <div className="h-px flex-1 bg-purple-100" />
                            </div>

                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-extrabold text-purple-800 mb-1.5 uppercase tracking-widest">
                                    <Type className="w-3.5 h-3.5" /> Nama Panggilan
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-purple-200 bg-white font-bold text-sm text-slate-800 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all shadow-sm"
                                    placeholder="Contoh: Nardi Hero"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-400 mb-1.5 uppercase tracking-widest">
                                    <Mail className="w-3.5 h-3.5" /> Email Akun
                                    <Lock className="w-3 h-3 ml-auto text-slate-300" />
                                </label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 text-sm font-bold cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-400 mb-1.5 uppercase tracking-widest">
                                    <Award className="w-3.5 h-3.5" /> Gelar / Title
                                    <Lock className="w-3 h-3 ml-auto text-slate-300" />
                                </label>
                                <input
                                    type="text"
                                    value={profile.role === 'gm' ? 'Game Master' : profile.title || 'Apprentice'}
                                    disabled
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-pink-400 text-sm font-bold cursor-not-allowed"
                                />
                                <p className="text-[10px] text-slate-300 mt-1 font-semibold uppercase tracking-wider italic">
                                    * Gelar dikelola secara otomatis oleh sistem.
                                </p>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={isSaving}
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-sm flex flex-row items-center justify-center gap-2 rounded-xl shadow-[0_4px_14px_rgba(168,85,247,0.3)] hover:-translate-y-0.5 transition-all"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Simpan Perubahan</span>
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <Toast isVisible={showToast} onClose={() => setShowToast(false)} message={toastMessage} type="success" />
        </div>
    );
}