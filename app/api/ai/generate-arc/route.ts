import { generateArcDraft, type ArcGenContext } from '@/lib/ai/arcGenerator';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const ctx = (await req.json()) as ArcGenContext;
        if (!ctx?.displayName) {
            return Response.json({ error: 'Context tidak lengkap.' }, { status: 400 });
        }
        const isFirstArc = ctx.arcNumber === 1 || !ctx.previousArc;
        if (isFirstArc && !ctx.goalSummary) {
            return Response.json({ error: 'Tetapkan North Star goal terlebih dahulu.' }, { status: 400 });
        }
        const arc = await generateArcDraft(ctx);
        return Response.json(arc);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal generate arc.';
        return Response.json({ error: message }, { status: 500 });
    }
}
