import React from 'react';
import { useFinance } from '@/hooks/useFinance';
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChartCard } from './ChartCard';
import { StatCard } from './StatCard';
import { ChartTip } from './ChartTip';
import { Landmark, TrendingDown, TrendingUp, Wallet, Target, AlertCircle } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

export function FinanceAnalytics() {
    const { profile } = useAuth();
    const { transactions, goals, assets, totalNetWorthIDR } = useFinance(profile?.uid);

    // Hitung total income & expense bulan ini
    const now = new Date();
    const startOfMonthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    let totalIncome = 0;
    let totalExpense = 0;
    
    // Aggregation for categories
    const categoryMap: Record<string, number> = {};
    const merchantMap: Record<string, number> = {};

    transactions.forEach(tx => {
        if (tx.timestamp >= startOfMonthStr) {
            if (tx.type === 'income') totalIncome += tx.amount;
            if (tx.type === 'expense') {
                totalExpense += tx.amount;
                categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
                if (tx.merchant) merchantMap[tx.merchant] = (merchantMap[tx.merchant] || 0) + tx.amount;
            }
        }
    });

    const categoryData = Object.keys(categoryMap)
        .map(name => ({ name, value: categoryMap[name] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
        .map((item, i) => ({ ...item, color: COLORS[i % COLORS.length] }));

    const noData = transactions.length === 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Landmark}     label="Total Net Worth"  value={`Rp ${(totalNetWorthIDR/1000).toFixed(0)}k`} sub="Estimasi" color="text-brand" bg="bg-brand-soft" />
                <StatCard icon={TrendingDown} label="Pengeluaran Bulan Ini" value={`Rp ${(totalExpense/1000).toFixed(0)}k`}  sub="IDR" color="text-danger" bg="bg-danger-soft" />
                <StatCard icon={TrendingUp}   label="Pemasukan Bulan Ini"   value={`Rp ${(totalIncome/1000).toFixed(0)}k`}   sub="IDR" color="text-success" bg="bg-success-soft" />
                <StatCard icon={Target}       label="Financial Goals"       value={`${goals.length}`} sub="Target Aktif" color="text-purple-600" bg="bg-purple-50" />
            </div>

            {noData && (
                <EmptyState icon={Wallet} title="Belum ada transaksi" desc="Mulai catat transaksi di halaman Keuangan untuk melihat analitik." />
            )}

            {!noData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Pengeluaran Berdasarkan Kategori" sub="Bulan ini">
                        {categoryData.length === 0 ? (
                            <p className="text-ink-muted text-sm py-8 text-center">Belum ada pengeluaran</p>
                        ) : (
                            <div className="flex items-center gap-4">
                                <ResponsiveContainer width="60%" height={200} style={{ touchAction: 'pan-y' }}>
                                    <PieChart>
                                        <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                                            {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                        </Pie>
                                        <Tooltip formatter={(v) => [`Rp ${Math.round(Number(v)).toLocaleString('id-ID')}`]} isAnimationActive={false} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex-1 space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                    {categoryData.map(c => (
                                        <div key={c.name} className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                                                <span className="text-[10px] text-ink-soft truncate flex-1">{c.name}</span>
                                            </div>
                                            <span className="text-xs font-bold text-ink pl-4">Rp {Math.round(c.value).toLocaleString('id-ID')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </ChartCard>

                    <ChartCard title="Progress Target Finansial" sub="Wishlist & Saving Goals">
                        {goals.length === 0 ? (
                            <p className="text-ink-muted text-sm py-8 text-center">Belum ada target menabung</p>
                        ) : (
                            <div className="space-y-4 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
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
                </div>
            )}
        </div>
    );
}
