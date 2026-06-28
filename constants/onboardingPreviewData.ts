import { localDateStr } from '@/lib/dateUtils';
import type { ActivityEntry, Quest, StoryArc } from '@/types';
import type { ActivityPoint } from '@/hooks/useDashboard';
import type { DayActivity } from '@/hooks/useActivityHistory';
import type { DayXP } from '@/hooks/useXPHistory';

/**
 * Illustrative "Contoh" datasets shown only while a page's onboarding tour is
 * active AND the real data is still empty — so first-time users see what a
 * filled-in chart looks like instead of a blank/empty state. Never persisted,
 * never fed back into any mutation — purely for display during the tour.
 */

function isoAt(daysAgo: number, hour: number, minute = 0): string {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
}

// ── Dashboard: "Aktivitas Mingguan" 7-day EXP/penalty chart ──
export const DUMMY_ACTIVITY_7D: ActivityPoint[] = (() => {
    const fmt = new Intl.DateTimeFormat('id-ID', { weekday: 'short' });
    const exp = [40, 65, 20, 80, 55, 90, 70];
    const penalty = [0, 10, 0, 0, 15, 0, 5];
    return exp.map((e, idx) => {
        const i = 6 - idx;
        const d = new Date();
        d.setDate(d.getDate() - i);
        return { day: fmt.format(d), date: localDateStr(d), exp: e, penalty: penalty[idx], net: e - penalty[idx], hours: 2 + idx * 0.4 };
    });
})();

// ── Dashboard "Story Arc" card + Story Arc page history ──
export const DUMMY_STORY_ARC: StoryArc = {
    id: 'preview-arc',
    uid: 'preview',
    arcNumber: 1,
    title: 'Arc I: Fondasi Petualang',
    theme: 'Membangun rutinitas dasar',
    narrative: 'Petualanganmu baru dimulai — chapter ini fokus membangun kebiasaan harian yang solid.',
    weeklyGoals: ['Catat aktivitas tiap hari', 'Selesaikan 5 quest pertama'],
    startDate: localDateStr(new Date(Date.now() - 3 * 86_400_000)),
    endDate: localDateStr(new Date(Date.now() + 11 * 86_400_000)),
    status: 'active',
    questsCompleted: 3,
};

export const DUMMY_ARC_QUESTS: { id: string; title: string; status: Quest['status'] }[] = [
    { id: 'preview-q1', title: 'Catat aktivitas pertamamu', status: 'approved' },
    { id: 'preview-q2', title: 'Selesaikan 1 habit hari ini', status: 'approved' },
    { id: 'preview-q3', title: 'Mulai story arc pertamamu', status: 'in_progress' },
];

// ── AI Game Master: "Misi dari AI" list ──
export const DUMMY_AI_QUESTS: Quest[] = [
    {
        id: 'preview-quest-1', title: 'Rapikan meja kerja & mulai sesi fokus 1 jam',
        description: 'Bersihkan ruang kerja lalu fokus 60 menit tanpa distraksi.',
        category: 'daily', difficulty: 'D', expReward: 30, deadline: isoAt(-1, 23, 59),
        status: 'pending', createdBy: 'ai', motivation: 'Lingkungan rapi bikin fokus lebih gampang.',
        assignedTo: 'preview', createdAt: isoAt(0, 8), updatedAt: isoAt(0, 8),
    },
    {
        id: 'preview-quest-2', title: 'Olahraga ringan 20 menit',
        description: 'Jalan kaki atau stretching 20 menit buat jaga energi harian.',
        category: 'daily', difficulty: 'C', expReward: 45, deadline: isoAt(-2, 23, 59),
        status: 'in_progress', createdBy: 'ai', motivation: 'Badan sehat, fokus juga ikut naik.',
        assignedTo: 'preview', createdAt: isoAt(1, 8), updatedAt: isoAt(1, 8),
    },
    {
        id: 'preview-quest-3', title: 'Refleksi mingguan di jurnal',
        description: 'Tulis 3 hal yang berjalan baik minggu ini.',
        category: 'weekly', difficulty: 'B', expReward: 60, deadline: isoAt(-5, 23, 59),
        status: 'approved', createdBy: 'ai', motivation: 'Refleksi bantu kamu lihat progressmu sendiri.',
        assignedTo: 'preview', createdAt: isoAt(2, 8), updatedAt: isoAt(2, 8),
    },
];

// ── Life Log: "Timeline Hari Ini" ──
export const DUMMY_TIMELINE_ENTRIES: ActivityEntry[] = [
    {
        id: 'preview-entry-1', uid: 'preview', title: 'Deep work — coding project',
        category: 'work', mood: 4, energy: 4,
        startTime: isoAt(0, 9, 0), endTime: isoAt(0, 11, 0), createdAt: isoAt(0, 9, 0),
    },
    {
        id: 'preview-entry-2', uid: 'preview', title: 'Olahraga pagi',
        category: 'health', mood: 5, energy: 5,
        startTime: isoAt(0, 7, 0), endTime: isoAt(0, 7, 30), createdAt: isoAt(0, 7, 0),
    },
    {
        id: 'preview-entry-3', uid: 'preview', title: 'Istirahat siang',
        category: 'rest', mood: 3, energy: 3,
        startTime: isoAt(0, 12, 0), endTime: isoAt(0, 13, 0), createdAt: isoAt(0, 12, 0),
    },
];

// ── Life Log: "Riwayat Aktivitas" (ActivityHistory) ──
export const DUMMY_ACTIVITY_HISTORY_DAYS: DayActivity[] = [1, 2, 3].map((daysAgo) => {
    const entries: ActivityEntry[] = [
        {
            id: `preview-hist-${daysAgo}-1`, uid: 'preview', title: 'Kerja fokus',
            category: 'work', mood: 4, energy: 4,
            startTime: isoAt(daysAgo, 9), endTime: isoAt(daysAgo, 11), createdAt: isoAt(daysAgo, 9),
        },
        {
            id: `preview-hist-${daysAgo}-2`, uid: 'preview', title: 'Belajar topik baru',
            category: 'learning', mood: 4, energy: 3,
            startTime: isoAt(daysAgo, 19), endTime: isoAt(daysAgo, 20), createdAt: isoAt(daysAgo, 19),
        },
    ];
    return {
        date: localDateStr(new Date(Date.now() - daysAgo * 86_400_000)),
        entries, completedEntries: entries, totalMinutes: 180, avgMood: 4, habitLogs: [],
    };
});

// ── Analytics: mood/energy, category, peak hours, best day, heatmap, exp growth ──
export const DUMMY_MOOD_ENERGY = [4, 6, 1, 0, 5, 3, 2].map((daysAgo, idx) => {
    const d = new Date(Date.now() - (6 - idx) * 86_400_000);
    return { label: `${d.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'][d.getMonth()]}`, mood: 3 + (idx % 3) * 0.5, energy: 3.2 + (idx % 2) * 0.8 };
});

export const DUMMY_CATEGORY_DATA = [
    { name: 'Kerja', value: 18.5, color: '#3b82f6' },
    { name: 'Belajar', value: 7.2, color: '#a855f7' },
    { name: 'Kesehatan', value: 4.0, color: '#f43f5e' },
    { name: 'Istirahat', value: 9.8, color: '#6366f1' },
];

export const DUMMY_PEAK_HOURS = Array.from({ length: 19 }, (_, i) => {
    const hour = i + 5;
    const bump = hour === 9 || hour === 20 ? 6 : hour === 14 ? 4 : 1;
    return { hour: `${String(hour).padStart(2, '0')}:00`, count: bump };
});

export const DUMMY_BEST_DAY = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, i) => ({
    day, count: [2, 6, 5, 7, 4, 6, 3][i], hours: [3, 6.5, 5.5, 7, 4.5, 6, 3.5][i],
}));

export const DUMMY_HEATMAP_ACTIVITIES: ActivityEntry[] = Array.from({ length: 40 }, (_, i) => {
    const daysAgo = Math.floor(i * 3.2);
    return {
        id: `preview-heatmap-${i}`, uid: 'preview', title: 'Aktivitas',
        category: (['work', 'learning', 'health', 'personal'] as const)[i % 4],
        mood: 4, energy: 4,
        startTime: isoAt(daysAgo, 10), endTime: isoAt(daysAgo, 11), createdAt: isoAt(daysAgo, 10),
    };
});

export const DUMMY_EXP_DATA = (() => {
    let cumulative = 0;
    return [50, 70, 30, 90, 60, 100, 80].map((exp, idx) => {
        const d = new Date(Date.now() - (6 - idx) * 86_400_000);
        const penalty = idx === 2 ? 20 : 0;
        cumulative += exp - penalty;
        return {
            label: `${d.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'][d.getMonth()]}`,
            exp, penalty: -penalty, net: exp - penalty, cumulative,
        };
    });
})();

// ── Analytics: Strength Radar ──
export const DUMMY_RADAR_DATA = [
    { category: 'Harian', score: 24 },
    { category: 'Mingguan', score: 14 },
    { category: 'Utama', score: 9 },
    { category: 'Sampingan', score: 6 },
];

export const DUMMY_HABIT_RATE = 72;

// ── Analytics: "Riwayat XP" (XPHistory) ──
export const DUMMY_XP_DAYS: DayXP[] = Array.from({ length: 14 }, (_, i) => {
    const daysAgo = 13 - i;
    const earned = [20, 0, 45, 30, 0, 60, 25, 40, 0, 50, 35, 20, 55, 30][i];
    const penalty = [0, 0, 0, 10, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0][i];
    return {
        date: localDateStr(new Date(Date.now() - daysAgo * 86_400_000)),
        earned, penalty, net: earned - penalty, entries: [], missedTitles: penalty > 0 ? ['Quest contoh'] : [],
    };
});
