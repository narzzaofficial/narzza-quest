import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendTelegramMessage } from "@/lib/telegram";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const secret = req.headers.get("x-telegram-bot-api-secret-token");
    if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const update = await req.json().catch(() => null);
    const message = update?.message;
    const text: string | undefined = message?.text;
    const chatId: number | undefined = message?.chat?.id;

    if (!text || !chatId) {
        return NextResponse.json({ ok: true });
    }

    const match = text.match(/^\/start(?:@\w+)?\s+(\S+)/);
    if (!match) {
        await sendTelegramMessage(String(chatId), "Halo! Buka Settings → Hubungkan Telegram di Narzza Quest buat ngelink akunmu ke sini.");
        return NextResponse.json({ ok: true });
    }

    const code = match[1];
    const codeRef = adminDb.collection("telegramLinkCodes").doc(code);
    const codeSnap = await codeRef.get();

    if (!codeSnap.exists) {
        await sendTelegramMessage(String(chatId), "Kode nggak valid atau udah dipakai. Generate kode baru di Settings.");
        return NextResponse.json({ ok: true });
    }

    const { uid, createdAt } = codeSnap.data() as { uid: string; createdAt: string };
    await codeRef.delete();

    const ageMinutes = (Date.now() - new Date(createdAt).getTime()) / 60_000;
    if (ageMinutes > 10) {
        await sendTelegramMessage(String(chatId), "Kode udah expired (lebih dari 10 menit). Generate kode baru di Settings.");
        return NextResponse.json({ ok: true });
    }

    const userSnap = await adminDb.collection("users").doc(uid).get();
    const displayName = (userSnap.data() as Record<string, unknown> | undefined)?.displayName ?? "Hero";
    await adminDb.collection("users").doc(uid).update({ telegramChatId: String(chatId) });

    await sendTelegramMessage(
        String(chatId),
        `✅ Terhubung sebagai <b>${displayName}</b>! Mulai sekarang kamu bakal dapet notifikasi, laporan harian/mingguan, dan reminder langsung di sini.`
    );

    return NextResponse.json({ ok: true });
}
