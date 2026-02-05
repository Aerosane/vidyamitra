import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user_id, data } = body;
        const { skills, target_role, location } = data;

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1200));

        return NextResponse.json({
            status: "ok",
            jobs: [
                {
                    title: "Senior Backend Engineer",
                    match_percent: 92,
                    skills_matched: ["Python", "Docker", "PostgreSQL"],
                    skills_to_learn: ["Kubernetes", "Redis"],
                    salary_range_usd: "$120,000 - $160,000",
                    growth_outlook: "strong",
                    location: "Remote",
                    company: "TechSolutions Inc."
                },
                {
                    title: "Python Developer",
                    match_percent: 85,
                    skills_matched: ["Python", "Django"],
                    skills_to_learn: ["FastAPI", "AWS"],
                    salary_range_usd: "$95,000 - $130,000",
                    growth_outlook: "moderate",
                    location: location || "San Francisco, CA",
                    company: "StartUp Galaxy"
                },
                {
                    title: "DevOps Engineer",
                    match_percent: 78,
                    skills_matched: ["Docker", "Linux"],
                    skills_to_learn: ["Terraform", "Jenkins", "AWS"],
                    salary_range_usd: "$110,000 - $150,000",
                    growth_outlook: "high",
                    location: "New York, NY",
                    company: "CloudSystems"
                }
            ]
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
