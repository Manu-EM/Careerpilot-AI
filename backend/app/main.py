from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, jobs, applications, ai, scraper, profile
from app.database import engine, Base

app = FastAPI(
    title=settings.APP_NAME,
    description="Autonomous AI Career Agent API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS - allows React frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://careerpilot.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(jobs.router, prefix="/api/v1")
app.include_router(applications.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(scraper.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")

# Health check
@app.get("/")
async def root():
    return {"message": "CareerPilot AI API is running!"}

@app.get("/health")
async def health():
    return {"status": "healthy", "app": settings.APP_NAME}

# Create tables on startup
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Database tables created")
    print("✓ CareerPilot AI API started")