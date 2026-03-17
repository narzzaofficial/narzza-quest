import { NextRequest, NextResponse } from 'next/server';
import { patchQuestWithUserToken } from '../_helpers';

export async function POST(req: NextRequest) {
    try {
        const { questId, submissionNote, urls, idToken } = await req.json();

        if (!questId || !idToken) {
            return NextResponse.json({ error: 'questId dan idToken wajib diisi.' }, { status: 400 });
        }

        const safeUrls: string[] = Array.isArray(urls) ? urls.filter((url) => typeof url === 'string' && url.trim()) : [];
        const noteValue = typeof submissionNote === 'string' ? submissionNote : '';
        const now = new Date().toISOString();

        const response = await patchQuestWithUserToken({
            idToken,
            questId,
            fields: {
                status: { stringValue: 'submitted' },
                submissionNote: { stringValue: noteValue },
                submissionUrls: {
                    arrayValue: {
                        values: safeUrls.map((url) => ({ stringValue: url })),
                    },
                },
                submittedAt: { timestampValue: now },
                updatedAt: { timestampValue: now },
            },
            updateMaskFields: ['status', 'submissionNote', 'submissionUrls', 'submittedAt', 'updatedAt'],
        });

        if (!response.ok) {
            const text = await response.text();
            return NextResponse.json({ error: 'Gagal submit quest.', details: text }, { status: response.status });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat memproses submit offline.', details: String(error) },
            { status: 500 }
        );
    }
}
