from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ApplicationCreate(BaseModel):
    job_id: UUID
    cover_letter: Optional[str] = None
    resume_used: Optional[str] = None
    notes: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: UUID
    user_id: UUID
    job_id: UUID
    status: str
    cover_letter: Optional[str]
    resume_used: Optional[str]
    notes: Optional[str]
    applied_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}