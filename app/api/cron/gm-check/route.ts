import { runGMProactiveCheck } from '@/lib/gm-proactive';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: Request) {
    // Vercel sets this header automatically for cron requests
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await runGMProactiveCheck();
        return Response.json({ ok: true, ...result });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[GM Cron] Error:', message);
        return Response.json({ ok: false, error: message }, { status: 500 });
    }
}
