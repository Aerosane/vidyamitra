"""GitHub Models LLM client - optimized for low memory"""

import json
from config import settings

ENDPOINT = f"https://models.github.ai/orgs/{settings.GITHUB_ORG}/inference/chat/completions"
HEADERS = {
    "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2024-12-01-preview",
}


async def chat(messages: list, model: str = None, max_tokens: int = 2048) -> str:
    """Chat completion using shared HTTP client"""
    from main import get_http_client
    client = get_http_client()
    
    if not client:
        import httpx
        async with httpx.AsyncClient(timeout=60) as c:
            res = await c.post(ENDPOINT, headers=HEADERS, json={
                "model": model or settings.LLM_MODEL,
                "messages": messages,
                "max_tokens": max_tokens
            })
            res.raise_for_status()
            return res.json()["choices"][0]["message"]["content"]
    
    res = await client.post(ENDPOINT, headers=HEADERS, json={
        "model": model or settings.LLM_MODEL,
        "messages": messages,
        "max_tokens": max_tokens
    })
    res.raise_for_status()
    return res.json()["choices"][0]["message"]["content"]


def _parse_json(text: str, fallback=None):
    """Parse JSON from LLM response, handling markdown blocks"""
    try:
        # Try direct parse first
        return json.loads(text.strip())
    except:
        pass
    
    try:
        # Handle ```json blocks
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        return json.loads(text.strip())
    except:
        pass
    
    try:
        # Find JSON array or object in text
        import re
        match = re.search(r'(\[[\s\S]*\]|\{[\s\S]*\})', text)
        if match:
            return json.loads(match.group(1))
    except:
        pass
    
    return fallback


# Market context - lazy loaded
_market_context_cache = {}

def _get_market_context(target_role: str = "") -> str:
    """Get job market context (cached)"""
    cache_key = target_role.lower()[:20]
    if cache_key in _market_context_cache:
        return _market_context_cache[cache_key]
    
    from job_market import JOB_MARKET_DATA, get_role_outlook
    role_outlook = get_role_outlook(target_role) if target_role else {}
    
    ctx = f"""
MARKET DATA (2025-2030):
- Hot Skills: {', '.join(s['skill'] for s in JOB_MARKET_DATA['top_skills_global'][:5])}
- Top Certs: {', '.join(c['name'] for c in JOB_MARKET_DATA['top_certifications'][:4])}
- Declining: {', '.join(j['role'] for j in JOB_MARKET_DATA['declining_roles'][:3])}
- Role: {role_outlook.get('outlook', 'stable')}
"""
    _market_context_cache[cache_key] = ctx
    return ctx


RESUME_ANALYSIS_PROMPT = """Expert ATS analyzer. Score resumes on: Contact(10), Summary(15), Experience(30), Skills(15), Education(10), ATS(10), Impact(10). Consider hot/outdated skills."""

async def analyze_resume(text: str, target_role: str = "") -> dict:
    """Analyze resume with scoring + market context"""
    prompt = f"""{_get_market_context(target_role)}
{"Target: " + target_role if target_role else ""}
Return JSON: {{"score":0-100,"grade":"A-F","summary":"...","skills_found":[],"skills_hot":[],"skills_outdated":[],"gaps":[],"improvements":[{{"priority":"high","issue":"...","fix":"..."}}],"certifications_recommended":[],"market_readiness":"high|medium|low","career_trajectory":"growing|stable|at_risk"}}

Resume:
{text[:4000]}"""

    result = await chat([
        {"role": "system", "content": RESUME_ANALYSIS_PROMPT},
        {"role": "user", "content": prompt}
    ], max_tokens=1500)
    
    return _parse_json(result) or {"score": 50, "grade": "C", "summary": "Parse error", "skills_found": [], "gaps": []}


async def enhance_resume(text: str, target_role: str = "", focus_areas: list = None) -> dict:
    """Enhance resume for market competitiveness"""
    focus = ", ".join(focus_areas) if focus_areas else "ATS optimization"
    
    prompt = f"""{_get_market_context(target_role)}
Enhance for: {focus}. Target: {target_role or "general"}
Return JSON: {{"enhanced_resume":"markdown","changes_made":[{{"section":"...","before":"...","after":"..."}}],"score_before":0,"score_after":0,"market_readiness_before":"low","market_readiness_after":"high"}}

Resume:
{text[:4000]}"""

    result = await chat([
        {"role": "system", "content": "Expert resume writer. Use action verbs, quantify achievements, add hot skills."},
        {"role": "user", "content": prompt}
    ], max_tokens=2000)
    
    return _parse_json(result) or {"enhanced_resume": result, "changes_made": []}


RESUME_SYS = "Expert resume writer. ATS-friendly, action verbs, quantified achievements, hot skills: AI/ML, Cloud, Data."


async def generate_resume(data: dict, target_role: str = "") -> str:
    """Generate resume from user data"""
    d = data
    prompt = f"""{_get_market_context(target_role)}
Create markdown resume:
Name: {d.get('name')} | {d.get('email')} | {d.get('phone')} | {d.get('location')}
Experience: {_format_experience(d.get('experience', []))}
Education: {_format_education(d.get('education', []))}
Skills: {', '.join(d.get('technical_skills', []))}
Target: {target_role or 'general'}"""

    return await chat([
        {"role": "system", "content": RESUME_SYS},
        {"role": "user", "content": prompt}
    ], max_tokens=1500)


def _format_experience(exp: list) -> str:
    if not exp: return "None"
    return "; ".join(f"{e.get('title')} at {e.get('company')} ({e.get('duration')})" for e in exp[:5])


def _format_education(edu: list) -> str:
    if not edu: return "None"
    return "; ".join(f"{e.get('degree')} in {e.get('field')} from {e.get('institution')}" for e in edu[:3])


# ═══════════════════════════════════════════════════════════════
# INTERVIEW FUNCTIONS
# ═══════════════════════════════════════════════════════════════

INTERVIEW_SYS = "Senior interviewer. Test theory + practice. STAR for behavioral. Easy→hard progression."

async def generate_questions(domain: str, role: str, count: int = 5, difficulty_mix: bool = True) -> list:
    """Generate interview questions"""
    prompt = f"""Generate {count} interview questions for {role} in {domain}.
Return JSON: [{{"text":"...","type":"technical|behavioral","expected_points":[],"difficulty":"easy|medium|hard"}}]"""

    result = await chat([
        {"role": "system", "content": INTERVIEW_SYS},
        {"role": "user", "content": prompt}
    ], max_tokens=1000)
    return _parse_json(result) or [{"text": "Tell me about yourself", "expected_points": [], "difficulty": "easy", "type": "behavioral"}]


async def evaluate_answer(question: str, answer: str, expected_points: list = None) -> dict:
    """Evaluate interview answer"""
    prompt = f"""Question: {question}
Expected: {', '.join(expected_points or [])}
Answer: {answer[:1500]}
Return JSON: {{"score":0-100,"grade":"A-F","feedback":"...","strengths":[],"improvements":[],"would_hire":bool}}"""

    result = await chat([
        {"role": "system", "content": "Fair interviewer. Score: relevance, depth, examples, communication."},
        {"role": "user", "content": prompt}
    ], max_tokens=500)
    return _parse_json(result) or {"score": 50, "grade": "C", "feedback": "Could not evaluate"}


async def generate_learning_plan(gaps: list, role: str, time_available: str = "2h/day") -> list:
    """Generate learning plan for skill gaps"""
    prompt = f"""Learning plan for: {', '.join(gaps[:5])}. Role: {role}
Return JSON: [{{"skill":"...","priority":"high|low","resources":[{{"title":"...","type":"course|video","platform":"..."}}]}}]"""

    result = await chat([{"role": "user", "content": prompt}], max_tokens=1000)
    return _parse_json(result) or []


async def generate_quiz(skill: str, count: int = 5, difficulty: str = "medium") -> list:
    """Generate quiz questions"""
    prompt = f"""Generate {count} MCQ for {skill} ({difficulty}).
Return JSON: [{{"question":"...","options":["A)...","B)...","C)...","D)..."],"correct":"A","explanation":"..."}}]"""

    result = await chat([
        {"role": "system", "content": "Educator. Test understanding, plausible wrong answers, code if relevant."},
        {"role": "user", "content": prompt}
    ], max_tokens=1000)
    return _parse_json(result) or []


def evaluate_quiz(questions: list, answers: list) -> dict:
    """Evaluate quiz answers (sync - no LLM needed)"""
    if not questions:
        return {"score": 0, "correct": 0, "total": 0, "passed": False, "feedback": "No questions"}
    
    correct = 0
    details = []
    
    for i, (q, a) in enumerate(zip(questions, answers)):
        is_correct = q.get("correct", "").upper() == str(a).upper()
        if is_correct:
            correct += 1
        details.append({
            "question": i + 1,
            "correct": is_correct,
            "your_answer": a,
            "correct_answer": q.get("correct"),
            "explanation": q.get("explanation", "")
        })
    
    score = int((correct / len(questions)) * 100)
    
    return {
        "score": score,
        "correct": correct,
        "total": len(questions),
        "passed": score >= 70,
        "feedback": "Great job!" if score >= 70 else "Keep practicing!",
        "details": details
    }


# ═══════════════════════════════════════════════════════════════
# JOB RECOMMENDATIONS
# ═══════════════════════════════════════════════════════════════

async def get_job_recommendations(skills: list, role: str, location: str = "") -> list:
    """Get job recommendations based on skills"""
    from job_market import get_skills_gap_analysis
    gap = get_skills_gap_analysis(skills, role)
    
    prompt = f"""Suggest 5 jobs for: {role}
Skills: {', '.join(skills[:8])}. Match: {gap['match_percent']}%
Return JSON: [{{"title":"...","match_percent":0-100,"skills_matched":[],"skills_to_learn":[],"salary_range_usd":"...","growth_outlook":"strong|moderate"}}]"""

    result = await chat([{"role": "user", "content": prompt}], max_tokens=800)
    return _parse_json(result) or []
