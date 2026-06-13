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
}

export interface QuestReviewResult {
    decision: 'approve' | 'reject';
    feedback: string;
    bonusExp: number;
}

function buildSystemPrompt(): string {
    return [
        'Kamu adalah AI Game Master yang me-review penyelesaian quest di aplikasi RPG kehidupan nyata.',
        'Nilai laporan user dengan adil tapi suportif. Approve jika usaha & buktinya masuk akal untuk quest ini.',
        'Tolak (reject) hanya jika laporan jelas kosong, asal-asalan, atau tidak nyambung dengan quest.',
        'Boleh beri bonus EXP kecil (0–50) kalau laporannya bagus atau melebihi ekspektasi.',
        'Feedback dalam Bahasa Indonesia, hangat & memotivasi, maksimal 2 kalimat.',
        'Balas HANYA dalam format JSON: { "decision": "approve|reject", "feedback": string, "bonusExp": number }',
    ].join('\n');
}

function buildUserPrompt(ctx: QuestReviewContext): string {
    return [
        `Quest: "${ctx.title}" (difficulty ${ctx.difficulty}, reward ${ctx.expReward} EXP).`,
        `Deskripsi: ${ctx.description || '-'}`,
        `Laporan user: ${ctx.submissionNote || '(tidak ada catatan)'}`,
        ctx.hasProof ? 'User melampirkan bukti file.' : 'User tidak melampirkan bukti file.',
        'Review laporan ini sebagai JSON.',
    ].join('\n');
}

export async function reviewQuestSubmission(ctx: QuestReviewContext): Promise<QuestReviewResult> {
    const ai = getAIProvider();

    const res = await ai.generateJSON<Partial<QuestReviewResult>>({
        system: buildSystemPrompt(),
        messages: [{ role: 'user', content: buildUserPrompt(ctx) }],
        maxTokens: 512,
        temperature: 0.5,
    });

    const decision: QuestReviewResult['decision'] = res?.decision === 'reject' ? 'reject' : 'approve';
    const bonusExp = Math.max(0, Math.min(50, Math.round(Number(res?.bonusExp) || 0)));
    const feedback = String(
        res?.feedback ?? (decision === 'approve' ? 'Kerja bagus, quest diterima!' : 'Perlu perbaikan, coba lagi ya.')
    ).slice(0, 500);

    return { decision, feedback, bonusExp };
}
