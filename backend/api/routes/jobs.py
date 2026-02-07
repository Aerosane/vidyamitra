"""Job recommendation routes for VidyaMitra API"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_user
import llm
import db
from job_market import JOB_MARKET_DATA, get_job_market_summary, get_role_outlook, get_skills_gap_analysis

router = APIRouter(prefix="/jobs", tags=["jobs"])


class RecommendJobsRequest(BaseModel):
    skills: list
    role: str = ""
    location: str = ""


# ═══════════════════════════════════════════════════════════════
# JOB MARKET DATA ENDPOINTS (No Auth - Public Data)
# ═══════════════════════════════════════════════════════════════

@router.get("/market/summary")
async def market_summary(field: str = None):
    """Get job market summary with latest trends"""
    return get_job_market_summary(field)


@router.get("/market/fastest-growing")
async def fastest_growing_jobs(region: str = "global"):
    """Get fastest growing jobs by region"""
    if region.lower() == "india":
        return {
            "region": "India",
            "jobs": JOB_MARKET_DATA["fastest_growing_india"],
            "source": "WEF Future of Jobs Report 2025, India Employment Forum"
        }
    return {
        "region": "Global",
        "jobs": JOB_MARKET_DATA["fastest_growing_global"],
        "source": "WEF Future of Jobs Report 2025, BLS"
    }


@router.get("/market/declining")
async def declining_jobs():
    """Get jobs at risk of automation/decline"""
    return {
        "warning": "These roles face high automation risk by 2030",
        "jobs": JOB_MARKET_DATA["declining_roles"],
        "recommendation": "Consider upskilling to tech-adjacent roles"
    }


@router.get("/market/skills")
async def in_demand_skills():
    """Get most in-demand skills"""
    return {
        "technical_skills": JOB_MARKET_DATA["top_skills_global"],
        "soft_skills": JOB_MARKET_DATA["top_soft_skills"],
        "certifications": JOB_MARKET_DATA["top_certifications"],
        "key_insight": "39-40% of core job skills will change by 2030"
    }


@router.get("/market/salaries")
async def salary_benchmarks(level: str = "mid_level"):
    """Get salary benchmarks by experience level"""
    level = level.lower().replace("-", "_").replace(" ", "_")
    if level not in JOB_MARKET_DATA["salary_benchmarks_usd"]:
        level = "mid_level"
    return {
        "level": level,
        "salaries_usd": JOB_MARKET_DATA["salary_benchmarks_usd"][level],
        "note": "Salaries vary by location, company size, and specific skills"
    }


@router.get("/market/industry/{industry}")
async def industry_outlook(industry: str):
    """Get outlook for a specific industry"""
    industry = industry.lower().replace("-", "_").replace(" ", "_")
    if industry not in JOB_MARKET_DATA["industry_outlook"]:
        return {
            "error": f"Industry '{industry}' not found",
            "available": list(JOB_MARKET_DATA["industry_outlook"].keys())
        }
    return {
        "industry": industry,
        **JOB_MARKET_DATA["industry_outlook"][industry]
    }


@router.get("/market/role/{role}")
async def role_outlook(role: str):
    """Get outlook for a specific role"""
    return get_role_outlook(role)


@router.post("/market/skill-gap")
async def analyze_skill_gap(request: RecommendJobsRequest):
    """Analyze skill gaps for target role"""
    return get_skills_gap_analysis(request.skills, request.role)


# ═══════════════════════════════════════════════════════════════
# PERSONALIZED RECOMMENDATIONS (Auth Required)
# ═══════════════════════════════════════════════════════════════

@router.post("/recommend")
async def recommend_jobs(
    request: RecommendJobsRequest,
    user: dict = Depends(get_current_user)
):
    """Get job recommendations based on skills"""
    
    if not request.skills:
        raise HTTPException(status_code=400, detail="skills list required")
    
    jobs = await llm.get_job_recommendations(
        skills=request.skills,
        role=request.role,
        location=request.location
    )
    
    saved = await db.save_job_search(
        user_id=user["user_id"],
        skills=request.skills,
        role=request.role,
        results=jobs
    )
    
    return {
        "jobs": jobs,
        "search_id": saved.get("id") if saved else None
    }


@router.get("/history")
async def job_search_history(user: dict = Depends(get_current_user)):
    """Get job search history for current user"""
    
    client = db._get_client()
    if not client:
        return {"searches": []}
    result = client.table("job_recommendations").select("*").eq(
        "user_id", user["user_id"]
    ).order("created_at", desc=True).execute()
    
    return {"searches": result.data}


@router.get("/{search_id}")
async def get_job_search(search_id: str, user: dict = Depends(get_current_user)):
    """Get specific job search by ID"""
    
    client = db._get_client()
    if not client:
        raise HTTPException(status_code=404, detail="Search not found")
    result = client.table("job_recommendations").select("*").eq(
        "id", search_id
    ).eq("user_id", user["user_id"]).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Search not found")
    
    return result.data
