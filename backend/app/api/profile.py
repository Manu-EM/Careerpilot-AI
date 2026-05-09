from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.profile import UserProfile, UserResume
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from app.core.security import get_current_user_id
import uuid

router = APIRouter(prefix="/profile", tags=["Profile"])

# ── Profile CRUD ──────────────────────────────────

@router.get("/", response_model=ProfileResponse)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.post("/", response_model=ProfileResponse)
async def create_profile(
    data: ProfileCreate,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    existing = result.scalar_one_or_none()

    if existing:
        for key, value in data.model_dump(exclude_none=True).items():
            setattr(existing, key, value)
        await db.commit()
        await db.refresh(existing)
        return existing

    profile = UserProfile(user_id=user_id, **data.model_dump())
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.patch("/", response_model=ProfileResponse)
async def update_profile(
    data: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    for key, value in data.model_dump(exclude_none=True).items():
        setattr(profile, key, value)

    await db.commit()
    await db.refresh(profile)
    return profile


# ── Resume Vault ──────────────────────────────────

@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    # Check 10 resume limit
    count_result = await db.execute(
        select(func.count(UserResume.id)).where(UserResume.user_id == user_id)
    )
    count = count_result.scalar()
    if count >= 10:
        raise HTTPException(status_code=400, detail="Maximum 10 resumes allowed")

    file_bytes = await file.read()

    # First resume is automatically set as active
    is_first = count == 0

    resume = UserResume(
        user_id   = user_id,
        filename  = file.filename,
        file_data = file_bytes,
        file_size = len(file_bytes),
        is_active = is_first
    )
    db.add(resume)
    await db.commit()
    return {"message": "Resume uploaded", "filename": file.filename}


@router.get("/resumes")
async def list_resumes(
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    result = await db.execute(
        select(UserResume)
        .where(UserResume.user_id == user_id)
        .order_by(UserResume.uploaded_at.desc())
    )
    resumes = result.scalars().all()
    return [
        {
            "id":          str(r.id),
            "filename":    r.filename,
            "file_size":   r.file_size,
            "is_active":   r.is_active,
            "uploaded_at": r.uploaded_at.isoformat() if r.uploaded_at else ""
        }
        for r in resumes
    ]


@router.get("/resumes/{resume_id}/download")
async def download_resume_by_id(
    resume_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    result = await db.execute(
        select(UserResume).where(
            UserResume.id == resume_id,
            UserResume.user_id == user_id
        )
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    content_type = (
        "application/pdf"
        if (resume.filename or "").endswith(".pdf")
        else "application/octet-stream"
    )
    return Response(
        content=resume.file_data,
        media_type=content_type,
        headers={"Content-Disposition": f"attachment; filename={resume.filename}"}
    )


@router.patch("/resumes/{resume_id}/set-active")
async def set_active_resume(
    resume_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    # Deactivate all resumes for this user
    all_result = await db.execute(
        select(UserResume).where(UserResume.user_id == user_id)
    )
    for r in all_result.scalars().all():
        r.is_active = False

    # Activate the selected one
    result = await db.execute(
        select(UserResume).where(
            UserResume.id == resume_id,
            UserResume.user_id == user_id
        )
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume.is_active = True
    await db.commit()
    return {"message": "Active resume updated"}


@router.delete("/resumes/{resume_id}")
async def delete_resume(
    resume_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    result = await db.execute(
        select(UserResume).where(
            UserResume.id == resume_id,
            UserResume.user_id == user_id
        )
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    await db.delete(resume)
    await db.commit()
    return {"message": "Resume deleted"}