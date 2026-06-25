'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProfileSettings } from '@/hooks/useProfileSettings';
import { useProfileForm } from '@/hooks/useProfileForm';
import { useAIConnectionTest } from '@/hooks/useAIConnectionTest';
import { useMcpConnector } from '@/hooks/useMcpConnector';
import { useTelegramConnector } from '@/hooks/useTelegramConnector';
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
    Bot,
    Key,
    Cpu,
    Wifi,
    Sparkles,
    Copy,
    Check,
    ExternalLink,
} from 'lucide-react';
import { FaTelegram } from 'react-icons/fa6';
import { dicebearAvatar } from '@/lib/avatar';

export default function ProfilePage() {
    const router = useRouter();
    const { logout } = useAuth();
    const { profile, loading, isSaving, isUploading, uploadAvatar, saveProfile } = useProfileSettings();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        displayName, setDisplayName,
        useOpenRouter, setUseOpenRouter,
        openRouterApiKey, setOpenRouterApiKey,
        openRouterModel, setOpenRouterModel,
        saveForm,
    } = useProfileForm(profile, saveProfile);
    const { isTesting: isTestingConnection, testConnection } = useAIConnectionTest();
    const {
        isActivating: mcpActivating, isDisconnecting: mcpDisconnecting,
        code: mcpCode, codeCopied, urlCopied, serverUrl: mcpServerUrl,
        activate: mcpActivate, disconnect: mcpDisconnect, copyCode: handleCopyCode, copyUrl: handleCopyUrl,
    } = useMcpConnector();
    const {
        isActivating: isTelegramActivating, isDisconnecting: isTelegramDisconnecting,
        code: telegramCode, deepLink: telegramDeepLink,
        activate: telegramActivate, disconnect: telegramDisconnect,
    } = useTelegramConnector();

    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success',
    });

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
            await saveForm();
            notify('Profil berhasil diperbarui! ✨');
        } catch {
            notify('Terjadi kesalahan saat menyimpan profil.', 'error');
        }
    };

    const handleTestConnection = async () => {
        try {
            await testConnection(openRouterApiKey, openRouterModel);
            notify('Koneksi sukses! Model siap digunakan. 🚀', 'success');
        } catch (e) {
            notify(e instanceof Error ? e.message : 'Koneksi gagal.', 'error');
        }
    };

    const handleActivateMcp = async () => {
        try {
            await mcpActivate();
        } catch (e) {
            notify(e instanceof Error ? e.message : 'Gagal generate kode.', 'error');
        }
    };

    const handleDisconnectMcp = async () => {
        try {
            await mcpDisconnect();
            notify('Sesi Claude Connector berhasil di-keluarkan. Sambungkan ulang di Claude.ai buat ganti akun. 🔌');
        } catch (e) {
            notify(e instanceof Error ? e.message : 'Gagal keluar dari sesi connector.', 'error');
        }
    };

    const handleActivateTelegram = async () => {
        try {
            await telegramActivate();
        } catch (e) {
            notify(e instanceof Error ? e.message : 'Gagal generate kode.', 'error');
        }
    };

    const handleDisconnectTelegram = async () => {
        try {
            await telegramDisconnect();
            notify('Telegram berhasil diputuskan. 🔌');
        } catch (e) {
            notify(e instanceof Error ? e.message : 'Gagal memutuskan Telegram.', 'error');
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

            {/* ── AI Configuration ── */}
            <GlassCard className="p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Bot className="w-4 h-4 text-brand" />
                    <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold">Konfigurasi AI (Opsional)</p>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-line bg-surface cursor-pointer hover:bg-surface-2 transition-colors">
                        <input
                            type="checkbox"
                            checked={useOpenRouter}
                            onChange={(e) => setUseOpenRouter(e.target.checked)}
                            className="w-4 h-4 rounded border-line text-brand focus:ring-brand/20"
                        />
                        <span className="text-sm font-bold text-ink flex-1">Gunakan OpenRouter</span>
                    </label>

                    {useOpenRouter && (
                        <div className="space-y-4 p-4 rounded-xl bg-surface-2 border border-line">
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-extrabold text-ink-soft mb-1.5 uppercase tracking-widest">
                                    <Key className="w-3.5 h-3.5" /> API Key
                                </label>
                                <input
                                    type="password"
                                    value={openRouterApiKey}
                                    onChange={(e) => setOpenRouterApiKey(e.target.value)}
                                    placeholder="sk-or-v1-..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface font-bold text-sm text-ink outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition"
                                />
                                <p className="text-[10px] text-ink-muted mt-1.5 font-medium leading-relaxed">
                                    Akan disimpan aman di database profilmu. Kosongkan jika ingin fallback ke default sistem.
                                </p>
                            </div>

                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-extrabold text-ink-soft mb-1.5 uppercase tracking-widest">
                                    <Cpu className="w-3.5 h-3.5" /> Model ID
                                </label>
                                <input
                                    type="text"
                                    value={openRouterModel}
                                    onChange={(e) => setOpenRouterModel(e.target.value)}
                                    placeholder="google/gemini-2.5-flash"
                                    className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface font-bold text-sm text-ink outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition"
                                />
                                <p className="text-[10px] text-ink-muted mt-1.5 font-medium leading-relaxed">
                                    Secara default sistem menggunakan &quot;google/gemini-2.5-flash&quot;.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            isLoading={isTestingConnection}
                            onClick={handleTestConnection}
                            className="w-full sm:w-1/3 whitespace-nowrap"
                            disabled={!openRouterApiKey}
                            leftIcon={<Wifi className="w-4 h-4" />}
                        >
                            Test Koneksi
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isSaving}
                            className="w-full sm:w-2/3 whitespace-nowrap"
                            leftIcon={<Save className="w-4 h-4" />}
                        >
                            Simpan Pengaturan
                        </Button>
                    </div>
                </form>
            </GlassCard>

            {/* ── Claude Connector ── */}
            <GlassCard className="p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-brand" />
                    <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold">Hubungkan Claude</p>
                </div>
                <p className="text-ink-soft text-sm font-medium mb-4">
                    Generate kode akses buat nyambungin akun Claude.ai kamu ke Narzza Quest, biar bisa nanya quest/finance/journal langsung lewat chat Claude.
                </p>

                {mcpCode ? (
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-brand-soft text-brand text-xs font-black flex items-center justify-center">1</span>
                            <div className="flex-1 pt-0.5">
                                <p className="text-sm font-bold text-ink mb-2">Buka Connectors di Claude.ai</p>
                                <a href="https://claude.ai/settings/connectors?modal=add-custom-connector" target="_blank" rel="noopener noreferrer">
                                    <Button type="button" variant="secondary" className="w-full sm:w-auto" leftIcon={<ExternalLink className="w-4 h-4" />}>
                                        Buka Claude.ai
                                    </Button>
                                </a>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-brand-soft text-brand text-xs font-black flex items-center justify-center">2</span>
                            <div className="flex-1 pt-0.5">
                                <p className="text-sm font-bold text-ink mb-2">Masukkan URL connector ini</p>
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-2 border border-line">
                                    <code className="flex-1 text-xs font-bold text-ink-soft break-all">{mcpServerUrl}</code>
                                    <button type="button" onClick={handleCopyUrl} className="shrink-0 p-2 rounded-lg hover:bg-surface transition-colors" aria-label="Copy URL">
                                        {urlCopied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-ink-muted" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-brand-soft text-brand text-xs font-black flex items-center justify-center">3</span>
                            <div className="flex-1 pt-0.5">
                                <p className="text-sm font-bold text-ink mb-2">Pas diminta login, klik tab <span className="text-brand">&quot;Punya Kode&quot;</span> lalu tempel ini</p>
                                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-surface-2 border border-line">
                                    <code className="flex-1 text-sm font-bold text-brand break-all">{mcpCode}</code>
                                    <button type="button" onClick={handleCopyCode} className="shrink-0 p-2 rounded-lg hover:bg-surface transition-colors" aria-label="Copy kode">
                                        {codeCopied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-ink-muted" />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-ink-muted font-semibold uppercase tracking-wider mt-1.5">
                                    Berlaku 10 menit
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Button type="button" variant="primary" isLoading={mcpActivating} onClick={handleActivateMcp} className="w-full" leftIcon={<Sparkles className="w-4 h-4" />}>
                        Generate Kode Akses
                    </Button>
                )}

                <div className="mt-4 pt-4 border-t border-line">
                    <p className="text-ink-muted text-xs font-medium mb-2.5">
                        Connector udah aktif tapi mau ganti ke akun lain?
                    </p>
                    <Button type="button" variant="secondary" isLoading={mcpDisconnecting} onClick={handleDisconnectMcp} className="w-full" leftIcon={<LogOut className="w-4 h-4" />}>
                        Ganti Akun / Keluar dari Sesi Connector
                    </Button>
                </div>
            </GlassCard>

            {/* ── Telegram ── */}
            <GlassCard className="p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <FaTelegram className="w-4 h-4 text-brand" />
                    <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold">Hubungkan Telegram</p>
                </div>
                <p className="text-ink-soft text-sm font-medium mb-4">
                    Dapetin notifikasi real-time, laporan harian/mingguan, dan reminder quest/habit langsung lewat Telegram.
                </p>

                {telegramCode ? (
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-brand-soft text-brand text-xs font-black flex items-center justify-center">1</span>
                            <div className="flex-1 pt-0.5">
                                <p className="text-sm font-bold text-ink mb-2">Buka bot Telegram & tekan Start</p>
                                <a href={telegramDeepLink} target="_blank" rel="noopener noreferrer">
                                    <Button type="button" variant="secondary" className="w-full sm:w-auto" leftIcon={<ExternalLink className="w-4 h-4" />}>
                                        Buka Telegram
                                    </Button>
                                </a>
                                <p className="text-[10px] text-ink-muted font-semibold uppercase tracking-wider mt-1.5">
                                    Kode berlaku 10 menit
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Button type="button" variant="primary" isLoading={isTelegramActivating} onClick={handleActivateTelegram} className="w-full" leftIcon={<FaTelegram className="w-4 h-4" />}>
                        Generate Kode & Hubungkan
                    </Button>
                )}

                <div className="mt-4 pt-4 border-t border-line">
                    <p className="text-ink-muted text-xs font-medium mb-2.5">
                        Mau berhenti dapet notifikasi di Telegram?
                    </p>
                    <Button type="button" variant="secondary" isLoading={isTelegramDisconnecting} onClick={handleDisconnectTelegram} className="w-full" leftIcon={<LogOut className="w-4 h-4" />}>
                        Putuskan Telegram
                    </Button>
                </div>
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
