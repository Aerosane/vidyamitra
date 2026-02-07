"""Quiz routes for VidyaMitra API"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_user
import llm
import db

router = APIRouter(prefix="/quiz", tags=["quiz"])


class GenerateQuizRequest(BaseModel):
    skill: str
    count: int = 5
    difficulty: str = "medium"


class EvaluateQuizRequest(BaseModel):
    skill: str
    questions: list
    answers: list
    difficulty: str = "intermediate"


@router.post("/generate")
async def generate_quiz(
    request: GenerateQuizRequest,
    user: dict = Depends(get_current_user)
):
    """Generate quiz questions for a skill"""
    
    if not request.skill:
        raise HTTPException(status_code=400, detail="skill required")
    
    questions = await llm.generate_quiz(
        skill=request.skill,
        count=request.count,
        difficulty=request.difficulty
    )
    
    return {
        "skill": request.skill,
        "difficulty": request.difficulty,
        "questions": questions
    }


@router.post("/evaluate")
async def evaluate_quiz(
    request: EvaluateQuizRequest,
    user: dict = Depends(get_current_user)
):
    """Evaluate quiz answers and save result"""
    
    if len(request.questions) != len(request.answers):
        raise HTTPException(status_code=400, detail="questions and answers must have same length")
    
    result = llm.evaluate_quiz(request.questions, request.answers)
    
    # Merge answers into questions for storage
    questions_with_answers = []
    for i, q in enumerate(request.questions):
        q_copy = dict(q)
        q_copy["user_answer"] = request.answers[i] if i < len(request.answers) else None
        questions_with_answers.append(q_copy)

    saved = await db.save_quiz(
        user_id=user["user_id"],
        skill=request.skill,
        difficulty=request.difficulty,
        questions=questions_with_answers
    )
    
    return {
        "result": result,
        "quiz_id": saved.get("id") if saved else None
    }


@router.get("/history")
async def quiz_history(user: dict = Depends(get_current_user)):
    """Get quiz history for current user"""
    
    client = db._get_client()
    if not client:
        return {"quizzes": []}
    result = client.table("quizzes").select("*").eq(
        "user_id", user["user_id"]
    ).order("created_at", desc=True).execute()
    
    return {"quizzes": result.data}


@router.get("/{quiz_id}")
async def get_quiz(quiz_id: str, user: dict = Depends(get_current_user)):
    """Get specific quiz by ID"""
    
    client = db._get_client()
    if not client:
        raise HTTPException(status_code=404, detail="Quiz not found")
    result = client.table("quizzes").select("*").eq(
        "id", quiz_id
    ).eq("user_id", user["user_id"]).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    return result.data
