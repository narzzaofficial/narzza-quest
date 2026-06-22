import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD', {
            next: { revalidate: 3600 }
        });
        
        if (!res.ok) {
            throw new Error(`Failed to fetch rates: ${res.status}`);
        }
        
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return NextResponse.json({ error: 'Failed to fetch exchange rates' }, { status: 500 });
    }
}
