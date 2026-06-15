import webpush from 'web-push';
import { adminDb } from './firebase-admin';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface WebPushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

export async function sendWebPushToUser(
  uid: string,
  payload: WebPushPayload
): Promise<void> {
  const snap = await adminDb
    .collection('users')
    .doc(uid)
    .collection('pushSubscriptions')
    .get();

  if (snap.empty) return;

  const notification = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon ?? '/icon-192x192.png',
    url: payload.url ?? '/notifications',
  });

  const sends = snap.docs.map(async (docSnap) => {
    const sub = docSnap.data() as webpush.PushSubscription;
    try {
      await webpush.sendNotification(sub, notification);
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        // Subscription expired/invalid — remove it
        await docSnap.ref.delete();
      } else {
        console.error('[WebPush] send error:', err);
      }
    }
  });

  await Promise.allSettled(sends);
}
