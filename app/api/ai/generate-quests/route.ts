import { NextResponse } from 'next/server';
import { generateQuestDrafts, type QuestGenContext } from '@/lib/ai/questGenerator';

// Runs server-side (Node) so the AI API key never reaches the client.
export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const ctx = (await req.json()) as QuestGenContext;

        if (!ctx?.displayName) {
            return NextResponse.json({ error: 'Context tidak lengkap.' }, { status: 400 });
        }

        const quests = await generateQuestDrafts(ctx);
        return NextResponse.json({ quests });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal generate quest.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
