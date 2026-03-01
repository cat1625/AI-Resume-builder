from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import re

from scoring.ats_scorer import ATSScorer

app = FastAPI(title="AI Resume Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScoreRequest(BaseModel):
    resume_text: str
    job_description: str = ""


class AnalyzeJobRequest(BaseModel):
    job_description: str


class SkillGapRequest(BaseModel):
    resume_text: str
    job_description: str


class SuggestionsRequest(BaseModel):
    resume_text: str
    job_description: str = ""


# Lazy load scorer
_scorer = None


def get_scorer():
    global _scorer
    if _scorer is None:
        _scorer = ATSScorer()
    return _scorer


@app.get("/health")
def health():
    return {"status": "healthy", "service": "ai-engine"}


@app.post("/score")
def score_resume(request: ScoreRequest):
    scorer = get_scorer()
    result = scorer.score(request.resume_text, request.job_description)
    return result


@app.post("/analyze-job")
def analyze_job(request: AnalyzeJobRequest):
    scorer = get_scorer()
    return scorer.analyze_job(request.job_description)


@app.post("/skill-gap")
def skill_gap(request: SkillGapRequest):
    scorer = get_scorer()
    return scorer.detect_skill_gap(request.resume_text, request.job_description)


@app.post("/suggestions")
def suggestions(request: SuggestionsRequest):
    scorer = get_scorer()
    return scorer.get_suggestions(request.resume_text, request.job_description)
