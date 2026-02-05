import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user_id, data } = body;
        const { skill, difficulty, num_questions } = data;

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        return NextResponse.json({
            status: "ok",
            skill: skill || "General",
            questions: [
                {
                    question: `What is a key difference between ${skill} and other similar technologies?`,
                    options: [
                        "A) It is faster",
                        "B) It uses a different syntax",
                        "C) It is compiled vs interpreted",
                        "D) It has better community support"
                    ],
                    correct: "C",
                    explanation: "This is a fundamental distinction."
                },
                {
                    question: "Which of the following is considered a best practice?",
                    options: [
                        "A) Hardcoding credentials",
                        "B) Writing unit tests",
                        "C) Ignoring error handling",
                        "D) Using global variables"
                    ],
                    correct: "B",
                    explanation: "Unit tests ensure code reliability."
                },
                {
                    question: "What does the term 'idempotency' mean in API design?",
                    options: [
                        "A) Operations can be applied multiple times without changing the result",
                        "B) Operations are always faster",
                        "C) Operations are secure",
                        "D) Operations are hidden"
                    ],
                    correct: "A",
                    explanation: "Idempotency ensures consistency."
                }
            ].slice(0, num_questions || 5)
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
