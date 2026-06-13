"use client";

import { WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflineFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="glass p-8 rounded-card shadow-pop max-w-md w-full flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-surface-2 rounded-2xl flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-ink-muted" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Koneksi Terputus</h1>
          <p className="text-ink-soft">
            Sepertinya kamu sedang tidak terhubung ke internet. Beberapa fitur mungkin tidak tersedia saat ini.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 px-4 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold transition-colors shadow-card"
        >
          Coba Lagi
        </button>
        <Link href="/" className="text-sm text-ink-muted hover:text-brand transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
