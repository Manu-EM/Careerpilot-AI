from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, LargeBinary
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
import uuid
from app.database import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id         = Column(UUID(as_uuid=True), nullable=False, unique=True, index=True)
    job_title       = Column(String, nullable=True)
    phone           = Column(String, nullable=True)
    city    = Column(String, nullable=True)
    state   = Column(String, nullable=True)
    country = Column(String, nullable=True, default="India")
    resume_text     = Column(Text, nullable=True)
    resume_filename = Column(String, nullable=True)
    resume_file     = Column(LargeBinary, nullable=True)
    skills          = Column(ARRAY(String), default=[])
    preferred_roles = Column(ARRAY(String), default=[])
    preferred_locations = Column(ARRAY(String), default=[])
    salary_range    = Column(String, nullable=True)
    auto_apply      = Column(Boolean, default=False)
    auto_apply_threshold = Column(Integer, default=90)
    experience_years = Column(Integer, default=0)
    education       = Column(String, nullable=True)
    summary         = Column(Text, nullable=True)
    linkedin_url    = Column(String, nullable=True)
    github_url      = Column(String, nullable=True)
    portfolio_url   = Column(String, nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())


class UserResume(Base):
    __tablename__ = "user_resumes"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id     = Column(UUID(as_uuid=True), nullable=False, index=True)
    filename    = Column(String, nullable=False)
    file_data   = Column(LargeBinary, nullable=False)
    file_size   = Column(Integer, default=0)
    is_active   = Column(Boolean, default=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())