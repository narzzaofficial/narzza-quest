import Link from "next/link";
import Button from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden text-slate-800 selection:bg-purple-200"
      style={{
        background: "linear-gradient(135deg, #FFF5F7 0%, #F3E8FF 50%, #E0F2FE 100%)",
        fontFamily: "var(--font-nunito), sans-serif"
      }}
    >
      {/* ── Background Ornaments ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[50rem] h-[50rem] bg-purple-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-pink-400/20 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Navbar ── */}
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🌟</span>
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-500 tracking-wide" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Life Quest
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-purple-600 font-bold hover:text-pink-500 transition-colors hidden md:block">
            Sign In
          </Link>
          <Link href="/login">
            <Button variant="primary" className="shadow-lg shadow-purple-500/20">
              Mulai Petualangan
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10 mt-10 md:mt-0">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-purple-100 shadow-sm backdrop-blur-md mb-8 animate-[bounce_3s_ease-in-out_infinite]">
          <span className="text-xs font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
            v1.0 is Live 🎉
          </span>
        </div>

        <h1
          className="text-5xl md:text-7xl font-bold text-purple-950 max-w-4xl leading-tight mb-6"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Ubah Hidupmu Menjadi <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
            Petualangan RPG Epik
          </span>
        </h1>

        <p className="text-lg md:text-xl text-purple-700/80 max-w-2xl mb-10 font-medium leading-relaxed">
          Tingkatkan produktivitas, selesaikan misi harian, dan kumpulkan EXP bersama *accountability partner*-mu. Jadilah Hero di dunia nyatamu sendiri.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/login">
            <Button variant="primary" size="lg" className="w-full sm:w-auto text-lg px-10 shadow-[0_15px_40px_rgba(168,85,247,0.3)] hover:-translate-y-1">
              Buat Karakter Sekarang
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-10 bg-white/50 backdrop-blur-md hover:bg-white/80">
              Pelajari Lebih Lanjut
            </Button>
          </Link>
        </div>
      </main>

      {/* ── Feature Highlights ── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white/80 backdrop-blur-xl border border-purple-100 rounded-3xl p-8 shadow-[0_10px_40px_rgba(168,85,247,0.08)] hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-3xl mb-6 border border-purple-100">
              📜
            </div>
            <h3 className="text-2xl font-bold text-purple-950 mb-3" style={{ fontFamily: "var(--font-playfair), serif" }}>Sistem Quest Harian</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Ubah tugas menumpuk menjadi misi dengan rank E sampai S. Kumpulkan EXP dan capai level tertinggi.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/80 backdrop-blur-xl border border-pink-100 rounded-3xl p-8 shadow-[0_10px_40px_rgba(236,72,153,0.08)] hover:-translate-y-2 transition-transform duration-300 md:-translate-y-4">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-3xl mb-6 border border-pink-100">
              👑
            </div>
            <h3 className="text-2xl font-bold text-pink-950 mb-3" style={{ fontFamily: "var(--font-playfair), serif" }}>Game Master Mode</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Undang pasangan atau temanmu sebagai GM untuk memberikan misi, memvalidasi laporan, dan mengirim semangat.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/80 backdrop-blur-xl border border-emerald-100 rounded-3xl p-8 shadow-[0_10px_40px_rgba(16,185,129,0.05)] hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl mb-6 border border-emerald-100">
              ⚔️
            </div>
            <h3 className="text-2xl font-bold text-emerald-950 mb-3" style={{ fontFamily: "var(--font-playfair), serif" }}>Arena Pelatihan</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Asah otak di waktu luang. Selesaikan mini-games seperti Speed Math dan tebak Vocab untuk EXP tambahan.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-purple-100/50 bg-white/30 backdrop-blur-sm py-8 text-center mt-auto">
        <p className="text-sm font-bold text-purple-900/60 uppercase tracking-widest">
          © {new Date().getFullYear()} NardiLabs. All rights reserved.
        </p>
      </footer>
    </div>
  );
}