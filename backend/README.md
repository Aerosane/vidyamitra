# VidyaMitra Backend

AI-powered career guidance API with optional n8n workflow integration.

## Architecture

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

**Frontend → API Server**: Primary path for authenticated operations, market data, job recommendations.

**Frontend → n8n**: Alternative path for AI features (resume analysis, interviews). n8n handles LLM calls directly via OpenRouter.

**API Server** can operate standalone OR alongside n8n workflows.

## Structure

```
backend/
├── api/                   # FastAPI server (PRIMARY)
│   ├── routes/
│   │   ├── webhooks.py    # Webhook endpoints (same format as n8n)
│   │   ├── resume.py      # Resume analysis/generation
│   │   ├── interview.py   # Mock interviews
│   │   ├── quiz.py        # Skill assessments  
│   │   ├── jobs.py        # Job recommendations & market data
│   │   └── learning.py    # Learning plans
│   ├── main.py            # FastAPI app entry
│   ├── llm.py             # GitHub Models LLM client
│   ├── auth.py            # Clerk JWT verification
│   ├── db.py              # Supabase client
│   ├── config.py          # Environment settings
│   ├── job_market.py      # 2025-2030 market research data
│   └── requirements.txt
│
└── n8n-workflows/         # n8n workflow templates (OPTIONAL)
    ├── 1. Resume Analyzer.json
    ├── 2. Resume Enhancer.json
    ├── 3. Resume Generator.json
    ├── 4. Interview Starter.json
    ├── 5. Interview Evaluator.json
    ├── 7. Quiz Generator.json
    └── 8. Learning Path Generator.json
```

## Quick Start

### 1. Setup Environment

```bash
cd api
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

**Required:**
- `GITHUB_TOKEN` - GitHub PAT with models:read scope

**Optional:**
- `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` - For data persistence
- `CLERK_SECRET_KEY` - For user authentication

### 3. Run Server

```bash
# Development
python main.py

# Production
./run.sh
```

Server runs at `http://localhost:8000`

## API Endpoints

See [ENDPOINTS.md](../ENDPOINTS.md) for full API documentation.

### Key Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/webhook/resume/analyze` | Analyze resume, get score |
| `POST /api/webhook/resume/enhance` | Get improved resume |
| `POST /api/webhook/resume/generate` | Generate from data |
| `POST /api/webhook/interview/start` | Start mock interview |
| `POST /api/webhook/interview/evaluate` | Evaluate answer |
| `POST /api/webhook/quiz/generate` | Generate skill quiz |
| `POST /api/webhook/jobs/recommend` | Get job recommendations |
| `GET /api/jobs/market/skills` | Get in-demand skills |

### Endpoint Types

| Type | Auth | Usage |
|------|------|-------|
| `/api/webhook/*` | None | AI features - usable by frontend OR n8n |
| `/api/resume/*`, `/api/interview/*` | Clerk JWT | User-facing authenticated endpoints |
| `/api/jobs/market/*` | None | Public market data |

### Frontend Integration

Frontend can call API endpoints directly:

```typescript
// Example: Direct API call from Next.js
const response = await fetch(`${API_URL}/api/webhook/resume/analyze`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: userId,
    data: { resume_text: text, target_role: role }
  })
});
```

## n8n Integration (Optional)

n8n workflows provide an alternative AI processing path. See [n8n-workflows/N8N.md](n8n-workflows/N8N.md) for details.

**Important:** n8n workflows are **self-contained** - they call OpenRouter LLM directly, not through this API server. Both paths produce compatible responses.

**When to use n8n:**
- Complex multi-step pipelines
- File processing (Google Drive integration)
- Custom LLM providers (OpenRouter)
- Workflow automation with triggers

**When to use API directly:**
- Simple request/response
- Lower latency requirements
- Direct frontend integration

## LLM Configuration

Uses GitHub Models API with `imperialorg` organization:

```
Endpoint: https://models.github.ai/orgs/imperialorg/inference/chat/completions
Model: openai/gpt-4.1
```

## Memory Optimization

Optimized for low-memory environments (tested on 1GB RAM VPS):

- Shared HTTP client via lifespan context
- Reduced max_tokens per endpoint
- Optional Supabase dependency
- Single worker, limited concurrency

## Testing

```bash
cd api
python test_api.py
```

Runs 23 tests covering all endpoints.

## Docker

```bash
cd api
docker build -t vidyamitra-api .
docker run -p 8000:8000 --env-file .env vidyamitra-api
```

## Tech Stack

- **Framework:** FastAPI
- **LLM:** GitHub Models (GPT-4.1)
- **Auth:** Clerk
- **Database:** Supabase (PostgreSQL)
- **Storage:** Google Drive (via n8n)
- **Automation:** n8n
