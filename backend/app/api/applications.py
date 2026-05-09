from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid
from app.database import get_db
from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse
from app.core.security import get_current_user_id

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.get("/", response_model=List[ApplicationResponse])
async def get_applications(
    status: str = None,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    query = select(Application).where(Application.user_id == user_id)
    if status:
        query = query.where(Application.status == status)
    query = query.order_by(Application.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=ApplicationResponse)
async def create_application(
    data: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    # Check duplicate
    existing = await db.execute(
        select(Application).where(
            Application.user_id == user_id,
            Application.job_id == data.job_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already applied to this job")

    # Set status based on notes
    status = "Applied"
    if data.notes and "Saved" in data.notes:
        status = "Saved"

    application = Application(
        user_id=user_id,
        status=status,
        **data.model_dump()
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return application

@router.patch("/{app_id}", response_model=ApplicationResponse)
async def update_application(
    app_id: str,
    data: ApplicationUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    result = await db.execute(
        select(Application).where(
            Application.id == app_id,
            Application.user_id == user_id
        )
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    for key, value in data.model_dump(exclude_none=True).items():
        setattr(application, key, value)

    await db.commit()
    await db.refresh(application)
    return application

@router.delete("/{app_id}")
async def delete_application(
    app_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    result = await db.execute(
        select(Application).where(
            Application.id == app_id,
            Application.user_id == user_id
        )
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    await db.delete(application)
    await db.commit()
    return {"message": "Deleted successfully"}

@router.delete("/job/{job_id}")
async def delete_application_by_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    result = await db.execute(
        select(Application).where(
            Application.user_id == user_id,
            Application.job_id == uuid.UUID(job_id)
        )
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    await db.delete(application)
    await db.commit()
    return {"message": "Removed successfully"}