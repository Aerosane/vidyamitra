import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user_id, data } = body;
        const { skill, questions, answers } = data;

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        return NextResponse.json({
            status: "ok",
            result: {
                score: 100,
                correct: 1,
                total: 1,
                passed: true,
                feedback: "Great job! You demonstrated strong knowledge.",
                details: [
                    {
                        question: 1,
                        your_answer: "B",
                        correct_answer: "B",
                        correct: true,
                        explanation: "Unit tests are crucial for maintainable code."
                    }
                ]
            },
            quiz_id: `quiz_${Math.random().toString(36).substring(7)}`
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
