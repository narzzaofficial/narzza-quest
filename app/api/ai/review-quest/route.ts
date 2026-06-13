import { NextResponse } from 'next/server';
import { reviewQuestSubmission, type QuestReviewContext } from '@/lib/ai/questReviewer';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const ctx = (await req.json()) as QuestReviewContext;
        if (!ctx?.title) {
            return NextResponse.json({ error: 'Context tidak lengkap.' }, { status: 400 });
        }
        const result = await reviewQuestSubmission(ctx);
        return NextResponse.json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal review quest.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
