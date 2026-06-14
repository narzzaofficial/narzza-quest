'use client';

import React, { useEffect, useRef } from 'react';
import { Bot, X, Send, Loader2, RefreshCw, MessageSquare } from 'lucide-react';
import { useAIChat } from '@/hooks/useAIChat';
import type { ChatContext } from '@/app/api/ai/chat/route';

const SUGGESTIONS = [
    'Apa yang sebaiknya aku kerjakan hari ini?',
    'Evaluasi progres minggu ini dong',
    'Aku lagi kurang semangat, gimana caranya?',
    'Quest apa yang cocok buat level ku?',
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    context: ChatContext | null;
}

export default function ChatPanel({ isOpen, onClose, context }: Props) {
    const chat = useAIChat(context);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat.messages]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chat.send();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-40 md:hidden"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-[420px] flex flex-col shadow-2xl rounded-t-2xl md:rounded-2xl overflow-hidden border border-line bg-surface"
                style={{ height: 'min(600px, 90dvh)' }}>

                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line bg-surface shrink-0"
                    style={{ background: 'linear-gradient(135deg, #4f7cff 0%, #38bdf8 100%)' }}>
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-extrabold text-sm leading-tight">AI Game Master</p>
                        <p className="text-white/70 text-[10px]">Tanya apa saja tentang perjalananmu</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {chat.messages.length > 0 && (
                            <button
                                onClick={chat.reset}
                                className="p-2 text-white/70 hover:text-white hover:bg-white/15 rounded-xl transition-colors"
                                title="Reset percakapan"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-white/70 hover:text-white hover:bg-white/15 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
                    {/* Empty state */}
                    {chat.messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full gap-4 pb-4">
                            <div className="w-16 h-16 rounded-2xl bg-brand-soft flex items-center justify-center">
                                <MessageSquare className="w-8 h-8 text-brand" />
                            </div>
                            <div className="text-center">
                                <p className="text-ink font-bold text-sm mb-1">Halo, {context?.displayName?.split(' ')[0]}!</p>
                                <p className="text-ink-soft text-xs max-w-[240px]">Tanya apa saja — rencana hari ini, evaluasi progres, atau sekadar curhat.</p>
                            </div>
                            {/* Suggestion chips */}
                            <div className="flex flex-col gap-2 w-full max-w-[300px]">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => chat.send(s)}
                                        className="text-left text-xs font-semibold text-ink-soft bg-surface-2 hover:bg-brand-soft hover:text-brand border border-line hover:border-brand/20 px-3 py-2.5 rounded-xl transition-colors"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Message bubbles */}
                    {chat.messages.map((msg, i) => (
                        <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-7 h-7 rounded-xl bg-brand-soft flex items-center justify-center shrink-0 mt-0.5">
                                    <Bot className="w-4 h-4 text-brand" />
                                </div>
                            )}
                            <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                                msg.role === 'user'
                                    ? 'bg-brand text-white rounded-tr-sm'
                                    : 'bg-surface-2 text-ink rounded-tl-sm'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {/* Loading bubble */}
                    {chat.loading && (
                        <div className="flex gap-2.5">
                            <div className="w-7 h-7 rounded-xl bg-brand-soft flex items-center justify-center shrink-0 mt-0.5">
                                <Bot className="w-4 h-4 text-brand" />
                            </div>
                            <div className="bg-surface-2 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-ink-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-ink-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-ink-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {chat.error && (
                        <p className="text-danger text-xs font-semibold text-center bg-danger-soft rounded-xl px-3 py-2">
                            ⚠ {chat.error}
                        </p>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="shrink-0 px-3 py-3 border-t border-line bg-surface">
                    <div className="flex items-end gap-2">
                        <textarea
                            ref={inputRef}
                            value={chat.input}
                            onChange={(e) => chat.setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ketik pesan… (Enter untuk kirim)"
                            rows={1}
                            className="flex-1 resize-none rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition max-h-28 overflow-y-auto custom-scrollbar"
                            style={{ lineHeight: '1.5' }}
                            onInput={(e) => {
                                const el = e.currentTarget;
                                el.style.height = 'auto';
                                el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
                            }}
                        />
                        <button
                            onClick={() => chat.send()}
                            disabled={!chat.input.trim() || chat.loading}
                            className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center hover:bg-brand-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                        >
                            {chat.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="text-ink-muted text-[10px] mt-1.5 text-center">Shift+Enter untuk baris baru</p>
                </div>
            </div>
        </>
    );
}
