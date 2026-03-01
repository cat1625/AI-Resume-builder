from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.models.user import User
from app.models.resume import Resume
from app.auth.dependencies import get_current_user
from app.database import get_db
from sqlalchemy.orm import Session
from app.services.openai_service import OpenAIService

router = APIRouter()


class GenerateRequest(BaseModel):
    prompt: Optional[str] = None
    resume_id: Optional[int] = None
    job_description: Optional[str] = None


@router.post("/generate-resume")
async def generate_resume(
    request: GenerateRequest,
    current_user: User = Depends(get_current_user),
):
    service = OpenAIService()
    return await service.generate_resume(
        prompt=request.prompt or "",
        job_description=request.job_description or "",
    )


@router.post("/generate-cover-letter")
async def generate_cover_letter(
    request: GenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume_content = ""
    if request.resume_id:
        resume = db.query(Resume).filter(
            Resume.id == request.resume_id,
            Resume.user_id == current_user.id,
        ).first()
        if resume:
            resume_content = resume.content or ""

    service = OpenAIService()
    return await service.generate_cover_letter(
        resume_content=resume_content,
        job_description=request.job_description or "",
    )


@router.post("/generate-interview-questions")
async def generate_interview_questions(
    request: GenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume_content = ""
    if request.resume_id:
        resume = db.query(Resume).filter(
            Resume.id == request.resume_id,
            Resume.user_id == current_user.id,
        ).first()
        if resume:
            resume_content = resume.content or ""

    service = OpenAIService()
    return await service.generate_interview_questions(
        resume_content=resume_content,
        job_description=request.job_description or "",
    )


class SkillGapRequest(BaseModel):
    resume_text: str
    job_description: str


class SuggestionsRequest(BaseModel):
    resume_text: str
    job_description: str = ""


@router.post("/skill-gap")
async def detect_skill_gap(
    request: SkillGapRequest,
    current_user: User = Depends(get_current_user),
):
    from app.services.ai_client import AIClient
    ai_client = AIClient()
    return await ai_client.detect_skill_gap(request.resume_text, request.job_description)


@router.post("/suggestions")
async def get_suggestions(
    request: SuggestionsRequest,
    current_user: User = Depends(get_current_user),
):
    from app.services.ai_client import AIClient
    ai_client = AIClient()
    return await ai_client.get_optimization_suggestions(request.resume_text, request.job_description)
