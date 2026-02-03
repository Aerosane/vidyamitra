"""Clerk JWT verification for VidyaMitra API"""

import httpx
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from config import settings

security = HTTPBearer()


async def verify_clerk_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Verify Clerk JWT and return user data"""
    
    token = credentials.credentials
    
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                "https://api.clerk.com/v1/sessions/verify",
                headers={
                    "Authorization": f"Bearer {settings.CLERK_SECRET_KEY}",
                    "Content-Type": "application/json"
                },
                params={"token": token}
            )
            
            if res.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid token")
            
            data = res.json()
            return {
                "user_id": data.get("user_id"),
                "session_id": data.get("id"),
                "email": data.get("user", {}).get("email_addresses", [{}])[0].get("email_address")
            }
            
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Auth service unavailable")


def get_current_user(user: dict = Depends(verify_clerk_token)) -> dict:
    """Dependency to get current authenticated user"""
    if not user.get("user_id"):
        raise HTTPException(status_code=401, detail="User not found")
    return user
