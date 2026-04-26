from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.database import get_db
from app.models.job import Job
from app.schemas.job import JobResponse

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("/", response_model=List[JobResponse])
async def get_jobs(
    search: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    min_match: Optional[float] = Query(None),
    skip: int = Query(0),
    limit: int = Query(20),
    db: AsyncSession = Depends(get_db)
):
    query = select(Job).where(Job.is_active == True)

    if search:
        query = query.where(
            Job.title.ilike(f"%{search}%") |
            Job.company.ilike(f"%{search}%")
        )
    if location:
        query = query.where(Job.location.ilike(f"%{location}%"))
    if min_match:
        query = query.where(Job.match_score >= min_match)

    query = query.order_by(Job.match_score.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job