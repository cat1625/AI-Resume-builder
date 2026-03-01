from fastapi import APIRouter, Depends
from app.models.user import User
from app.auth.dependencies import get_current_user
from app.services.ai_client import AIClient
from app.schemas.job import JobAnalyzeRequest

router = APIRouter()


@router.post("/analyze")
async def analyze_job_description(
    request: JobAnalyzeRequest,
    current_user: User = Depends(get_current_user),
):
    ai_client = AIClient()
    return await ai_client.analyze_job(request.job_description)
