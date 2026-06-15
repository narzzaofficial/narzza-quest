/**
 * Expo Push Notification helper — server-side only.
 * Sends via Expo's Push API: https://exp.host/--/api/v2/push/send
 */

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

export async function sendExpoPush(
  pushToken: string | null | undefined,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  if (!pushToken || !pushToken.startsWith('ExponentPushToken[')) return;

  const message: PushMessage = {
    to: pushToken,
    title,
    body,
    sound: 'default',
    channelId: 'default',
    data: data ?? {},
  };

  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[Push] Failed:', res.status, text);
    }
  } catch (err) {
    console.error('[Push] Error:', err);
  }
}

export async function sendExpoPushBatch(
  messages: PushMessage[]
): Promise<void> {
  if (!messages.length) return;

  // Expo allows max 100 per request
  const chunks = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });
    } catch (err) {
      console.error('[Push] Batch error:', err);
    }
  }
}
