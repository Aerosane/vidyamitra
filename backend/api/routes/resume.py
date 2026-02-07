"""Resume routes for VidyaMitra API"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_user
import llm
import db

router = APIRouter(prefix="/resume", tags=["resume"])


class ResumeAnalyzeRequest(BaseModel):
    resume_text: str
    file_id: str | None = None


class ResumeGenerateRequest(BaseModel):
    name: str
    email: str
    phone: str
    location: str
    linkedin: str | None = None
    portfolio: str | None = None
    summary: str | None = None
    experience: list = []
    education: list = []
    technical_skills: list = []
    soft_skills: list = []
    tools: list = []
    languages: list = []
    certifications: list = []
    projects: list = []
    achievements: list = []
    target_role: str | None = None


@router.post("/analyze")
async def analyze_resume(
    request: ResumeAnalyzeRequest,
    user: dict = Depends(get_current_user)
):
    """Analyze uploaded resume"""
    
    if not request.resume_text:
        raise HTTPException(status_code=400, detail="resume_text required")
    
    analysis = await llm.analyze_resume(request.resume_text)
    
    saved = await db.save_resume(
        user_id=user["user_id"],
        resume_text=request.resume_text,
        analysis=analysis
    )
    
    return {
        "analysis": analysis,
        "resume_id": saved.get("id") if saved else None
    }


@router.post("/generate")
async def generate_resume(
    request: ResumeGenerateRequest,
    user: dict = Depends(get_current_user)
):
    """Generate professional resume from data"""
    
    resume_md = await llm.generate_resume(
        data=request.model_dump(),
        target_role=request.target_role or ""
    )
    
    return {
        "resume": resume_md,
        "format": "markdown"
    }


@router.get("/")
async def list_resumes(user: dict = Depends(get_current_user)):
    """Get all resumes for current user"""
    
    resumes = await db.get_resumes(user["user_id"])
    return {"resumes": resumes}


@router.get("/{resume_id}")
async def get_resume(resume_id: str, user: dict = Depends(get_current_user)):
    """Get specific resume by ID"""
    
    resumes = await db.get_resumes(user["user_id"])
    resume = next((r for r in resumes if r["id"] == resume_id), None)
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return resume
