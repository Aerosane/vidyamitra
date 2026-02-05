import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user_id, data } = body;
        const { gaps, target_role } = data;

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        const plan = gaps.map((skill: string) => ({
            skill: skill,
            priority: "high",
            resources: [
                {
                    title: `Complete ${skill} Bootcamp`,
                    type: "course",
                    platform: "Udemy"
                },
                {
                    title: `${skill} Documentation & Best Practices`,
                    type: "documentation",
                    platform: "Official Docs"
                },
                {
                    title: `Build a project using ${skill}`,
                    type: "practice",
                    platform: "GitHub"
                }
            ]
        }));

        return NextResponse.json({
            status: "ok",
            plan_id: `plan_${Math.random().toString(36).substring(7)}`,
            plan: plan
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
