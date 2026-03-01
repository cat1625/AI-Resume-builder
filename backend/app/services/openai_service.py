from openai import AsyncOpenAI
from app.config import settings


class OpenAIService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

    async def generate_resume(self, prompt: str, job_description: str = "") -> dict:
        if not self.client:
            return {"content": "OpenAI API key not configured. Add OPENAI_API_KEY to enable AI generation.", "error": True}

        system = "You are an expert resume writer. Create a professional, ATS-optimized resume."
        user_content = f"Create a resume based on: {prompt}"
        if job_description:
            user_content += f"\n\nTarget job description:\n{job_description}"

        response = await self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_content},
            ],
        )
        return {"content": response.choices[0].message.content}

    async def generate_cover_letter(self, resume_content: str, job_description: str) -> dict:
        if not self.client:
            return {"content": "OpenAI API key not configured.", "error": True}

        response = await self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert cover letter writer. Write compelling, personalized cover letters."},
                {"role": "user", "content": f"Resume:\n{resume_content}\n\nJob:\n{job_description}\n\nWrite a cover letter."},
            ],
        )
        return {"content": response.choices[0].message.content}

    async def generate_interview_questions(self, resume_content: str, job_description: str) -> dict:
        if not self.client:
            return {"questions": ["OpenAI API key not configured."], "error": True}

        response = await self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Generate 10 relevant interview questions based on the resume and job."},
                {"role": "user", "content": f"Resume:\n{resume_content}\n\nJob:\n{job_description}"},
            ],
        )
        content = response.choices[0].message.content
        questions = [q.strip() for q in content.split("\n") if q.strip() and q.strip()[0].isdigit()]
        return {"questions": questions if questions else content.split("\n")}
