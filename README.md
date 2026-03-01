# AI Resume Builder with Advanced ATS Scoring System

A production-ready, microservices-based AI Resume Builder featuring real-time ATS scoring, job description analysis, skill gap detection, and AI-powered resume optimization.

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20FastAPI%20%7C%20PostgreSQL%20%7C%20Redis-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

### Core Features
- **AI Resume Generator** – GPT-powered resume creation
- **Real-time ATS Scoring** – Keyword + Semantic similarity (TF-IDF, SBERT)
- **Job Description Analyzer** – Extract keywords and skills
- **Skill Gap Detection** – Compare resume vs job requirements
- **Resume Optimization Suggestions** – Actionable improvement tips
- **Version History Tracking** – Track resume iterations
- **AI Cover Letter Generator** – Personalized cover letters
- **Interview Question Generator** – Prepare with AI questions
- **Resume Ranking Simulator** – 6-second recruiter scan simulation

### ATS Scoring Logic
- TF-IDF keyword matching
- SBERT semantic similarity
- Section completeness check
- Formatting validation
- Grammar scoring
- Action verb detection
- Quantifiable metric detection
- Readability score

### Dashboard
- Resume analytics
- Score breakdown radar chart
- Skill gap heatmap
- Version comparison
- Dark/light mode
- Fully responsive UI

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nginx     │────▶│   Frontend  │     │   Backend   │
│  (Proxy)    │     │   (React)   │────▶│  (FastAPI)  │
└─────────────┘     └─────────────┘     └──────┬──────┘
       │                    │                   │
       │                    │                   ├────▶ PostgreSQL
       │                    │                   ├────▶ Redis
       │                    │                   └────▶ AI Engine
       │                    │
       └────────────────────┴─────────────────────────▶ AI Engine (NLP)
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local dev)
- Python 3.11+ (for local dev)

### 1. Clone & Configure

```bash
git clone <repo-url>
cd "AI Resume Builder with ATS Scoring System"
cp .env.example .env
# Edit .env - add OPENAI_API_KEY for GPT features
```

### 2. Run with Docker Compose

```bash
docker-compose up -d
```

- **Frontend**: http://localhost (via Nginx)
- **Backend API**: http://localhost/api
- **API Docs**: http://localhost/api/docs

### 3. Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
# Create PostgreSQL and Redis (or use Docker)
export DATABASE_URL=postgresql://user:pass@localhost:5432/resume_db
export REDIS_URL=redis://localhost:6379/0
uvicorn app.main:app --reload --port 8000
```

**AI Engine:**
```bash
cd ai-engine
pip install -r requirements.txt
python -m spacy download en_core_web_md
uvicorn main:app --reload --port 8001
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| POSTGRES_USER | PostgreSQL user | resume_user |
| POSTGRES_PASSWORD | PostgreSQL password | resume_pass |
| POSTGRES_DB | Database name | resume_db |
| REDIS_URL | Redis connection | redis://redis:6379/0 |
| JWT_SECRET | JWT signing key | (change in prod!) |
| OPENAI_API_KEY | OpenAI API key | (required for GPT) |
| AI_ENGINE_URL | AI service URL | http://ai-engine:8001 |

## API Documentation

- **Swagger UI**: `/api/docs`
- **ReDoc**: `/api/redoc`

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register user |
| POST | /auth/login | Login |
| GET | /resumes/ | List resumes |
| POST | /resumes/ | Create resume |
| POST | /resumes/{id}/score | ATS score resume |
| POST | /jobs/analyze | Analyze job description |
| POST | /ai/skill-gap | Skill gap detection |
| POST | /ai/generate-cover-letter | Generate cover letter |

## Sample Data

- `sample-data/job_descriptions.json` – Sample job postings
- `sample-data/sample_resume.txt` – Sample resume for testing

## Deployment

### AWS EC2 Deployment Guide

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed AWS EC2 setup instructions.

### Docker Production

```bash
docker-compose -f docker-compose.yml up -d
```

## Security

- JWT authentication
- Role-based access (user, admin)
- Input validation (Pydantic)
- Rate limiting (SlowAPI)
- CORS configuration

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TailwindCSS, Recharts, Framer Motion |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| AI Engine | spaCy, Sentence Transformers, scikit-learn |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Deployment | Docker, Nginx |

## License

MIT
