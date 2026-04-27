import json
from google import genai
from app.core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)


async def tailor_resume(
    resume_text: str,
    job_description: str,
    job_title: str,
    company: str
) -> dict:
    try:
        tailor_prompt = f"""
You are an expert resume writer and ATS specialist.
Tailor this resume for the job below. Keep all facts true.
Reword bullet points to match job keywords naturally.

Original Resume:
{resume_text[:3000]}

Job Title: {job_title}
Company: {company}
Job Description:
{job_description[:1500]}

Return the complete tailored resume text only.
"""
        tailored = client.models.generate_content(model="gemini-2.5-flash", contents=tailor_prompt)

        keywords_prompt = f"""
Extract top 10 keywords from this job description missing from the resume.

Resume: {resume_text[:2000]}
Job Description: {job_description[:1500]}

Respond in JSON only:
{{
    "missing_keywords": ["keyword1", "keyword2"],
    "present_keywords": ["keyword3", "keyword4"],
    "ats_tips": ["tip1", "tip2"]
}}
"""
        keywords_response = client.models.generate_content(model="gemini-2.5-flash", contents=keywords_prompt)
        content = keywords_response.text.strip()

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]

        keywords_data = json.loads(content)

        return {
            "tailored_resume": tailored.text,
            "missing_keywords": keywords_data.get("missing_keywords", []),
            "present_keywords": keywords_data.get("present_keywords", []),
            "ats_tips": keywords_data.get("ats_tips", []),
            "status": "success"
        }

    except Exception as e:
        print(f"Resume agent error: {e}")
        return {
            "tailored_resume": resume_text,
            "missing_keywords": [],
            "present_keywords": [],
            "ats_tips": [],
            "status": "error",
            "error": str(e)
        }


async def extract_skills(resume_text: str) -> dict:
    try:
        prompt = f"""
Extract structured information from this resume.

Resume:
{resume_text[:3000]}

Respond in this exact JSON format only:
{{
    "name": "John Doe",
    "email": "john@email.com",
    "skills": ["React", "Python", "SQL"],
    "experience_years": 3,
    "current_title": "Frontend Developer",
    "education": "B.Tech Computer Science",
    "summary": "One sentence professional summary"
}}
"""
        response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
        content = response.text.strip()

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]

        return json.loads(content)

    except Exception as e:
        print(f"Skill extraction error: {e}")
        return {"skills": [], "experience_years": 0, "status": "error"}