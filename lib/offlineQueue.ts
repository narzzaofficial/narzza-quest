'use client';

export type QueuedFile = {
    name: string;
    type: string;
    lastModified: number;
    blob: Blob;
};

type OfflineQueueMeta = {
    id?: number;
    createdAt: number;
    retryCount?: number;
    nextRetryAt?: number;
};

export type AcceptQuestQueueItem = OfflineQueueMeta & {
    type: 'accept_quest';
    questId: string;
    idToken: string;
};

export type SubmitQuestQueueItem = OfflineQueueMeta & {
    type: 'submit_quest';
    questId: string;
    idToken: string;
    submissionNote: string;
    files: QueuedFile[];
};

export type OfflineQueueItem = AcceptQuestQueueItem | SubmitQuestQueueItem;
export type OfflineQueueEnqueueItem =
    | Omit<AcceptQuestQueueItem, 'id'>
    | Omit<SubmitQuestQueueItem, 'id'>;

const DB_NAME = 'lifequest-offline-queue';
const STORE_NAME = 'operations';
const DB_VERSION = 1;
const MAX_QUEUE_ITEMS = 60;
const MAX_RETRY_DELAY_MS = 5 * 60 * 1000;

const notifyQueueChanged = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('offline-queue-updated'));
    }
};

const openDb = (): Promise<IDBDatabase> =>
    new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

export const enqueueOfflineItem = async (item: OfflineQueueEnqueueItem): Promise<void> => {
    const db = await openDb();

    const withMeta: OfflineQueueEnqueueItem = {
        ...item,
        retryCount: 0,
        nextRetryAt: 0,
    };

    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const getAllReq = store.getAll();
        getAllReq.onsuccess = () => {
            const allItems = (getAllReq.result as OfflineQueueItem[]) || [];
            if (allItems.length >= MAX_QUEUE_ITEMS) {
                const toDelete = allItems
                    .filter((queueItem): queueItem is OfflineQueueItem & { id: number } => typeof queueItem.id === 'number')
                    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
                    .slice(0, allItems.length - MAX_QUEUE_ITEMS + 1);
                toDelete.forEach((queueItem) => store.delete(queueItem.id));
            }
            store.add(withMeta);
        };
        getAllReq.onerror = () => reject(getAllReq.error);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    notifyQueueChanged();

    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.ready;
            if ('sync' in registration) {
                await registration.sync.register('lifequest-offline-sync');
            }
        } catch (error) {
            console.warn('Gagal register background sync:', error);
        }
    }
};

export const getOfflineItems = async (): Promise<OfflineQueueItem[]> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).getAll();
        req.onsuccess = () => resolve((req.result as OfflineQueueItem[]) || []);
        req.onerror = () => reject(req.error);
    });
};

export const removeOfflineItem = async (id: number): Promise<void> => {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    notifyQueueChanged();
};

export const markOfflineItemFailed = async (id: number, retryCount: number): Promise<void> => {
    const db = await openDb();
    const nextRetryCount = retryCount + 1;
    const retryDelay = Math.min(MAX_RETRY_DELAY_MS, (2 ** Math.min(nextRetryCount, 8)) * 1000);
    const nextRetryAt = Date.now() + retryDelay;

    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => {
            const value = req.result as OfflineQueueItem | undefined;
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
    notifyQueueChanged();
};

export const getPendingOfflineCount = async (): Promise<number> => {
    const items = await getOfflineItems();
    return items.length;
};
