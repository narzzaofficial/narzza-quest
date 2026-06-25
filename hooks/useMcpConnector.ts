'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';

/** Claude Connector (MCP) linking: generate/redeem code, copy helpers. */
export function useMcpConnector() {
    const [isActivating, setIsActivating] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [code, setCode] = useState('');
    const [codeCopied, setCodeCopied] = useState(false);
    const [urlCopied, setUrlCopied] = useState(false);
    const [serverUrl, setServerUrl] = useState('');

    useEffect(() => {
        setServerUrl(`${window.location.origin}/api/mcp`);
    }, []);

    async function activate(): Promise<void> {
        setIsActivating(true);
        setCode('');
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch('/api/mcp/activate', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Gagal generate kode.');
            setCode(data.code);
            setCodeCopied(false);
        } finally {
            setIsActivating(false);
        }
    }

    async function disconnect(): Promise<void> {
        setIsDisconnecting(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch('/api/mcp/disconnect', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Gagal keluar dari sesi connector.');
            setCode('');
        } finally {
            setIsDisconnecting(false);
        }
    }

    async function copyCode(): Promise<void> {
        await navigator.clipboard.writeText(code);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    }

    async function copyUrl(): Promise<void> {
        await navigator.clipboard.writeText(serverUrl);
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 2000);
    }

    return { isActivating, isDisconnecting, code, codeCopied, urlCopied, serverUrl, activate, disconnect, copyCode, copyUrl };
}
