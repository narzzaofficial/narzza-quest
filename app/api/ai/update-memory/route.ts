import { NextResponse } from 'next/server';
import { generateMemory, type MemoryContext } from '@/lib/ai/memory';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const ctx = (await req.json()) as MemoryContext;
        if (!ctx?.displayName) {
            return NextResponse.json({ error: 'Context tidak lengkap.' }, { status: 400 });
        }
        const result = await generateMemory(ctx);
        return NextResponse.json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal update memory.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
