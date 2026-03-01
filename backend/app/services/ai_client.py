import httpx
from app.config import settings


class AIClient:
    def __init__(self):
        self.base_url = settings.AI_ENGINE_URL

    async def score_resume(self, resume_text: str, job_description: str = "") -> dict:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/score",
                json={"resume_text": resume_text, "job_description": job_description},
            )
            response.raise_for_status()
            return response.json()

    async def analyze_job(self, job_description: str) -> dict:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/analyze-job",
                json={"job_description": job_description},
            )
            response.raise_for_status()
            return response.json()

    async def detect_skill_gap(self, resume_text: str, job_description: str) -> dict:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/skill-gap",
                json={"resume_text": resume_text, "job_description": job_description},
            )
            response.raise_for_status()
            return response.json()

    async def get_optimization_suggestions(self, resume_text: str, job_description: str = "") -> dict:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/suggestions",
                json={"resume_text": resume_text, "job_description": job_description},
            )
            response.raise_for_status()
            return response.json()
