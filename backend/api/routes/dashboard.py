"""Dashboard routes for VidyaMitra API"""

from fastapi import APIRouter

import db

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats(user_id: str | None = None):
    """Get user dashboard stats (public for webhooks, uses user_id param)"""
    if not user_id:
        return {
            "stats": {
                "skills_assessed": 0,
                "achievements": 0,
                "profile_score": 0,
                "streak_days": 0,
                "interviews_completed": 0,
                "resumes_analyzed": 0
            }
        }

    stats = await db.get_user_stats(user_id)
    return {"stats": stats}


@router.get("/history/resumes")
async def get_resume_history(user_id: str):
    """Get user's resume analysis history"""
    resumes = await db.get_resumes(user_id)
    return {"resumes": resumes}


@router.get("/history/interviews")
async def get_interview_history(user_id: str):
    """Get user's interview history"""
    interviews = await db.get_interviews(user_id)
    return {"interviews": interviews}


@router.get("/history/quizzes")
async def get_quiz_history(user_id: str):
    """Get user's quiz history"""
    quizzes = await db.get_quizzes(user_id)
    return {"quizzes": quizzes}


@router.get("/history/learning")
async def get_learning_history(user_id: str):
    """Get user's learning plan history"""
    plans = await db.get_learning_plans(user_id)
    return {"learning_plans": plans}


@router.get("/history/jobs")
async def get_job_search_history(user_id: str):
    """Get user's job search history"""
    searches = await db.get_job_searches(user_id)
    return {"job_searches": searches}
