"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

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
            setError(e.message || "Something went wrong.");
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
            setError(e.message || "Something went wrong.");
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
            <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-400/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-pink-400/30 rounded-full blur-[100px] pointer-events-none" />

            {/* ── Main Auth Card ── */}
            <div className="relative z-10 w-full max-w-[420px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(168,85,247,0.15)] border border-purple-100 overflow-hidden animate-[fadeIn_0.5s_ease-out]">

                {/* Header Area */}
                <div className="text-center pt-10 pb-6 px-8 bg-gradient-to-b from-purple-50/50 to-white">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-[0_10px_20px_rgba(168,85,247,0.1)] border border-purple-100 mb-4 rotate-3">
                        <span className="text-3xl">🌟</span>
                    </div>
                    <h1
                        className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-500 mb-2"
                        style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                        LIFE QUEST
                    </h1>
                    <p className="text-purple-600/80 font-medium text-sm">
                        Tingkatkan level hidupmu, capai target bersama.
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
                        <>
                            {/* Display Name */}
                            <div>
                                <label className="block text-xs font-extrabold text-purple-700 uppercase tracking-widest mb-2">Nama Panggilan</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Misal: Nardi / Azizah"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full bg-slate-50 border border-purple-100 rounded-2xl p-4 text-purple-900 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all font-bold placeholder:font-medium placeholder:text-slate-400"
                                />
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-xs font-extrabold text-purple-700 uppercase tracking-widest mb-2">Pilih Peran</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: "player", icon: "⚔️", title: "Hero", desc: "Selesaikan quest" },
                                        { value: "gm", icon: "👑", title: "Game Master", desc: "Berikan tugas" },
                                    ].map((r) => (
                                        <div
                                            key={r.value}
                                            onClick={() => setRole(r.value as "player" | "gm")}
                                            className={`cursor-pointer p-4 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${role === r.value
                                                    ? "border-pink-400 bg-pink-50 text-pink-700 shadow-sm"
                                                    : "border-slate-100 bg-slate-50 text-slate-500 hover:border-purple-200 hover:bg-purple-50"
                                                }`}
                                        >
                                            <span className="text-2xl mb-1">{r.icon}</span>
                                            <span className="font-bold text-sm">{r.title}</span>
                                            <span className="text-[10px] leading-tight opacity-80 mt-1">{r.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-extrabold text-purple-700 uppercase tracking-widest mb-2">Email</label>
                        <input
                            type="email"
                            required
                            placeholder="nardi@lifequest.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-purple-100 rounded-2xl p-4 text-purple-900 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all font-bold placeholder:font-medium placeholder:text-slate-400"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-extrabold text-purple-700 uppercase tracking-widest mb-2">Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-purple-100 rounded-2xl p-4 text-purple-900 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all font-bold placeholder:font-medium placeholder:text-slate-400"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold p-3 rounded-xl flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-2 rounded-2xl text-white font-bold tracking-widest uppercase transition-all duration-300 shadow-[0_10px_30px_rgba(168,85,247,0.3)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(236,72,153,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        style={{ background: "linear-gradient(to right, #9333EA, #EC4899)" }}
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : mode === "login" ? "Mulai Petualangan" : "Buat Karakter"}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-bold text-slate-300 py-2">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span>Atau</span>
                        <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    {/* Google Button */}
                    <button
                        type="button"
                        onClick={handleGoogle}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white border border-purple-100 text-purple-900 font-bold hover:bg-purple-50 transition-all duration-300"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
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
            <p className="relative z-10 mt-8 text-sm font-bold text-purple-500/80 tracking-wide">
                Made with 💜 for Nardi & Azizah
            </p>
        </div>
    );
}