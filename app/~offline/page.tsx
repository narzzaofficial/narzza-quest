"use client";

import { WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflineFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-neutral-200 p-6 text-center font-sans">
      <div className="bg-neutral-800 p-8 rounded-2xl shadow-xl max-w-md w-full flex flex-col items-center gap-6 border border-neutral-700">
        <div className="w-20 h-20 bg-neutral-700 rounded-full flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-neutral-400" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Koneksi Terputus</h1>
          <p className="text-neutral-400">
            Sepertinya kamu sedang tidak terhubung ke internet. Beberapa fitur mungkin tidak tersedia saat ini.
          </p>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-teal-900/20"
        >
          Coba Lagi
        </button>
        
        <Link 
          href="/" 
          className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
