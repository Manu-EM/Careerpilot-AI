from sqlalchemy import Column, String, Float, DateTime, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
import uuid
from app.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title        = Column(String, nullable=False)
    company      = Column(String, nullable=False)
    location     = Column(String)
    salary_min   = Column(Float)
    salary_max   = Column(Float)
    description  = Column(Text)
    requirements = Column(Text)
    source       = Column(String)
    source_url   = Column(String)
    match_score  = Column(Float, default=0.0)
    ats_score    = Column(Float, default=0.0)
    is_active    = Column(Boolean, default=True)
    embedding    = Column(Vector(384))
    posted_at    = Column(DateTime(timezone=True))
    created_at   = Column(DateTime(timezone=True), server_default=func.now())