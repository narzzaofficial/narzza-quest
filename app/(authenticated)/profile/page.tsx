'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProfileSettings } from '@/hooks/useProfileSettings';
import { GRAD } from '@/constants/ui';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import StatTile from '@/components/ui/StatTile';
import ExpBar from '@/components/ui/ExpBar';
import Toast from '@/components/ui/Toast';
import {
    Camera,
    Save,
    Mail,
    Type,
    Award,
    Lock,
    Loader2,
    Trophy,
    Clock,
    Flame,
    CheckCircle2,
    LogOut,
} from 'lucide-react';
import { dicebearAvatar } from '@/lib/avatar';

export default function ProfilePage() {
    const router = useRouter();
    const { logout } = useAuth();
    const { profile, loading, isSaving, isUploading, uploadAvatar, saveName } = useProfileSettings();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [displayName, setDisplayName] = useState('');
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success',
    });

    useEffect(() => {
        if (profile) setDisplayName(profile.displayName || '');
    }, [profile]);

    const notify = (message: string, type: 'success' | 'error' = 'success') =>
        setToast({ show: true, message, type });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            await uploadAvatar(file);
            notify('Foto profil berhasil diperbarui! 📸');
        } catch (err) {
            notify(err instanceof Error ? err.message : 'Gagal mengganti foto.', 'error');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await saveName(displayName);
            notify('Profil berhasil diperbarui! ✨');
        } catch {
            notify('Terjadi kesalahan saat menyimpan profil.', 'error');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (e) {
            console.error('Logout error:', e);
            notify('Gagal log out', 'error');
        }
    };

    if (loading || !profile) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
        );
    }

    const avatarUrl = profile.avatar || dicebearAvatar(profile.displayName);
    const isGm = profile.role === 'gm';

    const stats = [
        { label: 'Level', value: profile.level || 1, icon: Trophy, grad: 'green' as const },
        { label: 'Quest Selesai', value: profile.totalQuestsCompleted || 0, icon: CheckCircle2, grad: 'brand' as const },
        { label: 'Jam Fokus', value: `${(profile.totalHoursWorked || 0).toFixed(1)}h`, icon: Clock, grad: 'sky' as const },
        { label: 'Day Streak', value: profile.streak || 0, icon: Flame, grad: 'amber' as const },
    ];

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
            {/* ── Identity banner ── */}
            <header className="relative overflow-hidden rounded-card p-6 md:p-7 text-white shadow-card" style={{ backgroundImage: GRAD.brand }}>
                <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/15 blur-2xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                    <button
                        type="button"
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className="relative group shrink-0"
                        aria-label="Ganti foto profil"
                    >
                        <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white/40 bg-white/20">
                            {isUploading ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            ) : (
                                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            )}
                            <div className="absolute inset-0 bg-ink/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <span className="absolute -bottom-1.5 -right-1.5 bg-white text-brand p-1.5 rounded-lg shadow-card">
                            <Camera className="w-3.5 h-3.5" />
                        </span>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </button>

                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white">{profile.displayName}</h1>
                        <p className="text-white/85 font-semibold text-sm flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                            <Award className="w-4 h-4" />
                            {isGm ? 'Game Master' : profile.title || `Lv. ${profile.level || 1} Hero`}
                        </p>
                    </div>
                </div>
            </header>

            {/* ── Stats + XP (hero only) ── */}
            {!isGm && (
                <>
                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((s) => (
                            <StatTile key={s.label} icon={s.icon} label={s.label} value={s.value} grad={s.grad} />
                        ))}
                    </section>

                    <GlassCard className="p-5 md:p-6">
                        <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-3">Experience</p>
                        <ExpBar currentExp={profile.exp || 0} maxExp={profile.expToNextLevel || 100} level={profile.level || 1} />
                    </GlassCard>
                </>
            )}

            {/* ── Settings ── */}
            <GlassCard className="p-5 md:p-6">
                <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-4">Detail Akun</p>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-extrabold text-ink-soft mb-1.5 uppercase tracking-widest">
                            <Type className="w-3.5 h-3.5" /> Nama Panggilan
                        </label>
                        <input
                            type="text"
                            required
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Contoh: Nardi Hero"
                            className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface font-bold text-sm text-ink outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-extrabold text-ink-muted mb-1.5 uppercase tracking-widest">
                            <Mail className="w-3.5 h-3.5" /> Email <Lock className="w-3 h-3 ml-auto" />
                        </label>
                        <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface-2 text-ink-muted text-sm font-bold cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-extrabold text-ink-muted mb-1.5 uppercase tracking-widest">
                            <Award className="w-3.5 h-3.5" /> Gelar <Lock className="w-3 h-3 ml-auto" />
                        </label>
                        <input
                            type="text"
                            value={isGm ? 'Game Master' : profile.title || 'Apprentice'}
                            disabled
                            className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface-2 text-brand text-sm font-bold cursor-not-allowed"
                        />
                        <p className="text-[10px] text-ink-muted mt-1 font-semibold uppercase tracking-wider italic">
                            * Gelar dikelola otomatis oleh sistem.
                        </p>
                    </div>

                    <Button type="submit" variant="primary" isLoading={isSaving} className="w-full">
                        <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
                    </Button>
                </form>
            </GlassCard>

            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-card text-danger font-bold hover:bg-danger-soft transition-colors border border-danger/20 bg-surface shadow-sm"
            >
                <LogOut className="w-5 h-5" /> Keluar dari Akun
            </button>

            <Toast isVisible={toast.show} onClose={() => setToast((t) => ({ ...t, show: false }))} message={toast.message} type={toast.type} />
        </div>
    );
}
