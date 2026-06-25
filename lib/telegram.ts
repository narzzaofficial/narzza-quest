/**
 * Telegram Bot API helper — server-side only.
 * Sends via https://api.telegram.org/bot<token>/sendMessage
 */

export async function sendTelegramMessage(
    chatId: string | null | undefined,
    text: string
): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!chatId || !token) return;

    try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
        });

        if (!res.ok) {
            const body = await res.text();
            console.error('[Telegram] Failed:', res.status, body);
        }
    } catch (err) {
        console.error('[Telegram] Error:', err);
    }
}
