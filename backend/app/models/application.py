from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.database import Base

class Application(Base):
    __tablename__ = "applications"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id      = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    job_id       = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    status       = Column(String, default="Saved")
    cover_letter = Column(Text)
    resume_used  = Column(String)
    notes        = Column(Text)
    applied_at   = Column(DateTime(timezone=True))
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())