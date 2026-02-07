"""n8n Webhook routes for VidyaMitra API

When USE_N8N=true, these endpoints proxy requests to n8n workflows.
When USE_N8N=false, they call GitHub Models directly via llm.py.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import llm
import db
import n8n_client
from config import settings

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
    
    # Ensure user exists in DB
    await db.ensure_user(payload.user_id)
    
    resume_text = payload.data.get("resume_text", "")
    target_role = payload.data.get("target_role", "")
    
    if not resume_text:
        raise HTTPException(status_code=400, detail="resume_text required")
    
    # Use n8n or direct LLM
    if settings.USE_N8N:
        result = await n8n_client.call_n8n("resume_analyze", payload.model_dump())
        if result.get("status") != "error":
            # n8n returns: { status, analysis: { score, grade, summary, strengths, improvements, missing_keywords } }
            analysis = result.get("analysis", {})
            # Save to DB
            saved = await db.save_resume(
                user_id=payload.user_id,
                resume_text=resume_text,
                target_role=target_role,
                analysis=analysis
            )
            return {
                "status": "ok",
                "analysis": analysis,
                "resume_id": saved.get("id") if saved else None
            }
        # Fallback to direct LLM
    
    analysis = await llm.analyze_resume(resume_text, target_role)
    
    saved = await db.save_resume(
        user_id=payload.user_id,
        resume_text=resume_text,
        target_role=target_role,
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
    
    # Ensure user exists in DB
    await db.ensure_user(payload.user_id)
    
    resume_text = payload.data.get("resume_text", "")
    target_role = payload.data.get("target_role", "")
    focus_areas = payload.data.get("focus_areas", [])
    
    if not resume_text:
        raise HTTPException(status_code=400, detail="resume_text required")
    
    # Use n8n or direct LLM
    if settings.USE_N8N:
        result = await n8n_client.call_n8n("resume_enhance", payload.model_dump())
        if result.get("status") != "error":
            return result
    
    enhanced = await llm.enhance_resume(resume_text, target_role, focus_areas)
    
    return {
        "status": "ok",
        "enhanced": enhanced
    }


@router.post("/resume")
async def n8n_resume(payload: N8nPayload):
    """n8n triggers this after uploading resume to GDrive (legacy endpoint)"""
    
    # Ensure user exists in DB
    await db.ensure_user(payload.user_id)
    
    analysis = await llm.analyze_resume(
        payload.data.get("resume_text", ""),
        payload.data.get("target_role", "")
    )
    
    saved = await db.save_resume(
        user_id=payload.user_id,
        resume_text=payload.data.get("resume_text", ""),
        target_role=payload.data.get("target_role", ""),
        analysis=analysis
    )
    
    return {"status": "ok", "analysis": analysis, "resume_id": saved.get("id") if saved else None}


@router.post("/resume/generate")
async def n8n_generate_resume(payload: N8nPayload):
    """Generate professional resume from structured data"""
    
    # Ensure user exists in DB
    await db.ensure_user(payload.user_id)
    
    # Use n8n or direct LLM
    if settings.USE_N8N:
        result = await n8n_client.call_n8n("resume_generate", payload.model_dump())
        if result.get("status") != "error":
            return result
    
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
    
    # Ensure user exists in DB
    await db.ensure_user(payload.user_id)
    
    domain = payload.data.get("domain", "technology")
    role = payload.data.get("role", "Software Engineer")
    count = payload.data.get("question_count", payload.data.get("num_questions", 5))
    difficulty = payload.data.get("difficulty", "intermediate")
    
    # Use n8n or direct LLM
    if settings.USE_N8N:
        result = await n8n_client.call_n8n("interview_start", payload.model_dump())
        if result.get("status") != "error":
            # Save to DB
            saved = await db.save_interview(
                user_id=payload.user_id,
                domain=domain,
                role=role,
                difficulty=difficulty
            )
            # Normalize n8n response format for frontend
            # n8n returns: { questions: [{ id, text, topic, key_concepts }] }
            # Frontend expects: { questions: [{ text/question, topic, key_concepts }] }
            questions = result.get("questions", [])
            normalized = []
            for q in questions:
                normalized.append({
                    "question": q.get("text", q.get("question", "")),
                    "text": q.get("text", q.get("question", "")),
                    "topic": q.get("topic", ""),
                    "key_concepts": q.get("key_concepts", [])
                })
            return {
                "status": "ok",
                "interview_id": saved.get("id") if saved else result.get("session_id"),
                "session_id": result.get("session_id"),
                "questions": normalized
            }
        # Fallback to direct LLM if n8n fails
    
    questions = await llm.generate_questions(domain, role, count)
    
    saved = await db.save_interview(
        user_id=payload.user_id,
        domain=domain,
        role=role,
        difficulty=difficulty
    )
    
    return {
        "status": "ok",
        "interview_id": saved.get("id") if saved else None,
        "questions": questions
    }


@router.post("/interview/evaluate")
async def n8n_evaluate_answer(payload: N8nPayload):
    """Evaluate an interview answer"""
    
    # Ensure user exists in DB
    await db.ensure_user(payload.user_id)
    
    question = payload.data.get("question", "")
    answer = payload.data.get("answer", "")
    expected_points = payload.data.get("expected_points", [])
    
    # Use n8n or direct LLM
    if settings.USE_N8N:
        result = await n8n_client.call_n8n("interview_evaluate", payload.model_dump())
        if result.get("status") != "error":
            return result
    
    evaluation = await llm.evaluate_answer(question, answer, expected_points)
    
    return {"status": "ok", "evaluation": evaluation}


@router.post("/interview/complete")
async def n8n_complete_interview(payload: N8nPayload):
    """Complete interview and calculate final score"""
    
    # Ensure user exists in DB
    await db.ensure_user(payload.user_id)
    
    interview_id = payload.data.get("interview_id")
    answers = payload.data.get("answers", [])
    
    if not interview_id:
        raise HTTPException(status_code=400, detail="interview_id required")
    
    # Calculate average score from evaluations
    total_score = sum(a.get("score", 0) for a in answers) // len(answers) if answers else 0
    
    saved = await db.update_interview(
        interview_id=interview_id,
        status="completed"
    )
    
    return {"status": "ok", "final_score": total_score, "interview": saved}


# ═══════════════════════════════════════════════════════════════
# LEARNING PLAN WEBHOOKS
# ═══════════════════════════════════════════════════════════════

@router.post("/learning/generate")
async def n8n_generate_learning(payload: N8nPayload):
    """Generate learning plan for skill gaps"""
    
    # Ensure user exists in DB
    await db.ensure_user(payload.user_id)
    
    gaps = payload.data.get("gaps", [])
    role = payload.data.get("role", payload.data.get("target_role", "Software Engineer"))
    
    if not gaps:
        raise HTTPException(status_code=400, detail="gaps list required")
    
    # Use n8n or direct LLM
    if settings.USE_N8N:
        # n8n expects: { data: { target_role, gaps } }
        n8n_payload = {
            "user_id": payload.user_id,
            "data": {
                "target_role": role,
                "gaps": ", ".join(gaps) if isinstance(gaps, list) else gaps
            }
        }
        result = await n8n_client.call_n8n("learning_generate", n8n_payload)
        if result.get("status") != "error":
            # Save to DB
            plan = result.get("plan", [])
            saved = await db.save_learning_plan(
                user_id=payload.user_id,
                target_role=role,
                plan={"gaps": gaps, "plan": plan}
            )
            return {
                "status": "ok",
                "plan_id": saved.get("id") if saved else result.get("plan_id"),
                "plan": plan
            }
    
    plan = await llm.generate_learning_plan(gaps, role)
    
    saved = await db.save_learning_plan(
        user_id=payload.user_id,
        target_role=role,
        plan={"gaps": gaps, "plan": plan}
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
    
    # Ensure user exists in DB
    await db.ensure_user(payload.user_id)
    
    skill = payload.data.get("skill", "")
    count = payload.data.get("count", payload.data.get("num_questions", 5))
    difficulty = payload.data.get("difficulty", "medium")
    
    if not skill:
        raise HTTPException(status_code=400, detail="skill required")
    
    # Use n8n or direct LLM
    if settings.USE_N8N:
        result = await n8n_client.call_n8n("quiz_generate", payload.model_dump())
        if result.get("status") != "error":
            # Normalize n8n response format for frontend
            # n8n returns: { questions: [{ id, text, options, correct_option, explanation }] }
            # Frontend expects: { questions: [{ question, options, correct, explanation }] }
            questions = result.get("questions", [])
            normalized = []
            for q in questions:
                normalized.append({
                    "question": q.get("text", q.get("question", "")),
                    "options": q.get("options", []),
                    "correct": _index_to_letter(q.get("correct_option")) if isinstance(q.get("correct_option"), int) else q.get("correct", "A"),
                    "explanation": q.get("explanation", "")
                })
            return {"status": "ok", "skill": skill, "questions": normalized, "quiz_id": result.get("quiz_id")}
        # Fallback to direct LLM if n8n fails
    
    questions = await llm.generate_quiz(skill, count, difficulty)
    
    return {"status": "ok", "skill": skill, "questions": questions}


def _index_to_letter(index: int) -> str:
    """Convert 0-based index to letter (0 -> A, 1 -> B, etc.)"""
    if index is None:
        return "A"
    return chr(65 + index) if 0 <= index <= 25 else "A"


@router.post("/quiz/evaluate")
async def n8n_evaluate_quiz(payload: N8nPayload):
    """Evaluate quiz answers"""
    
    # Ensure user exists in DB
    await db.ensure_user(payload.user_id)
    
    questions = payload.data.get("questions", [])
    answers = payload.data.get("answers", [])
    skill = payload.data.get("skill", "")
    difficulty = payload.data.get("difficulty", "intermediate")
    
    result = llm.evaluate_quiz(questions, answers)
    
    # Add answers and result to questions for storage
    questions_with_answers = []
    for i, q in enumerate(questions):
        q_copy = dict(q)
        q_copy["user_answer"] = answers[i] if i < len(answers) else None
        q_copy["evaluation"] = result.get("evaluations", [{}])[i] if i < len(result.get("evaluations", [])) else {}
        questions_with_answers.append(q_copy)
    
    saved = await db.save_quiz(
        user_id=payload.user_id,
        skill=skill,
        difficulty=difficulty,
        questions=questions_with_answers
    )
    
    return {"status": "ok", "result": result, "quiz_id": saved.get("id") if saved else None}


# ═══════════════════════════════════════════════════════════════
# JOB WEBHOOKS
# ═══════════════════════════════════════════════════════════════

@router.post("/jobs/recommend")
async def n8n_recommend_jobs(payload: N8nPayload):
    """Get job recommendations based on skills"""
    
    # Ensure user exists in DB
    await db.ensure_user(payload.user_id)
    
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
    
    # Ensure user exists in DB
    await db.ensure_user(payload.user_id)
    
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
