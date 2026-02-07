"""Learning plan routes for VidyaMitra API"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_user
import llm
import db

router = APIRouter(prefix="/learning", tags=["learning"])


class GeneratePlanRequest(BaseModel):
    gaps: list
    role: str = "Software Engineer"


class UpdateProgressRequest(BaseModel):
    progress: dict


@router.post("/generate")
async def generate_learning_plan(
    request: GeneratePlanRequest,
    user: dict = Depends(get_current_user)
):
    """Generate learning plan for skill gaps"""
    
    if not request.gaps:
        raise HTTPException(status_code=400, detail="gaps list required")
    
    plan = await llm.generate_learning_plan(
        gaps=request.gaps,
        role=request.role
    )
    
    saved = await db.save_learning_plan(
        user_id=user["user_id"],
        target_role=request.role,
        plan={"gaps": request.gaps, "plan": plan}
    )
    
    return {
        "plan_id": saved.get("id") if saved else None,
        "plan": plan
    }


@router.patch("/{plan_id}/progress")
async def update_progress(
    plan_id: str,
    request: UpdateProgressRequest,
    user: dict = Depends(get_current_user)
):
    """Update learning plan progress"""
    
    saved = await db.update_learning_progress(plan_id, request.progress)
    
    if not saved:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return {"plan": saved}


@router.get("/")
async def list_plans(user: dict = Depends(get_current_user)):
    """Get all learning plans for current user"""
    
    client = db._get_client()
    if not client:
        return {"plans": []}
    result = client.table("learning_plans").select("*").eq(
        "user_id", user["user_id"]
    ).order("created_at", desc=True).execute()
    
    return {"plans": result.data}


@router.get("/{plan_id}")
async def get_plan(plan_id: str, user: dict = Depends(get_current_user)):
    """Get specific learning plan by ID"""
    
    client = db._get_client()
    if not client:
        raise HTTPException(status_code=404, detail="Plan not found")
    result = client.table("learning_plans").select("*").eq(
        "id", plan_id
    ).eq("user_id", user["user_id"]).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return result.data
