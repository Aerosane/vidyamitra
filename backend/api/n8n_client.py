"""n8n webhook client - proxies requests to n8n workflows"""

import httpx
from config import settings

# n8n webhook endpoints
N8N_ENDPOINTS = {
    "resume_analyze": "/resume/analyze",
    "resume_enhance": "/resume/enhance", 
    "resume_generate": "/resume/generate",
    "interview_start": "/interview/start",
    "interview_evaluate": "/interview/evaluate",
    "quiz_generate": "/quiz/generate",
    "learning_generate": "/learning/generate",
}


async def call_n8n(endpoint: str, payload: dict) -> dict:
    """
    Call n8n webhook endpoint.
    
    Args:
        endpoint: Key from N8N_ENDPOINTS (e.g., "quiz_generate")
        payload: Request payload with user_id and data
        
    Returns:
        Response from n8n workflow
    """
    if endpoint not in N8N_ENDPOINTS:
        raise ValueError(f"Unknown n8n endpoint: {endpoint}")
    
    url = f"{settings.N8N_WEBHOOK_URL}{N8N_ENDPOINTS[endpoint]}"
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException:
            print(f"[n8n] Timeout calling {endpoint}")
            return {"error": "n8n timeout", "status": "error"}
        except httpx.HTTPStatusError as e:
            print(f"[n8n] HTTP error {e.response.status_code}: {e.response.text}")
            return {"error": f"n8n error: {e.response.status_code}", "status": "error"}
        except Exception as e:
            print(f"[n8n] Error calling {endpoint}: {e}")
            return {"error": str(e), "status": "error"}


async def is_n8n_available() -> bool:
    """Check if n8n is running and accessible"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(settings.N8N_WEBHOOK_URL.replace("/webhook", "/healthz"))
            return response.status_code == 200
    except:
        return False
