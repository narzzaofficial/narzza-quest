'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFinance } from '@/hooks/useFinance';
import { Landmark, Plus, ArrowUpRight, ArrowDownRight, Wallet, Banknote, LineChart, Loader2, Target, PieChart, ScanLine } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import SectionLabel from '@/components/ui/SectionLabel';
import EmptyState from '@/components/ui/EmptyState';
import { createAsset, recordTransaction, createGoal } from '@/lib/financeDb';
import { AssetType } from '@/types';
import Toast from '@/components/ui/Toast';

const EXPENSE_CATEGORIES = ['Food & Beverage', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Health', 'Education', 'Personal Care', 'Investment', 'Others'];
const INCOME_CATEGORIES = ['Salary', 'Freelance / Business', 'Investment Return', 'Gift / Bonus', 'Others'];
const TRANSFER_CATEGORIES = ['Transfer / Convert'];

export default function FinancePage() {
    const { profile } = useAuth();
    const { assets, transactions, goals, loading, totalNetWorthIDR, exchangeRates } = useFinance(profile?.uid);

    const [isAddingAsset, setIsAddingAsset] = useState(false);
    const [newAsset, setNewAsset] = useState({ name: '', type: 'bank' as AssetType, balance: 0, currency: 'IDR' });

    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', targetAmount: 0, currentAmount: 0, currency: 'IDR' });

    const [isAddingTx, setIsAddingTx] = useState(false);
    const [newTx, setNewTx] = useState({
        type: 'expense' as 'income' | 'expense' | 'transfer',
        amount: 0,
        toAmount: 0,
        txCurrency: '',
        assetId: '',
        toAssetId: '',
        toGoalId: '',
        category: '',
        title: '',
        merchant: '',
        context: '',
        isRecurring: false,
        hasTransferFee: false,
        transferFee: 0,
        transferFeeType: 'add_to_source' as 'add_to_source' | 'deduct_from_target'
    });

    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' });
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    const handleAddAsset = async () => {
        if (!profile || !newAsset.name) return;
        try {
            await createAsset(profile.uid, newAsset);
            setIsAddingAsset(false);
            setNewAsset({ name: '', type: 'bank', balance: 0, currency: 'IDR' });
            showToast('Aset berhasil ditambahkan!');
        } catch (error) {
            showToast('Gagal menambahkan aset', 'error');
        }
    };

    const handleAddGoal = async () => {
        if (!profile || !newGoal.title || newGoal.targetAmount <= 0) return;
        try {
            await createGoal(profile.uid, newGoal);
            setIsAddingGoal(false);
            setNewGoal({ title: '', targetAmount: 0, currentAmount: 0, currency: 'IDR' });
            showToast('Target finansial berhasil ditambahkan!');
        } catch (error) {
            showToast('Gagal menambahkan target', 'error');
        }
    };

    const handleAddTx = async () => {
        if (!profile || !newTx.assetId || newTx.amount <= 0 || !newTx.title) return;
        if (newTx.type !== 'transfer' && !newTx.category) return;
        if (newTx.type === 'transfer' && (!newTx.toAssetId && !newTx.toGoalId)) return;

        try {
            const selectedAsset = assets.find(a => a.id === newTx.assetId);
            const assetCurrency = selectedAsset?.currency || 'IDR';
            const txCurrency = newTx.txCurrency || assetCurrency;

            let finalAmount = newTx.amount;
            if (newTx.type !== 'transfer' && assetCurrency !== txCurrency && exchangeRates[assetCurrency] && exchangeRates[txCurrency]) {
                finalAmount = newTx.amount * (exchangeRates[assetCurrency] / exchangeRates[txCurrency]);
            }

            const txData: any = {
                assetId: newTx.assetId,
                amount: finalAmount,
                originalAmount: newTx.amount,
                originalCurrency: txCurrency,
                type: newTx.type,
                category: newTx.type === 'transfer' ? 'Transfer / Convert' : newTx.category,
                isRecurring: newTx.isRecurring,
                title: newTx.title,
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString(),
                tags: []
            };

            if (newTx.type === 'transfer') {
                if (newTx.toAssetId) txData.toAssetId = newTx.toAssetId;
                if (newTx.toGoalId) txData.toGoalId = newTx.toGoalId;

                const toCurrency = newTx.toAssetId ? assets.find(a => a.id === newTx.toAssetId)?.currency : goals.find(g => g.id === newTx.toGoalId)?.currency;
                let receivedAmount = finalAmount;
                if (assetCurrency !== toCurrency && toCurrency && exchangeRates[assetCurrency] && exchangeRates[toCurrency]) {
                    receivedAmount = finalAmount * (exchangeRates[toCurrency] / exchangeRates[assetCurrency]);
                }

                if (newTx.hasTransferFee && newTx.transferFee > 0) {
                    if (newTx.transferFeeType === 'add_to_source') {
                        txData.amount = finalAmount + newTx.transferFee;
                        txData.toAmount = receivedAmount;
                    } else if (newTx.transferFeeType === 'deduct_from_target') {
                        txData.amount = finalAmount;
                        const amountAfterFee = Math.max(0, finalAmount - newTx.transferFee);
                        let receivedAmountAfterFee = amountAfterFee;
                        if (assetCurrency !== toCurrency && toCurrency && exchangeRates[assetCurrency] && exchangeRates[toCurrency]) {
                            receivedAmountAfterFee = amountAfterFee * (exchangeRates[toCurrency] / exchangeRates[assetCurrency]);
                        }
                        txData.toAmount = receivedAmountAfterFee;
                    }
                    txData.transferFee = newTx.transferFee;
                    txData.transferFeeType = newTx.transferFeeType;
                } else {
                    txData.toAmount = receivedAmount;
                }
            } else {
                if (newTx.merchant) txData.merchant = newTx.merchant;
                if (newTx.context) txData.context = newTx.context;
            }

            await recordTransaction(profile.uid, txData);

            setIsAddingTx(false);
            setNewTx({ type: 'expense', amount: 0, toAmount: 0, txCurrency: '', assetId: assets[0]?.id || '', toAssetId: '', toGoalId: '', category: '', title: '', merchant: '', context: '', isRecurring: false, hasTransferFee: false, transferFee: 0, transferFeeType: 'add_to_source' });
            showToast('Transaksi berhasil dicatat!');
        } catch (error) {
            console.error(error);
            showToast('Gagal mencatat transaksi', 'error');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        showToast('Memindai struk dengan AI...', 'success');

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = reader.result as string;
                
                const res = await fetch('/api/ai/scan-receipt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageBase64: base64 })
                });

                const json = await res.json();
                if (json.error) throw new Error(json.error);

                const data = json.data;
                const matchedAsset = assets.find(a => data.assetName && a.name.toLowerCase().includes(data.assetName.toLowerCase()));
                const matchedToAsset = assets.find(a => data.toAssetName && a.name.toLowerCase().includes(data.toAssetName.toLowerCase()));

                setNewTx(prev => ({
                    ...prev,
                    type: data.type === 'income' ? 'income' : data.type === 'transfer' ? 'transfer' : 'expense',
                    amount: data.amount || 0,
                    txCurrency: data.currency || prev.txCurrency,
                    merchant: data.merchant || '',
                    title: data.title || '',
                    category: data.category || '',
                    context: data.context || '',
                    hasTransferFee: !!data.transferFee,
                    transferFee: data.transferFee || 0,
                    assetId: matchedAsset ? matchedAsset.id : prev.assetId,
                    toAssetId: matchedToAsset ? matchedToAsset.id : prev.toAssetId
                }));
                showToast('Struk berhasil dibaca!', 'success');
                setIsScanning(false);
            };
            reader.onerror = () => {
                throw new Error('Gagal membaca file gambar');
            };
        } catch (error: any) {
            showToast(error.message || 'Gagal memindai struk', 'error');
            setIsScanning(false);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (loading) {
        return (
            <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 md:space-y-8">
                {/* Header Skeleton */}
                <div className="flex gap-4 items-center">
                    <div className="animate-pulse w-12 h-12 rounded-2xl bg-brand-soft/50"></div>
                    <div className="space-y-2 flex-1">
                        <div className="animate-pulse h-6 w-48 bg-brand-soft/50 rounded"></div>
                        <div className="animate-pulse h-4 w-72 bg-brand-soft/50 rounded"></div>
                    </div>
                </div>

                {/* Net Worth Card Skeleton */}
                <div className="relative overflow-hidden p-6 md:p-8 rounded-card border border-brand/20 bg-surface">
                    <div className="animate-pulse h-4 w-32 bg-brand-soft/50 rounded mb-2"></div>
                    <div className="animate-pulse h-12 w-64 bg-brand-soft/50 rounded"></div>
                </div>

                {/* Main Content Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* KIRI: Daftar Aset Skeleton */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="animate-pulse h-5 w-24 bg-brand-soft/50 rounded"></div>
                            <div className="animate-pulse h-6 w-16 bg-brand-soft/50 rounded"></div>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-4 rounded-card border border-line bg-surface flex justify-between">
                                    <div className="space-y-2">
                                        <div className="animate-pulse h-4 w-20 bg-brand-soft/50 rounded"></div>
                                        <div className="animate-pulse h-3 w-12 bg-brand-soft/50 rounded"></div>
                                    </div>
                                    <div className="animate-pulse h-5 w-24 bg-brand-soft/50 rounded mt-1"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* KANAN: Transaksi Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="animate-pulse h-5 w-40 bg-brand-soft/50 rounded"></div>
                            <div className="animate-pulse h-6 w-32 bg-brand-soft/50 rounded"></div>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="p-4 rounded-card border border-line bg-surface flex justify-between items-center">
                                    <div className="flex gap-4 items-center">
                                        <div className="animate-pulse w-10 h-10 rounded-xl bg-brand-soft/50"></div>
                                        <div className="space-y-2">
                                            <div className="animate-pulse h-4 w-32 bg-brand-soft/50 rounded"></div>
                                            <div className="animate-pulse h-3 w-20 bg-brand-soft/50 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-right flex flex-col items-end">
                                        <div className="animate-pulse h-4 w-24 bg-brand-soft/50 rounded"></div>
                                        <div className="animate-pulse h-3 w-16 bg-brand-soft/50 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 md:space-y-8">
            <PageHeader
                grad="brand"
                icon={<Landmark className="w-6 h-6 text-white" />}
                title="Keuangan Pribadi"
                subtitle="Pantau kekayaan, pengeluaran, dan target finansialmu."
                badge="Finance"
            />

            <GlassCard className="relative overflow-hidden p-6 md:p-8 border-brand/20">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Landmark className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="text-ink-muted text-[10px] md:text-xs uppercase tracking-widest font-bold mb-1">Total Net Worth (Estimasi IDR)</p>
                        <h2 className="text-4xl md:text-5xl font-black text-brand tracking-tight">
                            Rp {Math.round(totalNetWorthIDR).toLocaleString('id-ID')}
                        </h2>
                    </div>
                </div>
            </GlassCard>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* KIRI: Daftar Aset */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <SectionLabel className="flex items-center gap-1.5 m-0"><Wallet className="w-4 h-4" /> Aset Saya</SectionLabel>
                        <button onClick={() => setIsAddingAsset(!isAddingAsset)} className="text-[10px] font-bold uppercase tracking-widest text-brand bg-brand-soft px-3 py-1.5 rounded-lg hover:bg-brand hover:text-white transition-colors">
                            {isAddingAsset ? 'Batal' : '+ Tambah'}
                        </button>
                    </div>

                    {isAddingAsset && (
                        <GlassCard className="p-4 space-y-3 bg-surface border-brand/20 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Nama Aset</label>
                                <input type="text" value={newAsset.name} onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="Misal: BCA, Gopay" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Tipe</label>
                                    <select value={newAsset.type} onChange={e => setNewAsset({ ...newAsset, type: e.target.value as AssetType })} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand">
                                        <option value="bank">Bank</option>
                                        <option value="ewallet">E-Wallet</option>
                                        <option value="cash">Tunai</option>
                                        <option value="investment">Investasi</option>
                                        <option value="crypto">Crypto</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Mata Uang</label>
                                    <select value={newAsset.currency} onChange={e => setNewAsset({ ...newAsset, currency: e.target.value })} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand">
                                        <option value="IDR">IDR</option>
                                        <option value="MYR">MYR</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="BTC">BTC</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Saldo Awal</label>
                                <input type="number" value={newAsset.balance || ''} onChange={e => setNewAsset({ ...newAsset, balance: Number(e.target.value) })} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="0" />
                            </div>
                            <button onClick={handleAddAsset} disabled={!newAsset.name} className="w-full bg-brand text-white font-bold py-2 rounded-lg text-sm disabled:opacity-50 hover:brightness-110 transition-all">Simpan Aset</button>
                        </GlassCard>
                    )}

                    {assets.length === 0 && !isAddingAsset ? (
                        <EmptyState icon={Wallet} title="Belum ada aset" desc="Tambahkan rekening atau dompet digitalmu." />
                    ) : (
                        <div className="space-y-3">
                            {assets.map(asset => (
                                <GlassCard key={asset.id} className="p-4 flex items-center justify-between hover:border-brand/30 transition-colors">
                                    <div>
                                        <p className="text-sm font-bold text-ink">{asset.name}</p>
                                        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">{asset.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-ink">{asset.currency} {asset.balance.toLocaleString('id-ID')}</p>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    )}

                    {/* --- TARGET FINANSIAL --- */}
                    <div className="mt-8 flex items-center justify-between">
                        <SectionLabel className="flex items-center gap-1.5 m-0"><Target className="w-4 h-4" /> Target Finansial</SectionLabel>
                        <button onClick={() => setIsAddingGoal(!isAddingGoal)} className="text-[10px] font-bold uppercase tracking-widest text-brand bg-brand-soft px-3 py-1.5 rounded-lg hover:bg-brand hover:text-white transition-colors">
                            {isAddingGoal ? 'Batal' : '+ Tambah'}
                        </button>
                    </div>

                    {isAddingGoal && (
                        <GlassCard className="p-4 space-y-3 bg-surface border-brand/20 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Nama Target</label>
                                <input type="text" value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="Misal: PS5, Dana Darurat" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Target Angka</label>
                                    <input type="number" value={newGoal.targetAmount || ''} onChange={e => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="0" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Terkumpul</label>
                                    <input type="number" value={newGoal.currentAmount || ''} onChange={e => setNewGoal({ ...newGoal, currentAmount: Number(e.target.value) })} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="0" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Mata Uang</label>
                                <select value={newGoal.currency} onChange={e => setNewGoal({ ...newGoal, currency: e.target.value })} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand">
                                    <option value="IDR">IDR</option>
                                    <option value="MYR">MYR</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="BTC">BTC</option>
                                </select>
                            </div>
                            <button onClick={handleAddGoal} disabled={!newGoal.title || newGoal.targetAmount <= 0} className="w-full bg-brand text-white font-bold py-2 rounded-lg text-sm disabled:opacity-50 hover:brightness-110 transition-all">Simpan Target</button>
                        </GlassCard>
                    )}

                    {goals.length === 0 && !isAddingGoal ? (
                        <EmptyState icon={Target} title="Belum ada target" desc="Buat wishlist barang atau tabungan." />
                    ) : (
                        <div className="space-y-3">
                            {goals.map(goal => {
                                const progress = Math.min(100, Math.max(0, (goal.currentAmount / goal.targetAmount) * 100));
                                const isCompleted = goal.currentAmount >= goal.targetAmount;

                                return (
                                    <GlassCard key={goal.id} className="p-5 flex flex-col gap-3 group hover:border-brand/30 transition-all hover:-translate-y-0.5">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-ink flex items-center gap-2">
                                                    {goal.title}
                                                    {isCompleted && <span className="text-[9px] bg-success-soft text-success px-1.5 py-0.5 rounded-md uppercase tracking-widest">Tercapai</span>}
                                                </p>
                                                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mt-1">
                                                    {goal.currency} {goal.currentAmount.toLocaleString('id-ID', { maximumFractionDigits: 2 })} / {goal.targetAmount.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-xl font-black tracking-tighter ${isCompleted ? 'text-success' : 'text-brand'}`}>
                                                    {Math.floor(progress)}%
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-full h-2 bg-surface-2 border border-line rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gradient-to-r from-brand to-brand-soft shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`} style={{ width: `${progress}%` }} />
                                        </div>
                                    </GlassCard>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* KANAN: Transaksi & Goals */}
                <div className="lg:col-span-2 space-y-6">

                    <div className="flex items-center justify-between">
                        <SectionLabel className="flex items-center gap-1.5 m-0"><Banknote className="w-4 h-4" /> Transaksi Terakhir</SectionLabel>
                        <button onClick={() => { setIsAddingTx(!isAddingTx); if (!newTx.assetId && assets.length > 0) setNewTx({ ...newTx, assetId: assets[0].id }); }} className="text-[10px] font-bold uppercase tracking-widest text-brand bg-brand-soft px-3 py-1.5 rounded-lg hover:bg-brand hover:text-white transition-colors">
                            {isAddingTx ? 'Batal' : '+ Catat Transaksi'}
                        </button>
                    </div>

                    {isAddingTx && (
                        <GlassCard className="p-5 border-brand/20 bg-surface animate-in fade-in slide-in-from-top-2">
                            <div className="flex gap-2 mb-4">
                                <button onClick={() => setNewTx({ ...newTx, type: 'expense', category: '' })} className={`flex-1 py-2 rounded-lg font-bold text-xs border transition-colors ${newTx.type === 'expense' ? 'bg-danger-soft text-danger border-danger/30' : 'bg-surface-2 text-ink-muted border-transparent hover:bg-surface-3'}`}>Pengeluaran</button>
                                <button onClick={() => setNewTx({ ...newTx, type: 'income', category: '' })} className={`flex-1 py-2 rounded-lg font-bold text-xs border transition-colors ${newTx.type === 'income' ? 'bg-success-soft text-success border-success/30' : 'bg-surface-2 text-ink-muted border-transparent hover:bg-surface-3'}`}>Pemasukan</button>
                                <button onClick={() => setNewTx({ ...newTx, type: 'transfer', category: 'Transfer / Convert' })} className={`flex-1 py-2 rounded-lg font-bold text-xs border transition-colors ${newTx.type === 'transfer' ? 'bg-brand-soft text-brand border-brand/30' : 'bg-surface-2 text-ink-muted border-transparent hover:bg-surface-3'}`}>Transfer / Beli Aset</button>
                            </div>

                            <div className="mb-4">
                                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                                <button 
                                    onClick={() => fileInputRef.current?.click()} 
                                    disabled={isScanning}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-brand/40 bg-brand-soft/30 hover:bg-brand-soft/50 text-brand font-bold text-sm transition-all disabled:opacity-50"
                                >
                                    {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                                    {isScanning ? 'AI Sedang Membaca...' : 'Auto Scan Struk dengan AI'}
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Dari Aset</label>
                                        <select value={newTx.assetId} onChange={e => setNewTx({ ...newTx, assetId: e.target.value })} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand">
                                            {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
                                        </select>
                                    </div>
                                    {newTx.type === 'transfer' ? (
                                        <div>
                                            <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Ke Tujuan</label>
                                            <select
                                                value={newTx.toAssetId ? `asset_${newTx.toAssetId}` : newTx.toGoalId ? `goal_${newTx.toGoalId}` : ''}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    if (val.startsWith('asset_')) setNewTx({ ...newTx, toAssetId: val.replace('asset_', ''), toGoalId: '' });
                                                    else if (val.startsWith('goal_')) setNewTx({ ...newTx, toGoalId: val.replace('goal_', ''), toAssetId: '' });
                                                    else setNewTx({ ...newTx, toAssetId: '', toGoalId: '' });
                                                }}
                                                className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
                                            >
                                                <option value="">-- Pilih Tujuan --</option>
                                                <optgroup label="Aset">
                                                    {assets.filter(a => a.id !== newTx.assetId).map(a => <option key={a.id} value={`asset_${a.id}`}>{a.name} ({a.currency})</option>)}
                                                </optgroup>
                                                {goals.length > 0 && (
                                                    <optgroup label="Target Finansial">
                                                        {goals.map(g => <option key={g.id} value={`goal_${g.id}`}>{g.title} ({g.currency})</option>)}
                                                    </optgroup>
                                                )}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <div className="w-1/3">
                                                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Mata Uang</label>
                                                <select value={newTx.txCurrency || (assets.find(a => a.id === newTx.assetId)?.currency || 'IDR')} onChange={e => setNewTx({ ...newTx, txCurrency: e.target.value })} className="w-full bg-surface-2 border border-line rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-brand font-bold">
                                                    <option value="IDR">IDR</option>
                                                    <option value="MYR">MYR</option>
                                                    <option value="USD">USD</option>
                                                    <option value="EUR">EUR</option>
                                                    <option value="BTC">BTC</option>
                                                </select>
                                            </div>
                                            <div className="w-2/3">
                                                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Nominal</label>
                                                <input type="number" value={newTx.amount || ''} onChange={e => setNewTx({ ...newTx, amount: Number(e.target.value) })} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 focus:outline-none focus:border-brand font-bold text-lg" placeholder="0" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {newTx.type === 'transfer' && (
                                    <>
                                        <div>
                                            <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Nominal Transfer</label>
                                            <input type="number" value={newTx.amount || ''} onChange={e => setNewTx({ ...newTx, amount: Number(e.target.value) })} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 focus:outline-none focus:border-brand font-bold text-lg" placeholder="0" />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 cursor-pointer mt-1">
                                                <input type="checkbox" checked={newTx.hasTransferFee} onChange={e => setNewTx({ ...newTx, hasTransferFee: e.target.checked })} className="rounded text-brand focus:ring-brand w-4 h-4" />
                                                <span className="text-xs font-bold text-ink">Ada Biaya Transfer?</span>
                                            </label>
                                        </div>
                                        {newTx.hasTransferFee && (
                                            <div className="bg-surface-2 p-3 rounded-lg border border-line space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Biaya Transfer</label>
                                                        <input type="number" value={newTx.transferFee || ''} onChange={e => setNewTx({ ...newTx, transferFee: Number(e.target.value) })} className="w-full bg-surface border border-line rounded-lg px-3 py-2 focus:outline-none focus:border-brand font-bold" placeholder="0" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Jenis Biaya</label>
                                                        <select value={newTx.transferFeeType} onChange={e => setNewTx({ ...newTx, transferFeeType: e.target.value as any })} className="w-full bg-surface border border-line rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-brand">
                                                            <option value="add_to_source">Ditambah ke Saldo Asal (+)</option>
                                                            <option value="deduct_from_target">Dipotong dari Uang Masuk (-)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-ink-muted leading-relaxed">
                                                    {newTx.transferFeeType === 'add_to_source'
                                                        ? 'Biaya akan dibebankan ke aset pengirim (menambah total pengeluaran).'
                                                        : 'Biaya akan dipotong dari uang yang ditransfer (mengurangi uang yang diterima target).'}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {newTx.type !== 'transfer' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Kategori</label>
                                                <select value={newTx.category} onChange={e => setNewTx({ ...newTx, category: e.target.value })} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand">
                                                    <option value="">-- Pilih Kategori --</option>
                                                    {(newTx.type === 'expense' ? EXPENSE_CATEGORIES : newTx.type === 'income' ? INCOME_CATEGORIES : TRANSFER_CATEGORIES).map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Judul/Catatan</label>
                                                <input type="text" value={newTx.title} onChange={e => setNewTx({ ...newTx, title: e.target.value })} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="Misal: Kopi Starbucks" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Merchant (Opsional)</label>
                                                <input type="text" value={newTx.merchant} onChange={e => setNewTx({ ...newTx, merchant: e.target.value })} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="Misal: Starbucks" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Context/Mood (Opsional)</label>
                                                <select value={newTx.context} onChange={e => setNewTx({ ...newTx, context: e.target.value })} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand">
                                                    <option value="">-- Pilih --</option>
                                                    <option value="necessity">Kebutuhan Pokok</option>
                                                    <option value="reward">Self Reward</option>
                                                    <option value="stress-relief">Pelampiasan Stres</option>
                                                    <option value="investment">Investasi Masa Depan</option>
                                                    <option value="impulse">Impulsif</option>
                                                </select>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {newTx.type === 'transfer' && (
                                    <div>
                                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1 block">Judul/Catatan</label>
                                        <input type="text" value={newTx.title} onChange={e => setNewTx({ ...newTx, title: e.target.value })} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="Misal: Pindah ke Dana Darurat" />
                                    </div>
                                )}
                                <button onClick={handleAddTx} disabled={!newTx.assetId || newTx.amount <= 0 || !newTx.title || (newTx.type !== 'transfer' && !newTx.category) || (newTx.type === 'transfer' && !newTx.toAssetId && !newTx.toGoalId)} className="w-full bg-brand text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50 hover:brightness-110 transition-all mt-2">
                                    Simpan Transaksi
                                </button>
                            </div>
                        </GlassCard>
                    )}

                    {transactions.length === 0 ? (
                        <EmptyState icon={LineChart} title="Belum ada transaksi" desc="Catat pengeluaran atau pemasukan pertamamu." />
                    ) : (
                        <div className="space-y-3">
                            {transactions.slice(0, 10).map(tx => {
                                const isExpense = tx.type === 'expense';
                                const isTransfer = tx.type === 'transfer';
                                const asset = assets.find(a => a.id === tx.assetId);
                                const toAsset = tx.toAssetId ? assets.find(a => a.id === tx.toAssetId) : null;
                                const toGoal = tx.toGoalId ? goals.find(g => g.id === tx.toGoalId) : null;
                                const targetName = toAsset ? toAsset.name : toGoal ? toGoal.title : 'Unknown';
                                return (
                                    <GlassCard key={tx.id} className="p-4 flex items-center justify-between group hover:border-brand/20 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isTransfer ? 'bg-brand-soft text-brand' : isExpense ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success'}`}>
                                                {isTransfer ? <ArrowUpRight className="w-5 h-5 rotate-45" /> : isExpense ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-ink">{tx.title}</p>
                                                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">{isTransfer ? 'Transfer' : tx.category}</span>
                                                    {tx.merchant && <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-surface-2 text-ink-soft">{tx.merchant}</span>}
                                                    {tx.context && <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-brand-soft text-brand">{tx.context}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`text-sm font-black ${isTransfer ? 'text-brand' : isExpense ? 'text-danger' : 'text-success'}`}>
                                                {isTransfer ? '' : isExpense ? '-' : '+'} {tx.originalCurrency || asset?.currency || 'IDR'} {(tx.originalAmount || tx.amount).toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mt-0.5">
                                                {isTransfer ? `${asset?.name} ➔ ${targetName}` : asset?.name}
                                                {tx.originalCurrency && tx.originalCurrency !== asset?.currency && ` (~${asset?.currency} ${tx.amount.toLocaleString('id-ID', { maximumFractionDigits: 0 })})`}
                                            </p>
                                        </div>
                                    </GlassCard>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={() => setToast(p => ({ ...p, show: false }))} />
        </div>
    );
}
