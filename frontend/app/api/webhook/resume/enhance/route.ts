import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user_id, data } = body;

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        const originalText = data.resume_text || "Resume content";

        return NextResponse.json({
            status: "ok",
            enhanced: {
                enhanced_resume: `## John Doe\n\n**Backend Developer**\n\nExperienced Python developer with a proven track record of building scalable web applications. Skilled in FastAPI, Django, and cloud technologies.\n\n### Experience\n\n**Senior Developer | TechCorp**\n*2021 - Present*\n- Architected and deployed high-performance REST APIs serving 1M+ daily requests, resulting in a 30% reduction in latency.\n- Led a cross-functional team of 4 developers, implementing agile best practices that increased sprint velocity by 15%.\n- Optimized database queries, reducing load times by 40% using advanced indexing strategies.\n\n### Skills\n- **Languages:** Python, JavaScript, SQL\n- **Frameworks:** FastAPI, Django, React\n- **Tools:** Docker, Git, AWS\n`,
                changes: [
                    "Rephrased summary to be more impact-oriented",
                    "Added strong action verbs (Architected, Led, Optimized)",
                    "Quantified achievements with specific metrics (30%, 15%, 40%)",
                    "Structured skills section for better readability"
                ],
                ats_score_before: 45,
                ats_score_after: 78
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
