from pydantic import BaseModel


class JobAnalyzeRequest(BaseModel):
    job_description: str
