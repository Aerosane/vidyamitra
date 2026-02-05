import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { skills, target_role } = body;

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Basic mock logic: Check if user has "Python" or "React" to simulate matches
        const commonSkills = ["git", "communication", "problem solving", "agile"];
        const matched = skills.map((s: string) => s.toLowerCase());
        const missing = ["docker", "kubernetes", "aws", "graphql"].filter(s => !matched.includes(s));

        // Add target-specific missing skills
        if (target_role.toLowerCase().includes("python")) {
            if (!matched.includes("fastapi")) missing.push("fastapi");
            if (!matched.includes("django")) missing.push("django");
        }

        return NextResponse.json({
            target_role: target_role,
            skills_matched: matched,
            skills_missing: missing,
            match_percent: Math.floor(Math.random() * 40) + 30, // 30-70%
            priority_skills: missing.slice(0, 2)
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
