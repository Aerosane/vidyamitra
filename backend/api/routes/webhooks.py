"""n8n Webhook routes for VidyaMitra API"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import llm
import db

router = APIRouter(prefix="/webhook", tags=["n8n"])


class N8nPayload(BaseModel):
    user_id: str
    data: dict


class JobStatusResponse(BaseModel):
    id: str
    status: str
    result: dict | None = None


# ═══════════════════════════════════════════════════════════════
# RESUME WEBHOOKS
# ═══════════════════════════════════════════════════════════════

@router.post("/resume/analyze")
async def n8n_analyze_resume(payload: N8nPayload):
    """Analyze and score a resume with detailed feedback"""
    
    resume_text = payload.data.get("resume_text", "")
    target_role = payload.data.get("target_role", "")
    
    if not resume_text:
        raise HTTPException(status_code=400, detail="resume_text required")
    
    analysis = await llm.analyze_resume(resume_text, target_role)
    
    saved = await db.save_resume(
        user_id=payload.user_id,
        file_id=payload.data.get("file_id", ""),
        analysis=analysis
    )
    
    return {
        "status": "ok",
        "analysis": analysis,
        "resume_id": saved.get("id") if saved else None
    }


@router.post("/resume/enhance")
async def n8n_enhance_resume(payload: N8nPayload):
    """Enhance/improve an existing resume"""
    
    resume_text = payload.data.get("resume_text", "")
    target_role = payload.data.get("target_role", "")
    focus_areas = payload.data.get("focus_areas", [])
    
    if not resume_text:
        raise HTTPException(status_code=400, detail="resume_text required")
    
    enhanced = await llm.enhance_resume(resume_text, target_role, focus_areas)
    
    return {
        "status": "ok",
        "enhanced": enhanced
    }


@router.post("/resume")
async def n8n_resume(payload: N8nPayload):
    """n8n triggers this after uploading resume to GDrive (legacy endpoint)"""
    
    analysis = await llm.analyze_resume(
        payload.data.get("resume_text", ""),
        payload.data.get("target_role", "")
    )
    
    saved = await db.save_resume(
        user_id=payload.user_id,
        file_id=payload.data.get("file_id", ""),
        analysis=analysis
    )
    
    return {"status": "ok", "analysis": analysis, "resume_id": saved.get("id") if saved else None}


@router.post("/resume/generate")
async def n8n_generate_resume(payload: N8nPayload):
    """Generate professional resume from structured data"""
    
    resume_md = await llm.generate_resume(
        data=payload.data,
        target_role=payload.data.get("target_role", "")
    )
    
    return {"status": "ok", "resume": resume_md, "format": "markdown"}


# ═══════════════════════════════════════════════════════════════
# INTERVIEW WEBHOOKS
# ═══════════════════════════════════════════════════════════════

@router.post("/interview/start")
async def n8n_start_interview(payload: N8nPayload):
    """Start a new interview session"""
    
    domain = payload.data.get("domain", "technology")
    role = payload.data.get("role", "Software Engineer")
    count = payload.data.get("question_count", 5)
    
    questions = await llm.generate_questions(domain, role, count)
    
    saved = await db.save_interview(
        user_id=payload.user_id,
        domain=domain,
        role=role,
        questions=questions
    )
    
    return {
        "status": "ok",
        "interview_id": saved.get("id") if saved else None,
        "questions": questions
    }


@router.post("/interview/evaluate")
async def n8n_evaluate_answer(payload: N8nPayload):
    """Evaluate an interview answer"""
    
    question = payload.data.get("question", "")
    answer = payload.data.get("answer", "")
    expected_points = payload.data.get("expected_points", [])
    
    evaluation = await llm.evaluate_answer(question, answer, expected_points)
    
    return {"status": "ok", "evaluation": evaluation}


@router.post("/interview/complete")
async def n8n_complete_interview(payload: N8nPayload):
    """Complete interview and calculate final score"""
    
    interview_id = payload.data.get("interview_id")
    answers = payload.data.get("answers", [])
    
    if not interview_id:
        raise HTTPException(status_code=400, detail="interview_id required")
    
    # Calculate average score from evaluations
    total_score = sum(a.get("score", 0) for a in answers) // len(answers) if answers else 0
    
    saved = await db.update_interview(
        interview_id=interview_id,
        answers=answers,
        score=total_score
    )
    
    return {"status": "ok", "final_score": total_score, "interview": saved}


# ═══════════════════════════════════════════════════════════════
# LEARNING PLAN WEBHOOKS
# ═══════════════════════════════════════════════════════════════

@router.post("/learning/generate")
async def n8n_generate_learning(payload: N8nPayload):
    """Generate learning plan for skill gaps"""
    
    gaps = payload.data.get("gaps", [])
    role = payload.data.get("role", "Software Engineer")
    
    if not gaps:
        raise HTTPException(status_code=400, detail="gaps list required")
    
    plan = await llm.generate_learning_plan(gaps, role)
    
    saved = await db.save_learning_plan(
        user_id=payload.user_id,
        gaps=gaps,
        plan=plan
    )
    
    return {
        "status": "ok",
        "plan_id": saved.get("id") if saved else None,
        "plan": plan
    }


@router.patch("/learning/{plan_id}/progress")
async def n8n_update_progress(plan_id: str, payload: N8nPayload):
    """Update learning plan progress"""
    
    progress = payload.data.get("progress", {})
    
    saved = await db.update_learning_progress(plan_id, progress)
    
    return {"status": "ok", "plan": saved}


# ═══════════════════════════════════════════════════════════════
# QUIZ WEBHOOKS
# ═══════════════════════════════════════════════════════════════

@router.post("/quiz/generate")
async def n8n_generate_quiz(payload: N8nPayload):
    """Generate quiz for a skill"""
    
    skill = payload.data.get("skill", "")
    count = payload.data.get("count", 5)
    difficulty = payload.data.get("difficulty", "medium")
    
    if not skill:
        raise HTTPException(status_code=400, detail="skill required")
    
    questions = await llm.generate_quiz(skill, count, difficulty)
    
    return {"status": "ok", "skill": skill, "questions": questions}


@router.post("/quiz/evaluate")
async def n8n_evaluate_quiz(payload: N8nPayload):
    """Evaluate quiz answers"""
    
    questions = payload.data.get("questions", [])
    answers = payload.data.get("answers", [])
    skill = payload.data.get("skill", "")
    
    result = llm.evaluate_quiz(questions, answers)
    
    saved = await db.save_quiz(
        user_id=payload.user_id,
        skill=skill,
        questions=questions,
        answers=answers,
        result_data=result
    )
    
    return {"status": "ok", "result": result, "quiz_id": saved.get("id") if saved else None}


# ═══════════════════════════════════════════════════════════════
# JOB WEBHOOKS
# ═══════════════════════════════════════════════════════════════

@router.post("/jobs/recommend")
async def n8n_recommend_jobs(payload: N8nPayload):
    """Get job recommendations based on skills"""
    
    skills = payload.data.get("skills", [])
    role = payload.data.get("role", "")
    location = payload.data.get("location", "")
    
    if not skills:
        raise HTTPException(status_code=400, detail="skills list required")
    
    jobs = await llm.get_job_recommendations(skills, role, location)
    
    saved = await db.save_job_search(
        user_id=payload.user_id,
        skills=skills,
        role=role,
        results=jobs
    )
    
    return {"status": "ok", "jobs": jobs, "search_id": saved.get("id") if saved else None}


# ═══════════════════════════════════════════════════════════════
# VOICE INTERVIEW WEBHOOK
# ═══════════════════════════════════════════════════════════════

@router.post("/voice/process")
async def n8n_voice_process(payload: N8nPayload):
    """Process voice interview turn (text from STT)"""
    
    transcript = payload.data.get("transcript", "")
    question = payload.data.get("current_question") or payload.data.get("question", "")
    ctx = payload.data.get("context")
    
    # Handle context as string or dict
    if isinstance(ctx, str):
        context = {"context": ctx}
    elif isinstance(ctx, dict):
        context = ctx
    else:
        context = {}
    
    if not transcript:
        return {"status": "error", "message": "No transcript provided"}
    
    if not question:
        question = context.get("context", "general interview question")
    
    try:
        evaluation = await llm.evaluate_answer(question, transcript)
    except Exception as e:
        evaluation = {"score": 50, "grade": "C", "feedback": "Response noted.", "strengths": [], "improvements": []}
    
    is_last = context.get("question_index", 0) >= context.get("total_questions", 5) - 1
    
    if is_last:
        response_text = f"Thank you. {evaluation.get('feedback', '')} Interview complete."
    else:
        next_q = context.get("next_question", "Tell me more about your experience.")
        response_text = f"{evaluation.get('feedback', '')} Next: {next_q}"
    
    return {
        "status": "ok",
        "evaluation": evaluation,
        "response_text": response_text,
        "is_complete": is_last
    }
