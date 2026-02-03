"""Routes package for VidyaMitra API"""

from fastapi import APIRouter

from routes.webhooks import router as webhooks_router
from routes.resume import router as resume_router
from routes.interview import router as interview_router
from routes.learning import router as learning_router
from routes.quiz import router as quiz_router
from routes.jobs import router as jobs_router

# Create main API router
api_router = APIRouter()

# Include all route modules
api_router.include_router(webhooks_router)
api_router.include_router(resume_router)
api_router.include_router(interview_router)
api_router.include_router(learning_router)
api_router.include_router(quiz_router)
api_router.include_router(jobs_router)

__all__ = ["api_router"]
