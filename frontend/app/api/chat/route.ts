import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Invalid request: messages array required' },
                { status: 400 }
            );
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ',//add api value
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional AI assistant for The Resume Hub platform. Provide helpful, accurate, and professional responses about career development, resume building, job searching, and interview preparation. Be concise, friendly, and supportive.'
                    },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 1024,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Groq API Error Details:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });

            return NextResponse.json(
                {
                    error: `Groq API error: ${response.status}`,
                    details: errorText,
                    statusText: response.statusText
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Server error:', error);
        return NextResponse.json(
            { error: 'Server error', details: error.message },
            { status: 500 }
        );
    }
}
