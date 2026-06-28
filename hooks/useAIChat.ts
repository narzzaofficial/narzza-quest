'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { AIMessage } from '@/lib/ai';
import type { ChatContext } from '@/app/api/ai/chat/route';
import { saveChatHistory, loadChatHistory, type StoredChatMessage } from '@/lib/db';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const CHARS_PER_TICK = 4;
const TICK_MS = 16;

function toStored(m: ChatMessage): StoredChatMessage {
    return { role: m.role, content: m.content, timestamp: m.timestamp.toISOString() };
}

function fromStored(m: StoredChatMessage): ChatMessage {
    return { role: m.role, content: m.content, timestamp: new Date(m.timestamp) };
}

import type { UserProfile } from '@/types';

export function useAIChat(
    context: ChatContext | null,
    uid?: string,
    aiSettings?: UserProfile['aiSettings'],
    onExchangeComplete?: (userMessage: string, assistantReply: string) => void
) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const cancelRef = useRef(false);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onExchangeCompleteRef = useRef(onExchangeComplete);
    useEffect(() => { onExchangeCompleteRef.current = onExchangeComplete; }, [onExchangeComplete]);

    // Load history from Firestore on mount
    useEffect(() => {
        if (!uid) { setHistoryLoaded(true); return; }
        loadChatHistory(uid)
            .then(stored => {
                if (stored.length > 0) setMessages(stored.map(fromStored));
            })
            .catch(() => {})
            .finally(() => setHistoryLoaded(true));
    }, [uid]);

    // Debounced save to Firestore after messages change
    const persistMessages = useCallback((msgs: ChatMessage[]) => {
        if (!uid || msgs.length === 0) return;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            saveChatHistory(uid, msgs.map(toStored)).catch(() => {});
        }, 1000);
    }, [uid]);

    const send = useCallback(async (text?: string) => {
        const content = (text ?? input).trim();
        if (!content || !context || loading || typing) return;

        cancelRef.current = false;

        const userMsg: ChatMessage = { role: 'user', content, timestamp: new Date() };
        const nextMessages = [...messages, userMsg];
        setMessages(nextMessages);
        setInput('');
        setLoading(true);
        setError(null);

        try {
            const history: AIMessage[] = nextMessages.map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history, context, aiSettings }),
            });

            const data = await res.json();
            setLoading(false);

            if (!res.ok) throw new Error(data?.error || 'Gagal menghubungi AI.');

            const fullReply: string = data.reply ?? '';

            const withAssistant = [
                ...nextMessages,
                { role: 'assistant' as const, content: '', timestamp: new Date() },
            ];
            setMessages(withAssistant);
            setTyping(true);

            let i = 0;
            while (i < fullReply.length && !cancelRef.current) {
                i = Math.min(i + CHARS_PER_TICK, fullReply.length);
                const slice = fullReply.slice(0, i);
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { ...updated[updated.length - 1], content: slice };
                    return updated;
                });
                await new Promise((r) => setTimeout(r, TICK_MS));
            }

            if (!cancelRef.current) {
                const finalMessages: ChatMessage[] = [
                    ...nextMessages,
                    { role: 'assistant', content: fullReply, timestamp: new Date() },
                ];
                setMessages(finalMessages);
                persistMessages(finalMessages);
                onExchangeCompleteRef.current?.(content, fullReply);
            }
        } catch (e) {
            setLoading(false);
            setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
        } finally {
            setTyping(false);
        }
    }, [input, messages, context, loading, typing, persistMessages]);

    const reset = useCallback(() => {
        cancelRef.current = true;
        setMessages([]);
        setInput('');
        setError(null);
        setLoading(false);
        setTyping(false);
        if (uid) saveChatHistory(uid, []).catch(() => {});
    }, [uid]);

    return { messages, input, setInput, loading, typing, error, historyLoaded, send, reset };
}
