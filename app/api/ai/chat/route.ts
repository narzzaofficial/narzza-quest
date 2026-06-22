import { getAIProvider } from '@/lib/ai';
import type { AIMessage } from '@/lib/ai';

export const runtime = 'nodejs';

export interface ChatContext {
    displayName: string;
    level: number;
    streak: number;
    title?: string;
    goalSummary?: string;
    memorySummary?: string;
    todayReview?: {
        summary: string;
        wins: string[];
        focus: string[];
        questsCompleted: number;
        expEarned: number;
    } | null;
    recentQuestTitles?: string[];
    recentJournals?: { content: string; createdAt: string }[];
    // Life Coach context
    situation?: {
        currentStatus: string;
        weekFocus: string;
        workload: string;
        activeProjects: string[];
        contextNote: string;
    } | null;
    workTasks?: {
        title: string;
        project?: string;
        priority: string;
        status: string;
        deadline?: string;
        blocker?: string;
    }[];
    todayActivities?: {
        title: string;
        category: string;
        mood: number;
        energy: number;
        durationMinutes: number;
    }[];
    habitSummary?: {
        completed: number;
        total: number;
    } | null;
    recentMoodAvg?: number | null;
    recentEnergyAvg?: number | null;
    arcTitle?: string;
    arcNarrative?: string;
    financeSummary?: {
        totalNetWorthIDR: number;
        incomeThisMonth: number;
        expenseThisMonth: number;
        goals: { title: string; progressPercentage: number }[];
        recentTransactions: { title: string; amount: number; type: string; category: string }[];
    } | null;
}

export async function POST(req: Request) {
    try {
        const { messages, context }: { messages: AIMessage[]; context: ChatContext } = await req.json();

        if (!messages?.length || !context?.displayName) {
            return Response.json({ error: 'Request tidak lengkap.' }, { status: 400 });
        }

        const ai = getAIProvider();

        // ── Build rich context ───────────────────────────────
        const lines: string[] = [
            `User: ${context.displayName}, Level ${context.level}, streak ${context.streak} hari.`,
            context.title ? `Gelar: "${context.title}".` : '',
            context.goalSummary ? `Tujuan utama: ${context.goalSummary}` : '',
            context.memorySummary ? `Memory AI tentang user: ${context.memorySummary}` : '',
        ];

        // Story Arc
        if (context.arcTitle) {
            lines.push(`Story Arc aktif: "${context.arcTitle}". ${context.arcNarrative ?? ''}`);
        }

        // Situation Room
        if (context.situation) {
            const s = context.situation;
            lines.push([
                `Situasi sekarang: Status=${s.currentStatus}, Workload=${s.workload}.`,
                s.weekFocus ? `Fokus minggu ini: "${s.weekFocus}".` : '',
                s.activeProjects.length ? `Proyek aktif: ${s.activeProjects.join(', ')}.` : '',
                s.contextNote ? `Catatan user ke AI: "${s.contextNote}".` : '',
            ].filter(Boolean).join(' '));
        }

        // Work tasks
        const activeWorkTasks = (context.workTasks ?? []).filter(t => t.status !== 'done');
        if (activeWorkTasks.length > 0) {
            lines.push(`Task kantor aktif (${activeWorkTasks.length}):`);
            activeWorkTasks.slice(0, 5).forEach(t => {
                const parts = [`- [${t.priority.toUpperCase()}] ${t.title}`];
                if (t.project) parts.push(`(${t.project})`);
                if (t.deadline) parts.push(`deadline ${t.deadline}`);
                if (t.blocker) parts.push(`⚠ blocked: ${t.blocker}`);
                lines.push(parts.join(' '));
            });
        }

        // Today's activities
        if ((context.todayActivities ?? []).length > 0) {
            lines.push(`Aktivitas hari ini:`);
            context.todayActivities!.slice(0, 5).forEach(a => {
                lines.push(`- ${a.title} (${a.category}, ${a.durationMinutes} mnt, mood ${a.mood}/5, energi ${a.energy}/5)`);
            });
        }

        // Mood & energy trends
        if (context.recentMoodAvg != null) {
            lines.push(`Rata-rata mood 7 hari: ${context.recentMoodAvg.toFixed(1)}/5, energi: ${(context.recentEnergyAvg ?? 0).toFixed(1)}/5.`);
        }

        // Habits
        if (context.habitSummary) {
            lines.push(`Habit hari ini: ${context.habitSummary.completed}/${context.habitSummary.total} selesai.`);
        }

        // Daily review
        if (context.todayReview) {
            const r = context.todayReview;
            lines.push([
                `Review hari ini: ${r.questsCompleted} quest selesai, +${r.expEarned} EXP.`,
                r.summary,
                r.wins.length ? `Wins: ${r.wins.join('; ')}.` : '',
                r.focus.length ? `Fokus besok: ${r.focus.join('; ')}.` : '',
            ].filter(Boolean).join(' '));
        } else {
            lines.push('Belum ada review hari ini.');
        }

        if (context.recentQuestTitles?.length) {
            lines.push(`Quest terbaru: ${context.recentQuestTitles.slice(0, 5).join(', ')}.`);
        }

        if (context.recentJournals?.length) {
            lines.push(`Catatan Jurnal/Perasaan terbaru dari user:`);
            context.recentJournals.forEach(j => {
                lines.push(`- [${new Date(j.createdAt).toLocaleDateString()}] "${j.content}"`);
            });
        }

        // Finance context
        if (context.financeSummary) {
            const f = context.financeSummary;
            lines.push([
                `Kondisi Keuangan: Total Net Worth Rp ${Math.round(f.totalNetWorthIDR).toLocaleString('id-ID')}.`,
                `Bulan ini: Pemasukan Rp ${Math.round(f.incomeThisMonth).toLocaleString('id-ID')}, Pengeluaran Rp ${Math.round(f.expenseThisMonth).toLocaleString('id-ID')}.`,
                f.goals?.length ? `Target Finansial: ${f.goals.map(g => `${g.title} (${g.progressPercentage}%)`).join(', ')}.` : '',
                f.recentTransactions?.length ? `Transaksi terakhir: ${f.recentTransactions.map(t => `${t.title} (${t.type === 'expense' ? '-' : '+'} ${t.amount})`).join('; ')}.` : ''
            ].filter(Boolean).join(' '));
        }

        const contextBlock = lines.filter(Boolean).join('\n');

        const system = [
            'Kamu adalah AI Game Master dan Life Coach dari aplikasi "Narzza Quest".',
            'Tugasmu: mengenal user secara dalam, memahami pola hidupnya, dan mengarahkan dia mencapai tujuannya.',
            'Kamu punya akses ke seluruh konteks hidupnya: aktivitas harian, task kantor, mood, energi, habit, story arc, dan memory jangka panjang.',
            'Gunakan semua konteks ini untuk menjawab secara personal, relevan, dan insightful — bukan generik.',
            'Contoh: jika user tanya "aku harus ngapain hari ini?", jawab berdasarkan workload kantor, mood, dan tujuan utamanya.',
            'Gaya bicara: hangat, suportif, direct. Bahasa Indonesia. Tidak bertele-tele.',
            'Jangan selalu sebut nama user. Jawab seperti coach yang sudah kenal baik selama berbulan-bulan.',
            'FORMAT: Gunakan Markdown. JANGAN pakai numbered list (1. 2. 3.) sama sekali. Untuk bagian/poin utama, gunakan ### Heading. Untuk detail di bawahnya, gunakan - bullet list. **bold** hanya untuk kata penting. Jangan gunakan LaTeX.',
            '',
            'REFERENSI IN-LINE: Saat kamu menyebut data user atau menyarankan fitur app, embed markdown link ke halaman yang relevan. Gunakan format [teks](/path). Contoh:',
            '- Menyebut aktivitas/habit user → [Life Log](/life-log)',
            '- Menyebut atau menyarankan quest/misi → [Quest Board](/quest-board)',
            '- Guild quest → [Guild Quest](/guild-quest)',
            '- Jurnal/refleksi → [Jurnal](/journal)',
            '- Ranking/kompetisi → [Leaderboard](/leaderboard)',
            '- Statistik/analitik progress → [Analytics](/analytics)',
            '- Dompet/uang/reward → [My Wallet](/wallet)',
            '- Jadwal/roadmap/deadline → [Roadmap](/calendar)',
            '- Koneksi/partner → [My Network](/network)',
            '- Keuangan/Aset/Pengeluaran → [Keuangan](/finance)',
            '- AI Game Master/generate quest/daily review → [AI Game Master](/ai-gm)',
            'Embed link secara natural di tengah kalimat, bukan sebagai list terpisah. Hanya link yang benar-benar relevan dengan isi jawaban.',
            '',
            '=== KONTEKS LENGKAP USER ===',
            contextBlock,
        ].join('\n');

        const raw = await ai.generateText({ system, messages, maxTokens: 600, temperature: 0.75 });

        // Fix numbered list where model puts number alone then title on next line:
        // "1.\n**Title**" or "1.\n\n**Title**" → "1. **Title**"
        const reply = raw.replace(/(\d+)\.\s*\n+(\*\*)/g, '$1. $2');

        return Response.json({ reply });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memproses chat.';
        return Response.json({ error: message }, { status: 500 });
    }
}
