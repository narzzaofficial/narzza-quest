import React, { useMemo } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { useAuth } from '@/hooks/useAuth';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
    LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadialBarChart, RadialBar, ComposedChart, CartesianGrid
} from 'recharts';
import { ChartCard } from './ChartCard';
import { StatCard } from './StatCard';
import { Landmark, TrendingDown, TrendingUp, Wallet, Target, PieChart as PieChartIcon, AlertCircle } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
const EXPENSE_COLOR = '#f43f5e';
const INCOME_COLOR = '#10b981';

export function FinanceAnalytics() {
    const { profile } = useAuth();
    const { transactions, goals, assets, totalNetWorthIDR, exchangeRates } = useFinance(profile?.uid);

    // --- Helper: Convert any amount to IDR ---
    const toIDR = (amount: number, currency: string) => {
        if (!currency || currency === 'IDR') return amount;
        if (exchangeRates[currency] && exchangeRates['IDR']) {
            return amount * (exchangeRates['IDR'] / exchangeRates[currency]);
        }
        return amount; // Fallback
    };

    const formatIDR = (value: number) => `Rp ${value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;

    // Hitung total income & expense bulan ini
    const now = new Date();
    const startOfMonthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    let totalIncomeThisMonth = 0;
    let totalExpenseThisMonth = 0;
    
    transactions.forEach(tx => {
        if (tx.timestamp >= startOfMonthStr) {
            const amountIDR = toIDR(tx.originalAmount || tx.amount, tx.originalCurrency || assets.find(a => a.id === tx.assetId)?.currency || 'IDR');
            if (tx.type === 'income') totalIncomeThisMonth += amountIDR;
            if (tx.type === 'expense') totalExpenseThisMonth += amountIDR;
        }
    });

    // --- 1. Cash Flow (Income vs Expense total) ---
    const cashFlowData = useMemo(() => {
        let totalIncome = 0;
        let totalExpense = 0;
        
        transactions.forEach(tx => {
            const amountIDR = toIDR(tx.originalAmount || tx.amount, tx.originalCurrency || assets.find(a => a.id === tx.assetId)?.currency || 'IDR');
            if (tx.type === 'income') totalIncome += amountIDR;
            if (tx.type === 'expense') totalExpense += amountIDR;
        });

        return [
            { name: 'Pemasukan', value: totalIncome, fill: INCOME_COLOR },
            { name: 'Pengeluaran', value: totalExpense, fill: EXPENSE_COLOR }
        ];
    }, [transactions, assets, exchangeRates]);

    // --- 2. Category Breakdown (Expenses only) ---
    const categoryData = useMemo(() => {
        const catMap: Record<string, number> = {};
        transactions.filter(t => t.type === 'expense').forEach(tx => {
            const amountIDR = toIDR(tx.originalAmount || tx.amount, tx.originalCurrency || assets.find(a => a.id === tx.assetId)?.currency || 'IDR');
            catMap[tx.category] = (catMap[tx.category] || 0) + amountIDR;
        });
        return Object.entries(catMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Sort largest first
    }, [transactions, assets, exchangeRates]);

    // --- 3. Behavioral Analytics (Context/Mood) ---
    const behavioralData = useMemo(() => {
        const moodMap: Record<string, number> = {};
        transactions.filter(t => t.type === 'expense' && t.context).forEach(tx => {
            const amountIDR = toIDR(tx.originalAmount || tx.amount, tx.originalCurrency || assets.find(a => a.id === tx.assetId)?.currency || 'IDR');
            const label = tx.context === 'necessity' ? 'Kebutuhan Pokok' :
                          tx.context === 'reward' ? 'Self Reward' :
                          tx.context === 'stress-relief' ? 'Pelampiasan Stres' :
                          tx.context === 'investment' ? 'Investasi Masa Depan' :
                          tx.context === 'impulse' ? 'Impulsif' : (tx.context || 'Lainnya');
            moodMap[label] = (moodMap[label] || 0) + amountIDR;
        });
        return Object.entries(moodMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions, assets, exchangeRates]);

    // --- 4. Hidden Fees (Transfer Fees) ---
    const totalFees = useMemo(() => {
        let total = 0;
        transactions.filter(t => t.type === 'transfer' && t.transferFee && t.transferFee > 0).forEach(tx => {
            const assetCurrency = assets.find(a => a.id === tx.assetId)?.currency || 'IDR';
            const amountIDR = toIDR(tx.transferFee!, assetCurrency);
            total += amountIDR;
        });
        return total;
    }, [transactions, assets, exchangeRates]);

    // --- 5. Top Merchants ---
    const merchantData = useMemo(() => {
        const merchantMap: Record<string, number> = {};
        transactions.filter(t => t.type === 'expense' && t.merchant).forEach(tx => {
            const amountIDR = toIDR(tx.originalAmount || tx.amount, tx.originalCurrency || assets.find(a => a.id === tx.assetId)?.currency || 'IDR');
            merchantMap[tx.merchant!] = (merchantMap[tx.merchant!] || 0) + amountIDR;
        });
        return Object.entries(merchantMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5
    }, [transactions, assets, exchangeRates]);

    // --- 6. Currency Exposure (Assets) ---
    const currencyExposureData = useMemo(() => {
        const currMap: Record<string, number> = {};
        assets.forEach(asset => {
            const amountIDR = toIDR(asset.balance, asset.currency);
            currMap[asset.currency] = (currMap[asset.currency] || 0) + amountIDR;
        });
        return Object.entries(currMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [assets, exchangeRates]);


    // --- 7. Trend Cash Flow Harian (LineChart) ---
    const dailyCashFlowData = useMemo(() => {
        const daysMap: Record<string, any> = {};
        for(let i=29; i>=0; i--) {
            const d = new Date(now.getTime() - i*24*60*60*1000);
            const key = d.toISOString().split('T')[0];
            daysMap[key] = { name: key.substring(5), income: 0, expense: 0 };
        }
        transactions.forEach(tx => {
            const txDate = tx.timestamp.split('T')[0];
            if(daysMap[txDate]) {
                const amountIDR = toIDR(tx.originalAmount || tx.amount, tx.originalCurrency || assets.find(a => a.id === tx.assetId)?.currency || 'IDR');
                if(tx.type === 'income') daysMap[txDate].income += amountIDR;
                if(tx.type === 'expense') daysMap[txDate].expense += amountIDR;
            }
        });
        return Object.values(daysMap);
    }, [transactions, assets, exchangeRates]);

    // --- 8. Pertumbuhan Net Worth Kumulatif (AreaChart) ---
    const netWorthTrendData = useMemo(() => {
        const daysMap: Record<string, any> = {};
        for(let i=29; i>=0; i--) {
            const d = new Date(now.getTime() - i*24*60*60*1000);
            const key = d.toISOString().split('T')[0];
            daysMap[key] = { name: key.substring(5), change: 0 };
        }
        transactions.forEach(tx => {
            const txDate = tx.timestamp.split('T')[0];
            if(daysMap[txDate]) {
                const amountIDR = toIDR(tx.originalAmount || tx.amount, tx.originalCurrency || assets.find(a => a.id === tx.assetId)?.currency || 'IDR');
                if(tx.type === 'income') daysMap[txDate].change += amountIDR;
                if(tx.type === 'expense') daysMap[txDate].change -= amountIDR;
            }
        });
        let currentW = totalNetWorthIDR;
        const trend = [];
        const values = Object.values(daysMap);
        for(let i = values.length - 1; i >= 0; i--) {
            trend.unshift({ name: values[i].name, netWorth: currentW });
            currentW -= values[i].change;
        }
        return trend;
    }, [transactions, assets, exchangeRates, totalNetWorthIDR]);

    // --- 9. Frekuensi vs Nominal (ComposedChart) ---
    const freqNominalData = useMemo(() => {
        let incomeCount = 0, expenseCount = 0, transferCount = 0;
        let incomeTotal = 0, expenseTotal = 0, transferTotal = 0;
        transactions.forEach(tx => {
            const amountIDR = toIDR(tx.originalAmount || tx.amount, tx.originalCurrency || assets.find(a => a.id === tx.assetId)?.currency || 'IDR');
            if(tx.type === 'income') { incomeCount++; incomeTotal += amountIDR; }
            if(tx.type === 'expense') { expenseCount++; expenseTotal += amountIDR; }
            if(tx.type === 'transfer') { transferCount++; transferTotal += amountIDR; }
        });
        return [
            { name: 'Pemasukan', nominal: incomeTotal, freq: incomeCount },
            { name: 'Pengeluaran', nominal: expenseTotal, freq: expenseCount },
            { name: 'Transfer', nominal: transferTotal, freq: transferCount }
        ];
    }, [transactions, assets, exchangeRates]);

    // --- 10. Pemasukan Berdasarkan Sumber (Donut PieChart) ---
    const incomeSourceData = useMemo(() => {
        const sourceMap: Record<string, number> = {};
        transactions.filter(t => t.type === 'income').forEach(tx => {
            const amountIDR = toIDR(tx.originalAmount || tx.amount, tx.originalCurrency || assets.find(a => a.id === tx.assetId)?.currency || 'IDR');
            const cat = tx.category || 'Lainnya';
            sourceMap[cat] = (sourceMap[cat] || 0) + amountIDR;
        });
        return Object.entries(sourceMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [transactions, assets, exchangeRates]);

    // --- 11. Distribusi Tipe Aset (RadarChart) ---
    const assetTypeData = useMemo(() => {
        const typeMap: Record<string, number> = {};
        assets.forEach(asset => {
            const amountIDR = toIDR(asset.balance, asset.currency);
            const t = asset.type || 'Lainnya';
            typeMap[t] = (typeMap[t] || 0) + amountIDR;
        });
        return Object.entries(typeMap).map(([name, value]) => ({ name, value }));
    }, [assets, exchangeRates]);

    // --- 12. Rasio Tabungan (RadialBarChart) ---
    const savingsRateData = useMemo(() => {
        if(totalIncomeThisMonth === 0) return [];
        const saved = Math.max(0, totalIncomeThisMonth - totalExpenseThisMonth);
        return [
            { name: 'Pengeluaran', value: totalExpenseThisMonth, fill: EXPENSE_COLOR },
            { name: 'Tersimpan', value: saved, fill: INCOME_COLOR }
        ];
    }, [totalIncomeThisMonth, totalExpenseThisMonth]);

    // --- 13. Kebutuhan Pokok vs Keinginan (Stacked Bar) ---
    const needsVsWantsData = useMemo(() => {
        let needs = 0, wants = 0;
        transactions.filter(t => t.type === 'expense').forEach(tx => {
            const amountIDR = toIDR(tx.originalAmount || tx.amount, tx.originalCurrency || assets.find(a => a.id === tx.assetId)?.currency || 'IDR');
            if(tx.context === 'necessity') needs += amountIDR;
            else wants += amountIDR;
        });
        return [{ name: 'Bulan Ini', Kebutuhan: needs, Keinginan: wants }];
    }, [transactions, assets, exchangeRates]);

    // --- 14. Rata-Rata Nominal Pengeluaran (LineChart) ---
    const avgExpenseData = useMemo(() => {
        const daysMap: Record<string, any> = {};
        for(let i=29; i>=0; i--) {
            const d = new Date(now.getTime() - i*24*60*60*1000);
            const key = d.toISOString().split('T')[0];
            daysMap[key] = { name: key.substring(5), total: 0, count: 0 };
        }
        transactions.filter(t => t.type === 'expense').forEach(tx => {
            const txDate = tx.timestamp.split('T')[0];
            if(daysMap[txDate]) {
                const amountIDR = toIDR(tx.originalAmount || tx.amount, tx.originalCurrency || assets.find(a => a.id === tx.assetId)?.currency || 'IDR');
                daysMap[txDate].total += amountIDR;
                daysMap[txDate].count += 1;
            }
        });
        return Object.values(daysMap).map((d:any) => ({
            name: d.name,
            avg: d.count > 0 ? (d.total / d.count) : 0
        }));
    }, [transactions, assets, exchangeRates]);

    // --- 15. Intensitas Pengeluaran per Hari (BarChart Vertikal) ---
    const dayOfWeekData = useMemo(() => {
        const days = ['Mgg', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const data = days.map(day => ({ name: day, total: 0 }));
        transactions.filter(t => t.type === 'expense').forEach(tx => {
            const d = new Date(tx.timestamp);
            const amountIDR = toIDR(tx.originalAmount || tx.amount, tx.originalCurrency || assets.find(a => a.id === tx.assetId)?.currency || 'IDR');
            data[d.getDay()].total += amountIDR;
        });
        return data;
    }, [transactions, assets, exchangeRates]);

    // --- 16. Biaya Siluman / Transfer Fees Over Time (AreaChart) ---
    const feeTrendData = useMemo(() => {
        const daysMap: Record<string, any> = {};
        for(let i=29; i>=0; i--) {
            const d = new Date(now.getTime() - i*24*60*60*1000);
            const key = d.toISOString().split('T')[0];
            daysMap[key] = { name: key.substring(5), fee: 0 };
        }
        transactions.filter(t => t.type === 'transfer' && t.transferFee && t.transferFee > 0).forEach(tx => {
            const txDate = tx.timestamp.split('T')[0];
            if(daysMap[txDate]) {
                const assetCurrency = assets.find(a => a.id === tx.assetId)?.currency || 'IDR';
                const amountIDR = toIDR(tx.transferFee!, assetCurrency);
                daysMap[txDate].fee += amountIDR;
            }
        });
        return Object.values(daysMap);
    }, [transactions, assets, exchangeRates]);

    const noData = transactions.length === 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Landmark}     label="Total Net Worth"  value={`Rp ${(totalNetWorthIDR/1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })}k`} sub="Estimasi" color="text-brand" bg="bg-brand-soft" />
                <StatCard icon={TrendingDown} label="Pengeluaran Bulan Ini" value={`Rp ${(totalExpenseThisMonth/1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })}k`}  sub="IDR" color="text-danger" bg="bg-danger-soft" />
                <StatCard icon={TrendingUp}   label="Pemasukan Bulan Ini"   value={`Rp ${(totalIncomeThisMonth/1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })}k`}   sub="IDR" color="text-success" bg="bg-success-soft" />
                <StatCard icon={AlertCircle}  label="Biaya Admin/Transfer"  value={`Rp ${(totalFees/1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })}k`} sub="Sepanjang waktu" color="text-purple-600" bg="bg-purple-50" />
            </div>

            {noData && (
                <EmptyState icon={Wallet} title="Belum ada transaksi" desc="Mulai catat transaksi di halaman Keuangan untuk melihat analitik." />
            )}

            {!noData && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        <ChartCard title="Pemasukan vs Pengeluaran" sub="Total Sepanjang Waktu">
                            <div className="flex-1 w-full mt-4 h-[250px]">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <BarChart data={cashFlowData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#8b949e' }} />
                                        <RechartsTooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} formatter={(value: any) => [formatIDR(Number(value) || 0), 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Psikologi Pengeluaran" sub="Kategori Mood & Context">
                            <div className="flex-1 w-full mt-4 h-[250px]">
                                {behavioralData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                        <PieChart>
                                            <Pie data={behavioralData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5}>
                                                {behavioralData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip formatter={(value: any) => [formatIDR(Number(value) || 0), 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-ink-muted text-sm font-bold text-center">Belum ada pengeluaran dengan label Mood.</div>
                                )}
                            </div>
                        </ChartCard>

                        <ChartCard title="Pengeluaran per Kategori" sub="Berdasarkan kategori">
                            <div className="flex-1 w-full mt-4 h-[250px]">
                                {categoryData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                        <BarChart data={categoryData} layout="vertical" margin={{ left: 50 }}>
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#8b949e' }} />
                                            <RechartsTooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} formatter={(value: any) => [formatIDR(Number(value) || 0), 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]}>
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-ink-muted text-sm font-bold text-center">Belum ada pengeluaran.</div>
                                )}
                            </div>
                        </ChartCard>

                        <ChartCard title="Eksposur Mata Uang" sub="Berdasarkan saldo aset">
                            <div className="flex-1 w-full mt-4 h-[250px]">
                                {currencyExposureData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                        <PieChart>
                                            <Pie data={currencyExposureData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5}>
                                                {currencyExposureData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip formatter={(value: any) => [formatIDR(Number(value) || 0), 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-ink-muted text-sm font-bold text-center">Belum ada aset.</div>
                                )}
                            </div>
                        </ChartCard>

                        <ChartCard title="Top 5 Merchant" sub="Tempat pengeluaran terbesar">
                            <div className="flex-1 w-full mt-2 space-y-4">
                                {merchantData.length > 0 ? (
                                    merchantData.map((merchant, index) => {
                                        const maxVal = merchantData[0].value;
                                        const progress = (merchant.value / maxVal) * 100;
                                        return (
                                            <div key={merchant.name} className="flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-bold text-ink">{merchant.name}</p>
                                                    <p className="text-sm font-black text-danger">{formatIDR(merchant.value)}</p>
                                                </div>
                                                <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
                                                    <div className="h-full bg-danger rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="h-20 flex items-center justify-center text-ink-muted text-sm font-bold text-center">Belum ada pengeluaran di merchant tertentu.</div>
                                )}
                            </div>
                        </ChartCard>

                        <ChartCard title="Progress Target Finansial" sub="Wishlist & Saving Goals">
                            {goals.length === 0 ? (
                                <p className="text-ink-muted text-sm py-8 text-center">Belum ada target menabung</p>
                            ) : (
                                <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2 mt-2">
                                    {goals.map(goal => {
                                        const progress = Math.min(100, Math.max(0, (goal.currentAmount / goal.targetAmount) * 100));
                                        return (
                                            <div key={goal.id} className="space-y-1.5">
                                                <div className="flex justify-between items-end">
                                                    <p className="text-sm font-bold text-ink">{goal.title}</p>
                                                    <p className="text-xs font-black text-brand">{progress.toFixed(1)}%</p>
                                                </div>
                                                <div className="h-2 bg-surface-2 rounded-full overflow-hidden border border-line">
                                                    <div className="h-full rounded-full transition-all duration-700 bg-brand" style={{ width: `${progress}%` }} />
                                                </div>
                                                <div className="flex justify-between">
                                                    <p className="text-[9px] text-ink-muted">{goal.currency} {goal.currentAmount.toLocaleString('id-ID')}</p>
                                                    <p className="text-[9px] text-ink-muted">{goal.currency} {goal.targetAmount.toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ChartCard>
                        <ChartCard title="Trend Cash Flow Harian" sub="30 Hari Terakhir">
                            <div className="flex-1 w-full mt-4 h-[250px]">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <LineChart data={dailyCashFlowData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#8b949e' }} />
                                        <YAxis hide />
                                        <RechartsTooltip cursor={{ stroke: 'rgba(99, 102, 241, 0.2)', strokeWidth: 2 }} formatter={(value: any) => [formatIDR(Number(value) || 0), '']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Line type="monotone" dataKey="income" name="Pemasukan" stroke={INCOME_COLOR} strokeWidth={3} dot={false} />
                                        <Line type="monotone" dataKey="expense" name="Pengeluaran" stroke={EXPENSE_COLOR} strokeWidth={3} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Pertumbuhan Kekayaan Bersih" sub="Estimasi Net Worth 30 Hari">
                            <div className="flex-1 w-full mt-4 h-[250px]">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <AreaChart data={netWorthTrendData}>
                                        <defs>
                                            <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#8b949e' }} />
                                        <YAxis hide domain={['dataMin', 'dataMax']} />
                                        <RechartsTooltip cursor={{ stroke: 'rgba(99, 102, 241, 0.2)' }} formatter={(value: any) => [formatIDR(Number(value) || 0), 'Net Worth']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Area baseValue="dataMin" type="monotone" dataKey="netWorth" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorNetWorth)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Frekuensi Transaksi" sub="Jumlah Transaksi Berdasarkan Tipe">
                            <div className="flex-1 w-full mt-4 h-[250px]">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <BarChart data={freqNominalData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#8b949e' }} />
                                        <YAxis hide />
                                        <RechartsTooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} formatter={(value: any) => [value, 'Kali']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="freq" name="Frekuensi" barSize={50} fill="#a78bfa" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Pemasukan Berdasarkan Sumber" sub="Kategori Pendapatan">
                            <div className="flex-1 w-full mt-4 h-[250px]">
                                {incomeSourceData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                        <PieChart>
                                            <Pie data={incomeSourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                                                {incomeSourceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip formatter={(value: any) => [formatIDR(Number(value) || 0), 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-ink-muted text-sm font-bold text-center">Belum ada pemasukan.</div>
                                )}
                            </div>
                        </ChartCard>

                        <ChartCard title="Distribusi Tipe Aset" sub="Struktur Portofolio Finansial">
                            <div className="flex-1 w-full mt-4 h-[250px]">
                                {assetTypeData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={assetTypeData}>
                                            <PolarGrid stroke="rgba(139, 148, 158, 0.2)" />
                                            <PolarAngleAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 11, fontWeight: 'bold' }} />
                                            <Radar name="Aset" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                                            <RechartsTooltip formatter={(value: any) => [formatIDR(Number(value) || 0), 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-ink-muted text-sm font-bold text-center">Belum ada tipe aset tercatat.</div>
                                )}
                            </div>
                        </ChartCard>

                        <ChartCard title="Rasio Tabungan (Savings Rate)" sub="Pengeluaran vs Tersisa Bulan Ini">
                            <div className="flex-1 w-full mt-4 h-[250px]">
                                {totalIncomeThisMonth > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                        <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="90%" barSize={20} data={savingsRateData}>
                                            <RadialBar background={{ fill: '#f3f4f6' }} dataKey="value" cornerRadius={10} />
                                            <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px' }} />
                                            <RechartsTooltip formatter={(value: any) => [formatIDR(Number(value) || 0), 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-ink-muted text-sm font-bold text-center">Belum ada pemasukan bulan ini untuk dihitung.</div>
                                )}
                            </div>
                        </ChartCard>

                        <ChartCard title="Kebutuhan Pokok vs Keinginan" sub="Bulan Ini">
                            <div className="flex-1 w-full mt-4 h-[250px]">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <BarChart data={needsVsWantsData} layout="vertical" margin={{ left: 20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" hide />
                                        <RechartsTooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} formatter={(value: any) => [formatIDR(Number(value) || 0), '']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                                        <Bar dataKey="Kebutuhan" stackId="a" fill="#10b981" radius={[8, 0, 0, 8]} />
                                        <Bar dataKey="Keinginan" stackId="a" fill="#f43f5e" radius={[0, 8, 8, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Rata-Rata Nominal Pengeluaran" sub="Nilai rata-rata per transaksi (30 Hari)">
                            <div className="flex-1 w-full mt-4 h-[250px]">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <LineChart data={avgExpenseData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#8b949e' }} />
                                        <YAxis hide />
                                        <RechartsTooltip cursor={{ stroke: 'rgba(99, 102, 241, 0.2)' }} formatter={(value: any) => [formatIDR(Number(value) || 0), 'Rata-Rata']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Line type="monotone" dataKey="avg" stroke="#f43f5e" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 3, fill: '#f43f5e' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Intensitas Hari Pengeluaran" sub="Berdasarkan Hari (Sepanjang Waktu)">
                            <div className="flex-1 w-full mt-4 h-[250px]">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <BarChart data={dayOfWeekData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#8b949e' }} />
                                        <YAxis hide />
                                        <RechartsTooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} formatter={(value: any) => [formatIDR(Number(value) || 0), 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="total" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Kebocoran Biaya Siluman" sub="Transfer Fees / Admin Bulanan (30 Hari)">
                            <div className="flex-1 w-full mt-4 h-[250px]">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <AreaChart data={feeTrendData}>
                                        <defs>
                                            <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#8b949e' }} />
                                        <YAxis hide />
                                        <RechartsTooltip cursor={{ stroke: 'rgba(236, 72, 153, 0.2)' }} formatter={(value: any) => [formatIDR(Number(value) || 0), 'Biaya Admin']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="fee" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorFees)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                    </div>
                </>
            )}
        </div>
    );
}
