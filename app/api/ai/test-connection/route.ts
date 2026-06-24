import { NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const { aiSettings }: { aiSettings: any } = await req.json();

        if (!aiSettings?.openRouterApiKey) {
            return NextResponse.json({ error: 'API Key tidak boleh kosong untuk ditest.' }, { status: 400 });
        }

        const ai = getAIProvider({
            useOpenRouter: true,
            openRouterApiKey: aiSettings.openRouterApiKey,
            openRouterModel: aiSettings.openRouterModel || 'google/gemini-2.5-flash',
        });

        // Test with a very small prompt
        const res = await ai.generateText({
            system: 'You are a connection tester. Reply with exactly the word "OK".',
            messages: [{ role: 'user', content: 'Ping' }],
            maxTokens: 5,
        });

        if (res) {
            return NextResponse.json({ success: true, message: 'Koneksi berhasil! Model merespons dengan baik.' });
        } else {
            throw new Error('Tidak ada respon dari model.');
        }
    } catch (err: any) {
        console.error("Test connection error:", err);
        const message = err?.message || err?.toString() || 'Gagal terhubung ke API.';
        const details = err?.response?.data || err?.error || null;
        return NextResponse.json({ error: message, details }, { status: 500 });
    }
}
