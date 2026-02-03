# VidyāMitra Backend — MVP Scaffold
> Simple FastAPI backend for n8n automation

---

## 🎯 MVP Scope

**3 Core Features:**
1. Resume Analysis (upload → AI analysis → skill gaps)
2. Mock Interview (questions → evaluate answers → report)
3. Learning Plan (skill gaps → resources)

**Stack:**
- FastAPI (backend)
- Clerk (auth - frontend handles it)
- Supabase (database)
- Google Drive (file storage via n8n)
- GitHub Models API (LLM)

---

## 📁 Project Structure

```
backend/
├── main.py              # FastAPI app
├── config.py            # Environment vars
├── auth.py              # Clerk JWT verification
├── llm.py               # GitHub Models client
├── db.py                # Supabase client
├── requirements.txt
├── .env.example
└── Dockerfile
```

---

## ⚙️ Environment

```env
# .env.example

# Clerk (JWT verification)
CLERK_SECRET_KEY=sk_live_xxx

# GitHub Models API (Org Endpoint)
GITHUB_TOKEN=ghp_xxx
GITHUB_ORG=imperialorg
DEFAULT_MODEL=openai/gpt-4.1

# Supabase (DB only)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-service-key

# Google Drive (folder for uploads)
GDRIVE_FOLDER_ID=your-folder-id
```

---

## 🗄️ Database (Supabase)

```sql
-- Users (synced from Clerk)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumes
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    gdrive_file_id TEXT,
    filename TEXT,
    analysis JSONB,          -- AI analysis result
    skills JSONB,            -- extracted skills
    gaps JSONB,              -- skill gaps
    score INTEGER,           -- employability score
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interviews
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    domain TEXT,
    role TEXT,
    questions JSONB,         -- generated questions
    answers JSONB,           -- user answers + evaluations
    score INTEGER,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Plans
CREATE TABLE learning_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    target_role TEXT,
    gaps JSONB,
    resources JSONB,         -- youtube links, courses
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 Core Code

### main.py

```python
from fastapi import FastAPI, Depends, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import auth, llm, db

app = FastAPI(title="VidyaMitra API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ HEALTH ============
@app.get("/health")
def health():
    return {"status": "ok"}


# ============ RESUME ============
class ResumeAnalyzeRequest(BaseModel):
    gdrive_file_id: str
    resume_text: str  # n8n extracts text from file

@app.post("/api/resume/analyze")
async def analyze_resume(req: ResumeAnalyzeRequest, user=Depends(auth.get_user)):
    """Analyze resume with AI"""
    
    # Call LLM
    analysis = await llm.analyze_resume(req.resume_text)
    
    # Save to DB
    result = db.client.table("resumes").insert({
        "user_id": user.id,
        "gdrive_file_id": req.gdrive_file_id,
        "analysis": analysis,
        "skills": analysis.get("skills"),
        "gaps": analysis.get("gaps"),
        "score": analysis.get("score")
    }).execute()
    
    return {"resume_id": result.data[0]["id"], "analysis": analysis}


@app.get("/api/resume/{resume_id}")
async def get_resume(resume_id: str, user=Depends(auth.get_user)):
    """Get resume analysis"""
    result = db.client.table("resumes").select("*").eq("id", resume_id).eq("user_id", user.id).single().execute()
    return result.data


# ============ INTERVIEW ============
class InterviewStartRequest(BaseModel):
    domain: str
    role: str

@app.post("/api/interview/start")
async def start_interview(req: InterviewStartRequest, user=Depends(auth.get_user)):
    """Start mock interview session"""
    
    questions = await llm.generate_interview_questions(req.domain, req.role, count=5)
    
    result = db.client.table("interviews").insert({
        "user_id": user.id,
        "domain": req.domain,
        "role": req.role,
        "questions": questions,
        "answers": [],
        "status": "active"
    }).execute()
    
    return {"interview_id": result.data[0]["id"], "questions": questions}


class AnswerRequest(BaseModel):
    question_index: int
    answer: str

@app.post("/api/interview/{interview_id}/answer")
async def submit_answer(interview_id: str, req: AnswerRequest, user=Depends(auth.get_user)):
    """Submit and evaluate an answer"""
    
    # Get interview
    interview = db.client.table("interviews").select("*").eq("id", interview_id).single().execute().data
    
    question = interview["questions"][req.question_index]
    evaluation = await llm.evaluate_answer(question["text"], req.answer)
    
    # Update answers
    answers = interview.get("answers") or []
    answers.append({
        "question_index": req.question_index,
        "answer": req.answer,
        "evaluation": evaluation
    })
    
    db.client.table("interviews").update({"answers": answers}).eq("id", interview_id).execute()
    
    return {"evaluation": evaluation}


@app.post("/api/interview/{interview_id}/complete")
async def complete_interview(interview_id: str, user=Depends(auth.get_user)):
    """Complete interview and get final score"""
    
    interview = db.client.table("interviews").select("*").eq("id", interview_id).single().execute().data
    
    # Calculate average score
    answers = interview.get("answers") or []
    if answers:
        avg_score = sum(a["evaluation"]["score"] for a in answers) // len(answers)
    else:
        avg_score = 0
    
    db.client.table("interviews").update({
        "status": "completed",
        "score": avg_score
    }).eq("id", interview_id).execute()
    
    return {"score": avg_score, "answers": answers}


# ============ LEARNING PLAN ============
class LearningPlanRequest(BaseModel):
    target_role: str
    gaps: List[str]

@app.post("/api/learning/plan")
async def create_learning_plan(req: LearningPlanRequest, user=Depends(auth.get_user)):
    """Generate learning plan based on skill gaps"""
    
    resources = await llm.generate_learning_resources(req.gaps, req.target_role)
    
    result = db.client.table("learning_plans").insert({
        "user_id": user.id,
        "target_role": req.target_role,
        "gaps": req.gaps,
        "resources": resources
    }).execute()
    
    return {"plan_id": result.data[0]["id"], "resources": resources}


@app.get("/api/learning/plan/{plan_id}")
async def get_learning_plan(plan_id: str, user=Depends(auth.get_user)):
    result = db.client.table("learning_plans").select("*").eq("id", plan_id).eq("user_id", user.id).single().execute()
    return result.data


# ============ N8N WEBHOOKS ============
class N8nPayload(BaseModel):
    user_id: str
    data: dict
    
@app.post("/webhook/resume")
async def n8n_resume_webhook(payload: N8nPayload):
    """n8n calls this after uploading resume to GDrive"""
    analysis = await llm.analyze_resume(payload.data["resume_text"])
    
    db.client.table("resumes").insert({
        "user_id": payload.user_id,
        "gdrive_file_id": payload.data["file_id"],
        "filename": payload.data["filename"],
        "analysis": analysis,
        "skills": analysis.get("skills"),
        "gaps": analysis.get("gaps"),
        "score": analysis.get("score")
    }).execute()
    
    return {"status": "ok", "analysis": analysis}
```

### auth.py

```python
import os
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel

security = HTTPBearer()

class User(BaseModel):
    id: str
    email: str = None

def get_user(creds: HTTPAuthorizationCredentials = Security(security)) -> User:
    """Verify Clerk JWT and return user"""
    try:
        payload = jwt.decode(
            creds.credentials,
            os.getenv("CLERK_SECRET_KEY"),
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        return User(id=payload["sub"], email=payload.get("email"))
    except JWTError:
        raise HTTPException(401, "Invalid token")
```

### llm.py

```python
import os
import httpx

ORG = os.getenv("GITHUB_ORG")
if not ORG:
    raise ValueError("GITHUB_ORG required")

ENDPOINT = f"https://models.github.ai/orgs/{ORG}/inference/chat/completions"
TOKEN = os.getenv("GITHUB_TOKEN")
MODEL = os.getenv("DEFAULT_MODEL", "openai/gpt-4.1")

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2024-12-01-preview",
}

async def chat(messages: list, model: str = None) -> str:
    """Send chat request to GitHub Models"""
    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.post(ENDPOINT, headers=HEADERS, json={
            "model": model or MODEL,
            "messages": messages,
            "max_tokens": 2048
        })
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]


async def analyze_resume(text: str) -> dict:
    """Analyze resume and return structured data"""
    prompt = f"""Analyze this resume. Return JSON with:
- skills: list of skills found
- experience_years: number
- gaps: list of missing skills for modern job market  
- score: employability score 0-100
- summary: brief summary

Resume:
{text[:4000]}

Return only valid JSON."""

    result = await chat([{"role": "user", "content": prompt}])
    
    # Parse JSON from response
    import json
    try:
        return json.loads(result)
    except:
        return {"raw": result, "score": 50, "skills": [], "gaps": []}


async def generate_interview_questions(domain: str, role: str, count: int = 5) -> list:
    """Generate interview questions"""
    prompt = f"""Generate {count} interview questions for:
Domain: {domain}
Role: {role}

Return JSON array with objects containing:
- text: the question
- expected_points: list of key points expected in answer

Return only valid JSON array."""

    result = await chat([{"role": "user", "content": prompt}])
    
    import json
    try:
        return json.loads(result)
    except:
        return [{"text": "Tell me about yourself", "expected_points": ["experience", "skills"]}]


async def evaluate_answer(question: str, answer: str) -> dict:
    """Evaluate interview answer"""
    prompt = f"""Evaluate this interview answer.

Question: {question}
Answer: {answer}

Return JSON with:
- score: 0-100
- feedback: brief feedback
- strengths: list
- improvements: list

Return only valid JSON."""

    result = await chat([{"role": "user", "content": prompt}])
    
    import json
    try:
        return json.loads(result)
    except:
        return {"score": 50, "feedback": "Could not evaluate", "strengths": [], "improvements": []}


async def generate_learning_resources(gaps: list, role: str) -> list:
    """Generate learning resources for skill gaps"""
    prompt = f"""Suggest learning resources for these skill gaps:
{', '.join(gaps)}

Target role: {role}

Return JSON array with objects containing:
- skill: the skill
- resources: list of {{title, type, url_hint}}

Types: youtube, course, article, book

Return only valid JSON array."""

    result = await chat([{"role": "user", "content": prompt}])
    
    import json
    try:
        return json.loads(result)
    except:
        return []
```

### db.py

```python
import os
from supabase import create_client

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

client = create_client(url, key)
```

### config.py

```python
import os
from dotenv import load_dotenv

load_dotenv()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
```

---

## 📦 Dependencies

```txt
# requirements.txt
fastapi==0.115.0
uvicorn[standard]==0.30.0
python-jose[cryptography]==3.3.0
httpx==0.27.0
supabase==2.4.0
python-dotenv==1.0.1
pydantic==2.7.0
```

---

## 🐳 Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🔄 n8n Workflows

### Resume Analysis Flow

```
[Form/Upload Trigger]
      ↓
[Google Drive: Upload file]
      ↓
[Google Drive: Download as text] (or use PDF parser)
      ↓
[HTTP Request: POST /webhook/resume]
  Body: {
    "user_id": "{{clerk_user_id}}",
    "data": {
      "file_id": "{{$json.id}}",
      "filename": "{{$json.name}}",
      "resume_text": "{{$json.content}}"
    }
  }
      ↓
[Send notification with results]
```

### Interview Flow

```
[Webhook: User starts interview]
      ↓
[HTTP: POST /api/interview/start]
      ↓
[Loop: For each question]
  → [Wait for answer webhook]
  → [HTTP: POST /api/interview/{id}/answer]
      ↓
[HTTP: POST /api/interview/{id}/complete]
      ↓
[Store report / Send email]
```

---

## 🚀 Run Locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill in values
uvicorn main:app --reload
```

API docs: http://localhost:8000/docs

---

## 📋 API Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/resume/analyze` | POST | Analyze resume |
| `/api/resume/{id}` | GET | Get analysis |
| `/api/interview/start` | POST | Start interview |
| `/api/interview/{id}/answer` | POST | Submit answer |
| `/api/interview/{id}/complete` | POST | Get final score |
| `/api/learning/plan` | POST | Create learning plan |
| `/api/learning/plan/{id}` | GET | Get plan |
| `/webhook/resume` | POST | n8n resume webhook |

---

*VidyāMitra MVP v1.0*
