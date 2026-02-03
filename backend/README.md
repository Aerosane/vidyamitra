# VidyaMitra Backend

AI-powered career guidance API with n8n workflow integration.

## Structure

```
backend/
├── api/                 # FastAPI server
│   ├── routes/          # API endpoints
│   │   ├── webhooks.py  # n8n webhook endpoints (no auth)
│   │   ├── resume.py    # Resume analysis/generation
│   │   ├── interview.py # Mock interviews
│   │   ├── quiz.py      # Skill assessments
│   │   ├── jobs.py      # Job recommendations & market data
│   │   └── learning.py  # Learning plans
│   ├── main.py          # FastAPI app entry
│   ├── llm.py           # GitHub Models LLM client
│   ├── auth.py          # Clerk JWT verification
│   ├── db.py            # Supabase client
│   ├── config.py        # Environment settings
│   ├── job_market.py    # 2025-2030 market research data
│   └── requirements.txt
│
└── n8n_workflows/       # n8n flow templates
    ├── resume_flow.json
    ├── interview_flow.json
    └── voice_flow.json
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

### Webhook vs Authenticated Endpoints

- `/api/webhook/*` - No auth required, designed for n8n
- `/api/resume/*`, `/api/interview/*`, etc. - Require Clerk JWT

## n8n Integration

Import workflow templates from `n8n_workflows/` into your n8n instance:

1. Open n8n → Workflows → Import
2. Select JSON file
3. Update webhook URLs to point to your API

### Workflow Architecture

```
┌─────────┐     ┌─────────┐     ┌─────────────┐     ┌──────────┐
│ Frontend│ ──► │   n8n   │ ──► │ VidyaMitra  │ ──► │  GitHub  │
│         │ ◄── │         │ ◄── │     API     │ ◄── │  Models  │
└─────────┘     └─────────┘     └─────────────┘     └──────────┘
                     │
                     ▼
               ┌──────────┐
               │  Google  │
               │  Drive   │
               └──────────┘
```

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
