'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, Trash2, Loader2, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAIGameMaster } from '@/hooks/useAIGameMaster';
import { useAIChat } from '@/hooks/useAIChat';
import { useLearningGraph } from '@/hooks/useLearningGraph';
import { useActivityLog } from '@/hooks/useActivityLog';
import { useWorkTasks } from '@/hooks/useWorkTasks';
import { useSituation } from '@/hooks/useSituation';
import { useHabits } from '@/hooks/useHabits';
import { useFinance } from '@/hooks/useFinance';
import { useJournal } from '@/hooks/useJournal';
import { useChatContext } from '@/hooks/useChatContext';
import { MarkdownMessage } from '@/components/ai/MarkdownMessage';
import { TypingIndicator } from '@/components/ai/TypingIndicator';
import { GRAD } from '@/constants/ui';
import { CHAT_SUGGESTED_PROMPTS } from '@/constants/ai';
import OnboardingTour from '@/components/system/OnboardingTour';
import { CHAT_TOUR_STEPS } from '@/constants/onboardingTours';

export default function ChatPage() {
    const { profile } = useAuth();
    const ai        = useAIGameMaster();
    const actLog    = useActivityLog(profile?.uid);
    const workTasks = useWorkTasks(profile?.uid);
    const sit       = useSituation(profile?.uid);
    const habits    = useHabits(profile?.uid);
    const finance   = useFinance(profile?.uid);
    const journal   = useJournal();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef       = useRef<HTMLTextAreaElement>(null);
    const [confirmClear, setConfirmClear] = useState(false);

    const chatContext = useChatContext(profile, ai, actLog, workTasks, sit, habits, finance, journal);
    const learningGraph = useLearningGraph(profile?.uid, profile?.aiSettings);
    const { messages, input, setInput, loading, typing, error, historyLoaded, send, reset } = useAIChat(chatContext, profile?.uid, profile?.aiSettings, learningGraph.recordExchange);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Refocus input once AI finishes responding
    useEffect(() => {
        if (!loading && !typing) {
            inputRef.current?.focus();
        }
    }, [loading, typing]);

    const handleSend = () => {
        if (!input.trim() || loading || typing) return;
        send();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleClear = () => {
        if (!confirmClear) { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000); return; }
        reset();
        setConfirmClear(false);
    };

    const isEmpty = historyLoaded && messages.length === 0 && !loading;

    return (
        <div className="flex flex-col h-full max-h-screen bg-transparent">
            <OnboardingTour tourKey="chat" steps={CHAT_TOUR_STEPS} />
            <header data-tour="chat-header" className="flex items-center gap-4 px-6 py-4 shrink-0" style={{ backgroundImage: GRAD.brand }}>
                <div className="w-10 h-10 rounded-xl bg-white/20 ring-1 ring-white/30 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Life Coach</p>
                    <h1 className="text-white font-extrabold text-lg leading-tight">AI Game Master</h1>
                </div>
                <div className="flex items-center gap-2">
                    {messages.length > 0 && (
                        <button onClick={handleClear} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                            {confirmClear ? 'Yakin?' : 'Hapus Chat'}
                        </button>
                    )}
                </div>
            </header>

            <div data-tour="chat-messages" className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5 custom-scrollbar">
                {isEmpty && (
                    <div className="flex flex-col items-center justify-center h-full gap-6 text-center py-16">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30 animate-pulse" style={{ backgroundImage: GRAD.brand }} />
                            <div className="relative w-24 h-24 rounded-3xl flex items-center justify-center shadow-card" style={{ backgroundImage: GRAD.brand }}>
                                <Bot className="w-12 h-12 text-white" />
                            </div>
                            <span className="absolute -inset-1.5 rounded-3xl border-2 border-brand/20 animate-ping" />
                        </div>
                        <div className="max-w-sm">
                            <p className="text-brand text-[10px] uppercase tracking-widest font-bold mb-2">AI Life Coach</p>
                            <h2 className="text-ink font-extrabold text-2xl mb-2">
                                Halo{profile ? `, ${profile.displayName.split(' ')[0]}` : ''}!
                            </h2>
                            <p className="text-ink-soft text-sm leading-relaxed">
                                Aku tau situasimu — aktivitas hari ini, task kantor, habit, dan perjalananmu sejauh ini.
                                Tanya apa saja, aku siap bantu arahkan kamu.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center max-w-md">
                            {CHAT_SUGGESTED_PROMPTS.map(s => (
                                <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }} className="px-3 py-1.5 rounded-xl bg-brand-soft text-brand text-xs font-bold hover:bg-brand hover:text-white transition-colors border border-brand/20">
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {!historyLoaded && (
                    <div className="flex justify-center">
                        <span className="text-ink-muted text-xs flex items-center gap-1.5">
                            <Loader2 className="w-3 h-3 animate-spin" /> Memuat riwayat chat...
                        </span>
                    </div>
                )}
                {historyLoaded && messages.length > 0 && (
                    <div className="flex justify-center">
                        <span className="text-ink-muted/50 text-[10px] uppercase tracking-widest font-bold">Riwayat percakapan</span>
                    </div>
                )}

                {messages.map((msg, i) => {
                    const isStreaming = typing && i === messages.length - 1 && msg.role === 'assistant';
                    return (
                        <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-xl bg-brand-soft flex items-center justify-center shrink-0 mt-0.5">
                                    <Bot className="w-4 h-4 text-brand" />
                                </div>
                            )}
                            <div className={`max-w-[75%] md:max-w-[65%] ${msg.role === 'user'
                                ? 'bg-brand text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm font-medium'
                                : 'bg-surface-2 text-ink px-4 py-3 rounded-2xl rounded-tl-sm text-sm'
                            }`}>
                                {msg.role === 'assistant'
                                    ? <MarkdownMessage content={msg.content} streaming={isStreaming} />
                                    : msg.content
                                }
                            </div>
                        </div>
                    );
                })}

                {loading && <TypingIndicator />}
                {error && <p className="text-center text-danger text-sm">{error}</p>}
                <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 px-4 md:px-10 pb-5 pt-3">
                <div className="max-w-3xl mx-auto">
                    <div data-tour="chat-input" className="flex items-center gap-2 bg-white/80 border border-line rounded-full px-3 py-2 shadow-card backdrop-blur-sm focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/10 transition-all">
                        <button className="w-7 h-7 rounded-full flex items-center justify-center text-ink-muted hover:bg-surface-2 transition-colors shrink-0">
                            <Plus className="w-4 h-4" />
                        </button>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Tanya apa saja..."
                            rows={1}
                            className="flex-1 resize-none bg-transparent text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none overflow-hidden leading-relaxed"
                            style={{ maxHeight: 120 }}
                            onInput={e => {
                                const el = e.currentTarget;
                                el.style.height = 'auto';
                                el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                            }}
                            disabled={loading || typing}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading || typing}
                            className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-white transition-all active:scale-95 disabled:opacity-30 shrink-0"
                        >
                            {loading || typing
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Send className="w-3.5 h-3.5" />
                            }
                        </button>
                    </div>
                    <p className="text-center text-ink-muted/40 text-[10px] mt-2">
                        AI punya konteks penuh hidupmu — aktivitas, task, habit, tujuan, story arc, dan kondisi keuanganmu.
                    </p>
                </div>
            </div>
        </div>
    );
}
