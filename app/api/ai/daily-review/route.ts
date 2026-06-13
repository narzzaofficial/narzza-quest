import { NextResponse } from 'next/server';
import { generateDailyReview, type DailyReviewContext } from '@/lib/ai/dailyReview';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const ctx = (await req.json()) as DailyReviewContext;
        if (!ctx?.displayName) {
            return NextResponse.json({ error: 'Context tidak lengkap.' }, { status: 400 });
        }
        const result = await generateDailyReview(ctx);
        return NextResponse.json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal generate review.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
