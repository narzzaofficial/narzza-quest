import Link from "next/link";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { PiScrollLight, PiCrownSimpleLight, PiSwordLight } from "react-icons/pi";

const features = [
  { icon: PiScrollLight, title: "Sistem Quest Harian", desc: "Ubah tugas menumpuk jadi misi berperingkat E–S. Kumpulkan EXP dan capai level tertinggimu.", accent: "#3b82f6", tint: "rgba(59,130,246,0.10)" },
  { icon: PiCrownSimpleLight, title: "Game Master Mode", desc: "Undang pasangan/teman sebagai GM untuk memberi misi, memvalidasi laporan, dan mengirim semangat.", accent: "#06b6d4", tint: "rgba(6,182,212,0.10)" },
  { icon: PiSwordLight, title: "Arena Pelatihan", desc: "Asah otak di waktu luang. Selesaikan mini-game seperti Speed Math & tebak Vocab untuk EXP tambahan.", accent: "#18a06b", tint: "rgba(24,160,107,0.10)" },
];

const highlights = ["Gratis untuk memulai", "Tanpa iklan", "Sinkron offline", "Ditenagai AI"];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-ink-soft">
      <div className="pointer-events-none absolute -left-[12%] -top-[14%] h-[42rem] w-[42rem] rounded-full bg-brand/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-[10%] top-[20%] h-[34rem] w-[34rem] rounded-full bg-sky/15 blur-[130px]" />

      {/* Navbar */}
      <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden font-bold text-ink-soft transition-colors hover:text-brand md:block">Sign In</Link>
          <Link href="/login"><Button variant="primary">Mulai Petualangan</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 mt-8 flex flex-1 flex-col items-center px-6 text-center md:mt-4">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-line glass px-4 py-1.5 shadow-card">
          <span className="flex h-2 w-2 rounded-full bg-brand shadow-[0_0_8px_2px_rgba(59,130,246,0.5)]" />
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">v1.0 is Live</span>
        </div>

        <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.08] tracking-tight text-ink md:text-7xl">
          Ubah Hidupmu Menjadi{" "}
          <span className="relative inline-block whitespace-nowrap">
            <span aria-hidden className="stabilo absolute inset-x-[-2px] bottom-[0.08em] -z-0 h-[0.42em] rounded-sm" style={{ background: "linear-gradient(90deg, rgba(147,197,253,0.85), rgba(125,211,252,0.85))" }} />
            <span className="relative z-10">Petualangan</span>
          </span>{" "}
          <span className="bg-gradient-to-r from-brand to-sky bg-clip-text text-transparent">RPG Epik</span>
        </h1>

        <p className="mt-7 max-w-2xl text-lg font-medium leading-relaxed text-ink-soft md:text-xl">
          Tingkatkan produktivitas, selesaikan misi harian, dan kumpulkan EXP bersama AI Game Master atau accountability partner-mu. Jadilah Hero di dunia nyatamu.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="/login"><Button variant="primary" size="lg" rightIcon={<FiArrowRight className="h-5 w-5" />} className="w-full px-9 text-lg sm:w-auto">Buat Karakter Sekarang</Button></Link>
          <Link href="#features"><Button variant="outline" size="lg" className="w-full px-9 text-lg sm:w-auto">Pelajari Lebih Lanjut</Button></Link>
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {highlights.map((h) => (
            <span key={h} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
              <FiCheck className="h-4 w-4 text-brand" /> {h}
            </span>
          ))}
        </div>
      </main>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
        <div className="mb-14 text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-brand">Fitur Utama</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Semua yang kamu butuh untuk{" "}
            <span className="relative inline-block">
              <span aria-hidden className="stabilo absolute inset-x-[-2px] bottom-[0.1em] -z-0 h-[0.4em] rounded-sm bg-brand/20" style={{ "--stabilo-delay": "0.2s" } as React.CSSProperties} />
              <span className="relative z-10">naik level</span>
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, desc, accent, tint }) => (
            <div key={title} className="group glass rounded-card p-8 shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-pop">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110" style={{ background: tint, color: accent }}>
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-extrabold tracking-tight text-ink">{title}</h3>
              <p className="font-medium leading-relaxed text-ink-soft">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-card px-8 py-14 text-center text-white shadow-pop" style={{ backgroundImage: "linear-gradient(135deg, #4f7cff 0%, #38bdf8 100%)" }}>
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative text-3xl font-extrabold tracking-tight md:text-4xl">Siap memulai petualanganmu?</h2>
          <p className="relative mx-auto mt-4 max-w-xl font-medium text-white/85">Buat karaktermu hari ini dan ubah daftar tugas membosankan jadi misi yang seru.</p>
          <Link href="/login" className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-9 py-3.5 text-lg font-bold text-brand shadow-card hover:bg-white/90 transition">
            Buat Karakter Sekarang <FiArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-line py-8 text-center">
        <div className="mb-2 flex items-center justify-center">
          <Logo size="sm" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">© {new Date().getFullYear()} Narzza. All rights reserved.</p>
      </footer>
    </div>
  );
}
