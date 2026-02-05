import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user_id, data } = body;
        const { personal_info, summary, experience, education, skills, certifications } = data;

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Construct a mock resume based on input
        const generatedResume = `# ${personal_info.name}\n\n**${data.target_role || 'Professional'}**\n\n${personal_info.email} | ${personal_info.phone} | ${personal_info.location}\n${personal_info.linkedin}\n\n## Professional Summary\n${summary}\n\n## Experience\n${experience.map((exp: any) => `\n**${exp.title} | ${exp.company}**\n*${exp.duration}*\n${exp.highlights.map((h: string) => `- ${h}`).join('\n')}`).join('\n')}\n\n## Education\n${education.map((edu: any) => `\n**${edu.degree}**\n${edu.institution}, ${edu.year}`).join('\n')}\n\n## Skills\n${skills.join(', ')}\n\n## Certifications\n${certifications.join(', ')}`;

        return NextResponse.json({
            status: "ok",
            resume: generatedResume
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
