import {
    collection, doc, getDoc, setDoc, updateDoc, addDoc,
    query, where, orderBy, getDocs, onSnapshot,
    writeBatch, increment
} from "firebase/firestore";
import { db } from "./firebase";
import { FinancialAsset, FinancialTransaction, FinancialGoal } from "@/types";

// ─────────────────────────────────────────
// ASSETS
// ─────────────────────────────────────────

export async function createAsset(uid: string, asset: Omit<FinancialAsset, 'id' | 'uid' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, "financial_assets"), {
        uid,
        ...asset,
        createdAt: now,
        updatedAt: now,
    });
    return docRef.id;
}

export async function updateAsset(id: string, updates: Partial<FinancialAsset>): Promise<void> {
    await updateDoc(doc(db, "financial_assets", id), {
        ...updates,
        updatedAt: new Date().toISOString(),
    });
}

export function subscribeToAssets(uid: string, callback: (assets: FinancialAsset[]) => void) {
    const q = query(
        collection(db, "financial_assets"),
        where("uid", "==", uid),
        orderBy("createdAt", "asc")
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as FinancialAsset)));
    });
}

// ─────────────────────────────────────────
// TRANSACTIONS
// ─────────────────────────────────────────

export async function recordTransaction(uid: string, tx: Omit<FinancialTransaction, 'id' | 'uid' | 'createdAt'>): Promise<string> {
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    
    // Create the transaction document
    const txRef = doc(collection(db, "financial_transactions"));
    batch.set(txRef, {
        uid,
        ...tx,
        createdAt: now,
    });

    // Update the main asset balance
    const assetRef = doc(db, "financial_assets", tx.assetId);
    let amountChange = tx.amount;
    
    if (tx.type === 'expense' || tx.type === 'transfer') {
        amountChange = -tx.amount;
    }
    batch.update(assetRef, {
        balance: increment(amountChange),
        updatedAt: now,
    });

    // If it's a transfer, increase the target asset or goal balance
    if (tx.type === 'transfer') {
        const receivedAmount = (tx as any).toAmount !== undefined ? (tx as any).toAmount : tx.amount;
        if (tx.toAssetId) {
            const toAssetRef = doc(db, "financial_assets", tx.toAssetId);
            batch.update(toAssetRef, {
                balance: increment(receivedAmount),
                updatedAt: now,
            });
        } else if ((tx as any).toGoalId) {
            const toGoalRef = doc(db, "financial_goals", (tx as any).toGoalId);
            batch.update(toGoalRef, {
                currentAmount: increment(receivedAmount),
                updatedAt: now,
            });
        }
    }

    await batch.commit();
    return txRef.id;
}

export function subscribeToTransactions(uid: string, limitCount: number, callback: (txs: FinancialTransaction[]) => void) {
    // Note: without composite indexes, we might just order by date/timestamp
    const q = query(
        collection(db, "financial_transactions"),
        where("uid", "==", uid),
        orderBy("timestamp", "desc")
        // limit(limitCount) -> can add limit later if index exists
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as FinancialTransaction)));
    });
}

// ─────────────────────────────────────────
// GOALS / WISHLIST
// ─────────────────────────────────────────

export async function createGoal(uid: string, goal: Omit<FinancialGoal, 'id' | 'uid' | 'createdAt' | 'updatedAt' | 'status' | 'currentAmount'>): Promise<string> {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, "financial_goals"), {
        uid,
        ...goal,
        currentAmount: 0,
        status: 'active',
        createdAt: now,
        updatedAt: now,
    });
    return docRef.id;
}

export async function updateGoalAmount(id: string, amountToAdd: number): Promise<void> {
    await updateDoc(doc(db, "financial_goals", id), {
        currentAmount: increment(amountToAdd),
        updatedAt: new Date().toISOString(),
    });
}

export function subscribeToGoals(uid: string, callback: (goals: FinancialGoal[]) => void) {
    const q = query(
        collection(db, "financial_goals"),
        where("uid", "==", uid),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as FinancialGoal)));
    });
}
