import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

// POST — save a new Web Push subscription for a user
export async function POST(req: Request) {
  try {
    const { idToken, subscription } = await req.json();
    if (!idToken || !subscription?.endpoint) {
      return NextResponse.json({ error: 'idToken and subscription required' }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Use endpoint hash as stable doc ID so the same browser doesn't duplicate
    const docId = Buffer.from(subscription.endpoint).toString('base64').slice(-60);

    await adminDb
      .collection('users')
      .doc(uid)
      .collection('pushSubscriptions')
      .doc(docId)
      .set({ ...subscription, updatedAt: new Date().toISOString() });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[/api/push/subscribe POST]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// DELETE — remove a subscription (user unsubscribes)
export async function DELETE(req: Request) {
  try {
    const { idToken, endpoint } = await req.json();
    if (!idToken || !endpoint) {
      return NextResponse.json({ error: 'idToken and endpoint required' }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const docId = Buffer.from(endpoint).toString('base64').slice(-60);

    await adminDb
      .collection('users')
      .doc(uid)
      .collection('pushSubscriptions')
      .doc(docId)
      .delete();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[/api/push/subscribe DELETE]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
