from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.auth.dependencies import get_current_user, require_admin

router = APIRouter()


@router.get("/analytics")
async def admin_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    total_users = db.query(func.count(User.id)).scalar()
    total_resumes = db.query(func.count(Resume.id)).scalar()
    avg_score = db.query(func.avg(Resume.ats_score)).filter(Resume.ats_score.isnot(None)).scalar()
    return {
        "total_users": total_users,
        "total_resumes": total_resumes,
        "average_ats_score": round(float(avg_score or 0), 2),
    }
