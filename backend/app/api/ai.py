from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.agents.workflow import run_career_workflow
from app.agents.match_agent import analyze_job_match
from app.agents.resume_agent import tailor_resume, extract_skills
from app.agents.cover_letter_agent import generate_cover_letter

router = APIRouter(prefix="/ai", tags=["AI Agents"])

# ── Request Models ────────────────────────────────

class MatchRequest(BaseModel):
    resume_text: str
    job_description: str

class ResumeRequest(BaseModel):
    resume_text: str
    job_description: str
    job_title: str
    company: str

class CoverLetterRequest(BaseModel):
    resume_text: str
    job_description: str
    job_title: str
    company: str
    candidate_name: Optional[str] = "Candidate"

class WorkflowRequest(BaseModel):
    resume_text: str
    job_description: str
    job_title: str
    company: str
    candidate_name: Optional[str] = "Candidate"
    user_id: Optional[str] = ""
    job_id: Optional[str] = ""

class SkillsRequest(BaseModel):
    resume_text: str

# ── Endpoints ─────────────────────────────────────

@router.post("/match")
async def match_job(request: MatchRequest):
    """
    Analyze how well a resume matches a job.
    Returns match score, matched skills, missing skills.
    """
    try:
        result = await analyze_job_match(
            request.resume_text,
            request.job_description
        )
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tailor-resume")
async def tailor_resume_endpoint(request: ResumeRequest):
    """
    Tailor a resume for a specific job using Gemini AI.
    Returns the tailored resume and keyword analysis.
    """
    try:
        result = await tailor_resume(
            request.resume_text,
            request.job_description,
            request.job_title,
            request.company
        )
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cover-letter")
async def cover_letter_endpoint(request: CoverLetterRequest):
    """
    Generate a tailored cover letter for a job.
    """
    try:
        result = await generate_cover_letter(
            request.resume_text,
            request.job_description,
            request.job_title,
            request.company,
            request.candidate_name
        )
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-skills")
async def extract_skills_endpoint(request: SkillsRequest):
    """
    Extract skills and experience from a resume.
    """
    try:
        result = await extract_skills(request.resume_text)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/run-workflow")
async def run_workflow(request: WorkflowRequest):
    """
    Run the full CareerPilot AI workflow for one job.
    Match → Skills → Tailor → Cover Letter → Finalize
    """
    try:
        result = await run_career_workflow(
            resume_text=request.resume_text,
            job_description=request.job_description,
            job_title=request.job_title,
            company=request.company,
            candidate_name=request.candidate_name,
            user_id=request.user_id,
            job_id=request.job_id
        )
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))