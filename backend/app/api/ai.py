from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
import json
import io
import sys

from app.agents.workflow import run_career_workflow
from app.agents.match_agent import analyze_job_match
from app.agents.resume_agent import tailor_resume, extract_skills
from app.agents.cover_letter_agent import generate_cover_letter
from app.core.config import settings

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

# ── Existing Endpoints (unchanged) ───────────────

@router.post("/match")
async def match_job(request: MatchRequest):
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
    try:
        result = await extract_skills(request.resume_text)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/run-workflow")
async def run_workflow(request: WorkflowRequest):
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

# ── New: Resume Parser Endpoint ───────────────────

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Try pdfplumber first (text-based PDFs).
    Fall back to pytesseract OCR (scanned/image PDFs).
    """
    extracted = ""

    # Method 1: pdfplumber — works for text-based PDFs
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            # Only read first 3 pages — resumes are never longer
            for page in pdf.pages[:3]:
                text = page.extract_text()
                if text:
                    extracted += text + "\n"
    except Exception:
        pass

    # If pdfplumber got meaningful text, return it
    if len(extracted.strip()) > 100:
        return extracted.strip()

    # Method 2: OCR fallback for scanned PDFs
    try:
        import pytesseract
        from pdf2image import convert_from_bytes

        # Point to Tesseract on Windows
        if sys.platform == "win32":
            pytesseract.pytesseract.tesseract_cmd = (
                r"C:\Program Files\Tesseract-OCR\tesseract.exe"
            )
        poppler_path = r"D:\Installation Files\poppler\Library\bin" if sys.platform == "win32" else None

        # Only convert first 3 pages, lower DPI for speed
        images = convert_from_bytes(
            file_bytes,
            dpi=150,          # ← was default 200, lower = faster
            first_page=1,
            last_page=3,      # ← only first 3 pages
            poppler_path=poppler_path
        )

        
        ocr_text = ""
        for img in images:
            ocr_text += pytesseract.image_to_string(img) + "\n"

        if ocr_text.strip():
            return ocr_text.strip()

    except Exception:
        print(f"OCR fallback error: {e}")
        pass

    return extracted.strip()


def extract_text_from_txt(file_bytes: bytes) -> str:
    """Handle plain text and .doc files."""
    try:
        return file_bytes.decode("utf-8")
    except Exception:
        try:
            return file_bytes.decode("latin-1")
        except Exception:
            return ""

async def parse_resume_with_gemini(extracted_text: str) -> dict:
    from google import genai

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt = f"""You are a resume parser. Extract information from this resume text.

The text may have unusual formatting like spaced characters (e.g. "E M M A N U E L" means "EMMANUEL").
First mentally reconstruct the text by joining spaced letters, then extract the fields.

Return ONLY a valid JSON object. No markdown, no code blocks, no explanation, nothing else.

JSON format:
{{"name":"full name","email":"email address","phone":"phone number","address":"city and state","current_title":"job title or role","experience_years":0,"education":"degree and college","summary":"2-3 sentence professional summary","skills":["skill1","skill2"]}}

Rules:
- experience_years must be an integer (count years from earliest job to now)
- skills must be an array of the top 5 most important/relevant skills only, no more than 5
- If a field is not found return "" for strings, 0 for experience_years, [] for skills
- For name: join any spaced letters (e.g. "E M M A" = "EMMA")
- For phone: include country code if present
- Return ONLY the JSON object, absolutely nothing else

Resume text:
{extracted_text[:4000]}"""

    try:
        from google.genai import types

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=2000,
                temperature=0,
            )
        )

        raw = response.text.strip()
        print(f"Gemini raw response: {raw[:200]}")  # ← debug log

        # Strip markdown if present
       
        if "```json" in raw:
            raw = raw.split("```json")[1]
            if "```" in raw:
                raw = raw.split("```")[0]
            raw = raw.strip()
        elif "```" in raw:
            parts = raw.split("```")
            # Take the part that looks like JSON
            for part in parts:
                part = part.strip()
                if part.startswith("{"):
                    raw = part
                    break

        # Find JSON object in response even if there's extra text
        start = raw.find('{')
        end   = raw.rfind('}') + 1
        if start != -1 and end > start:
            raw = raw[start:end]

        result = json.loads(raw)

        # Clean up spaced names (e.g. "E M M A" → "EMMA")
        if result.get("name"):
            name = result["name"]
            # If name has single chars separated by spaces, join them
            parts = name.split()
            if all(len(p) == 1 for p in parts):
                result["name"] = "".join(parts).title()

        return result

    except json.JSONDecodeError as e:
        print(f"Gemini JSON parse error: {e}, raw: {raw[:300]}")
        return {
            "name": "", "email": "", "phone": "", "address": "",
            "current_title": "", "experience_years": 0,
            "education": "", "summary": "", "skills": []
        }
    except Exception as e:
        print(f"Gemini error: {e}")
        return {
            "name": "", "email": "", "phone": "", "address": "",
            "current_title": "", "experience_years": 0,
            "education": "", "summary": "", "skills": []
        }


@router.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    """
    Upload a resume PDF/TXT/DOC.
    Extracts text with pdfplumber (or OCR fallback),
    then uses Gemini AI to parse all fields.
    Returns structured data + raw extracted text for preview.
    """
    # Validate file type
    allowed = {
        "application/pdf", "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }
    filename = (file.filename or "").lower()
    is_pdf = filename.endswith(".pdf") or file.content_type == "application/pdf"
    is_txt = filename.endswith(".txt") or filename.endswith(".doc") or filename.endswith(".docx")

    if not (is_pdf or is_txt):
        raise HTTPException(
            status_code=400,
            detail="Only PDF, TXT, DOC or DOCX files are supported"
        )

    try:
        file_bytes = await file.read()

        # Extract raw text
        if is_pdf:
            extracted_text = extract_text_from_pdf(file_bytes)
        else:
            extracted_text = extract_text_from_txt(file_bytes)

        if not extracted_text.strip():
            return {
                "status": "error",
                "message": "Could not extract text from this file. Please try a different format or paste your resume manually.",
                "data": {
                    "name": "", "email": "", "phone": "", "address": "",
                    "current_title": "", "experience_years": 0,
                    "education": "", "summary": "", "skills": []
                },
                "extracted_text": ""
            }

        # Parse with Gemini
        parsed = await parse_resume_with_gemini(extracted_text)

        return {
            "status": "success",
            "data": parsed,
            "extracted_text": extracted_text[:3000]  # Preview (first 3000 chars)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))