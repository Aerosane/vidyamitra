import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const response = await fetch(`${API_URL}/api/webhook/interview/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[interview/evaluate] Backend error:', error);
            return NextResponse.json(
                { error: 'Backend request failed', details: error },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[interview/evaluate] Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
