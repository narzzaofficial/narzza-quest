'use client';

import { useState } from 'react';

/** Tests an OpenRouter API key/model pair against /api/ai/test-connection. */
export function useAIConnectionTest() {
    const [isTesting, setIsTesting] = useState(false);

    async function testConnection(apiKey: string, model: string): Promise<void> {
        if (!apiKey) throw new Error('API Key harus diisi untuk mengetes koneksi.');
        setIsTesting(true);
        try {
            const res = await fetch('/api/ai/test-connection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aiSettings: { openRouterApiKey: apiKey, openRouterModel: model } }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Gagal terhubung.');
        } finally {
            setIsTesting(false);
        }
    }

    return { isTesting, testConnection };
}
