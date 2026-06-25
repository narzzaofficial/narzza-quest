import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { auth, pendingMagicLinkTokens } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    let email: string;
    let name: string | undefined;
    try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        if (!decoded.email) return NextResponse.json({ error: "Akun tidak punya email." }, { status: 400 });
        email = decoded.email;
        name = decoded.name;
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await auth.api.signInMagicLink({
        body: { email, name },
        headers: new Headers(),
    });

    const code = pendingMagicLinkTokens.get(email);
    pendingMagicLinkTokens.delete(email);

    if (!code) {
        return NextResponse.json({ error: "Gagal membuat kode akses." }, { status: 500 });
    }

    return NextResponse.json({ code, expiresInMinutes: 10 });
}
