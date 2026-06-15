"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/ui/Logo";
import { Mail, Lock, User as UserIcon, Loader2, Shield, Crown } from "lucide-react";

const field =
    "w-full pl-11 pr-4 py-3 bg-surface border border-line rounded-xl text-ink font-bold placeholder:font-medium placeholder:text-ink-muted outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition";

export default function LoginPage() {
    const { signIn, signUp, signInWithGoogle } = useAuth();
    const router = useRouter();

    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [role, setRole] = useState<"player" | "gm">("player");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isRegister = mode === "register";

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!email || !password) return setError("Email dan password wajib diisi.");
        if (isRegister && !displayName) return setError("Nama wajib diisi.");
        setLoading(true);
        setError("");
        try {
            if (!isRegister) await signIn(email, password);
            else await signUp(email, password, displayName, role);
            router.push("/dashboard");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Terjadi kesalahan pada sistem.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setLoading(true);
        setError("");
        try {
            await signInWithGoogle(role);
            router.push("/dashboard");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Gagal masuk dengan Google.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
            <div className="absolute top-[-10%] right-[-10%] w-160 h-160 rounded-full blur-[120px] pointer-events-none" style={{ background: "rgba(79,124,255,0.18)" }} />
            <div className="absolute bottom-[-10%] left-[-10%] w-140 h-140 rounded-full blur-[120px] pointer-events-none" style={{ background: "rgba(56,189,248,0.16)" }} />

            <div className="relative z-10 w-full max-w-md glass rounded-card shadow-pop p-7 md:p-9">
                {/* Brand */}
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-3">
                        <Logo size="xl" variant="mark" />
                    </div>
                    <Logo size="lg" variant="wordmark" className="justify-center" />
                    <p className="text-ink-soft text-sm mt-2">{isRegister ? "Mulai perjalanan epikmu sekarang." : "Masuk untuk lanjut bertualang."}</p>
                </div>

                {/* Tabs */}
                <div className="relative grid grid-cols-2 p-1 bg-surface-2 rounded-xl mb-5">
                    <span className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-lg bg-surface shadow-sm transition-transform duration-300 ease-out ${isRegister ? "translate-x-[calc(100%+0.5rem)]" : "translate-x-0"}`} />
                    {(["login", "register"] as const).map((m) => (
                        <button key={m} type="button" onClick={() => setMode(m)} className={`relative z-10 py-2 text-sm font-bold rounded-lg transition-colors ${mode === m ? "text-brand" : "text-ink-muted hover:text-brand"}`}>
                            {m === "login" ? "Masuk" : "Daftar"}
                        </button>
                    ))}
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Animated register-only fields */}
                    <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isRegister ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="overflow-hidden min-h-0">
                            <div className="space-y-4 pb-4">
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
                                    <input type="text" required={isRegister} placeholder="Nama karakter" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={field} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: "player", icon: Shield, title: "Hero" },
                                        { value: "gm", icon: Crown, title: "Game Master" },
                                    ].map((r) => {
                                        const active = role === r.value;
                                        return (
                                            <button type="button" key={r.value} onClick={() => setRole(r.value as "player" | "gm")} className={`p-2.5 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all ${active ? "border-brand/30 bg-brand-soft text-brand" : "border-line bg-surface text-ink-muted hover:bg-surface-2"}`}>
                                                <r.icon className="w-4 h-4" /> {r.title}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
                        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
                        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
                    </div>

                    {error && <div className="bg-danger-soft text-danger text-xs font-bold p-3 rounded-xl flex items-center gap-2">⚠ {error}</div>}

                    <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-white font-black tracking-wide uppercase shadow-card hover:bg-brand-hover transition-colors bg-brand disabled:opacity-70 disabled:cursor-not-allowed">
                        {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Memuat…</span> : isRegister ? "Buat Karakter" : "Mulai Petualangan"}
                    </button>

                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-black text-ink-muted">
                        <div className="flex-1 h-px bg-line" /> Atau <div className="flex-1 h-px bg-line" />
                    </div>

                    <button type="button" onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-surface border border-line text-ink-soft font-bold hover:bg-surface-2 hover:text-brand transition disabled:opacity-50">
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Lanjutkan dengan Google
                    </button>
                </form>
            </div>
        </div>
    );
}
