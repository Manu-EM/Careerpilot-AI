from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models.job import Job
from app.models.profile import UserProfile
from app.schemas.job import JobResponse
from app.scrapers.greenhouse import scrape_greenhouse_jobs
from app.scrapers.lever import scrape_lever_jobs
from app.scrapers.web_scraper import scrape_remoteok_jobs
from app.scrapers.job_processor import process_and_save_jobs
from app.core.security import get_current_user_id
import uuid

router = APIRouter(prefix="/scraper", tags=["Job Scraper"])

class ScrapeRequest(BaseModel):
    keywords:    Optional[List[str]]  = ["developer", "engineer", "react", "python"]
    companies:   Optional[List[str]]  = None
    resume_text: Optional[str]        = None
    sources:     Optional[List[str]]  = ["greenhouse", "lever", "remoteok"]

class ScrapeResponse(BaseModel):
    message: str
    stats:   dict

async def get_user_location(db: AsyncSession, user_id: uuid.UUID):
    """Fetch user's city, state, country from their profile."""
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        return "", "", "India"
    return (
        profile.city    or "",
        profile.state   or "",
        profile.country or "India"
    )

async def run_scraping(
    keywords:    List[str],
    companies:   List[str],
    resume_text: str,
    sources:     List[str],
    db:          AsyncSession,
    user_city:   str = "",
    user_state:  str = "",
    user_country:str = "India"
):
    all_jobs = []

    if "greenhouse" in sources:
        print("Starting Greenhouse scraper...")
        gh_jobs = await scrape_greenhouse_jobs(
            companies=companies,
            keywords=keywords,
            user_country=user_country,
            user_state=user_state,
            user_city=user_city
        )
        all_jobs.extend(gh_jobs)

    if "lever" in sources:
        print("Starting Lever scraper...")
        lv_jobs = await scrape_lever_jobs(
            companies=companies,
            keywords=keywords,
            user_country=user_country,
            user_state=user_state,
            user_city=user_city
        )
        all_jobs.extend(lv_jobs)

    if "remoteok" in sources:
        print("Starting RemoteOK scraper...")
        ro_jobs = await scrape_remoteok_jobs(keywords=keywords)
        all_jobs.extend(ro_jobs)

    print(f"Total raw jobs collected: {len(all_jobs)}")

    stats = await process_and_save_jobs(
        db=db,
        raw_jobs=all_jobs,
        user_resume=resume_text,
        keywords=keywords,
        user_country=user_country,
        user_state=user_state,
        user_city=user_city
    )

    return stats


@router.post("/scrape", response_model=ScrapeResponse)
async def scrape_jobs(
    request:          ScrapeRequest,
    background_tasks: BackgroundTasks,
    db:               AsyncSession = Depends(get_db),
    user_id:          uuid.UUID    = Depends(get_current_user_id)
):
    city, state, country = await get_user_location(db, user_id)

    background_tasks.add_task(
        run_scraping,
        keywords=request.keywords,
        companies=request.companies,
        resume_text=request.resume_text or "",
        sources=request.sources,
        db=db,
        user_city=city,
        user_state=state,
        user_country=country
    )

    return ScrapeResponse(
        message=f"Scraping started for sources: {request.sources}",
        stats={"status": "running in background"}
    )


@router.post("/scrape-now", response_model=ScrapeResponse)
async def scrape_jobs_now(
    request: ScrapeRequest,
    db:      AsyncSession = Depends(get_db),
    user_id: uuid.UUID    = Depends(get_current_user_id)
):
    city, state, country = await get_user_location(db, user_id)

    stats = await run_scraping(
        keywords=request.keywords,
        companies=request.companies,
        resume_text=request.resume_text or "",
        sources=request.sources,
        db=db,
        user_city=city,
        user_state=state,
        user_country=country
    )

    return ScrapeResponse(
        message="Scraping complete!",
        stats=stats
    )


@router.get("/jobs", response_model=List[JobResponse])
async def get_scraped_jobs(
    limit:     int   = 20,
    skip:      int   = 0,
    min_score: float = 0,
    db:        AsyncSession = Depends(get_db)
):
    query = select(Job).where(
        Job.is_active == True,
        Job.match_score >= min_score
    ).order_by(desc(Job.match_score)).offset(skip).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/stats")
async def get_scraping_stats(db: AsyncSession = Depends(get_db)):
    total = await db.execute(select(Job))
    total_count = len(total.scalars().all())
    return {
        "total_jobs": total_count,
        "sources":    ["greenhouse", "lever", "remoteok"],
        "status":     "ready"
    }