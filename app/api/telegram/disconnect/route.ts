import { NextRequest, NextResponse } from "next/server";
import admin, { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let uid: string;
    try {
        const decoded = await adminAuth.verifyIdToken(authHeader.split("Bearer ")[1]);
        uid = decoded.uid;
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await adminDb.collection("users").doc(uid).update({
        telegramChatId: admin.firestore.FieldValue.delete(),
    });

    return NextResponse.json({ success: true });
}
