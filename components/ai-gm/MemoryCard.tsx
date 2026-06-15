'use client';

import { Loader2, BrainCircuit, RefreshCw, Lightbulb } from 'lucide-react';
import { GRAD } from '@/constants/ui';
import type { useAIGameMaster } from '@/hooks/useAIGameMaster';

type AIData = ReturnType<typeof useAIGameMaster>;

export function MemoryCard({ ai }: { ai: AIData }) {
    const m = ai.memory;
    return (
        <section className="glass rounded-card p-5 md:p-6 shadow-card flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundImage: GRAD.brand }}>
                        <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-brand text-[10px] uppercase tracking-widest font-bold">AI Memory</p>
                        <h2 className="text-ink font-extrabold text-lg">Yang AI ingat</h2>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => ai.refreshMemory()}
                    disabled={ai.memoryLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-white text-sm font-bold shadow-card hover:bg-brand-hover transition-colors disabled:opacity-60"
                >
                    {ai.memoryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {m ? 'Refresh' : 'Bangun'}
                </button>
            </div>

            {ai.memoryError && <p className="text-danger text-sm font-semibold">⚠ {ai.memoryError}</p>}

            {!m && !ai.memoryError && (
                <p className="text-ink-soft text-sm">AI belum mengenal kamu. Klik &ldquo;Bangun&rdquo; supaya AI mulai mengingat pola &amp; progresmu.</p>
            )}

            {m && (
                <div className="space-y-4 mt-1">
                    <p className="text-ink-soft text-sm leading-relaxed">{m.summary}</p>

                    {m.insights.length > 0 && (
                        <ul className="space-y-1.5">
                            {m.insights.map((ins, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                                    <Lightbulb className="w-4 h-4 text-xp mt-0.5 shrink-0" /> {ins}
                                </li>
                            ))}
                        </ul>
                    )}

                    <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold">
                        Update: {new Date(m.updatedAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            )}
        </section>
    );
}
