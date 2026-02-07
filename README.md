# VidyaMitra

AI-powered career guidance platform that helps users analyze resumes, enhance their profiles, practice interviews, and discover job opportunities through intelligent recommendations.

## What This Project Does

VidyaMitra provides five core features:

1. **Resume Analysis** — Parse and score uploaded resumes; extract skills, experience, and education; identify gaps and strengths.
2. **Resume Enhancement & Generation** — Rewrite or expand resume sections (summary, skills, achievements) tailored to target roles using LLM-powered suggestions.
3. **Mock Interviews** — Generate role-specific interview questions and evaluate candidate answers with constructive feedback.
4. **Quizzes & Assessments** — Create skill-based quizzes to validate knowledge areas and pinpoint learning gaps.
5. **Job-Market Recommendations** — Suggest relevant roles, in-demand keywords, and personalized improvement paths based on user profile and market trends.

## How It Works

- **Frontend** (Next.js) — Interactive UI for uploading resumes, viewing analyses, conducting mock interviews, and exploring recommendations.
- **Backend API** (FastAPI) — Processes resumes, orchestrates LLM calls (via GitHub Models, OpenRouter, or similar), and returns actionable insights.
- **Optional Automation** (n8n workflows) — Multi-step workflows for complex pipelines (e.g., fetching job listings, emailing summaries, integrating with Google Drive).

## Repository Layout

- `backend/api/` — FastAPI server with LLM integrations, resume parsing, and analysis logic. Entry point: `main.py`
- `backend/n8n-workflows/` — Optional n8n JSON workflow templates for advanced automation.
- `frontend/` — Next.js application with pages, components, and client-side logic.
- `ENDPOINTS.md` — Full API endpoint reference.

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 24+ with `pnpm`, `npm`, or `yarn`
- GitHub account with a Personal Access Token (for LLM access via GitHub Models)

## Key Features of the Implementation

- **LLM Orchestration** — Flexible provider support (GitHub Models, OpenRouter, etc.); swappable prompt templates for each feature.
- **Resume Parsing** — Extracts structured data (skills, experience, education) from uploaded PDFs and text.
- **Lightweight Backend** — Optimized for resource-constrained environments; single-worker design with shared HTTP clients.
- **Modular Architecture** — Each feature (analysis, enhancement, interviews, quizzes, recommendations) is independently pluggable.

## Testing

Run backend tests from the `backend/api/` folder:

```bash
python test_api.py
```
## n8n Workflows (Optional)

Pre-built workflow templates are available in `backend/n8n-workflows/`. These enable advanced automation (e.g., scheduled job fetches, multi-step analysis pipelines, third-party integrations) but are not required for core app functionality.

## Contributing

Contributions are welcome! Please open an issue or PR with:
- Feature requests or bug reports
- Improvements to prompts, LLM provider integrations, or resume parsing
- New workflow templates or assessment types

---
For detailed backend docs, see `backend/README.md`. For frontend details, explore the `frontend/` folder.