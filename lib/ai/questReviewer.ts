import { getAIProvider } from './index';

// Server-side only. The AI Game Master reviews a quest submission (solo mode).

export interface QuestReviewContext {
    title: string;
    description: string;
    difficulty: string;
    expReward: number;
    submissionNote: string;
    hasProof?: boolean;
    playerLevel?: number;
    goalSummary?: string;
}

export interface QuestReviewResult {
    decision: 'approve' | 'reject';
    feedback: string;
    bonusExp: number;
}

function buildSystemPrompt(): string {
    return [
        'Kamu adalah AI Game Master yang me-review penyelesaian quest di aplikasi RPG kehidupan nyata.',
        'Tugasmu pada feedback:',
        '1) Tangkap & rangkum singkat APA yang user kerjakan/laporkan.',
        '2) Apresiasi yang SPESIFIK (sebut detail dari laporannya, jangan generik).',
        '3) Beri 1–2 ide/saran konkret untuk langkah berikutnya. Jika ada tujuan utama (North Star) user, kaitkan sarannya ke tujuan itu.',
        '',
        'Aturan keputusan: approve jika usaha & buktinya masuk akal untuk quest ini. Tolak (reject) hanya jika laporan jelas kosong, asal-asalan, atau tidak nyambung.',
        'Boleh beri bonus EXP kecil (0–50) kalau laporannya bagus atau melebihi ekspektasi.',
        '',
        'Gaya feedback: hangat, personal, membumi, 3–6 kalimat. Pakai 2 paragraf dipisah baris baru — paragraf 1 = ringkasan + apresiasi, paragraf 2 = ide/saran lanjutan (boleh diawali "Saran berikutnya:").',
        'Bahasa Indonesia.',
        'Balas HANYA dalam format JSON: { "decision": "approve|reject", "feedback": string, "bonusExp": number }',
    ].join('\n');
}

function buildUserPrompt(ctx: QuestReviewContext): string {
    const lines = [
        `Quest: "${ctx.title}" (difficulty ${ctx.difficulty}, reward ${ctx.expReward} EXP).`,
        `Deskripsi quest: ${ctx.description || '-'}`,
    ];
    if (ctx.goalSummary) lines.push(`Tujuan utama user (North Star): ${ctx.goalSummary}`);
    lines.push(`Laporan user: ${ctx.submissionNote || '(tidak ada catatan)'}`);
    lines.push(ctx.hasProof ? 'User melampirkan bukti file.' : 'User tidak melampirkan bukti file.');
    lines.push('Review laporan ini dengan feedback yang kaya (ringkasan + apresiasi + saran lanjutan) sebagai JSON.');
    return lines.join('\n');
}

export async function reviewQuestSubmission(ctx: QuestReviewContext): Promise<QuestReviewResult> {
    const ai = getAIProvider();

    const res = await ai.generateJSON<Partial<QuestReviewResult>>({
        system: buildSystemPrompt(),
        messages: [{ role: 'user', content: buildUserPrompt(ctx) }],
        maxTokens: 900,
        temperature: 0.6,
    });

    const decision: QuestReviewResult['decision'] = res?.decision === 'reject' ? 'reject' : 'approve';
    const bonusExp = Math.max(0, Math.min(50, Math.round(Number(res?.bonusExp) || 0)));
    const feedback = String(
        res?.feedback ?? (decision === 'approve' ? 'Kerja bagus, quest diterima!' : 'Perlu perbaikan, coba lagi ya.')
    ).slice(0, 2000);

    return { decision, feedback, bonusExp };
}
