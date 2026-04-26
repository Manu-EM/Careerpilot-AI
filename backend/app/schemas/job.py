from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class JobResponse(BaseModel):
    id: UUID
    title: str
    company: str
    location: Optional[str]
    salary_min: Optional[float]
    salary_max: Optional[float]
    description: Optional[str]
    source: Optional[str]
    source_url: Optional[str]
    match_score: float
    ats_score: float
    posted_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}

class JobFilter(BaseModel):
    search: Optional[str] = None
    location: Optional[str] = None
    min_salary: Optional[float] = None
    min_match_score: Optional[float] = None