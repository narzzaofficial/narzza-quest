import { NextRequest, NextResponse } from 'next/server';
import { patchQuestWithUserToken } from '../_helpers';

export async function POST(req: NextRequest) {
    try {
        const { questId, idToken } = await req.json();

        if (!questId || !idToken) {
            return NextResponse.json({ error: 'questId dan idToken wajib diisi.' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const response = await patchQuestWithUserToken({
            idToken,
            questId,
            fields: {
                status: { stringValue: 'in_progress' },
                updatedAt: { timestampValue: now },
            },
            updateMaskFields: ['status', 'updatedAt'],
        });

        if (!response.ok) {
            const text = await response.text();
            return NextResponse.json({ error: 'Gagal update quest.', details: text }, { status: response.status });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat memproses accept offline.', details: String(error) },
            { status: 500 }
        );
    }
}
