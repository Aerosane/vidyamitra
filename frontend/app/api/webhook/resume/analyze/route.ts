import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user_id, data } = body;

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));

        return NextResponse.json({
            status: "ok",
            analysis: {
                score: 72,
                grade: "B",
                summary: "Strong technical background with solid experience in backend development. The resume clearly outlines key skills such as Python and API development, but could benefit from more quantifiable achievements.",
                categories: {
                    format: 15,
                    experience: 20,
                    skills: 22,
                    education: 10,
                    achievements: 5
                },
                strengths: ["Python expertise", "Leadership experience", "Clear career progression"],
                improvements: ["Add metrics to achievements (e.g., 'improved performance by 20%')", "Include relevant certifications", "Tailor summary to specific job roles"],
                keywords_missing: ["AWS", "Kubernetes", "CI/CD", "Docker"],
                market_readiness: "medium"
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
