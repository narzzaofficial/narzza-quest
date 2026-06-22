'use client';

import { useState, useEffect } from 'react';
import { FinancialAsset, FinancialTransaction, FinancialGoal } from '@/types';
import {
    subscribeToAssets,
    subscribeToTransactions,
    subscribeToGoals
} from '@/lib/financeDb';

export function useFinance(uid?: string) {
    const [assets, setAssets] = useState<FinancialAsset[]>([]);
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [goals, setGoals] = useState<FinancialGoal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) {
            setAssets([]);
            setTransactions([]);
            setGoals([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const unsubAssets = subscribeToAssets(uid, (data) => {
            setAssets(data);
            setLoading(false);
        });

        const unsubTx = subscribeToTransactions(uid, 100, (data) => {
            setTransactions(data);
        });

        const unsubGoals = subscribeToGoals(uid, (data) => {
            setGoals(data);
        });

        return () => {
            unsubAssets();
            unsubTx();
            unsubGoals();
        };
    }, [uid]);

    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

    useEffect(() => {
        fetch('/api/finance/rates')
            .then(res => res.json())
            .then(data => {
                if (data && data.rates) {
                    setExchangeRates(data.rates);
                }
            })
            .catch(console.error);
    }, []);

    const convertToIDR = (amount: number, currency: string) => {
        if (!currency || currency === 'IDR') return amount;
        if (!exchangeRates.IDR) return amount; // Fallback
        
        const rate = exchangeRates[currency];
        if (rate) {
            return (amount / rate) * exchangeRates.IDR;
        }
        return amount;
    };

    const getAssetCurrency = (assetId: string) => {
        const asset = assets.find(a => a.id === assetId);
        return asset ? asset.currency : 'IDR';
    };

    // Computed
    const totalNetWorthIDR = assets.reduce((sum, a) => {
        return sum + convertToIDR(a.balance, a.currency);
    }, 0);

    const getIncomeThisMonth = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        return transactions
            .filter(tx => tx.type === 'income' && tx.timestamp >= startOfMonth)
            .reduce((sum, tx) => sum + convertToIDR(tx.amount, getAssetCurrency(tx.assetId)), 0);
    };

    const getExpenseThisMonth = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        return transactions
            .filter(tx => tx.type === 'expense' && tx.timestamp >= startOfMonth)
            .reduce((sum, tx) => sum + convertToIDR(tx.amount, getAssetCurrency(tx.assetId)), 0);
    };

    return {
        assets,
        transactions,
        goals,
        loading,
        totalNetWorthIDR,
        getIncomeThisMonth,
        getExpenseThisMonth,
        exchangeRates
    };
}
