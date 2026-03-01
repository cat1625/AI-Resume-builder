from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume, ResumeVersion
from app.schemas.resume import ResumeCreate, ResumeUpdate, ResumeResponse, ResumeVersionResponse
from app.auth.dependencies import get_current_user
from app.services.ai_client import AIClient
from app.services.languagetool_service import check_grammar

router = APIRouter()


@router.get("/", response_model=List[ResumeResponse])
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    return resumes


@router.post("/", response_model=ResumeResponse)
def create_resume(
    resume: ResumeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_resume = Resume(
        user_id=current_user.id,
        title=resume.title,
        content=resume.content,
        structured_data=resume.structured_data,
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    return db_resume


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.put("/{resume_id}", response_model=ResumeResponse)
def update_resume(
    resume_id: int,
    resume_update: ResumeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if resume_update.title is not None:
        resume.title = resume_update.title
    if resume_update.content is not None:
        resume.content = resume_update.content
    if resume_update.structured_data is not None:
        resume.structured_data = resume_update.structured_data

    db.commit()
    db.refresh(resume)
    return resume


@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted"}


@router.post("/{resume_id}/score")
async def score_resume(
    resume_id: int,
    job_description: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    ai_client = AIClient()
    result = await ai_client.score_resume(resume.content or "", job_description)

    resume.ats_score = result.get("total_score", 0)
    db.commit()

    # Save version
    version = ResumeVersion(
        resume_id=resume.id,
        version=resume.version,
        content=resume.content,
        structured_data=resume.structured_data,
        ats_score=resume.ats_score,
        score_breakdown=result,
    )
    db.add(version)
    resume.version += 1
    db.commit()

    return result


@router.get("/{resume_id}/versions", response_model=List[ResumeVersionResponse])
def get_resume_versions(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume.versions


@router.get("/{resume_id}/report")
async def get_resume_report(
    resume_id: int,
    job_description: Optional[str] = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Detailed ATS report with score breakdown, suggestions, and grammar (LanguageTool free API)."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    content = resume.content or ""
    ai_client = AIClient()

    # Get or compute ATS score breakdown
    score_data = None
    try:
        score_data = await ai_client.score_resume(content, job_description or "")
        resume.ats_score = score_data.get("total_score")
        db.commit()
    except Exception:
        # Use last version breakdown if AI engine unavailable
        last = db.query(ResumeVersion).filter(ResumeVersion.resume_id == resume_id).order_by(ResumeVersion.id.desc()).first()
        if last and last.score_breakdown:
            score_data = last.score_breakdown
        elif resume.ats_score is not None:
            score_data = {"total_score": resume.ats_score}

    # Suggestions (free - from our AI engine)
    suggestions_data = {"suggestions": []}
    try:
        suggestions_data = await ai_client.get_optimization_suggestions(content, job_description or "")
    except Exception:
        pass

    # Grammar (free - LanguageTool public API, no key)
    grammar_issues = await check_grammar(content)

    report = {
        "resume_id": resume.id,
        "title": resume.title,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "overall_score": score_data.get("total_score", 0) if score_data else 0,
        "score_breakdown": score_data or {},
        "suggestions": suggestions_data.get("suggestions", []),
        "grammar_issues": grammar_issues[:50],
        "job_description_preview": (job_description or "")[:200],
    }
    return report


@router.get("/{resume_id}/report/download", response_class=HTMLResponse)
async def download_resume_report(
    resume_id: int,
    job_description: Optional[str] = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download ATS report as HTML file."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    content = resume.content or ""
    ai_client = AIClient()
    score_data = None
    try:
        score_data = await ai_client.score_resume(content, job_description or "")
    except Exception:
        last = db.query(ResumeVersion).filter(ResumeVersion.resume_id == resume_id).order_by(ResumeVersion.id.desc()).first()
        if last and last.score_breakdown:
            score_data = last.score_breakdown
    if not score_data:
        score_data = {"total_score": resume.ats_score or 0}

    suggestions_data = {"suggestions": []}
    try:
        suggestions_data = await ai_client.get_optimization_suggestions(content, job_description or "")
    except Exception:
        pass
    grammar_issues = await check_grammar(content)

    total = score_data.get("total_score", 0) or 0
    breakdown = score_data
    suggestions = suggestions_data.get("suggestions", [])
    grammar = grammar_issues[:30]

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ATS Report - {resume.title}</title>
  <style>
    body {{ font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #1e293b; }}
    h1 {{ color: #0f172a; border-bottom: 2px solid #0ea5e9; padding-bottom: 0.5rem; }}
    h2 {{ color: #334155; margin-top: 1.5rem; }}
    .score {{ font-size: 2.5rem; font-weight: bold; color: #0ea5e9; }}
    .score-good {{ color: #059669; }}
    .score-ok {{ color: #d97706; }}
    .score-low {{ color: #dc2626; }}
    table {{ width: 100%; border-collapse: collapse; margin: 1rem 0; }}
    th, td {{ text-align: left; padding: 0.5rem; border-bottom: 1px solid #e2e8f0; }}
    th {{ background: #f1f5f9; }}
    ul {{ padding-left: 1.25rem; }}
    .grammar-item {{ background: #fef3c7; padding: 0.5rem; margin: 0.25rem 0; border-radius: 4px; }}
    .meta {{ color: #64748b; font-size: 0.875rem; margin-top: 2rem; }}
  </style>
</head>
<body>
  <h1>ATS Resume Report</h1>
  <p><strong>{resume.title}</strong></p>
  <p class="meta">Generated: {datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")}</p>

  <h2>Overall ATS Score</h2>
  <p class="score {'score-good' if total >= 70 else 'score-ok' if total >= 50 else 'score-low'}">{total:.0f}/100</p>

  <h2>Score Breakdown</h2>
  <table>
    <tr><th>Category</th><th>Score</th></tr>
    <tr><td>Keyword Match</td><td>{breakdown.get('keyword_match', 0):.0f}</td></tr>
    <tr><td>Semantic Similarity</td><td>{breakdown.get('semantic_similarity', 0):.0f}</td></tr>
    <tr><td>Section Completeness</td><td>{breakdown.get('section_completeness', 0):.0f}</td></tr>
    <tr><td>Formatting</td><td>{breakdown.get('formatting', 0):.0f}</td></tr>
    <tr><td>Grammar</td><td>{breakdown.get('grammar', 0):.0f}</td></tr>
    <tr><td>Action Verbs</td><td>{breakdown.get('action_verbs', 0):.0f}</td></tr>
    <tr><td>Quantifiable Metrics</td><td>{breakdown.get('quantifiable_metrics', 0):.0f}</td></tr>
    <tr><td>Readability</td><td>{breakdown.get('readability', 0):.0f}</td></tr>
  </table>

  <h2>Optimization Suggestions</h2>
  <ul>
    {"".join(f"<li>{s}</li>" for s in suggestions) or "<li>No suggestions.</li>"}
  </ul>

  <h2>Grammar & Spelling (LanguageTool)</h2>
  {"".join(f'<div class="grammar-item"><strong>{g.get("short_message", "Issue")}:</strong> {g.get("message", "")} Context: "{g.get("context", "")}"</div>' for g in grammar) or "<p>No issues found.</p>"}

  <p class="meta">This report uses free APIs: ATS scoring (local NLP) and LanguageTool (public API). No OpenAI required.</p>
</body>
</html>"""

    return Response(
        content=html,
        media_type="text/html",
        headers={
            "Content-Disposition": f'attachment; filename="ATS_Report_{resume.title.replace(" ", "_")}_{datetime.utcnow().strftime("%Y%m%d_%H%M")}.html"'
        },
    )
