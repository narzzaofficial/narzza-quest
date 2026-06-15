import { defaultCache } from "@serwist/next/worker";
import { PrecacheEntry } from "@serwist/precaching";
import { ExpirationPlugin, NetworkFirst, Serwist, SerwistGlobalConfig } from "serwist";


declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /^https:\/\/[a-z0-9-]+\.googleapis\.com\/.*/i,
      handler: new NetworkFirst({
        cacheName: "firebase-apis",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          }),
        ],
        networkTimeoutSeconds: 5,
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();

type SyncQueueItem =
  | {
      id?: number;
      type: "accept_quest";
      questId: string;
      idToken: string;
      createdAt: number;
      retryCount?: number;
      nextRetryAt?: number;
    }
  | {
      id?: number;
      type: "submit_quest";
      questId: string;
      idToken: string;
      submissionNote: string;
      files: Array<{ name: string; type: string; lastModified: number; blob: Blob }>;
      createdAt: number;
      retryCount?: number;
      nextRetryAt?: number;
    };

const QUEUE_DB_NAME = "lifequest-offline-queue";
const QUEUE_STORE_NAME = "operations";
const SYNC_TAG = "lifequest-offline-sync";
const MAX_RETRY_DELAY_MS = 5 * 60 * 1000;

const openQueueDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(QUEUE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE_NAME)) {
        db.createObjectStore(QUEUE_STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const getQueueItems = async (): Promise<SyncQueueItem[]> => {
  const db = await openQueueDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE_NAME, "readonly");
    const req = tx.objectStore(QUEUE_STORE_NAME).getAll();
    req.onsuccess = () => resolve((req.result as SyncQueueItem[]) || []);
    req.onerror = () => reject(req.error);
  });
};

const removeQueueItem = async (id: number): Promise<void> => {
  const db = await openQueueDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE_NAME, "readwrite");
    tx.objectStore(QUEUE_STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const markQueueItemFailed = async (id: number, retryCount: number): Promise<void> => {
  const db = await openQueueDb();
  const nextRetryCount = retryCount + 1;
  const retryDelay = Math.min(MAX_RETRY_DELAY_MS, (2 ** Math.min(nextRetryCount, 8)) * 1000);
  const nextRetryAt = Date.now() + retryDelay;
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE_NAME, "readwrite");
    const store = tx.objectStore(QUEUE_STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => {
      const value = req.result as SyncQueueItem | undefined;
      if (!value) return;
      store.put({
        ...value,
        retryCount: nextRetryCount,
        nextRetryAt,
      });
    };
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const syncOfflineQueue = async () => {
  const items = await getQueueItems();
  const sorted = items
    .filter((item) => typeof item.id === "number")
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

  for (const item of sorted) {
    if (typeof item.id !== "number") continue;
    if ((item.nextRetryAt || 0) > Date.now()) continue;

    try {
      if (item.type === "accept_quest") {
        const res = await fetch("/api/offline/quest/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questId: item.questId,
            idToken: item.idToken,
          }),
        });
        if (!res.ok) throw new Error("Gagal sinkronisasi accept_quest.");
        await removeQueueItem(item.id);
        continue;
      }

      const uploadedUrls: string[] = [];
      for (const file of item.files) {
        const formData = new FormData();
        formData.append("file", file.blob, file.name);
        formData.append("questId", item.questId);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Gagal upload file saat background sync.");
        const uploadJson = await uploadRes.json();
        uploadedUrls.push(uploadJson.url);
      }

      const submitRes = await fetch("/api/offline/quest/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questId: item.questId,
          submissionNote: item.submissionNote,
          urls: uploadedUrls,
          idToken: item.idToken,
        }),
      });
      if (!submitRes.ok) throw new Error("Gagal submit quest saat background sync.");
      await removeQueueItem(item.id);
    } catch (itemError) {
      console.error("Offline sync item failed in SW:", itemError);
      await markQueueItemFailed(item.id, item.retryCount || 0);
    }
  }
};

addEventListener("sync", (event: Event) => {
  const syncEvent = event as Event & { tag?: string; waitUntil: (promise: Promise<void>) => void };
  if (syncEvent.tag === SYNC_TAG) {
    syncEvent.waitUntil(syncOfflineQueue());
  }
});

// ── Web Push ──────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sw = self as any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
sw.addEventListener("push", (event: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const data: Record<string, string> = event.data?.json() ?? {};
  const title = data.title ?? "Narzza Quest";
  const body = data.body ?? "Ada notifikasi baru untukmu!";
  const icon = data.icon ?? "/icon-192x192.png";
  const url = data.url ?? "/notifications";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  event.waitUntil(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    sw.registration.showNotification(title, {
      body,
      icon,
      badge: "/icon-192x192.png",
      data: { url },
    }) as Promise<void>
  );
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
sw.addEventListener("notificationclick", (event: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  event.notification.close();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const url: string = (event.notification.data as { url?: string })?.url ?? "/notifications";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  event.waitUntil(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    (sw.clients.matchAll({ type: "window", includeUncontrolled: true }) as Promise<{ url: string; navigate: (u: string) => Promise<unknown>; focus: () => Promise<unknown> }[]>).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes((sw.location as Location).origin) && "focus" in client) {
          void client.navigate(url);
          return client.focus();
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return sw.clients.openWindow(url) as Promise<unknown>;
    })
  );
});
