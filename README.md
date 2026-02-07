# VidyaMitra

AI-powered career guidance platform (frontend + API + optional n8n workflows).

## Overview

VidyaMitra provides resume analysis, resume enhancement/generation, mock interviews, quizzes, and job-market recommendations. The repo contains a Next.js frontend, a FastAPI backend optimized for small VPS instances, and a set of optional n8n workflow templates for multi-step automation.

## Repository Layout

- `backend/` — FastAPI backend, LLM integration, DB helpers, and n8n workflow templates.
	- `backend/api/` — primary API server (entry: `main.py`).
	- `backend/n8n-workflows/` — n8n JSON workflow templates.
- `frontend/` — Next.js app (app directory, API routes, components).
- `ENDPOINTS.md` — API endpoint reference used by frontend and workflows.

## Quickstart

Prerequisites:
- Python 3.11+ (recommended)
- Node.js 18+ and a package manager (`pnpm`/`npm`/`yarn`) for the frontend
- Optionally Docker for containerized runs

### Backend (local)

1. Open a terminal and change into the API folder:

```bash
cd backend/api
```

2. Create and activate a virtual environment, then install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

3. Copy example environment and set required vars:

```bash
cp .env.example .env
# Edit .env to add GITHUB_TOKEN and any optional keys (SUPABASE, CLERK, etc.)
```

Required environment variables:

- `GITHUB_TOKEN` — GitHub PAT for GitHub Models access (models:read scope)

Optional:

- `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` — if using Supabase
- `CLERK_SECRET_KEY` — for authenticated endpoints

4. Start the server (development):

```bash
python main.py
# Or: ./run.sh (production wrapper)
```

The API listens on port `8000` by default. Open `http://localhost:8000/docs` when `DEBUG` is enabled to view the OpenAPI docs.

### Frontend (local)

1. From repo root:

```bash
cd frontend
```

2. Install dependencies and run:

```bash
pnpm install   # or npm install
pnpm dev       # or npm run dev
```

The frontend runs on `http://localhost:3000`.

### Optional: Docker (backend)

```bash
cd backend/api
docker build -t vidyamitra-api .
docker run -p 8000:8000 --env-file .env vidyamitra-api
```

## n8n Workflows

Pre-built workflow templates live in `backend/n8n-workflows/` and `frontend/n8n-workflows/`. These workflows are optional and call LLM providers (OpenRouter) directly; they are not required to run the API or frontend.

## Testing

Backend tests can be run from the API folder:

```bash
cd backend/api
python test_api.py
```

## Notes and Recommendations

- The backend is tuned for low-memory VPS (1GB RAM): single worker, shared HTTP client, reduced concurrency limits.
- Use n8n for complex pipelines, file handling, or Google Drive integrations; use the API for low-latency, direct frontend requests.
- See `ENDPOINTS.md` for full endpoint details and request/response examples.

## Contributing

If you'd like to contribute, please open an issue or PR describing the change.

---

For detailed backend docs see `backend/README.md` and for frontend details see the `frontend` folder.
