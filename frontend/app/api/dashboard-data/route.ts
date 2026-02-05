import { NextResponse } from 'next/server';

export async function POST() {
    // Return random stats for the dashboard
    return NextResponse.json({
        stats: {
            skillsAssessed: Math.floor(Math.random() * 20) + 5,
            achievements: Math.floor(Math.random() * 10) + 2,
            profileScore: Math.floor(Math.random() * 30) + 60, // 60-90
            streakDays: Math.floor(Math.random() * 15) + 1
        }
    });
}
