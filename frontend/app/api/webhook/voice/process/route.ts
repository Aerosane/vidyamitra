import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user_id, data } = body;
        const { transcript, current_question, context } = data;

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        const isLastQuestion = context.question_index >= context.total_questions - 1;
        const responseText = isLastQuestion
            ? "Excellent. That concludes our interview. Thank you for your time."
            : `Thank you. Now moving on to the next question: ${context.next_question}`;

        return NextResponse.json({
            status: "ok",
            evaluation: {
                score: 85,
                grade: "B+",
                feedback: "Good vocal delivery and clear points. Valid technical content.",
                strengths: ["Clear articulation", "Relevant vocabulary"],
                improvements: ["Could be more concise"]
            },
            response_text: responseText,
            is_complete: isLastQuestion
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
