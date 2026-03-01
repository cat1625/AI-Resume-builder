from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://resume_user:resume_pass@localhost:5432/resume_db"
    REDIS_URL: str = "redis://localhost:6379/0"
    AI_ENGINE_URL: str = "http://localhost:8001"
    JWT_SECRET: str = "your-super-secret-jwt-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60
    OPENAI_API_KEY: str = ""
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    @property
    def cors_origins_list(self) -> List[str]:
        return [x.strip() for x in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
