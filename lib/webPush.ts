import webpush from 'web-push';
import { adminDb } from './firebase-admin';

export interface WebPushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

function initVapid() {
  const subject = process.env.VAPID_EMAIL;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export async function sendWebPushToUser(
  uid: string,
  payload: WebPushPayload
): Promise<void> {
  if (!initVapid()) return;

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
