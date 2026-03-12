"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
    Mail,
    Lock,
    User as UserIcon,
    Compass,
    Shield,
    Crown,
    Sparkles
} from "lucide-react";

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

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!email || !password) return setError("Email dan password wajib diisi.");
        if (mode === "register" && !displayName) return setError("Nama wajib diisi.");

        setLoading(true);
        setError("");

        try {
            if (mode === "login") {
                await signIn(email, password);
            } else {
                await signUp(email, password, displayName, role);
            }
            router.push("/dashboard");
        } catch (e: any) {
            setError(e.message || "Terjadi kesalahan sihir pada sistem.");
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
        } catch (e: any) {
            setError(e.message || "Gagal masuk menggunakan Google.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden p-4 text-slate-800"
            style={{
                background: "linear-gradient(135deg, #E9D5FF 0%, #F3E8FF 40%, #FBCFE8 100%)",
                fontFamily: "var(--font-nunito), sans-serif"
            }}
        >
            {/* ── Decorative Background Blobs ── */}
            <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-400/30 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-pink-400/30 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '5s' }} />

            {/* ── Main Auth Card ── */}
            <div className="relative z-10 w-full max-w-[420px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(168,85,247,0.15)] border border-purple-100 overflow-hidden animate-in fade-in zoom-in duration-500">

                {/* Header Area */}
                <div className="text-center pt-10 pb-6 px-8 bg-gradient-to-b from-purple-50/50 to-white">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-[0_10px_20px_rgba(168,85,247,0.1)] border border-purple-100 mb-4 rotate-3 hover:rotate-0 transition-transform">
                        <Sparkles className="w-8 h-8 text-purple-500" />
                    </div>
                    <h1
                        className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-500 mb-2"
                        style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                        LIFE QUEST
                    </h1>
                    <p className="text-purple-600/80 font-medium text-sm">
                        {mode === "login" ? "Selamat datang kembali di Guild." : "Mulai perjalanan epikmu sekarang."}
                    </p>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 border-y border-purple-50">
                    {(["login", "register"] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`py-4 text-sm font-bold tracking-widest uppercase transition-all duration-300 ${mode === m
                                ? "text-purple-700 bg-purple-50/50 border-b-2 border-purple-500"
                                : "text-slate-400 hover:bg-slate-50 hover:text-purple-400 border-b-2 border-transparent"
                                }`}
                        >
                            {m === "login" ? "Masuk" : "Daftar"}
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <form
                    className="p-8 space-y-5"
                    onSubmit={handleSubmit}
                >
                    {mode === "register" && (
                        <div className="space-y-5 animate-in slide-in-from-left-4 duration-300">
                            {/* Display Name */}
                            <div>
                                <label className="block text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1.5 ml-1">Nama Karakter</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Misal: Nardi / Azizah"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-purple-100 rounded-2xl text-purple-900 focus:ring-2 focus:ring-purple-400 focus:bg-white focus:outline-none transition-all font-bold placeholder:font-medium placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1.5 ml-1">Pilih Class</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: "player", icon: <Shield className="w-6 h-6 mb-1" />, title: "Hero", desc: "Jalani misi & raih EXP" },
                                        { value: "gm", icon: <Crown className="w-6 h-6 mb-1" />, title: "Game Master", desc: "Pandu para Hero" },
                                    ].map((r) => (
                                        <div
                                            key={r.value}
                                            onClick={() => setRole(r.value as "player" | "gm")}
                                            className={`cursor-pointer p-3 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${role === r.value
                                                ? "border-pink-400 bg-pink-50 text-pink-600 shadow-sm transform scale-[1.02]"
                                                : "border-slate-100 bg-slate-50 text-slate-400 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-500"
                                                }`}
                                        >
                                            {r.icon}
                                            <span className="font-bold text-sm">{r.title}</span>
                                            <span className="text-[9px] font-medium leading-tight opacity-80 mt-0.5">{r.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                            <input
                                type="email"
                                required
                                placeholder="hero@lifequest.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-purple-100 rounded-2xl text-purple-900 focus:ring-2 focus:ring-purple-400 focus:bg-white focus:outline-none transition-all font-bold placeholder:font-medium placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-purple-100 rounded-2xl text-purple-900 focus:ring-2 focus:ring-purple-400 focus:bg-white focus:outline-none transition-all font-bold placeholder:font-medium placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold p-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-2 rounded-2xl text-white font-black tracking-widest uppercase transition-all duration-300 shadow-[0_10px_30px_rgba(168,85,247,0.3)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(236,72,153,0.4)] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 relative overflow-hidden group"
                        style={{ background: "linear-gradient(to right, #9333EA, #EC4899)" }}
                    >
                        {/* Shimmer effect */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-[shimmer_1.5s_infinite]" />

                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Compass className="w-5 h-5 animate-spin" />
                                <span>Memuat...</span>
                            </div>
                        ) : mode === "login" ? (
                            "Mulai Petualangan"
                        ) : (
                            "Buat Karakter"
                        )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-black text-slate-300 py-2">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span>Atau</span>
                        <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    {/* Google Button */}
                    <button
                        type="button"
                        onClick={handleGoogle}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 hover:border-purple-200 hover:text-purple-700 transition-all duration-300 disabled:opacity-50"
                    >
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

            {/* Footer Text */}
            <p className="relative z-10 mt-8 text-[10px] font-black uppercase tracking-widest text-purple-500/60">
                Life Quest • Narzza HQ
            </p>
        </div>
    );
}