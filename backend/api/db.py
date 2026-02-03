"""Supabase client - optional dependency"""

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    Client = None

from functools import lru_cache
from config import settings

@lru_cache
def get_supabase():
    if not SUPABASE_AVAILABLE:
        return None
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        return None
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

supabase = None

def _get_client():
    global supabase
    if supabase is None:
        supabase = get_supabase()
    return supabase

# Stub functions that work without DB
async def get_user(user_id: str): return None
async def upsert_user(user_data: dict): return None
async def save_resume(user_id: str, file_id: str, analysis: dict): return {"id": "mock-no-db"}
async def get_resumes(user_id: str): return []
async def save_interview(user_id: str, domain: str, role: str, questions: list): return {"id": "mock-no-db"}
async def update_interview(interview_id: str, answers: list, score: int): return {"id": interview_id}
async def get_interviews(user_id: str): return []
async def save_learning_plan(user_id: str, gaps: list, plan: list): return {"id": "mock-no-db"}
async def update_learning_progress(plan_id: str, progress: dict): return {"id": plan_id}
async def save_quiz(user_id: str, skill: str, questions: list, answers: list, result_data: dict): return {"id": "mock-no-db"}
async def save_job_search(user_id: str, skills: list, role: str, results: list): return {"id": "mock-no-db"}
