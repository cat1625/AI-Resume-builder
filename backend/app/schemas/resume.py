from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class ResumeCreate(BaseModel):
    title: str = "My Resume"
    content: Optional[str] = None
    structured_data: Optional[Dict[str, Any]] = None


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    structured_data: Optional[Dict[str, Any]] = None


class ResumeResponse(BaseModel):
    id: int
    title: str
    content: Optional[str] = None
    structured_data: Optional[Dict[str, Any]] = None
    ats_score: Optional[float] = None
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ATSScoreBreakdown(BaseModel):
    keyword_match: float
    semantic_similarity: float
    section_completeness: float
    formatting: float
    grammar: float
    action_verbs: float
    quantifiable_metrics: float
    readability: float
    total: float


class ResumeVersionResponse(BaseModel):
    id: int
    version: int
    ats_score: Optional[float] = None
    score_breakdown: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True
