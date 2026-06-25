import type { Step } from 'react-joyride';

export const DASHBOARD_TOUR_STEPS: Step[] = [
    {
        target: 'body',
        placement: 'center',
        title: 'Selamat datang di Lifegame!',
        content: 'Yuk kenalan bentar sama fitur-fiturnya sebelum mulai main.',
    },
    {
        target: '[data-tour="hero-banner"]',
        title: 'Profil Karaktermu',
        content: 'Ini ringkasan karaktermu — level, title, dan streak harian.',
    },
    {
        target: '[data-tour="xp-card"]',
        title: 'Experience Points',
        content: 'Progress EXP kamu ke level berikutnya.',
    },
    {
        target: '[data-tour="activity-card"]',
        title: 'Aktivitas Mingguan',
        content: 'Grafik aktivitas 7 hari terakhir, biar kamu bisa pantau konsistensi.',
    },
    {
        target: '[data-tour="stats-row"]',
        title: 'Statistik Cepat',
        content: 'Empat angka penting: quest selesai, jam aktif hari ini, streak harian, dan level kamu sekarang.',
    },
    {
        target: '[data-tour="story-arc-card"]',
        title: 'Story Arc',
        content: 'Cerita besar yang disusun AI Game Master buat progress jangka panjangmu — quest-quest kamu otomatis terhubung ke arc ini.',
    },
    {
        target: '[data-tour="generate-quest-btn"]',
        title: 'AI Game Master',
        content: 'Tombol ini buat AI Game Master generate quest baru sesuai levelmu.',
    },
    {
        target: '[data-tour="quick-actions"]',
        title: 'Quick Actions',
        content: 'Jalan pintas ke Quest Board, Guild Quest, dan Jurnal — nggak perlu scroll ke sidebar.',
    },
    {
        target: '[data-tour="nav-quest-board"]',
        title: 'Quest Board',
        content: 'Semua quest yang kamu punya ada di sini.',
    },
    {
        target: '[data-tour="nav-journal"]',
        title: 'Jurnal',
        content: 'Tempat refleksi & curhat harian.',
    },
    {
        target: '[data-tour="nav-finance"]',
        title: 'Keuangan',
        content: 'Catat & pantau keuanganmu di sini.',
    },
    {
        target: '[data-tour="nav-analytics"]',
        title: 'Analytics',
        content: 'Insight mendalam dari semua aktivitasmu.',
    },
    {
        target: 'body',
        placement: 'center',
        title: 'Siap berpetualang!',
        content: 'Itu dia fitur utamanya! Selamat berpetualang.',
    },
];

export const AI_GM_TOUR_STEPS: Step[] = [
    {
        target: '[data-tour="ai-gm-header"]',
        title: 'AI Game Master',
        content: 'Ini halaman tempat AI Game Master menyusun & ngatur misimu secara otomatis.',
    },
    {
        target: '[data-tour="ai-gm-goal"]',
        title: 'North Star Goal',
        content: 'Tujuan jangka panjangmu — semua misi dari AI disusun supaya mendukung goal ini.',
    },
    {
        target: '[data-tour="ai-gm-generate"]',
        title: 'Generate Misi Baru',
        content: 'Tulis fokus kamu sekarang (opsional), lalu klik Generate Quest buat dapet misi baru dari AI.',
    },
    {
        target: '[data-tour="ai-gm-daily-review"]',
        title: 'Daily Review',
        content: 'Ringkasan harian dari AI tentang progress & kebiasaanmu.',
    },
    {
        target: '[data-tour="ai-gm-memory"]',
        title: 'Memory',
        content: 'Hal-hal yang AI ingat tentang kamu, biar misi yang dibuat makin nyambung sama kondisimu.',
    },
    {
        target: '[data-tour="ai-gm-stats"]',
        title: 'Statistik Misi',
        content: 'Jumlah quest aktif, yang sudah selesai, dan total misi dari AI.',
    },
    {
        target: '[data-tour="ai-gm-quest-list"]',
        title: 'Misi dari AI',
        content: 'Semua misi yang sudah dibuat AI Game Master buat kamu ada di sini.',
    },
];

export const CHAT_TOUR_STEPS: Step[] = [
    {
        target: '[data-tour="chat-header"]',
        title: 'AI Coach',
        content: 'Life coach yang tahu konteks penuh hidupmu — aktivitas, task, habit, tujuan, story arc, dan keuanganmu.',
    },
    {
        target: '[data-tour="chat-messages"]',
        title: 'Percakapan',
        content: 'Riwayat chat & respons AI muncul di sini. Belum tau mau nanya apa? Coba salah satu starter prompt yang muncul.',
    },
    {
        target: '[data-tour="chat-input"]',
        title: 'Tanya Apa Aja',
        content: 'Tulis pertanyaanmu di sini — AI udah paham situasimu, jadi nggak perlu jelasin dari awal.',
    },
];

export const STORY_ARC_TOUR_STEPS: Step[] = [
    {
        target: '[data-tour="story-arc-header"]',
        title: 'Story Arc',
        content: 'Setiap arc adalah chapter 14 hari dalam hidupmu, disusun AI Game Master dari tujuan & konteksmu.',
    },
    {
        target: '[data-tour="story-arc-stats"]',
        title: 'Statistik Arc',
        content: 'Total arc yang sudah dibuat, quest yang diselesaikan, dan berapa arc yang sudah tuntas.',
    },
    {
        target: '[data-tour="story-arc-generate"]',
        title: 'Generate Arc Baru',
        content: 'Kalau belum ada arc aktif, generate di sini — arc baru cuma bisa dibuat kalau arc sebelumnya sudah selesai.',
    },
    {
        target: '[data-tour="story-arc-history"]',
        title: 'Riwayat Chapter',
        content: 'Semua arc yang pernah kamu jalani, dari yang paling baru.',
    },
];

export const LIFE_LOG_TOUR_STEPS: Step[] = [
    {
        target: '[data-tour="life-log-header"]',
        title: 'Life Log',
        content: 'Tempat catat semua aktivitas harianmu — dari kerja, olahraga, sampai istirahat.',
    },
    {
        target: '[data-tour="life-log-current"]',
        title: 'Aktivitas Sekarang',
        content: 'Lagi ngapain sekarang? Mulai catat di sini, nanti durasinya keitung otomatis.',
    },
    {
        target: '[data-tour="life-log-situation"]',
        title: 'Situation Room',
        content: 'Konteks situasimu saat ini, biar AI Game Master makin nyambung kasih masukan.',
    },
    {
        target: '[data-tour="life-log-tasks"]',
        title: 'Work Tasks',
        content: 'Daftar task kerjaanmu — bantu AI ngerti beban kerjamu pas nyusun misi.',
    },
    {
        target: '[data-tour="life-log-timeline"]',
        title: 'Timeline Hari Ini',
        content: 'Semua aktivitas yang udah kamu selesaikan hari ini, urut waktu.',
    },
    {
        target: '[data-tour="life-log-habits"]',
        title: 'Habit Harian',
        content: 'Kebiasaan yang mau kamu jaga konsistensinya — tandain selesai tiap hari di sini.',
    },
    {
        target: '[data-tour="life-log-history"]',
        title: 'Riwayat Aktivitas',
        content: 'Histori aktivitas & habit dari hari-hari sebelumnya.',
    },
];

export const ANALYTICS_TOUR_STEPS: Step[] = [
    {
        target: '[data-tour="analytics-header"]',
        title: 'Analytics',
        content: 'Insight dari semua aktivitasmu. Ada dua tab: Life Analytics dan Finance Analytics.',
    },
    {
        target: '[data-tour="analytics-stats"]',
        title: 'Statistik Utama',
        content: 'Jam tercatat, rata-rata mood, peak hour, dan total quest yang sudah kamu selesaikan.',
    },
    {
        target: '[data-tour="analytics-charts"]',
        title: 'Pola Hidupmu',
        content: 'Begitu kamu mulai aktif, di sini muncul mood & energi, distribusi waktu, peak hours, hari paling aktif, dan activity heatmap.',
    },
    {
        target: '[data-tour="analytics-radar"]',
        title: 'Strength Radar',
        content: 'Kekuatanmu berdasarkan quest yang diselesaikan, plus tingkat konsistensi habit.',
    },
    {
        target: '[data-tour="analytics-xp-history"]',
        title: 'Riwayat XP',
        content: 'EXP yang kamu dapat & penalti yang kamu kena dari waktu ke waktu.',
    },
];
