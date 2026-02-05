import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        technical_skills: [
            { skill: "AI/Machine Learning", demand: "critical", growth: "65%" },
            { skill: "Cloud Computing (AWS/Azure)", demand: "critical", growth: "45%" },
            { skill: "React / Next.js", demand: "high", growth: "30%" },
            { skill: "Python", demand: "very_high", growth: "25%" },
            { skill: "Cybersecurity", demand: "critical", growth: "40%" }
        ],
        soft_skills: [
            { skill: "Adaptability", demand: "high" },
            { skill: "Communication", demand: "high" },
            { skill: "Problem Solving", demand: "very_high" }
        ]
    });
}
