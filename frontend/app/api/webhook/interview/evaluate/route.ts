import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user_id, data } = body;
        const { question, answer, expected_points } = data;

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simple mock accumulation logic based on answer length
        const score = Math.min(Math.floor(answer.length / 2) + 40, 95);
        const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "D";

        return NextResponse.json({
            status: "ok",
            evaluation: {
                score: score,
                grade: grade,
                feedback: "Your answer demonstrates a solid understanding of the concept. You covered the key aspects, but could elaborate more on specific examples.",
                strengths: ["Clear explanation", "Mentioned key terms", "Structured response"],
                improvements: ["Provide a concrete example", "Discuss edge cases", "Relate to business impact"],
                would_hire: score >= 70
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
