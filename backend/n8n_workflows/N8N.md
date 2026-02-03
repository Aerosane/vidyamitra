# n8n ↔ VidyaMitra API Integration

Guide for n8n workflow developers integrating with VidyaMitra API.

## API Base URL

```
Development: http://localhost:8000
Production:  https://your-domain.com
```

## Available Endpoints

All endpoints accept POST with JSON body. No authentication required.

### Resume

| Endpoint | What it does |
|----------|--------------|
| `/api/webhook/resume/analyze` | Scores resume, identifies strengths/weaknesses |
| `/api/webhook/resume/enhance` | Returns improved version of resume |
| `/api/webhook/resume/generate` | Creates resume from structured data |

### Interview

| Endpoint | What it does |
|----------|--------------|
| `/api/webhook/interview/start` | Generates interview questions |
| `/api/webhook/interview/evaluate` | Scores an answer |
| `/api/webhook/voice/process` | Handles voice interview turn (for STT→TTS flow) |

### Quiz & Learning

| Endpoint | What it does |
|----------|--------------|
| `/api/webhook/quiz/generate` | Creates MCQ quiz for a skill |
| `/api/webhook/quiz/evaluate` | Scores quiz answers |
| `/api/webhook/learning/generate` | Creates personalized learning plan |
| `/api/webhook/jobs/recommend` | Suggests jobs based on skills |

---

## Request Format

Every endpoint expects:

```json
{
  "user_id": "any_identifier",
  "data": {
    // endpoint-specific fields (see below)
  }
}
```

## Response Format

```json
{
  "status": "ok",
  // ... result data
}
```

On error:
```json
{
  "status": "error",
  "message": "description"
}
```

---

## Endpoint Details

### Resume Analyze

```json
POST /api/webhook/resume/analyze

{
  "user_id": "user123",
  "data": {
    "resume_text": "Full resume content as text...",
    "target_role": "Backend Developer"  // optional
  }
}

// Response includes: score, grade, summary, strengths, improvements
```

### Resume Enhance

```json
POST /api/webhook/resume/enhance

{
  "user_id": "user123",
  "data": {
    "resume_text": "Original resume text...",
    "target_role": "Backend Developer"
  }
}

// Response includes: enhanced_resume, changes made
```

### Resume Generate

```json
POST /api/webhook/resume/generate

{
  "user_id": "user123",
  "data": {
    "personal_info": {
      "name": "Jane Doe",
      "email": "jane@email.com",
      "phone": "555-1234",
      "location": "City, Country"
    },
    "summary": "Brief professional summary",
    "experience": [
      {
        "title": "Job Title",
        "company": "Company",
        "duration": "2020-2023",
        "highlights": ["Achievement 1", "Achievement 2"]
      }
    ],
    "education": [
      {"degree": "BS Computer Science", "institution": "University", "year": "2020"}
    ],
    "skills": ["Python", "JavaScript", "AWS"],
    "target_role": "Full Stack Developer"
  }
}

// Response: generated resume in markdown
```

### Interview Start

```json
POST /api/webhook/interview/start

{
  "user_id": "user123",
  "data": {
    "domain": "backend",           // backend, frontend, data, etc.
    "role": "Python Developer",
    "difficulty": "intermediate",  // easy, intermediate, hard
    "num_questions": 5
  }
}

// Response: interview_id, array of questions
```

### Interview Evaluate

```json
POST /api/webhook/interview/evaluate

{
  "user_id": "user123",
  "data": {
    "question": "The question that was asked",
    "answer": "User's answer text",
    "expected_points": ["point1", "point2"]  // optional
  }
}

// Response: score, grade, feedback, strengths, improvements
```

### Voice Process

For voice interviews (STT input → evaluation → TTS output):

```json
POST /api/webhook/voice/process

{
  "user_id": "user123",
  "data": {
    "transcript": "Transcribed speech from user",
    "current_question": "The question being answered",
    "context": {
      "question_index": 0,
      "total_questions": 5,
      "next_question": "Next question text"
    }
  }
}

// Response: evaluation + response_text (for TTS) + is_complete flag
```

### Quiz Generate

```json
POST /api/webhook/quiz/generate

{
  "user_id": "user123",
  "data": {
    "skill": "Python",
    "difficulty": "intermediate",
    "num_questions": 5
  }
}

// Response: array of MCQ questions with options
```

### Quiz Evaluate

```json
POST /api/webhook/quiz/evaluate

{
  "user_id": "user123",
  "data": {
    "skill": "Python",
    "questions": [...],  // questions from generate
    "answers": ["A", "C", "B", "A", "D"]  // user's answers
  }
}

// Response: score, passed, detailed breakdown
```

### Jobs Recommend

```json
POST /api/webhook/jobs/recommend

{
  "user_id": "user123",
  "data": {
    "skills": ["Python", "FastAPI", "PostgreSQL"],
    "experience_years": 3,
    "target_role": "Backend Developer",
    "location": "Remote"
  }
}

// Response: array of job matches with salary, skills to learn
```

### Learning Plan Generate

```json
POST /api/webhook/learning/generate

{
  "user_id": "user123",
  "data": {
    "gaps": ["AWS", "Docker", "Kubernetes"],
    "target_role": "DevOps Engineer"
  }
}

// Response: structured learning plan with resources
```

---

## Market Data (GET endpoints)

These don't need request body:

```
GET /api/jobs/market/skills      → in-demand skills
GET /api/jobs/market/summary     → market overview  
GET /api/jobs/market/salaries    → salary ranges
GET /api/jobs/market/industry/{name}  → industry outlook
```

---

## Tips for n8n Workflows

- **Timeout**: Set HTTP Request timeout to 60s (LLM calls can be slow)
- **Retry**: Add 1-2 retries on failure
- **File handling**: Use Google Drive nodes for file storage, extract text before sending to API
- **Voice flow**: Chain STT service → this API → TTS service
- **Error handling**: Check `status` field in response

---

## Quick Test

```bash
curl -X POST http://localhost:8000/api/webhook/resume/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test",
    "data": {
      "resume_text": "John Doe, Python Developer, 3 years",
      "target_role": "Backend"
    }
  }'
```

---

## Questions?

Check `ENDPOINTS.md` in repo root for full response schemas.
