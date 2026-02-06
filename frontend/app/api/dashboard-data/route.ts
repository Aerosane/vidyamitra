import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user_id } = body;

        const response = await fetch(`${API_URL}/api/dashboard/stats?user_id=${user_id || ''}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[dashboard-data] Backend error:', error);
            // Return default stats on error
            return NextResponse.json({
                stats: {
                    skillsAssessed: 0,
                    achievements: 0,
                    profileScore: 0,
                    streakDays: 0
                }
            });
        }

        const data = await response.json();

        // Transform snake_case to camelCase for frontend
        return NextResponse.json({
            stats: {
                skillsAssessed: data.stats?.skills_assessed || 0,
                achievements: data.stats?.achievements || 0,
                profileScore: data.stats?.profile_score || 0,
                streakDays: data.stats?.streak_days || 0,
                interviewsCompleted: data.stats?.interviews_completed || 0,
                resumesAnalyzed: data.stats?.resumes_analyzed || 0
            }
        });
    } catch (error) {
        console.error('[dashboard-data] Error:', error);
        return NextResponse.json({
            stats: {
                skillsAssessed: 0,
                achievements: 0,
                profileScore: 0,
                streakDays: 0
            }
        });
    }
}
