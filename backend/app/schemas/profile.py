from pydantic import BaseModel
from uuid import UUID
from typing import Optional, List
from datetime import datetime

class ProfileCreate(BaseModel):
    job_title:            Optional[str] = None
    phone:                Optional[str] = None
    city:    Optional[str] = None
    state:   Optional[str] = None
    country: Optional[str] = "India"
    resume_text:          Optional[str] = None
    resume_filename: Optional[str] = None
    skills:               Optional[List[str]] = []
    preferred_roles:      Optional[List[str]] = []
    preferred_locations:  Optional[List[str]] = []
    salary_range:         Optional[str] = None
    auto_apply:           Optional[bool] = False
    auto_apply_threshold: Optional[int] = 90
    experience_years:     Optional[int] = 0
    education:            Optional[str] = None
    summary:              Optional[str] = None
    linkedin_url:         Optional[str] = None
    github_url:           Optional[str] = None
    portfolio_url:        Optional[str] = None

class ProfileUpdate(ProfileCreate):
    pass

class ProfileResponse(ProfileCreate):
    id:         UUID
    user_id:    UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}