import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

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

    const code = randomBytes(9).toString("base64url");
    await adminDb.collection("telegramLinkCodes").doc(code).set({
        uid,
        createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ code, expiresInMinutes: 10 });
}
