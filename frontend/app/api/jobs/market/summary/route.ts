import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        fastest_growing: [
            { role: "AI/ML Engineer", growth: "55%+", demand: "very_high" },
            { role: "Data Scientist", growth: "35%+", demand: "high" },
            { role: "Cloud Architect", growth: "40%+", demand: "very_high" }
        ],
        declining: [
            { role: "Data Entry Clerk", decline: "-30%", automation_risk: "very_high" },
            { role: "Telemarketer", decline: "-25%", automation_risk: "high" }
        ],
        hot_skills: ["AI/ML", "Cloud", "Cybersecurity", "DevOps", "Data Analysis"],
        outdated_skills: ["Flash", "Visual Basic", "COBOL (niche)", "jQuery (declining)"]
    });
}
