# VidyaMitra API Documentation

Base URL: `http://localhost:8000/api`

## Overview

This is the **FastAPI server** - the primary backend for VidyaMitra frontend.

**Alternative:** n8n workflows also provide AI endpoints with the same request/response format. See [backend/n8n-workflows/N8N.md](backend/n8n-workflows/N8N.md).

## Authentication

Most endpoints require a Bearer token (Clerk JWT) in the Authorization header:
```
Authorization: Bearer <clerk_jwt_token>
```

**Webhook endpoints** (`/api/webhook/*`) do not require auth - designed for direct frontend calls or n8n integration.

---

## Health Check

### `GET /health`
Check if API is running.

**Response:**
```json
{"status": "healthy"}
```

---

## Resume Endpoints

### `POST /api/webhook/resume/analyze`
Analyze a resume and get detailed scoring.

**Request:**
```json
{
  "user_id": "user_123",
  "data": {
    "resume_text": "John Doe\nSenior Developer\n5 years Python...",
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
    "categories": {
      "format": 15,
      "experience": 20,
      "skills": 22,
      "education": 10,
      "achievements": 5
    },
    "strengths": ["Python expertise", "Leadership experience"],
    "improvements": ["Add metrics", "Include certifications"],
    "keywords_missing": ["AWS", "Kubernetes"],
    "market_readiness": "medium"
  }
}
```

---

### `POST /api/webhook/resume/enhance`
Get an improved version of the resume.

**Request:**
```json
{
  "user_id": "user_123",
  "data": {
    "resume_text": "John Doe, Python developer, 2 years...",
    "target_role": "Backend Developer"
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "enhanced": {
    "enhanced_resume": "## John Doe\n\n**Backend Developer**\n...",
    "changes": ["Added action verbs", "Quantified achievements"],
    "ats_score_before": 45,
    "ats_score_after": 78
  }
}
```

---

### `POST /api/webhook/resume/generate`
Generate a complete resume from structured data.

**Request:**
```json
{
  "user_id": "user_123",
  "data": {
    "personal_info": {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "555-1234",
      "location": "San Francisco, CA",
      "linkedin": "linkedin.com/in/janesmith"
    },
    "summary": "Passionate full-stack developer...",
    "experience": [
      {
        "title": "Senior Developer",
        "company": "TechCorp",
        "duration": "2021-2024",
        "highlights": [
          "Built REST APIs serving 1M requests/day",
          "Led team of 4 developers"
        ]
      }
    ],
    "education": [
      {
        "degree": "BS Computer Science",
        "institution": "UC Berkeley",
        "year": "2020"
      }
    ],
    "skills": ["Python", "React", "AWS", "PostgreSQL"],
    "certifications": ["AWS Solutions Architect"],
    "target_role": "Full Stack Developer"
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "resume": "# Jane Smith\n\n**Full Stack Developer**\n\njane@example.com | 555-1234 | San Francisco, CA\n\n## Summary\n..."
}
```

---

## Interview Endpoints

### `POST /api/webhook/interview/start`
Start a mock interview session.

**Request:**
```json
{
  "user_id": "user_123",
  "data": {
    "domain": "backend",
    "role": "Python Developer",
    "difficulty": "intermediate",
    "num_questions": 5
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "interview_id": "int_abc123",
  "questions": [
    {
      "text": "Explain the difference between a list and tuple in Python.",
      "type": "technical",
      "expected_points": ["Mutability", "Performance", "Use cases"],
      "difficulty": "medium"
    },
    {
      "text": "Tell me about a challenging project you worked on.",
      "type": "behavioral",
      "expected_points": ["Problem description", "Actions taken", "Results"],
      "difficulty": "medium"
    }
  ]
}
```

---

### `POST /api/webhook/interview/evaluate`
Evaluate an interview answer.

**Request:**
```json
{
  "user_id": "user_123",
  "data": {
    "question": "Explain REST API best practices",
    "answer": "REST APIs should use proper HTTP methods like GET, POST, PUT, DELETE...",
    "expected_points": ["HTTP methods", "Status codes", "Versioning"]
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "evaluation": {
    "score": 68,
    "grade": "C+",
    "feedback": "Good understanding of basics but lacks depth...",
    "strengths": ["Mentioned HTTP methods correctly"],
    "improvements": ["Add examples", "Discuss error handling"],
    "would_hire": false
  }
}
```

---

### `POST /api/webhook/voice/process`
Process voice interview turn (for STT → LLM → TTS flow).

**Request:**
```json
{
  "user_id": "user_123",
  "data": {
    "transcript": "I have 5 years of Python experience with FastAPI and Django.",
    "current_question": "Tell me about your backend experience",
    "context": {
      "question_index": 0,
      "total_questions": 5,
      "next_question": "What databases have you worked with?"
    }
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "evaluation": {
    "score": 65,
    "grade": "C",
    "feedback": "Mentioned relevant frameworks but lacks specific examples...",
    "strengths": ["Relevant tech stack"],
    "improvements": ["Give concrete project examples"]
  },
  "response_text": "Good start. Next: What databases have you worked with?",
  "is_complete": false
}
```

---

## Quiz Endpoints

### `POST /api/webhook/quiz/generate`
Generate a skill assessment quiz.

**Request:**
```json
{
  "user_id": "user_123",
  "data": {
    "skill": "Python",
    "difficulty": "intermediate",
    "num_questions": 5
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "skill": "Python",
  "questions": [
    {
      "question": "What will `[1,2,3] * 2` return?",
      "options": [
        "A) [2, 4, 6]",
        "B) [1, 2, 3, 1, 2, 3]",
        "C) [1, 2, 3, 2]",
        "D) Error"
      ],
      "correct": "B",
      "explanation": "The * operator replicates the list."
    }
  ]
}
```

---

### `POST /api/webhook/quiz/evaluate`
Evaluate quiz answers.

**Request:**
```json
{
  "user_id": "user_123",
  "data": {
    "skill": "Python",
    "questions": [
      {
        "question": "What is a decorator?",
        "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
        "correct": "A"
      }
    ],
    "answers": ["A"]
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "result": {
    "score": 100,
    "correct": 1,
    "total": 1,
    "passed": true,
    "feedback": "Great job!",
    "details": [
      {
        "question": 1,
        "correct": true,
        "your_answer": "A",
        "correct_answer": "A",
        "explanation": "..."
      }
    ]
  },
  "quiz_id": "quiz_abc123"
}
```

---

## Job & Learning Endpoints

### `POST /api/webhook/jobs/recommend`
Get job recommendations based on skills.

**Request:**
```json
{
  "user_id": "user_123",
  "data": {
    "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
    "experience_years": 3,
    "target_role": "Backend Developer",
    "location": "Remote"
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "jobs": [
    {
      "title": "Backend Developer",
      "match_percent": 90,
      "skills_matched": ["Python", "FastAPI", "PostgreSQL", "Docker"],
      "skills_to_learn": ["AWS", "Kubernetes"],
      "salary_range_usd": "$90,000 - $130,000",
      "growth_outlook": "strong"
    },
    {
      "title": "DevOps Engineer",
      "match_percent": 65,
      "skills_matched": ["Docker", "Python"],
      "skills_to_learn": ["Terraform", "CI/CD"],
      "salary_range_usd": "$100,000 - $150,000",
      "growth_outlook": "strong"
    }
  ]
}
```

---

### `POST /api/webhook/learning/generate`
Generate a personalized learning plan.

**Request:**
```json
{
  "user_id": "user_123",
  "data": {
    "gaps": ["AWS", "Kubernetes", "CI/CD"],
    "target_role": "DevOps Engineer"
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "plan_id": "plan_abc123",
  "plan": [
    {
      "skill": "AWS",
      "priority": "high",
      "resources": [
        {
          "title": "AWS Certified Solutions Architect",
          "type": "course",
          "platform": "Udemy"
        },
        {
          "title": "AWS Free Tier Hands-on",
          "type": "practice",
          "platform": "AWS"
        }
      ]
    },
    {
      "skill": "Kubernetes",
      "priority": "high",
      "resources": [
        {
          "title": "Kubernetes Basics",
          "type": "course",
          "platform": "Coursera"
        }
      ]
    }
  ]
}
```

---

## Market Data Endpoints (No Auth Required)

### `GET /api/jobs/market/skills`
Get in-demand skills data.

**Response:**
```json
{
  "technical_skills": [
    {"skill": "AI/Machine Learning", "demand": "critical", "growth": "65%"},
    {"skill": "Cloud Computing", "demand": "critical", "growth": "45%"}
  ],
  "soft_skills": [
    {"skill": "Adaptability", "demand": "high"},
    {"skill": "Communication", "demand": "high"}
  ]
}
```

---

### `GET /api/jobs/market/summary`
Get job market summary.

**Response:**
```json
{
  "fastest_growing": [
    {"role": "AI/ML Engineer", "growth": "55%+", "demand": "very_high"}
  ],
  "declining": [
    {"role": "Data Entry Clerk", "decline": "-30%", "automation_risk": "very_high"}
  ],
  "hot_skills": ["AI/ML", "Cloud", "Cybersecurity"],
  "outdated_skills": ["COBOL", "Flash"]
}
```

---

### `GET /api/jobs/market/salaries`
Get salary ranges by role.

---

### `GET /api/jobs/market/industry/{industry}`
Get outlook for specific industry.

**Industries:** `technology`, `healthcare`, `finance`, `data_science`, `marketing`, `renewable_energy`

---

### `POST /api/jobs/market/skill-gap`
Analyze skill gaps for a target role.

**Request:**
```json
{
  "skills": ["Python", "SQL", "Git"],
  "target_role": "ML Engineer"
}
```

**Response:**
```json
{
  "target_role": "ML Engineer",
  "skills_matched": ["python"],
  "skills_missing": ["tensorflow", "pytorch", "mlops"],
  "match_percent": 25,
  "priority_skills": ["tensorflow", "pytorch"]
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "status": "error",
  "message": "Description of what went wrong"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad request (missing/invalid fields)
- `401` - Unauthorized (missing/invalid token)
- `500` - Server error

---

## Rate Limits

- Webhook endpoints: 60 requests/minute
- Authenticated endpoints: 120 requests/minute
- Market data endpoints: No limit (cached data)

---

## Frontend Integration Example

```javascript
// Example: Analyze a resume
async function analyzeResume(resumeText, targetRole) {
  const response = await fetch('http://localhost:8000/api/webhook/resume/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: 'demo_user',
      data: {
        resume_text: resumeText,
        target_role: targetRole
      }
    })
  });
  
  const result = await response.json();
  return result.analysis;
}

// Example: Start interview
async function startInterview(domain, role) {
  const response = await fetch('http://localhost:8000/api/webhook/interview/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: 'demo_user',
      data: { domain, role, difficulty: 'intermediate' }
    })
  });
  
  const result = await response.json();
  return result.questions;
}
```

---

## n8n Workflow Integration

These webhook endpoints are designed to be called from n8n workflows:

1. **Webhook Trigger** → receives request from frontend
2. **HTTP Request** → calls VidyaMitra API
3. **Process Response** → format/store results
4. **Respond to Webhook** → send back to frontend

Example n8n HTTP Request node config:
```
Method: POST
URL: http://localhost:8000/api/webhook/resume/analyze
Body: {{ $json }}
```
