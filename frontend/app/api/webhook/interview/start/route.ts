import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user_id, data } = body;
        const { domain, role, difficulty, num_questions } = data;

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        return NextResponse.json({
            status: "ok",
            interview_id: `int_${Math.random().toString(36).substring(7)}`,
            questions: [
                {
                    text: `Explain the core concepts of ${domain} in the context of a ${role}.`,
                    type: "technical",
                    expected_points: ["Core principles", "Role relevance", "Practical examples"],
                    difficulty: difficulty
                },
                {
                    text: "Tell me about a challenging project you worked on recently.",
                    type: "behavioral",
                    expected_points: ["Problem description", "Actions taken", "Results/Impact"],
                    difficulty: difficulty
                },
                {
                    text: `How do you handle error handling and logging in a typical ${role} application?`,
                    type: "technical",
                    expected_points: ["Try-catch blocks", "Logging levels", "Monitoring tools"],
                    difficulty: difficulty
                },
                {
                    text: "Describe a situation where you had to resolve a conflict within your team.",
                    type: "behavioral",
                    expected_points: ["Situation", "Communication", "Resolution"],
                    difficulty: difficulty
                },
                {
                    text: `What are the best practices for optimization in ${domain}?`,
                    type: "technical",
                    expected_points: ["Performance metrics", "Caching", "Code optimization"],
                    difficulty: difficulty
                }
            ].slice(0, num_questions || 5)
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
