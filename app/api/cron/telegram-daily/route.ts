import { runDailyTelegramReport } from '@/lib/telegram-reports';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await runDailyTelegramReport();
        return Response.json({ ok: true, ...result });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[Telegram Daily Cron] Error:', message);
        return Response.json({ ok: false, error: message }, { status: 500 });
    }
}
