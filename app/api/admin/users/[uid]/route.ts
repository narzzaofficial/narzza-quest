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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
    const isSuperAdmin = await checkSuperAdmin(req);
    if (!isSuperAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { uid } = await params;
        if (!uid) return NextResponse.json({ error: 'Missing UID' }, { status: 400 });

        // 1. Delete from Firebase Auth
        try {
            await adminAuth.deleteUser(uid);
        } catch (authErr: any) {
            // If user is already deleted in Auth, we still want to delete the Firestore doc
            if (authErr.code !== 'auth/user-not-found') {
                throw authErr;
            }
        }

        // 2. Delete User Profile from Firestore
        await adminDb.collection('users').doc(uid).delete();

        // Optional: We could also delete their subcollections (activities, etc.) 
        // but for a simple implementation, deleting the profile is enough.
        // Full recursive delete would require a cloud function or batching.

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
