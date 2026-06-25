import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    let email: string;
    try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        if (!decoded.email) return NextResponse.json({ error: "Akun tidak punya email." }, { status: 400 });
        email = decoded.email;
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ctx = await auth.$context;
    const betterAuthUser = await ctx.adapter.findOne<{ id: string }>({
        model: "user",
        where: [{ field: "email", value: email }],
    });

    let revoked = 0;
    if (betterAuthUser) {
        revoked = await ctx.adapter.deleteMany({
            model: "oauthAccessToken",
            where: [{ field: "userId", value: betterAuthUser.id }],
        });
    }

    // Also clear this browser's own connector session cookie, if any, so a
    // fresh /authorize attempt can't silently resume as the same account.
    const signOutRes = await auth.api.signOut({ headers: req.headers, asResponse: true });
    const res = NextResponse.json({ revoked });
    for (const cookie of signOutRes.headers.getSetCookie()) {
        res.headers.append("set-cookie", cookie);
    }
    return res;
}
