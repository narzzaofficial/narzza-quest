"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, Sparkles, KeyRound } from "lucide-react";

const field =
    "w-full pl-11 pr-4 py-3 bg-surface border border-line rounded-xl text-ink font-bold placeholder:font-medium placeholder:text-ink-muted outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition";

function McpLoginForm() {
    const searchParams = useSearchParams();
    const [mode, setMode] = useState<"password" | "code">("password");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return setError("Kode wajib diisi.");
        setLoading(true);
        setError("");
        // callbackURL is just a safe fallback (never actually used in the normal
        // flow) — the real resume happens via the same "oidc_login_prompt" cookie
        // + hooks.after mechanism used by the email/password path, which takes
        // priority over magic-link/verify's own redirect. A complex callbackURL
        // containing the full mcp/authorize query gets rejected by Better Auth's
        // origin-check regex (it can't contain ":" or raw spaces once decoded),
        // so don't try to build one — plain "/dashboard" is enough.
        window.location.href = `/api/auth/magic-link/verify?token=${encodeURIComponent(code.trim())}&callbackURL=%2Fdashboard`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return setError("Email dan password wajib diisi.");
        setLoading(true);
        setError("");
        try {
            // redirect: "manual" is required here — Better Auth responds with a
            // 302 straight to the OAuth client's redirect_uri (e.g. claude.ai) once
            // signed in. A normal fetch() would silently follow that cross-origin
            // redirect in the background instead of letting the browser navigate
            // there, which breaks the client's callback page and can CORS-error.
            const res = await fetch("/api/auth/sign-in/email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                redirect: "manual",
                body: JSON.stringify({ email, password }),
            });
            const success = res.ok || res.type === "opaqueredirect";
            if (!success) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message || "Email atau password salah.");
            }
            // Resume the OAuth flow now that a session cookie is set — this is a
            // real top-level navigation, so it can follow the final redirect
            // anywhere (including cross-origin) without CORS getting involved.
            window.location.href = `/api/auth/mcp/authorize?${searchParams.toString()}`;
        } catch (e) {
            setError(e instanceof Error ? e.message : "Terjadi kesalahan pada sistem.");
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
            <div className="absolute top-[-10%] right-[-10%] w-160 h-160 rounded-full blur-[120px] pointer-events-none" style={{ background: "rgba(79,124,255,0.18)" }} />
            <div className="absolute bottom-[-10%] left-[-10%] w-140 h-140 rounded-full blur-[120px] pointer-events-none" style={{ background: "rgba(56,189,248,0.16)" }} />

            <div className="relative z-10 w-full max-w-md glass rounded-card shadow-pop p-7 md:p-9">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-card mb-3" style={{ backgroundImage: "linear-gradient(135deg, #4f7cff 0%, #38bdf8 100%)" }}>
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold !text-brand">Hubungkan Claude</h1>
                    <p className="text-ink-soft text-sm mt-1">Masuk untuk mengizinkan Claude membaca data Narzza Quest-mu.</p>
                </div>

                <div className="relative grid grid-cols-2 p-1 bg-surface-2 rounded-xl mb-5">
                    <span className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-lg bg-surface shadow-sm transition-transform duration-300 ease-out ${mode === "code" ? "translate-x-[calc(100%+0.5rem)]" : "translate-x-0"}`} />
                    {([
                        { key: "password", label: "Email & Password" },
                        { key: "code", label: "Punya Kode" },
                    ] as const).map((m) => (
                        <button key={m.key} type="button" onClick={() => { setMode(m.key); setError(""); }} className={`relative z-10 py-2 text-sm font-bold rounded-lg transition-colors ${mode === m.key ? "text-brand" : "text-ink-muted hover:text-brand"}`}>
                            {m.label}
                        </button>
                    ))}
                </div>

                {mode === "password" ? (
                    <form className="space-y-4" onSubmit={handleSubmit}>
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
                            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Memuat…</span> : "Izinkan Akses"}
                        </button>
                    </form>
                ) : (
                    <form className="space-y-4" onSubmit={handleCodeSubmit}>
                        <p className="text-ink-muted text-xs font-medium leading-relaxed">
                            Buka <span className="font-bold text-ink-soft">Settings → Hubungkan Claude</span> di app Narzza Quest buat generate kode aksesnya.
                        </p>
                        <div className="relative">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
                            <input type="text" required placeholder="Kode akses" value={code} onChange={(e) => setCode(e.target.value)} className={field} />
                        </div>

                        {error && <div className="bg-danger-soft text-danger text-xs font-bold p-3 rounded-xl flex items-center gap-2">⚠ {error}</div>}

                        <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-white font-black tracking-wide uppercase shadow-card hover:bg-brand-hover transition-colors bg-brand disabled:opacity-70 disabled:cursor-not-allowed">
                            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Memuat…</span> : "Izinkan Akses"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function McpLoginPage() {
    return (
        <Suspense>
            <McpLoginForm />
        </Suspense>
    );
}
