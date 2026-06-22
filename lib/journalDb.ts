import { collection, doc, addDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { PersonalJournal } from "@/types";

export async function addPersonalJournal(uid: string, content: string, visibility: 'private' | 'gm' = 'private', mood?: 1 | 2 | 3 | 4 | 5): Promise<string> {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, "personal_journals"), {
        uid,
        content,
        visibility,
        mood: mood || null,
        createdAt: now,
        updatedAt: now,
    });
    return docRef.id;
}

export function subscribeToPersonalJournals(uid: string, callback: (journals: PersonalJournal[]) => void) {
    const q = query(
        collection(db, "personal_journals"),
        where("uid", "==", uid),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as PersonalJournal)));
    });
}
