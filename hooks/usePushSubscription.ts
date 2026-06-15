'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

type SubscriptionState = 'loading' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr.buffer;
}

export function usePushSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>('loading');

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) {
          setState('subscribed');
        } else {
          const perm = Notification.permission;
          setState(perm === 'denied' ? 'denied' : 'unsubscribed');
        }
      });
    });
  }, []);

  const subscribe = useCallback(async () => {
    if (!user) return;

    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      setState('denied');
      return;
    }

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });

    const idToken = await user.getIdToken();
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, subscription: sub.toJSON() }),
    });

    setState('subscribed');
  }, [user]);

  const unsubscribe = useCallback(async () => {
    if (!user) return;

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;

    const idToken = await user.getIdToken();
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, endpoint: sub.endpoint }),
    });

    await sub.unsubscribe();
    setState('unsubscribed');
  }, [user]);

  return { state, subscribe, unsubscribe };
}
