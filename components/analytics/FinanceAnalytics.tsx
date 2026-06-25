import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFinanceAnalytics } from '@/hooks/useFinanceAnalytics';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
    LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar, RadialBarChart, RadialBar
} from 'recharts';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { ChartCard } from './ChartCard';
import { StatCard } from './StatCard';
import { Landmark, TrendingDown, TrendingUp, Wallet, AlertCircle } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
const EXPENSE_COLOR = '#f43f5e';
const INCOME_COLOR = '#10b981';

const formatIDR = (value: number) => `Rp ${value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;

export function FinanceAnalytics() {
    const { profile } = useAuth();
    const {
        goals, totalNetWorthIDR,
        totalIncomeThisMonth, totalExpenseThisMonth, totalFees, expensePct,
        noData,
        cashFlowData, categoryData, behavioralData, merchantData, currencyExposureData,
        dailyCashFlowData, netWorthTrendData, freqNominalData, incomeSourceData, assetTypeData,
        savingsRateData, needsVsWantsData, avgExpenseData, dayOfWeekData, feeTrendData,
    } = useFinanceAnalytics(profile?.uid);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Landmark}     label="Total Net Worth"  value={`Rp ${(totalNetWorthIDR/1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })}k`} sub="Estimasi" color="text-brand" bg="bg-brand-soft" />
                <StatCard icon={TrendingDown} label="Pengeluaran Bulan Ini" value={`Rp ${(totalExpenseThisMonth/1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })}k`}  sub="IDR" color="text-danger" bg="bg-danger-soft" trend={{ pct: expensePct, goodWhenUp: false, periodLabel: 'vs bulan lalu' }} />
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
                            <div className="flex-1 w-full mt-4 h-62.5">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <BarChart data={cashFlowData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#8b949e' }} />
                                        <RechartsTooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} formatter={(value: ValueType | undefined) => [formatIDR(Number(value) || 0), 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Psikologi Pengeluaran" sub="Kategori Mood & Context">
                            <div className="flex-1 w-full mt-4 h-62.5">
                                {behavioralData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                        <PieChart>
                                            <Pie data={behavioralData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5}>
                                                {behavioralData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip formatter={(value: ValueType | undefined) => [formatIDR(Number(value) || 0), 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-ink-muted text-sm font-bold text-center">Belum ada pengeluaran dengan label Mood.</div>
                                )}
                            </div>
                        </ChartCard>

                        <ChartCard title="Pengeluaran per Kategori" sub="Berdasarkan kategori">
                            <div className="flex-1 w-full mt-4 h-62.5">
                                {categoryData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                        <BarChart data={categoryData} layout="vertical" margin={{ left: 50 }}>
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#8b949e' }} />
                                            <RechartsTooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} formatter={(value: ValueType | undefined) => [formatIDR(Number(value) || 0), 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
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
                            <div className="flex-1 w-full mt-4 h-62.5">
                                {currencyExposureData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                        <PieChart>
                                            <Pie data={currencyExposureData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5}>
                                                {currencyExposureData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip formatter={(value: ValueType | undefined) => [formatIDR(Number(value) || 0), 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
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
                                    merchantData.map((merchant) => {
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
                                <div className="space-y-4 max-h-62.5 overflow-y-auto custom-scrollbar pr-2 mt-2">
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
                            <div className="flex-1 w-full mt-4 h-62.5">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <LineChart data={dailyCashFlowData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#8b949e' }} />
                                        <YAxis hide />
                                        <RechartsTooltip cursor={{ stroke: 'rgba(99, 102, 241, 0.2)', strokeWidth: 2 }} formatter={(value: ValueType | undefined) => [formatIDR(Number(value) || 0), '']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Line type="monotone" dataKey="income" name="Pemasukan" stroke={INCOME_COLOR} strokeWidth={3} dot={false} />
                                        <Line type="monotone" dataKey="expense" name="Pengeluaran" stroke={EXPENSE_COLOR} strokeWidth={3} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Pertumbuhan Kekayaan Bersih" sub="Estimasi Net Worth 30 Hari">
                            <div className="flex-1 w-full mt-4 h-62.5">
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
                                        <RechartsTooltip cursor={{ stroke: 'rgba(99, 102, 241, 0.2)' }} formatter={(value: ValueType | undefined) => [formatIDR(Number(value) || 0), 'Net Worth']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Area baseValue="dataMin" type="monotone" dataKey="netWorth" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorNetWorth)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Frekuensi Transaksi" sub="Jumlah Transaksi Berdasarkan Tipe">
                            <div className="flex-1 w-full mt-4 h-62.5">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <BarChart data={freqNominalData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#8b949e' }} />
                                        <YAxis hide />
                                        <RechartsTooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} formatter={(value: ValueType | undefined) => [value, 'Kali']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="freq" name="Frekuensi" barSize={50} fill="#a78bfa" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Pemasukan Berdasarkan Sumber" sub="Kategori Pendapatan">
                            <div className="flex-1 w-full mt-4 h-62.5">
                                {incomeSourceData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                        <PieChart>
                                            <Pie data={incomeSourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                                                {incomeSourceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip formatter={(value: ValueType | undefined) => [formatIDR(Number(value) || 0), 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-ink-muted text-sm font-bold text-center">Belum ada pemasukan.</div>
                                )}
                            </div>
                        </ChartCard>

                        <ChartCard title="Distribusi Tipe Aset" sub="Struktur Portofolio Finansial">
                            <div className="flex-1 w-full mt-4 h-62.5">
                                {assetTypeData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={assetTypeData}>
                                            <PolarGrid stroke="rgba(139, 148, 158, 0.2)" />
                                            <PolarAngleAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 11, fontWeight: 'bold' }} />
                                            <Radar name="Aset" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                                            <RechartsTooltip formatter={(value: ValueType | undefined) => [formatIDR(Number(value) || 0), 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-ink-muted text-sm font-bold text-center">Belum ada tipe aset tercatat.</div>
                                )}
                            </div>
                        </ChartCard>

                        <ChartCard title="Rasio Tabungan (Savings Rate)" sub="Pengeluaran vs Tersisa Bulan Ini">
                            <div className="flex-1 w-full mt-4 h-62.5">
                                {totalIncomeThisMonth > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                        <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="90%" barSize={20} data={savingsRateData}>
                                            <RadialBar background={{ fill: '#f3f4f6' }} dataKey="value" cornerRadius={10} />
                                            <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px' }} />
                                            <RechartsTooltip formatter={(value: ValueType | undefined) => [formatIDR(Number(value) || 0), 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-ink-muted text-sm font-bold text-center">Belum ada pemasukan bulan ini untuk dihitung.</div>
                                )}
                            </div>
                        </ChartCard>

                        <ChartCard title="Kebutuhan Pokok vs Keinginan" sub="Bulan Ini">
                            <div className="flex-1 w-full mt-4 h-62.5">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <BarChart data={needsVsWantsData} layout="vertical" margin={{ left: 20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" hide />
                                        <RechartsTooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} formatter={(value: ValueType | undefined) => [formatIDR(Number(value) || 0), '']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                                        <Bar dataKey="Kebutuhan" stackId="a" fill="#10b981" radius={[8, 0, 0, 8]} />
                                        <Bar dataKey="Keinginan" stackId="a" fill="#f43f5e" radius={[0, 8, 8, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Rata-Rata Nominal Pengeluaran" sub="Nilai rata-rata per transaksi (30 Hari)">
                            <div className="flex-1 w-full mt-4 h-62.5">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <LineChart data={avgExpenseData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#8b949e' }} />
                                        <YAxis hide />
                                        <RechartsTooltip cursor={{ stroke: 'rgba(99, 102, 241, 0.2)' }} formatter={(value: ValueType | undefined) => [formatIDR(Number(value) || 0), 'Rata-Rata']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Line type="monotone" dataKey="avg" stroke="#f43f5e" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 3, fill: '#f43f5e' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Intensitas Hari Pengeluaran" sub="Berdasarkan Hari (Sepanjang Waktu)">
                            <div className="flex-1 w-full mt-4 h-62.5">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <BarChart data={dayOfWeekData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#8b949e' }} />
                                        <YAxis hide />
                                        <RechartsTooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} formatter={(value: ValueType | undefined) => [formatIDR(Number(value) || 0), 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="total" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Kebocoran Biaya Siluman" sub="Transfer Fees / Admin Bulanan (30 Hari)">
                            <div className="flex-1 w-full mt-4 h-62.5">
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
                                        <RechartsTooltip cursor={{ stroke: 'rgba(236, 72, 153, 0.2)' }} formatter={(value: ValueType | undefined) => [formatIDR(Number(value) || 0), 'Biaya Admin']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
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
