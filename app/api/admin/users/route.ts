import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

async function checkSuperAdmin(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return false;
    
    const token = authHeader.split('Bearer ')[1];
    try {
        const decoded = await adminAuth.verifyIdToken(token);
        if (decoded.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
}

export async function GET(req: NextRequest) {
    const isSuperAdmin = await checkSuperAdmin(req);
    if (!isSuperAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const usersSnap = await adminDb.collection('users').get();
        const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ users });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const isSuperAdmin = await checkSuperAdmin(req);
    if (!isSuperAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const body = await req.json();
        const { email, password, displayName, isDemo } = body;

        if (!email || !password || !displayName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create User in Firebase Auth
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName,
        });

        const uid = userRecord.uid;
        const now = new Date();

        // 2. Create User Profile in Firestore
        const profile = {
            uid,
            email,
            displayName,
            role: 'player',
            level: 1,
            exp: 0,
            expToNextLevel: 100,
            title: isDemo ? 'Demo Tester' : 'Rookie Adventurer',
            streak: 0,
            lastActiveDate: now.toISOString().split('T')[0],
            totalQuestsCompleted: 0,
            totalHoursWorked: 0,
            hearts: 5,
            missStrikeCount: 0,
            heartRecoveryStreak: 0,
            createdAt: now.toISOString(),
        };

        const batch = adminDb.batch();
        batch.set(adminDb.collection('users').doc(uid), profile);

                // 3. Seed Demo Data if requested
        if (isDemo) {
            const now = new Date();
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);

            const generateRandomDate = (start: Date, end: Date) => {
                return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
            };

            // Max out profile
            profile.level = 45;
            profile.exp = 8500;
            profile.expToNextLevel = 10000;
            profile.title = 'Elite Grandmaster';
            profile.streak = 150;
            profile.totalQuestsCompleted = 320;
            profile.totalHoursWorked = 1200;
            // What the AI understands about the user
            (profile as any).goal = {
                aspiration: 'Saya ingin menjadi Fullstack Developer tingkat Senior di perusahaan ternama dunia (seperti Google / Meta), sembari membangun startup sampingan yang sukses dan mencapai kebebasan finansial di usia 30 tahun.',
                focusAreas: ['Coding', 'System Design', 'Fitness', 'Investing', 'Public Speaking'],
                timeframe: '5 Tahun',
                updatedAt: now.toISOString()
            };
            batch.set(adminDb.collection('users').doc(uid), profile);

            // Assets
            const assetBcaRef = adminDb.collection('financial_assets').doc();
            const assetCryptoRef = adminDb.collection('financial_assets').doc();
            const assetUsdRef = adminDb.collection('financial_assets').doc();

            batch.set(assetBcaRef, {
                uid, name: 'BCA Utama', type: 'bank', balance: 15000000, currency: 'IDR',
                createdAt: sixMonthsAgo.toISOString(), updatedAt: now.toISOString()
            });
            batch.set(assetCryptoRef, {
                uid, name: 'Binance Wallet', type: 'crypto', balance: 0.15, currency: 'BTC',
                createdAt: sixMonthsAgo.toISOString(), updatedAt: now.toISOString()
            });
            batch.set(assetUsdRef, {
                uid, name: 'Paypal', type: 'ewallet', balance: 1200, currency: 'USD',
                createdAt: sixMonthsAgo.toISOString(), updatedAt: now.toISOString()
            });

            // Goals
            const goalJapanRef = adminDb.collection('financial_goals').doc();
            const goalEmergencyRef = adminDb.collection('financial_goals').doc();

            batch.set(goalJapanRef, {
                uid, title: 'Liburan ke Jepang', targetAmount: 20000000, currentAmount: 8500000,
                currency: 'IDR', status: 'active', createdAt: sixMonthsAgo.toISOString(), updatedAt: now.toISOString()
            });
            batch.set(goalEmergencyRef, {
                uid, title: 'Dana Darurat (6 Bulan)', targetAmount: 5000, currentAmount: 1200,
                currency: 'USD', status: 'active', createdAt: sixMonthsAgo.toISOString(), updatedAt: now.toISOString()
            });

            // Transactions
            const txCategories = ['Food & Beverage', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Health'];
            const merchants = ['Starbucks', 'Grab', 'Tokopedia', 'Netflix', 'Indomaret', 'Steam', 'Apotek', 'PLN'];
            const contexts = ['necessity', 'reward', 'stress-relief', 'impulse', null];

            for (let i = 0; i < 150; i++) {
                const isIncome = Math.random() > 0.8;
                const isTransfer = !isIncome && Math.random() > 0.9;
                
                const randomDate = i < 50 
                    ? new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) 
                    : generateRandomDate(sixMonthsAgo, now);
                
                const randomDateStr = randomDate.toISOString();
                const randomDateOnly = randomDateStr.split('T')[0];
                const docRef = adminDb.collection('financial_transactions').doc();

                if (isTransfer) {
                    batch.set(docRef, {
                        uid, assetId: assetBcaRef.id, toAssetId: assetUsdRef.id,
                        amount: 1500000, toAmount: 100, transferFee: 5000, transferFeeType: 'deduct_from_target',
                        type: 'transfer', category: 'Transfer / Convert', title: 'Topup Paypal',
                        date: randomDateOnly, timestamp: randomDateStr, createdAt: randomDateStr
                    });
                } else if (isIncome) {
                    batch.set(docRef, {
                        uid, assetId: Math.random() > 0.5 ? assetBcaRef.id : assetUsdRef.id,
                        amount: Math.floor(Math.random() * 5000000) + 1000000, type: 'income',
                        category: 'Freelance / Business', title: 'Project Payment',
                        date: randomDateOnly, timestamp: randomDateStr, createdAt: randomDateStr
                    });
                } else {
                    const ctx = contexts[Math.floor(Math.random() * contexts.length)];
                    const expenseData = {
                        uid, assetId: assetBcaRef.id, amount: Math.floor(Math.random() * 300000) + 20000,
                        type: 'expense', category: txCategories[Math.floor(Math.random() * txCategories.length)],
                        merchant: merchants[Math.floor(Math.random() * merchants.length)],
                        title: 'Daily Expense', date: randomDateOnly, timestamp: randomDateStr, createdAt: randomDateStr,
                        context: ctx || null
                    };
                    batch.set(docRef, expenseData);
                }
            }

            // Life Log Activities
            const actCategories = ['work', 'learning', 'health', 'personal', 'rest'];
            const actTitles = ['Coding Feature', 'Meeting Client', 'Gym', 'Read Book', 'Netflix', 'Sleeping'];
            
            for (let i = 0; i < 150; i++) {
                const randomDate = i < 30 
                    ? new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000) 
                    : generateRandomDate(sixMonthsAgo, now);
                const endRandom = new Date(randomDate.getTime() + (Math.floor(Math.random() * 120) + 30) * 60000);
                const docRef = adminDb.collection('activities').doc();

                batch.set(docRef, {
                    uid, title: actTitles[Math.floor(Math.random() * actTitles.length)],
                    category: actCategories[Math.floor(Math.random() * actCategories.length)],
                    mood: Math.floor(Math.random() * 5) + 1, energy: Math.floor(Math.random() * 5) + 1,
                    startTime: randomDate.toISOString(), endTime: endRandom.toISOString(), createdAt: randomDate.toISOString()
                });
            }

            // Quests (use assignedTo instead of uid)
            const questTitles = ['Selesaikan Laporan Akhir Bulan', 'Lari 5KM', 'Baca Buku 1 Bab', 'Meeting Tim', 'Belajar React'];
            const questCats = ['daily', 'weekly', 'main', 'side'];
            const questDiffs = ['E', 'D', 'C', 'B', 'A', 'S'];
            const savedQuestIds = [];

            for(let i = 0; i < 30; i++) {
                const docRef = adminDb.collection('quests').doc();
                savedQuestIds.push({ id: docRef.id, title: questTitles[i % questTitles.length] });
                const randomDate = new Date(now.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000);
                
                // Some are created by GM real, some by AI system
                const createdBy = (i % 3 === 0) ? 'gm-real-uid' : 'system';
                
                // If it's completed (approved), maybe it has a review Note
                const status = i < 20 ? 'approved' : (i < 24 ? 'missed' : 'active');
                
                let reviewNote = null;
                if (status === 'approved') {
                    if (createdBy === 'system') {
                        reviewNote = "Bagus sekali! AI melihat kamu sangat konsisten menyelesaikan tugas ini dengan cepat. Terus pertahankan kecepatanmu!";
                    } else {
                        reviewNote = "Kerja bagus, pahlawan! Saya melihat lampiran hasil pekerjaanmu dan itu sempurna. Saya berikan bonus EXP untuk dedikasimu.";
                    }
                }

                batch.set(docRef, {
                    assignedTo: uid, 
                    createdBy: createdBy,
                    title: questTitles[i % questTitles.length],
                    description: 'Quest dummy untuk akun demo yang mencerminkan tugas sehari-hari.',
                    difficulty: questDiffs[i % questDiffs.length], 
                    category: questCats[i % questCats.length],
                    expReward: 150, moneyReward: 50000,
                    deadline: randomDate.toISOString(),
                    status: status,
                    createdAt: randomDate.toISOString(),
                    completedAt: status === 'approved' ? randomDate.toISOString() : null,
                    reviewedAt: status === 'approved' ? randomDate.toISOString() : null,
                    reviewNote: reviewNote,
                    deadlinePenaltyExp: status === 'missed' ? 50 : 0,
                    missedAt: status === 'missed' ? randomDate.toISOString() : null,
                });
            }

            // Journals (XP History - uses authorId instead of uid)
            for(let i = 0; i < 30; i++) {
                const dateObj = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dateStr = dateObj.toISOString();
                const docRef = adminDb.collection('journals').doc();
                
                // Assign some journals to a specific quest
                const qRef = i < savedQuestIds.length ? savedQuestIds[i] : null;

                batch.set(docRef, {
                    authorId: uid, 
                    questId: qRef ? qRef.id : null,
                    questTitle: qRef ? qRef.title : null,
                    content: 'Hari ini cukup produktif. Menyelesaikan banyak task. Saya merasa telah mengalami kemajuan yang berarti dalam mencapai tujuan utama saya.',
                    expEarned: Math.floor(Math.random() * 300) + 150,
                    questsCompleted: Math.floor(Math.random() * 5) + 1,
                    habitsCompleted: Math.floor(Math.random() * 3),
                    createdAt: dateStr
                });
            }

            // GM Messages
            for(let i = 0; i < 5; i++) {
                const dateObj = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const docRef = adminDb.collection('gmMessages').doc(uid).collection('messages').doc();
                batch.set(docRef, {
                    gmUid: (i % 2 === 0) ? 'system' : 'gm-real-uid',
                    text: 'Ini adalah pesan teguran dan motivasi. Ingatlah bahwa setiap langkah kecil membawamu lebih dekat ke impianmu sebagai Fullstack Developer.',
                    isRead: i > 2,
                    createdAt: dateObj.toISOString()
                });
            }

            // AI Chat History
            const aiChatRef = adminDb.collection('aiChats').doc(uid);
            batch.set(aiChatRef, {
                messages: [
                    { role: 'user', content: 'Halo AI, apa misi utamaku hari ini?', timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() },
                    { role: 'assistant', content: 'Halo Hero! Misi utamamu adalah menyelesaikan pekerjaan secepatnya lalu berolahraga.', timestamp: new Date(now.getTime() - 1.9 * 60 * 60 * 1000).toISOString() },
                    { role: 'user', content: 'Aku merasa sedikit lelah hari ini. Apa saranmu?', timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString() },
                    { role: 'assistant', content: 'Tidak apa-apa, kamu sudah bekerja keras! Ambil waktu 15 menit untuk beristirahat. Ingat, kesehatanmu sama pentingnya dengan mencapai tujuan utamamu menjadi Senior Fullstack Developer.', timestamp: new Date(now.getTime() - 0.9 * 60 * 60 * 1000).toISOString() }
                ]
            });

            // Story Arcs
            const storyArcs = [
                {
                    title: 'Menaklukkan Proyek Raksasa',
                    description: 'Selesaikan 5 modul aplikasi dalam 2 minggu untuk membuktikan kemampuanmu di kantor.',
                    status: 'active',
                    expReward: 5000, moneyReward: 2000000,
                    progress: 60, totalSteps: 100,
                },
                {
                    title: 'Bulan Disiplin Fitness',
                    description: 'Membiasakan diri berolahraga ringan minimal 15 menit sehari selama sebulan penuh.',
                    status: 'completed',
                    expReward: 3000, moneyReward: 0,
                    progress: 100, totalSteps: 100,
                },
                {
                    title: 'Pencarian Bahasa Baru',
                    description: 'Menyelesaikan modul dasar pembelajaran bahasa asing.',
                    status: 'completed',
                    expReward: 2500, moneyReward: 50000,
                    progress: 100, totalSteps: 100,
                }
            ];

            storyArcs.forEach((arc, idx) => {
                const storyRef = adminDb.collection('storyArcs').doc();
                const arcDate = new Date(now.getTime() - (idx * 30 * 24 * 60 * 60 * 1000)).toISOString();
                batch.set(storyRef, {
                    uid, 
                    ...arc,
                    createdAt: arcDate,
                    updatedAt: arcDate
                });
            });
        }

        await batch.commit();

        return NextResponse.json({ message: 'User created successfully', uid });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
