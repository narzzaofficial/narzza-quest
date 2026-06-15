import { getAIProvider } from './index';

export interface PreviousArcSummary {
    arcNumber: number;
    title: string;
    theme: string;
    questsCompleted: number;
}

export interface ArcGenContext {
    displayName: string;
    level: number;
    streak: number;
    arcNumber: number;
    goalSummary?: string;
    memorySummary?: string;
    // Full previous arc for narrative continuity
    previousArc?: {
        title: string;
        theme: string;
        narrative: string;
        weeklyGoals: string[];
        questsCompleted: number;
    };
    // Compact history of all past arcs so AI knows the full journey
    arcHistory?: PreviousArcSummary[];
}

export interface ArcDraft {
    title: string;
    theme: string;
    narrative: string;
    weeklyGoals: string[];
}

export async function generateArcDraft(ctx: ArcGenContext): Promise<ArcDraft> {
    const ai = getAIProvider();

    const system = [
        'Kamu adalah AI Game Master dari RPG kehidupan nyata "Narzza Quest".',
        'Tugasmu menulis chapter baru dalam kisah nyata sang hero — sebuah Story Arc 2 minggu.',
        '',
        'PRINSIP UTAMA:',
        '- Arc adalah kelanjutan langsung dari arc sebelumnya — bukan episode terpisah.',
        '- Narrative harus menyebut/mengakui apa yang sudah dicapai di arc lalu (jika ada).',
        '- Target (weeklyGoals) harus merupakan langkah LANJUTAN dari target arc sebelumnya.',
        '- Jika arc sebelumnya targetnya belajar API → arc baru bisa: membangun proyek dengan API itu.',
        '- Setiap arc harus terasa seperti naik satu tangga, bukan mengulang atau lompat terlalu jauh.',
        `- Gunakan nama hero ("${ctx.displayName}", bukan "kamu") dalam narrative untuk efek sinematik.`,
        '',
        'Balas HANYA dengan JSON berikut (tanpa teks lain):',
        '{',
        '  "title": "Arc [Nomor]: [Judul Chapter yang Epik & Spesifik]",',
        '  "theme": "[tema singkat 3-5 kata]",',
        '  "narrative": "[2-3 kalimat GM yang melanjutkan kisah — akui pencapaian lalu, buka tantangan baru]",',
        '  "weeklyGoals": ["[goal konkret yang merupakan kelanjutan logis dari arc sebelumnya]", "[goal konkret kedua]"]',
        '}',
    ].join('\n');

    const lines: string[] = [
        `Hero: ${ctx.displayName}, Level ${ctx.level}, streak ${ctx.streak} hari.`,
    ];

    if (ctx.goalSummary) lines.push(`North Star (tujuan jangka panjang): ${ctx.goalSummary}`);
    if (ctx.memorySummary) lines.push(`Konteks AI (memory): ${ctx.memorySummary}`);

    // Full arc history for continuity
    if (ctx.arcHistory?.length) {
        const historyText = ctx.arcHistory
            .map(a => `Arc ${a.arcNumber} "${a.title}" (${a.theme}) — ${a.questsCompleted} quest selesai`)
            .join('\n  ');
        lines.push(`Perjalanan sejauh ini:\n  ${historyText}`);
    }

    // Previous arc full detail — most important for continuity
    if (ctx.previousArc) {
        const prev = ctx.previousArc;
        lines.push([
            `Arc sebelumnya (Arc ${ctx.arcNumber - 1}):`,
            `  Judul: ${prev.title}`,
            `  Tema: ${prev.theme}`,
            `  Narasi: "${prev.narrative}"`,
            `  Target yang dicanangkan: ${prev.weeklyGoals.join(' | ')}`,
            `  Quest diselesaikan: ${prev.questsCompleted}`,
            prev.questsCompleted === 0
                ? '  Catatan: hero belum menyelesaikan quest di arc ini — akui tantangan ini dalam narrative.'
                : prev.questsCompleted >= 5
                    ? '  Catatan: hero sangat produktif di arc ini — beri apresiasi dan naikkan tantangan.'
                    : '  Catatan: hero mulai membangun momentum.',
        ].join('\n'));
    }

    lines.push(`Ini adalah Arc ke-${ctx.arcNumber}. Tulis dalam Bahasa Indonesia.`);

    const contextLines = lines.join('\n\n');

    const res = await ai.generateJSON<ArcDraft>({
        system,
        messages: [{ role: 'user', content: contextLines }],
        maxTokens: 400,
        temperature: 0.85,
    });

    return {
        title: String(res?.title ?? `Arc ${ctx.arcNumber}: Petualangan Baru`).slice(0, 80),
        theme: String(res?.theme ?? 'produktivitas & pertumbuhan').slice(0, 60),
        narrative: String(res?.narrative ?? '').slice(0, 500),
        weeklyGoals: Array.isArray(res?.weeklyGoals)
            ? res.weeklyGoals.slice(0, 2).map(String)
            : ['Selesaikan 5 quest minggu ini', 'Tingkatkan satu skill baru'],
    };
}
