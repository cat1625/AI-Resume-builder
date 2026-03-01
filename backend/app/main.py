from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.api import auth, resumes, jobs, ai_features, admin
from app.middleware.rate_limit import limiter

app = FastAPI(
    title="AI Resume Builder API",
    description="Production-ready AI Resume Builder with Advanced ATS Scoring",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(resumes.router, prefix="/resumes", tags=["Resumes"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(ai_features.router, prefix="/ai", tags=["AI Features"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])


@app.on_event("startup")
async def startup():
    from app.init_db import init_db
    init_db()


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "backend"}


@app.get("/")
async def root():
    return {"message": "AI Resume Builder API", "docs": "/docs"}
