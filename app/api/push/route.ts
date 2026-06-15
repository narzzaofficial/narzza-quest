import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { sendExpoPush } from '@/lib/push';

export async function POST(req: Request) {
    try {
        const { uid, title, body, data } = await req.json();
        if (!uid || !title) {
            return NextResponse.json({ error: 'uid and title required' }, { status: 400 });
        }

        const userSnap = await adminDb.collection('users').doc(uid).get();
        const pushToken = userSnap.data()?.pushToken as string | undefined;

        await sendExpoPush(pushToken, title, body ?? '', data);

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('[/api/push]', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
