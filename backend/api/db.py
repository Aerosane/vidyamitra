"""Supabase client for VidyaMitra API"""

import json
from datetime import datetime, timezone
from functools import lru_cache
from typing import Any

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    Client = None

from config import settings


@lru_cache
def get_supabase() -> Client | None:
    """Get Supabase client (cached singleton)"""
    if not SUPABASE_AVAILABLE:
        print("[DB] Supabase library not installed")
        return None
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        print("[DB] Supabase credentials not configured")
        return None
    try:
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        print("[DB] Supabase client initialized")
        return client
    except Exception as e:
        print(f"[DB] Failed to create Supabase client: {e}")
        return None


def _get_client() -> Client | None:
    """Get the Supabase client"""
    return get_supabase()


def _now() -> str:
    """Get current UTC timestamp as ISO string"""
    return datetime.now(timezone.utc).isoformat()


# ═══════════════════════════════════════════════════════════════
# USER OPERATIONS
# ═══════════════════════════════════════════════════════════════

async def get_user(clerk_id: str) -> dict | None:
    """Get user by clerk_id (from Clerk auth)"""
    client = _get_client()
    if not client:
        return None
    try:
        result = client.table("users").select("*").eq("clerk_id", clerk_id).single().execute()
        return result.data
    except Exception as e:
        print(f"[DB] get_user error: {e}")
        return None


async def upsert_user(clerk_id: str, email: str = None, full_name: str = None) -> dict | None:
    """Create or update user - matches Supabase schema"""
    client = _get_client()
    if not client:
        return None
    try:
        # Check if user exists
        existing = client.table("users").select("id").eq("clerk_id", clerk_id).execute()
        if existing.data:
            # Update existing
            data = {"clerk_id": clerk_id}
            if email:
                data["email"] = email
            if full_name:
                data["full_name"] = full_name
            result = client.table("users").update(data).eq("clerk_id", clerk_id).execute()
        else:
            # Insert new
            data = {"clerk_id": clerk_id}
            if email:
                data["email"] = email
            if full_name:
                data["full_name"] = full_name
            result = client.table("users").insert(data).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"[DB] upsert_user error: {e}")
        return None


async def ensure_user(clerk_id: str, email: str = None, full_name: str = None) -> str:
    """Ensure user exists, create if not. Returns clerk_id for use as user_id in other tables."""
    client = _get_client()
    if not client:
        return clerk_id  # Return as-is if no DB
    try:
        existing = client.table("users").select("clerk_id").eq("clerk_id", clerk_id).execute()
        if not existing.data:
            data = {"clerk_id": clerk_id}
            if email:
                data["email"] = email
            if full_name:
                data["full_name"] = full_name
            client.table("users").insert(data).execute()
        return clerk_id
    except Exception as e:
        print(f"[DB] ensure_user error: {e}")
        return clerk_id


# ═══════════════════════════════════════════════════════════════
# RESUME OPERATIONS
# ═══════════════════════════════════════════════════════════════

async def save_resume(user_id: str, file_url: str = None, resume_text: str = None, 
                      target_role: str = None, analysis: dict = None) -> dict:
    """Save resume analysis - matches Supabase schema"""
    client = _get_client()
    if not client:
        return {"id": "mock-no-db"}
    try:
        data = {
            "user_id": user_id,
            "file_url": file_url,
            "resume_text": resume_text,
            "target_role": target_role,
            "analysis_json": analysis,
            "analysis_score": analysis.get("score", 0) if analysis else None,
            "analysis_grade": analysis.get("grade") if analysis else None,
        }
        # Remove None values
        data = {k: v for k, v in data.items() if v is not None}
        result = client.table("resumes").insert(data).execute()
        return result.data[0] if result.data else {"id": "mock-no-db"}
    except Exception as e:
        print(f"[DB] save_resume error: {e}")
        return {"id": "mock-no-db"}


async def get_resumes(user_id: str) -> list:
    """Get all resumes for a user"""
    client = _get_client()
    if not client:
        return []
    try:
        result = client.table("resumes").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data or []
    except Exception as e:
        print(f"[DB] get_resumes error: {e}")
        return []


async def get_resume(resume_id: str) -> dict | None:
    """Get a single resume by ID"""
    client = _get_client()
    if not client:
        return None
    try:
        result = client.table("resumes").select("*").eq("id", resume_id).single().execute()
        return result.data
    except Exception as e:
        print(f"[DB] get_resume error: {e}")
        return None


# ═══════════════════════════════════════════════════════════════
# INTERVIEW OPERATIONS
# ═══════════════════════════════════════════════════════════════

async def save_interview(user_id: str, domain: str, role: str, difficulty: str = "medium") -> dict:
    """Save a new interview session - matches Supabase schema"""
    client = _get_client()
    if not client:
        return {"id": "mock-no-db"}
    try:
        data = {
            "user_id": user_id,
            "domain": domain,
            "role": role,
            "difficulty": difficulty,
            "status": "in_progress"
        }
        result = client.table("interviews").insert(data).execute()
        return result.data[0] if result.data else {"id": "mock-no-db"}
    except Exception as e:
        print(f"[DB] save_interview error: {e}")
        return {"id": "mock-no-db"}


async def update_interview(interview_id: str, status: str = "completed") -> dict:
    """Update interview status - matches Supabase schema"""
    client = _get_client()
    if not client:
        return {"id": interview_id}
    try:
        data = {"status": status}
        result = client.table("interviews").update(data).eq("id", interview_id).execute()
        return result.data[0] if result.data else {"id": interview_id}
    except Exception as e:
        print(f"[DB] update_interview error: {e}")
        return {"id": interview_id}


async def get_interviews(user_id: str) -> list:
    """Get all interviews for a user"""
    client = _get_client()
    if not client:
        return []
    try:
        result = client.table("interviews").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data or []
    except Exception as e:
        print(f"[DB] get_interviews error: {e}")
        return []


async def get_interview(interview_id: str) -> dict | None:
    """Get a single interview by ID"""
    client = _get_client()
    if not client:
        return None
    try:
        result = client.table("interviews").select("*").eq("id", interview_id).single().execute()
        return result.data
    except Exception as e:
        print(f"[DB] get_interview error: {e}")
        return None


# ═══════════════════════════════════════════════════════════════
# LEARNING PLAN OPERATIONS
# ═══════════════════════════════════════════════════════════════

async def save_learning_plan(user_id: str, target_role: str, plan: dict) -> dict:
    """Save a new learning plan - matches Supabase schema"""
    client = _get_client()
    if not client:
        return {"id": "mock-no-db"}
    try:
        data = {
            "user_id": user_id,
            "target_role": target_role,
            "plan_json": plan
        }
        result = client.table("learning_plans").insert(data).execute()
        return result.data[0] if result.data else {"id": "mock-no-db"}
    except Exception as e:
        print(f"[DB] save_learning_plan error: {e}")
        return {"id": "mock-no-db"}


async def update_learning_progress(plan_id: str, plan_json: dict) -> dict:
    """Update learning plan - matches Supabase schema"""
    client = _get_client()
    if not client:
        return {"id": plan_id}
    try:
        data = {"plan_json": plan_json}
        result = client.table("learning_plans").update(data).eq("id", plan_id).execute()
        return result.data[0] if result.data else {"id": plan_id}
    except Exception as e:
        print(f"[DB] update_learning_progress error: {e}")
        return {"id": plan_id}


async def get_learning_plans(user_id: str) -> list:
    """Get all learning plans for a user"""
    client = _get_client()
    if not client:
        return []
    try:
        result = client.table("learning_plans").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data or []
    except Exception as e:
        print(f"[DB] get_learning_plans error: {e}")
        return []


# ═══════════════════════════════════════════════════════════════
# QUIZ OPERATIONS
# ═══════════════════════════════════════════════════════════════

async def save_quiz(user_id: str, skill: str, difficulty: str, questions: list) -> dict:
    """Save quiz - matches Supabase schema"""
    client = _get_client()
    if not client:
        return {"id": "mock-no-db"}
    try:
        data = {
            "user_id": user_id,
            "skill": skill,
            "difficulty": difficulty,
            "questions_json": questions
        }
        result = client.table("quizzes").insert(data).execute()
        return result.data[0] if result.data else {"id": "mock-no-db"}
    except Exception as e:
        print(f"[DB] save_quiz error: {e}")
        return {"id": "mock-no-db"}


async def get_quizzes(user_id: str) -> list:
    """Get all quizzes for a user"""
    client = _get_client()
    if not client:
        return []
    try:
        result = client.table("quizzes").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data or []
    except Exception as e:
        print(f"[DB] get_quizzes error: {e}")
        return []


# ═══════════════════════════════════════════════════════════════
# JOB SEARCH OPERATIONS
# ═══════════════════════════════════════════════════════════════

async def save_job_search(user_id: str, skills: list, role: str, results: list) -> dict:
    """Save job search results"""
    client = _get_client()
    if not client:
        return {"id": "mock-no-db"}
    try:
        data = {
            "user_id": user_id,
            "skills": skills,
            "role": role,
            "results": results,
            "created_at": _now()
        }
        result = client.table("job_searches").insert(data).execute()
        return result.data[0] if result.data else {"id": "mock-no-db"}
    except Exception as e:
        print(f"[DB] save_job_search error: {e}")
        return {"id": "mock-no-db"}


async def get_job_searches(user_id: str) -> list:
    """Get job search history for a user"""
    client = _get_client()
    if not client:
        return []
    try:
        result = client.table("job_searches").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data or []
    except Exception as e:
        print(f"[DB] get_job_searches error: {e}")
        return []


# ═══════════════════════════════════════════════════════════════
# DASHBOARD / STATS OPERATIONS
# ═══════════════════════════════════════════════════════════════

async def get_user_stats(user_id: str) -> dict:
    """Get aggregated stats for user dashboard - matches Supabase schema"""
    client = _get_client()
    if not client:
        return {
            "skills_assessed": 0,
            "achievements": 0,
            "profile_score": 0,
            "streak_days": 0,
            "interviews_completed": 0,
            "resumes_analyzed": 0
        }
    try:
        # Get counts from each table
        quizzes = client.table("quizzes").select("id", count="exact").eq("user_id", user_id).execute()
        interviews = client.table("interviews").select("id", count="exact").eq("user_id", user_id).eq("status", "completed").execute()
        resumes = client.table("resumes").select("id, analysis_score", count="exact").eq("user_id", user_id).execute()
        learning = client.table("learning_plans").select("id", count="exact").eq("user_id", user_id).execute()

        # Calculate profile score from latest resume (analysis_score column)
        profile_score = 0
        if resumes.data:
            scores = [r.get("analysis_score", 0) or 0 for r in resumes.data]
            profile_score = max(scores) if scores else 0

        return {
            "skills_assessed": quizzes.count or 0,
            "achievements": (interviews.count or 0) + (learning.count or 0),
            "profile_score": profile_score,
            "streak_days": 0,  # TODO: Implement streak tracking
            "interviews_completed": interviews.count or 0,
            "resumes_analyzed": resumes.count or 0
        }
    except Exception as e:
        print(f"[DB] get_user_stats error: {e}")
        return {
            "skills_assessed": 0,
            "achievements": 0,
            "profile_score": 0,
            "streak_days": 0,
            "interviews_completed": 0,
            "resumes_analyzed": 0
        }
