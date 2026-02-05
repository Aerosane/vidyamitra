# VidyāMitra Backend Scaffold 
## API-First Architecture with Optional n8n Integration

---

## 📋 Overview

VidyāMitra is an AI-powered career guidance platform for resume evaluation, skill assessment, mock interviews, and personalized learning paths. 

This scaffold defines a **FastAPI backend** that serves as the **primary interface for the frontend**, with optional n8n workflow integration for complex automation scenarios.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
       ┌──────────┐  ┌───────────┐  ┌──────────┐
       │   API    │  │    n8n    │  │ Supabase │
       │  Server  │  │ Workflows │  │   (DB)   │
       └────┬─────┘  └─────┬─────┘  └──────────┘
            │              │
            ▼              ▼
       ┌──────────┐  ┌───────────┐
       │  GitHub  │  │ OpenRouter│
       │  Models  │  │    LLM    │
       └──────────┘  └───────────┘
```

### Key Design Principles
- **API Server is primary** - Frontend calls API directly
- **n8n is self-contained** - Workflows call OpenRouter LLM directly (not through API)
- **Shared request/response formats** - API and n8n endpoints accept same payloads
- **No auth on webhook endpoints** - Enables direct frontend calls

---

## 🏗️ Project Structure

```
backend/
├── api/                       # FastAPI server (uses GitHub Models)
│   ├── main.py                # App entry
│   ├── config.py              # Env config  
│   ├── auth.py                # Clerk JWT verify
│   ├── llm.py                 # GitHub Models client
│   ├── db.py                  # Supabase client
│   ├── job_market.py          # Market research data
│   ├── routes/
│   │   ├── webhooks.py        # AI endpoints (no auth)
│   │   ├── resume.py          # Resume (auth required)
│   │   ├── interview.py       # Interview (auth required)
│   │   ├── quiz.py            # Quiz (auth required)
│   │   ├── jobs.py            # Job recommendations
│   │   └── learning.py        # Learning plans
│   ├── requirements.txt
│   └── Dockerfile
│
└── n8n-workflows/             # Self-contained n8n flows (uses OpenRouter)
    ├── N8N.md                 # Integration guide
    ├── 1. Resume Analyzer.json
    ├── 2. Resume Enhancer.json
    ├── 3. Resume Generator.json
    ├── 4. Interview Starter.json
    ├── 5. Interview Evaluator.json
    ├── 7. Quiz Generator.json
    └── 8. Learning Path Generator.json
```

---

## 🔌 Webhook Endpoints

Both API server and n8n workflows expose compatible webhook endpoints:

| Feature | API Server | n8n Workflow |
|---------|------------|--------------|
| Resume Analyze | `/api/webhook/resume/analyze` | `/webhook/resume/analyze` |
| Resume Enhance | `/api/webhook/resume/enhance` | `/webhook/resume/enhance` |
| Interview Start | `/api/webhook/interview/start` | `/webhook/interview/start` |
| Quiz Generate | `/api/webhook/quiz/generate` | `/webhook/quiz/generate` |
| LLM Provider | GitHub Models | OpenRouter |

### Example: Resume Analysis

```python
# API Server endpoint (routes/webhooks.py)
@router.post("/resume/analyze")
async def analyze_resume_webhook(payload: N8nPayload, request: Request):
    """Analyze resume - no auth required"""
    client = request.state.http_client
    analysis = await analyze_resume(
        client,
        payload.data.get("resume_text", ""),
        payload.data.get("target_role", "")
    )
    return {"status": "ok", "analysis": analysis}
```

---

## 🤖 LLM Client (GitHub Models)

```python
# llm.py

import os, httpx, json

ENDPOINT = f"https://models.github.ai/orgs/imperialorg/inference/chat/completions"
TOKEN = os.getenv("GITHUB_TOKEN")
MODEL = "openai/gpt-4.1"

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2024-12-01-preview",
}

async def chat(messages: list, model: str = MODEL) -> str:
    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.post(ENDPOINT, headers=HEADERS, json={
            "model": model,
            "messages": messages,
            "max_tokens": 4096
        })
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]

async def analyze_resume(text: str) -> dict:
    prompt = f"""Analyze this resume. Return JSON:
- skills: list of skills
- experience_years: number
- gaps: missing skills for job market
- score: 0-100
- summary: brief summary

Resume: {text[:4000]}"""
    
    result = await chat([{"role": "user", "content": prompt}])
    try:
        return json.loads(result)
    except:
        return {"raw": result, "score": 50}

async def generate_questions(domain: str, role: str, count: int = 5) -> list:
    prompt = f"""Generate {count} interview questions for {role} in {domain}.
Return JSON array: [{{"text": "question", "expected_points": ["point1"]}}]"""
    
    result = await chat([{"role": "user", "content": prompt}])
    try:
        return json.loads(result)
    except:
        return [{"text": "Tell me about yourself", "expected_points": []}]

async def evaluate_answer(question: str, answer: str) -> dict:
    prompt = f"""Evaluate interview answer.
Question: {question}
Answer: {answer}
Return JSON: {{"score": 0-100, "feedback": "", "improvements": []}}"""
    
    result = await chat([{"role": "user", "content": prompt}])
    try:
        return json.loads(result)
    except:
        return {"score": 50, "feedback": "Could not evaluate"}

async def generate_learning_plan(gaps: list, role: str) -> list:
    prompt = f"""Create learning resources for gaps: {', '.join(gaps)}
Target: {role}
Return JSON: [{{"skill": "", "resources": [{{"title": "", "type": "youtube|course", "url_hint": ""}}]}}]"""
    
    result = await chat([{"role": "user", "content": prompt}])
    try:
        return json.loads(result)
    except:
        return []

async def generate_quiz(skill: str, count: int = 5) -> list:
    prompt = f"""Generate {count} multiple choice questions to test knowledge of: {skill}
Return JSON array: [{{"question": "", "options": ["A", "B", "C", "D"], "correct": "A", "explanation": ""}}]"""
    
    result = await chat([{"role": "user", "content": prompt}])
    try:
        return json.loads(result)
    except:
        return []

async def evaluate_quiz(questions: list, answers: list) -> dict:
    correct = sum(1 for q, a in zip(questions, answers) if q["correct"] == a)
    score = int((correct / len(questions)) * 100) if questions else 0
    
    return {
        "score": score,
        "correct": correct,
        "total": len(questions),
        "passed": score >= 70,
        "feedback": "Great job!" if score >= 70 else "Keep practicing!"
    }

async def get_job_recommendations(skills: list, role: str, location: str = "") -> list:
    prompt = f"""Suggest job opportunities for someone with:
Skills: {', '.join(skills)}
Target Role: {role}
Location: {location or 'Remote/Any'}

Return JSON: [{{"title": "", "company_type": "", "match_percent": 0-100, "skills_matched": [], "skills_to_learn": []}}]
Suggest 5 realistic job types."""
    
    result = await chat([{"role": "user", "content": prompt}])
    try:
        return json.loads(result)
    except:
        return []

# ═══════════════════════════════════════════════════════════════
# RESUME GENERATION
# ═══════════════════════════════════════════════════════════════

RESUME_SYSTEM_PROMPT = """You are an expert resume writer and career coach. 
Your task is to create professional, ATS-friendly resumes that highlight the candidate's strengths.

Guidelines:
- Use action verbs (Led, Developed, Implemented, Achieved)
- Quantify achievements with numbers/percentages where possible
- Keep it concise - 1 page for <5 years exp, 2 pages max for seniors
- Use reverse chronological order
- Include relevant keywords for the target role
- Professional tone, no first-person pronouns
- Format sections clearly: Contact → Summary → Experience → Education → Skills

Output a clean, well-structured resume in markdown format."""

async def generate_resume(data: dict, target_role: str = "") -> str:
    """Generate professional resume from user data"""
    
    user_prompt = f"""Create a professional resume for the following candidate:

**Personal Info:**
- Name: {data.get('name', 'N/A')}
- Email: {data.get('email', 'N/A')}
- Phone: {data.get('phone', 'N/A')}
- Location: {data.get('location', 'N/A')}
- LinkedIn: {data.get('linkedin', '')}
- Portfolio/GitHub: {data.get('portfolio', '')}

**Professional Summary:**
{data.get('summary', 'Not provided - generate based on experience')}

**Work Experience:**
{_format_experience(data.get('experience', []))}

**Education:**
{_format_education(data.get('education', []))}

**Skills:**
- Technical: {', '.join(data.get('technical_skills', []))}
- Soft Skills: {', '.join(data.get('soft_skills', []))}
- Tools: {', '.join(data.get('tools', []))}
- Languages: {', '.join(data.get('languages', []))}

**Certifications:**
{_format_list(data.get('certifications', []))}

**Projects:**
{_format_projects(data.get('projects', []))}

**Achievements:**
{_format_list(data.get('achievements', []))}

**Target Role:** {target_role or 'General professional role'}

Generate a polished, ATS-optimized resume in markdown format."""

    return await chat([
        {"role": "system", "content": RESUME_SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt}
    ])

def _format_experience(exp_list: list) -> str:
    if not exp_list: return "No experience provided"
    lines = []
    for e in exp_list:
        lines.append(f"- **{e.get('title', 'Role')}** at {e.get('company', 'Company')} ({e.get('duration', 'N/A')})")
        lines.append(f"  Responsibilities: {e.get('description', 'N/A')}")
        if e.get('achievements'):
            lines.append(f"  Key Achievements: {', '.join(e['achievements'])}")
    return '\n'.join(lines)

def _format_education(edu_list: list) -> str:
    if not edu_list: return "No education provided"
    return '\n'.join([
        f"- {e.get('degree', 'Degree')} in {e.get('field', 'Field')} from {e.get('institution', 'Institution')} ({e.get('year', 'Year')})"
        for e in edu_list
    ])

def _format_projects(proj_list: list) -> str:
    if not proj_list: return "No projects provided"
    lines = []
    for p in proj_list:
        lines.append(f"- **{p.get('name', 'Project')}**: {p.get('description', 'N/A')}")
        if p.get('tech'):
            lines.append(f"  Tech: {', '.join(p['tech'])}")
        if p.get('url'):
            lines.append(f"  Link: {p['url']}")
    return '\n'.join(lines)

def _format_list(items: list) -> str:
    return '\n'.join([f"- {item}" for item in items]) if items else "None"
```

---

## 📝 Resume Generation - Required Data Fields

### Essential Fields (Required)
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Full name | "Rahul Sharma" |
| `email` | string | Professional email | "rahul@gmail.com" |
| `phone` | string | Contact number | "+91 98765 43210" |
| `location` | string | City, Country | "Bangalore, India" |

### Professional Experience (At least 1 required)
```json
{
  "experience": [
    {
      "title": "Software Engineer",
      "company": "TCS",
      "duration": "Jan 2022 - Present",
      "description": "Built REST APIs and microservices",
      "achievements": ["Reduced latency by 40%", "Led team of 3"]
    }
  ]
}
```

### Education (Required)
```json
{
  "education": [
    {
      "degree": "B.Tech",
      "field": "Computer Science",
      "institution": "VIT University",
      "year": "2022",
      "gpa": "8.5/10"  // optional
    }
  ]
}
```

### Skills (Required)
| Field | Type | Example |
|-------|------|---------|
| `technical_skills` | string[] | ["Python", "JavaScript", "SQL", "AWS"] |
| `soft_skills` | string[] | ["Communication", "Leadership", "Problem Solving"] |
| `tools` | string[] | ["Git", "Docker", "Jira", "VS Code"] |
| `languages` | string[] | ["English (Fluent)", "Hindi (Native)"] |

### Optional But Recommended
| Field | Type | Description |
|-------|------|-------------|
| `linkedin` | string | LinkedIn profile URL |
| `portfolio` | string | GitHub/Portfolio URL |
| `summary` | string | 2-3 sentence professional summary |
| `certifications` | string[] | ["AWS Certified", "Google Cloud"] |
| `achievements` | string[] | ["Hackathon winner", "Published paper"] |

### Projects (Highly Recommended for Freshers)
```json
{
  "projects": [
    {
      "name": "E-commerce Platform",
      "description": "Full-stack shopping app with payment integration",
      "tech": ["React", "Node.js", "MongoDB"],
      "url": "https://github.com/user/project"
    }
  ]
}
```

### Complete Request Example
```json
POST /api/resume/generate
{
  "data": {
    "name": "Priya Patel",
    "email": "priya.patel@email.com",
    "phone": "+91 98765 43210",
    "location": "Mumbai, India",
    "linkedin": "linkedin.com/in/priyapatel",
    "portfolio": "github.com/priyapatel",
    "summary": "Full-stack developer with 2 years experience in React and Node.js",
    "experience": [
      {
        "title": "Junior Developer",
        "company": "Infosys",
        "duration": "Jul 2022 - Present",
        "description": "Developed web applications using React, Node.js, and PostgreSQL",
        "achievements": ["Improved page load time by 60%", "Mentored 2 interns"]
      }
    ],
    "education": [
      {
        "degree": "B.E.",
        "field": "Information Technology",
        "institution": "Mumbai University",
        "year": "2022",
        "gpa": "8.2/10"
      }
    ],
    "technical_skills": ["JavaScript", "React", "Node.js", "PostgreSQL", "Git"],
    "soft_skills": ["Team Collaboration", "Problem Solving"],
    "tools": ["VS Code", "Docker", "Postman"],
    "languages": ["English (Professional)", "Hindi (Native)", "Marathi (Native)"],
    "certifications": ["AWS Cloud Practitioner"],
    "projects": [
      {
        "name": "Task Manager App",
        "description": "Kanban-style task management with real-time updates",
        "tech": ["React", "Firebase", "Material-UI"],
        "url": "github.com/priyapatel/taskmanager"
      }
    ],
    "achievements": ["Smart India Hackathon Finalist 2021"]
  },
  "target_role": "Full Stack Developer"
}
```

---

## 📡 n8n Workflows (Self-Contained)

The n8n workflows handle LLM calls directly via OpenRouter. See [n8n-workflows/N8N.md](backend/n8n-workflows/N8N.md) for full details.

### Available Workflows

| Workflow | Webhook Path | LLM Model |
|----------|--------------|-----------|
| 1. Resume Analyzer | `/webhook/resume/analyze` | openai/gpt-oss-120b |
| 2. Resume Enhancer | `/webhook/resume/enhance` | openai/gpt-oss-120b |
| 3. Resume Generator | `/webhook/resume/generate` | openai/gpt-oss-120b |
| 4. Interview Starter | `/webhook/interview/start` | openai/gpt-oss-120b |
| 5. Interview Evaluator | `/webhook/interview/evaluate` | openai/gpt-oss-120b |
| 7. Quiz Generator | `/webhook/quiz/generate` | openai/gpt-oss-120b |
| 8. Learning Path | `/webhook/learning/generate` | openai/gpt-oss-120b |

### Workflow Architecture

```
Frontend → n8n Webhook → LangChain LLM Node → JSON Parser → Response
                              │
                              ▼
                         OpenRouter API
```

Each workflow:
1. Receives POST with `{user_id, data: {...}}`
2. Passes to LangChain LLM node with prompt template
3. Parses JSON from LLM response
4. Returns structured response

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/resume/analyze` | POST | Analyze resume |
| `/api/resume/{id}` | GET | Get analysis |
| `/api/interview/start` | POST | Start interview |
| `/api/interview/{id}/answer` | POST | Submit answer |
| `/api/interview/{id}/complete` | POST | Get final score |
| `/api/quiz/generate` | POST | Generate skill quiz |
| `/api/quiz/submit` | POST | Submit quiz answers |
| `/api/jobs/recommend` | POST | Get job recommendations |
| `/api/learning/plan` | POST | Create learning plan |
| `/api/learning/{id}/progress` | PATCH | Update progress |
| `/webhook/resume` | POST | n8n resume webhook |
| `/webhook/clerk` | POST | Clerk user sync |

---

## ⚙️ Environment

```env
# Server
APP_PORT=8000

# Clerk
CLERK_SECRET_KEY=sk_live_xxx

# GitHub Models (imperialorg)
GITHUB_TOKEN=ghp_xxx
GITHUB_ORG=imperialorg
DEFAULT_MODEL=openai/gpt-4.1

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=service-key

# Google Drive
GDRIVE_FOLDER_ID=your-folder-id
```

---

## 📦 Dependencies

```txt
fastapi==0.115.0
uvicorn[standard]==0.30.0
python-jose[cryptography]==3.3.0
httpx==0.27.0
supabase==2.4.0
python-dotenv==1.0.1
pydantic==2.7.0
PyPDF2==3.0.1
python-multipart==0.0.9
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

## 🚀 Quick Start

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill values
uvicorn main:app --reload
# http://localhost:8000/docs
```

---

## 🔐 Auth (Clerk JWT)

```python
# auth.py
import os
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

security = HTTPBearer()

def get_user(creds: HTTPAuthorizationCredentials = Security(security)):
    try:
        payload = jwt.decode(creds.credentials, os.getenv("CLERK_SECRET_KEY"),
                            algorithms=["HS256"], options={"verify_aud": False})
        return {"id": payload["sub"], "email": payload.get("email")}
    except JWTError:
        raise HTTPException(401, "Invalid token")
```

---

## 🗄️ Database (Supabase)

```python
# db.py
import os
from supabase import create_client

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
```

### Schema

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    gdrive_file_id TEXT,
    analysis JSONB,
    skills JSONB,
    gaps JSONB,
    score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    domain TEXT,
    role TEXT,
    questions JSONB,
    answers JSONB,
    score INTEGER,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE learning_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    target_role TEXT,
    gaps JSONB,
    resources JSONB,
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    skill TEXT,
    questions JSONB,
    answers JSONB,
    score INTEGER,
    passed BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE job_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    skills JSONB,
    target_role TEXT,
    recommendations JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🧪 Quiz & Job Routes

```python
# routes/quiz.py

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from auth import get_user
from llm import generate_quiz, evaluate_quiz
from db import supabase

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

class QuizRequest(BaseModel):
    skill: str
    count: int = 5

class QuizSubmitRequest(BaseModel):
    quiz_id: str
    answers: List[str]  # ["A", "B", "C", ...]

@router.post("/generate")
async def create_quiz(req: QuizRequest, user=Depends(get_user)):
    """Generate quiz questions for a skill"""
    questions = await generate_quiz(req.skill, req.count)
    
    result = supabase.table("quizzes").insert({
        "user_id": user["id"],
        "skill": req.skill,
        "questions": questions
    }).execute()
    
    # Return questions without correct answers
    safe_questions = [{"question": q["question"], "options": q["options"]} for q in questions]
    return {"quiz_id": result.data[0]["id"], "questions": safe_questions}

@router.post("/submit")
async def submit_quiz(req: QuizSubmitRequest, user=Depends(get_user)):
    """Submit quiz answers and get score"""
    quiz = supabase.table("quizzes").select("*").eq("id", req.quiz_id).single().execute().data
    
    result = await evaluate_quiz(quiz["questions"], req.answers)
    
    supabase.table("quizzes").update({
        "answers": req.answers,
        "score": result["score"],
        "passed": result["passed"]
    }).eq("id", req.quiz_id).execute()
    
    # Include explanations in response
    detailed = []
    for i, q in enumerate(quiz["questions"]):
        detailed.append({
            "question": q["question"],
            "your_answer": req.answers[i] if i < len(req.answers) else None,
            "correct_answer": q["correct"],
            "is_correct": req.answers[i] == q["correct"] if i < len(req.answers) else False,
            "explanation": q.get("explanation", "")
        })
    
    return {**result, "details": detailed}
```

```python
# routes/jobs.py

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from auth import get_user
from llm import get_job_recommendations
from db import supabase

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

class JobRecommendRequest(BaseModel):
    skills: List[str]
    target_role: str
    location: Optional[str] = ""

@router.post("/recommend")
async def recommend_jobs(req: JobRecommendRequest, user=Depends(get_user)):
    """Get job recommendations based on skills"""
    recommendations = await get_job_recommendations(req.skills, req.target_role, req.location)
    
    supabase.table("job_searches").insert({
        "user_id": user["id"],
        "skills": req.skills,
        "target_role": req.target_role,
        "recommendations": recommendations
    }).execute()
    
    return {"recommendations": recommendations}

@router.get("/history")
async def job_search_history(user=Depends(get_user)):
    """Get user's job search history"""
    result = supabase.table("job_searches").select("*").eq("user_id", user["id"]).order("created_at", desc=True).limit(10).execute()
    return {"history": result.data}
```

```python
# routes/learning.py (progress tracking)

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from auth import get_user
from db import supabase

router = APIRouter(prefix="/api/learning", tags=["learning"])

class ProgressUpdate(BaseModel):
    progress: int  # 0-100

@router.patch("/{plan_id}/progress")
async def update_progress(plan_id: str, req: ProgressUpdate, user=Depends(get_user)):
    """Update learning plan progress"""
    supabase.table("learning_plans").update({
        "progress": min(100, max(0, req.progress))
    }).eq("id", plan_id).eq("user_id", user["id"]).execute()
    
    return {"status": "updated", "progress": req.progress}

@router.get("/{plan_id}")
async def get_plan(plan_id: str, user=Depends(get_user)):
    """Get learning plan with progress"""
    result = supabase.table("learning_plans").select("*").eq("id", plan_id).eq("user_id", user["id"]).single().execute()
    return result.data
```

---

## 🎤 Voice Interview Flow

### Architecture
```
[Mic] → [Browser STT] → text → [FastAPI] → [LLM] → response → [Browser TTS] → [Speaker]
```

- **STT**: Browser's Web Speech API (free, Chrome/Edge)
- **TTS**: Browser's speechSynthesis API (free, all browsers)
- **No external audio APIs needed**

### Frontend (Next.js)

```typescript
// components/VoiceInterview.tsx
'use client';
import { useState, useRef } from 'react';

export function VoiceInterview({ interviewId }: { interviewId: string }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setTranscript(text);

      // Final result - send to API
      if (event.results[0].isFinal) {
        submitAnswer(text);
      }
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const submitAnswer = async (answer: string) => {
    const res = await fetch(`/api/interview/${interviewId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer })
    });
    
    const { feedback, nextQuestion } = await res.json();
    
    // Speak the feedback + next question
    speak(feedback);
    if (nextQuestion) {
      setTimeout(() => speak(nextQuestion), 2000);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    // Optional: select voice
    const voices = speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.name.includes('Google')) || voices[0];
    speechSynthesis.speak(utterance);
  };

  return (
    <div>
      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? '🔴 Stop' : '🎤 Speak'}
      </button>
      <p>{transcript}</p>
    </div>
  );
}
```

### Backend Endpoint

```python
# routes/interview.py

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from auth import get_user
from llm import evaluate_answer, generate_questions
from db import supabase

router = APIRouter(prefix="/api/interview", tags=["interview"])

class VoiceAnswerRequest(BaseModel):
    answer: str

@router.post("/{interview_id}/answer")
async def voice_answer(interview_id: str, req: VoiceAnswerRequest, user=Depends(get_user)):
    """Process voice answer (already converted to text by browser STT)"""
    
    # Get current interview state
    interview = supabase.table("interviews").select("*").eq("id", interview_id).single().execute().data
    questions = interview["questions"]
    answers = interview.get("answers") or []
    current_idx = len(answers)
    
    if current_idx >= len(questions):
        return {"feedback": "Interview complete!", "nextQuestion": None}
    
    current_question = questions[current_idx]
    
    # Evaluate with LLM
    evaluation = await evaluate_answer(current_question["text"], req.answer)
    
    # Save answer
    answers.append({
        "question_index": current_idx,
        "answer": req.answer,
        "evaluation": evaluation
    })
    supabase.table("interviews").update({"answers": answers}).eq("id", interview_id).execute()
    
    # Prepare response for TTS
    feedback = f"Score: {evaluation['score']}. {evaluation['feedback']}"
    
    # Next question or complete
    next_q = None
    if current_idx + 1 < len(questions):
        next_q = questions[current_idx + 1]["text"]
    
    return {
        "feedback": feedback,
        "nextQuestion": next_q,
        "evaluation": evaluation
    }


@router.post("/{interview_id}/start-voice")
async def start_voice_interview(interview_id: str, user=Depends(get_user)):
    """Get first question for TTS to speak"""
    interview = supabase.table("interviews").select("*").eq("id", interview_id).single().execute().data
    first_question = interview["questions"][0]["text"]
    
    return {
        "message": f"Welcome to your interview. Here's your first question: {first_question}",
        "question": first_question
    }
```

### n8n Voice Interview Workflow

```
[Webhook: Start Interview]
       ↓
[HTTP: POST /api/interview/start] → questions
       ↓
[Respond: first question for TTS]
       ↓
[Loop: Wait for /answer webhook from frontend]
    → [Evaluate answer]
    → [Return feedback + next question]
       ↓
[On complete: Generate report, notify user]
```

### Browser Compatibility

| Browser | STT | TTS |
|---------|-----|-----|
| Chrome | ✅ (Google servers) | ✅ |
| Edge | ✅ (Azure servers) | ✅ |
| Safari | ✅ (on-device) | ✅ |
| Firefox | ⚠️ (limited) | ✅ |

### Tips
- Chrome STT requires HTTPS (or localhost)
- Call `speechSynthesis.getVoices()` after page load
- Add visual feedback while listening (waveform/indicator)
- Handle `recognition.onerror` for mic permission issues

n8n handles file uploads/downloads with its native Google Drive node. Backend just stores the `file_id` returned by n8n.

```
[User uploads] → [n8n: GDrive Upload] → [n8n: POST /webhook/resume with file_id]
```

---

## 🔗 Resources

- [GitHub Models API](https://docs.github.com/en/github-models)
- [FastAPI](https://fastapi.tiangolo.com/)
- [n8n Google Drive Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/)
- [Supabase Python](https://supabase.com/docs/reference/python/introduction)

---

*VidyāMitra Backend v1.0 | imperialorg*
