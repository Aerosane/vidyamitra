"""Interview routes for VidyaMitra API"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_user
import llm
import db

router = APIRouter(prefix="/interview", tags=["interview"])


class StartInterviewRequest(BaseModel):
    domain: str = "technology"
    role: str = "Software Engineer"
    question_count: int = 5


class EvaluateAnswerRequest(BaseModel):
    question: str
    answer: str
    expected_points: list = []


class CompleteInterviewRequest(BaseModel):
    interview_id: str
    answers: list


@router.post("/start")
async def start_interview(
    request: StartInterviewRequest,
    user: dict = Depends(get_current_user)
):
    """Start a new interview session"""
    
    questions = await llm.generate_questions(
        domain=request.domain,
        role=request.role,
        count=request.question_count
    )
    
    saved = await db.save_interview(
        user_id=user["user_id"],
        domain=request.domain,
        role=request.role
    )
    
    return {
        "interview_id": saved.get("id") if saved else None,
        "questions": questions
    }


@router.post("/evaluate")
async def evaluate_answer(
    request: EvaluateAnswerRequest,
    user: dict = Depends(get_current_user)
):
    """Evaluate a single interview answer"""
    
    evaluation = await llm.evaluate_answer(
        question=request.question,
        answer=request.answer,
        expected_points=request.expected_points
    )
    
    return {"evaluation": evaluation}


@router.post("/complete")
async def complete_interview(
    request: CompleteInterviewRequest,
    user: dict = Depends(get_current_user)
):
    """Complete interview and get final score"""
    
    if not request.answers:
        raise HTTPException(status_code=400, detail="answers required")
    
    total_score = sum(a.get("score", 0) for a in request.answers) // len(request.answers)
    
    saved = await db.update_interview(
        interview_id=request.interview_id,
        status="completed"
    )
    
    return {
        "final_score": total_score,
        "interview": saved
    }


@router.get("/")
async def list_interviews(user: dict = Depends(get_current_user)):
    """Get all interviews for current user"""
    
    interviews = await db.get_interviews(user["user_id"])
    return {"interviews": interviews}


@router.get("/{interview_id}")
async def get_interview(interview_id: str, user: dict = Depends(get_current_user)):
    """Get specific interview by ID"""
    
    interviews = await db.get_interviews(user["user_id"])
    interview = next((i for i in interviews if i["id"] == interview_id), None)
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    return interview


# ═══════════════════════════════════════════════════════════════
# VOICE INTERVIEW ENDPOINTS
# ═══════════════════════════════════════════════════════════════

class VoiceProcessRequest(BaseModel):
    transcript: str
    current_question: str
    question_index: int = 0
    total_questions: int = 5
    next_question: str | None = None


@router.post("/voice/process")
async def voice_process(
    request: VoiceProcessRequest,
    user: dict = Depends(get_current_user)
):
    """Process voice interview turn (STT text → LLM → TTS text)"""
    
    evaluation = await llm.evaluate_answer(
        question=request.current_question,
        answer=request.transcript
    )
    
    is_last = request.question_index >= request.total_questions - 1
    
    if is_last:
        response_text = f"Thank you for your response. {evaluation.get('feedback', '')} That concludes our interview."
    else:
        next_q = request.next_question or "Tell me more about your experience."
        response_text = f"{evaluation.get('feedback', '')} Next question: {next_q}"
    
    return {
        "evaluation": evaluation,
        "response_text": response_text,
        "is_complete": is_last
    }
