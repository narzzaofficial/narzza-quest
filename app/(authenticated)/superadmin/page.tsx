'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import SectionLabel from '@/components/ui/SectionLabel';
import Toast from '@/components/ui/Toast';
import { ShieldAlert, Users, Trash2, Plus, Loader2, Database, AlertTriangle } from 'lucide-react';
import { UserProfile } from '@/types';
import { useRouter } from 'next/navigation';

export default function SuperAdminPage() {
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();
    
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', displayName: '', isDemo: false });

    useEffect(() => {
        if (!authLoading && profile) {
            const adminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
            if (profile.email !== adminEmail) {
                router.replace('/');
            } else {
                fetchUsers();
            }
        }
    }, [authLoading, profile]);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setUsers(data.users || []);
            } else {
                showToast(data.error || 'Failed to fetch users', 'error');
            }
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (uid: string, email: string) => {
        const confirm = window.confirm(`Are you absolutely sure you want to delete ${email}? This action cannot be undone.`);
        if (!confirm) return;

        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch(`/api/admin/users/${uid}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                showToast('User deleted successfully');
                setUsers(prev => prev.filter(u => u.uid !== uid));
            } else {
                showToast(data.error || 'Failed to delete user', 'error');
            }
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                showToast('User created successfully');
                setIsModalOpen(false);
                setFormData({ email: '', password: '', displayName: '', isDemo: false });
                fetchUsers();
            } else {
                showToast(data.error || 'Failed to create user', 'error');
            }
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setIsCreating(false);
        }
    };

    if (authLoading || loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>;
    }

    if (profile?.email !== process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
        return null; // Will be redirected
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <PageHeader
                grad="brand"
                icon={<ShieldAlert className="w-6 h-6 text-white" />}
                title="Super Admin Dashboard"
                subtitle="Global user management and demo account provisioning."
            />

            <GlassCard className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <SectionLabel className="flex items-center gap-1.5 m-0"><Users className="w-4 h-4"/> Registered Users ({users.length})</SectionLabel>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-brand text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 hover:brightness-110 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Create User
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-line text-ink-muted text-xs uppercase tracking-wider">
                                <th className="py-3 px-4 font-bold">Email / Name</th>
                                <th className="py-3 px-4 font-bold">Role</th>
                                <th className="py-3 px-4 font-bold">Level / Exp</th>
                                <th className="py-3 px-4 font-bold">Joined</th>
                                <th className="py-3 px-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.uid} className="border-b border-line hover:bg-surface-2 transition-colors">
                                    <td className="py-3 px-4">
                                        <p className="text-sm font-bold text-ink">{user.email}</p>
                                        <p className="text-xs text-ink-muted">{user.displayName} {user.title === 'Demo Tester' && <span className="text-[9px] bg-danger text-white px-1.5 py-0.5 rounded ml-1">DEMO</span>}</p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${user.role === 'gm' ? 'bg-purple-100 text-purple-700' : 'bg-surface-3 text-ink-soft'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="text-sm font-bold text-ink">Lv {user.level}</p>
                                        <p className="text-xs text-brand font-semibold">{user.exp} XP</p>
                                    </td>
                                    <td className="py-3 px-4 text-xs text-ink-muted">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button 
                                            onClick={() => handleDelete(user.uid, user.email)}
                                            className="p-2 text-ink-muted hover:text-danger hover:bg-danger-soft rounded-lg transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-ink-muted text-sm">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <GlassCard className="w-full max-w-md p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-ink">Create New User</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-ink-muted hover:text-ink text-xl font-black">&times;</button>
                        </div>
                        
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-ink-soft mb-1 uppercase tracking-wider">Display Name</label>
                                <input type="text" required value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="w-full bg-surface-2 border border-line rounded-xl px-4 py-2 text-sm text-ink focus:outline-none focus:border-brand" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-ink-soft mb-1 uppercase tracking-wider">Email Address</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-surface-2 border border-line rounded-xl px-4 py-2 text-sm text-ink focus:outline-none focus:border-brand" placeholder="john@example.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-ink-soft mb-1 uppercase tracking-wider">Password (Min 6 chars)</label>
                                <input type="password" required minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-surface-2 border border-line rounded-xl px-4 py-2 text-sm text-ink focus:outline-none focus:border-brand" placeholder="••••••••" />
                            </div>

                            <div className="flex items-center gap-3 p-4 border border-line rounded-xl bg-surface-2 mt-2">
                                <input type="checkbox" id="isDemo" checked={formData.isDemo} onChange={e => setFormData({...formData, isDemo: e.target.checked})} className="w-5 h-5 accent-danger" />
                                <label htmlFor="isDemo" className="flex-1 cursor-pointer">
                                    <p className="text-sm font-bold text-ink flex items-center gap-1.5"><Database className="w-4 h-4 text-danger"/> Generate Demo Data</p>
                                    <p className="text-xs text-ink-muted mt-0.5">Automatically seeds this account with 6-months of realistic transactions, assets, and life-log data.</p>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 rounded-xl text-sm font-bold text-ink-soft hover:bg-surface-3 transition-colors">Cancel</button>
                                <button type="submit" disabled={isCreating} className="flex-1 py-2 rounded-xl text-sm font-bold text-white bg-brand hover:brightness-110 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isCreating ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}

            <Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={() => setToast(p => ({...p, show: false}))} />
        </div>
    );
}
