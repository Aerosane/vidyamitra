# n8n Workflows for VidyaMitra

These workflows provide **self-contained AI endpoints** using OpenRouter LLM. They are an alternative to the FastAPI server - frontend can call either.

## Architecture

```
┌──────────────┐                    ┌──────────────┐
│   Frontend   │                    │   Frontend   │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       ▼                                   ▼
┌──────────────┐                    ┌──────────────┐
│  n8n Webhook │                    │  API Server  │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       ▼                                   ▼
┌──────────────┐                    ┌──────────────┐
│  OpenRouter  │                    │GitHub Models │
│     LLM      │                    │     LLM      │
└──────────────┘                    └──────────────┘

     OPTION A                           OPTION B
  (n8n workflows)                    (API server)
```

## Available Workflows

| # | Workflow | Webhook Path | Description |
|---|----------|--------------|-------------|
| 1 | Resume Analyzer | `/webhook/resume/analyze` | Analyze resume, return score & feedback |
| 2 | Resume Enhancer | `/webhook/resume/enhance` | Rewrite resume with STAR method |
| 3 | Resume Generator | `/webhook/resume/generate` | Generate resume from structured data |
| 4 | Interview Starter | `/webhook/interview/start` | Generate 5 interview questions |
| 5 | Interview Evaluator | `/webhook/interview/evaluate` | Evaluate interview answer |
| 7 | Quiz Generator | `/webhook/quiz/generate` | Generate skill assessment quiz |
| 8 | Learning Path | `/webhook/learning/generate` | Create personalized learning plan |

## Setup

### 1. Import Workflows

```bash
# In n8n UI:
# 1. Go to Workflows → Import from File
# 2. Select each .json file
# 3. Save and activate
```

### 2. Configure OpenRouter Credentials

Each workflow uses OpenRouter for LLM. Set up credentials:

1. Go to **Credentials** in n8n
2. Add **OpenRouter API** credential
3. Enter your OpenRouter API key
4. The credential ID `kbLUbBg7LTgDm2VN` is referenced in workflows - update if needed

### 3. Activate Workflows

After import, each workflow is inactive. Click **Active** toggle to enable.

---

## Request/Response Formats

All endpoints accept POST with JSON body. Formats match the API server for interoperability.

### Resume Analyze

**POST** `/webhook/resume/analyze`

```json
{
  "user_id": "user_123",
  "data": {
    "resume_text": "John Doe\nSenior Developer...",
    "target_role": "Backend Engineer"
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "analysis": {
    "score": 72,
    "grade": "B",
    "summary": "Strong technical background...",
    "strengths": ["Python expertise", "Leadership"],
    "improvements": ["Add metrics", "Include certs"],
    "missing_keywords": ["AWS", "Kubernetes"]
  }
}
```

### Resume Enhance

**POST** `/webhook/resume/enhance`

```json
{
  "user_id": "user_123",
  "data": {
    "resume_text": "Original resume text...",
    "target_role": "Full Stack Developer"
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "enhanced": {
    "enhanced_resume": "# John Doe\n## Full Stack Developer...",
    "changes": ["Added metrics", "STAR format", "ATS keywords"],
    "ats_score_before": 45,
    "ats_score_after": 82
  }
}
```

### Resume Generate

**POST** `/webhook/resume/generate`

```json
{
  "user_id": "user_123",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "experience": [...],
    "skills": [...],
    "target_role": "Backend Developer"
  }
}
```

### Interview Start

**POST** `/webhook/interview/start`

```json
{
  "user_id": "user_123",
  "data": {
    "role": "Backend Developer",
    "domain": "Python",
    "difficulty": "intermediate"
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "session_id": "session_abc123",
  "questions": [
    {
      "id": 1,
      "text": "Explain the GIL in Python.",
      "topic": "Python Internals",
      "key_concepts": ["Thread safety", "Memory management"]
    }
  ]
}
```

### Interview Evaluate

**POST** `/webhook/interview/evaluate`

```json
{
  "user_id": "user_123",
  "data": {
    "question": "Explain the GIL in Python.",
    "answer": "The GIL is a mutex that protects...",
    "key_concepts": ["Thread safety", "Memory management"]
  }
}
```

### Quiz Generate

**POST** `/webhook/quiz/generate`

```json
{
  "user_id": "user_123",
  "data": {
    "topic": "Python",
    "difficulty": "intermediate",
    "count": 5
  }
}
```

### Learning Path Generate

**POST** `/webhook/learning/generate`

```json
{
  "user_id": "user_123",
  "data": {
    "current_skills": ["Python", "SQL"],
    "target_role": "ML Engineer",
    "experience_level": "intermediate"
  }
}
```

---

## LLM Configuration

Workflows use **OpenRouter** with model `openai/gpt-oss-120b`.

To change model, edit each workflow:
1. Open workflow in n8n
2. Click **OpenRouter Chat Model** node
3. Change `model` parameter

Alternative models:
- `anthropic/claude-3-haiku` - Fast, cheap
- `openai/gpt-4o` - Higher quality
- `meta-llama/llama-3-70b` - Open source

---

## Frontend Integration

Frontend can call n8n webhooks directly:

```typescript
const N8N_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678';

async function analyzeResume(resumeText: string, targetRole: string) {
  const response = await fetch(`${N8N_URL}/webhook/resume/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      data: { resume_text: resumeText, target_role: targetRole }
    })
  });
  return response.json();
}
```

Or use API server with same format:

```typescript
const API_URL = process.env.API_URL || 'http://localhost:8000';

// Same payload works on API server
const response = await fetch(`${API_URL}/api/webhook/resume/analyze`, {
  // ... same as above
});
```

---

## When to Use n8n vs API Server

| Use Case | Recommendation |
|----------|----------------|
| Simple AI request/response | Either works |
| Need Google Drive integration | n8n (has built-in nodes) |
| Custom LLM provider | n8n (easy to swap) |
| Lower latency | API Server |
| Complex multi-step pipelines | n8n |
| Need Supabase persistence | API Server |
