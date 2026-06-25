'use client';

import { useMemo } from 'react';
import { useFinance } from '@/hooks/useFinance';

const EXPENSE_COLOR = '#f43f5e';
const INCOME_COLOR = '#10b981';

/** All derived chart/stat data for the Finance Analytics tab — pure aggregation over useFinance's data. */
export function useFinanceAnalytics(uid: string | undefined) {
    const { transactions, goals, assets, totalNetWorthIDR, exchangeRates } = useFinance(uid);

    const toIDR = (amount: number, currency: string) => {
        if (!currency || currency === 'IDR') return amount;
        if (exchangeRates[currency] && exchangeRates['IDR']) {
            return amount * (exchangeRates['IDR'] / exchangeRates[currency]);
        }
        return amount; // Fallback
    };

    const now = new Date();
    const startOfMonthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfLastMonthStr = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

    let totalIncomeThisMonth = 0;
    let totalExpenseThisMonth = 0;
    let totalExpenseLastMonth = 0;

    transactions.forEach(tx => {
        const amountIDR = toIDR(tx.originalAmount || tx.amount, tx.originalCurrency || assets.find(a => a.id === tx.assetId)?.currency || 'IDR');
        if (tx.timestamp >= startOfMonthStr) {
            if (tx.type === 'income') totalIncomeThisMonth += amountIDR;
            if (tx.type === 'expense') totalExpenseThisMonth += amountIDR;
        } else if (tx.timestamp >= startOfLastMonthStr && tx.type === 'expense') {
            totalExpenseLastMonth += amountIDR;
        }
    });

    const expensePct = totalExpenseLastMonth > 0 ? ((totalExpenseThisMonth - totalExpenseLastMonth) / totalExpenseLastMonth) * 100 : null;

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
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().split('T')[0];
            daysMap[key] = { name: key.substring(5), income: 0, expense: 0 };
        }
        transactions.forEach(tx => {
            const txDate = tx.timestamp.split('T')[0];
            if (daysMap[txDate]) {
                const amountIDR = toIDR(tx.originalAmount || tx.amount, tx.originalCurrency || assets.find(a => a.id === tx.assetId)?.currency || 'IDR');
                if (tx.type === 'income') daysMap[txDate].income += amountIDR;
                if (tx.type === 'expense') daysMap[txDate].expense += amountIDR;
            }
        });
        return Object.values(daysMap);
    }, [transactions, assets, exchangeRates]);

    // --- 8. Pertumbuhan Net Worth Kumulatif (AreaChart) ---
    const netWorthTrendData = useMemo(() => {
        const daysMap: Record<string, any> = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().split('T')[0];
            daysMap[key] = { name: key.substring(5), change: 0 };
        }
        transactions.forEach(tx => {
            const txDate = tx.timestamp.split('T')[0];
            if (daysMap[txDate]) {
                const amountIDR = toIDR(tx.originalAmount || tx.amount, tx.originalCurrency || assets.find(a => a.id === tx.assetId)?.currency || 'IDR');
                if (tx.type === 'income') daysMap[txDate].change += amountIDR;
                if (tx.type === 'expense') daysMap[txDate].change -= amountIDR;
            }
        });
        let currentW = totalNetWorthIDR;
        const trend = [];
        const values = Object.values(daysMap);
        for (let i = values.length - 1; i >= 0; i--) {
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
            if (tx.type === 'income') { incomeCount++; incomeTotal += amountIDR; }
            if (tx.type === 'expense') { expenseCount++; expenseTotal += amountIDR; }
            if (tx.type === 'transfer') { transferCount++; transferTotal += amountIDR; }
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
        if (totalIncomeThisMonth === 0) return [];
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
            if (tx.context === 'necessity') needs += amountIDR;
            else wants += amountIDR;
        });
        return [{ name: 'Bulan Ini', Kebutuhan: needs, Keinginan: wants }];
    }, [transactions, assets, exchangeRates]);

    // --- 14. Rata-Rata Nominal Pengeluaran (LineChart) ---
    const avgExpenseData = useMemo(() => {
        const daysMap: Record<string, any> = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().split('T')[0];
            daysMap[key] = { name: key.substring(5), total: 0, count: 0 };
        }
        transactions.filter(t => t.type === 'expense').forEach(tx => {
            const txDate = tx.timestamp.split('T')[0];
            if (daysMap[txDate]) {
                const amountIDR = toIDR(tx.originalAmount || tx.amount, tx.originalCurrency || assets.find(a => a.id === tx.assetId)?.currency || 'IDR');
                daysMap[txDate].total += amountIDR;
                daysMap[txDate].count += 1;
            }
        });
        return Object.values(daysMap).map((d: any) => ({
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
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().split('T')[0];
            daysMap[key] = { name: key.substring(5), fee: 0 };
        }
        transactions.filter(t => t.type === 'transfer' && t.transferFee && t.transferFee > 0).forEach(tx => {
            const txDate = tx.timestamp.split('T')[0];
            if (daysMap[txDate]) {
                const assetCurrency = assets.find(a => a.id === tx.assetId)?.currency || 'IDR';
                const amountIDR = toIDR(tx.transferFee!, assetCurrency);
                daysMap[txDate].fee += amountIDR;
            }
        });
        return Object.values(daysMap);
    }, [transactions, assets, exchangeRates]);

    const noData = transactions.length === 0;

    return {
        goals, totalNetWorthIDR,
        totalIncomeThisMonth, totalExpenseThisMonth, totalFees, expensePct,
        noData,
        cashFlowData, categoryData, behavioralData, merchantData, currencyExposureData,
        dailyCashFlowData, netWorthTrendData, freqNominalData, incomeSourceData, assetTypeData,
        savingsRateData, needsVsWantsData, avgExpenseData, dayOfWeekData, feeTrendData,
    };
}
