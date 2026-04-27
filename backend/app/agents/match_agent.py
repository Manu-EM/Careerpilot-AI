import json
from google import genai
from google.genai import types
from app.core.config import settings
from app.agents.embeddings import get_match_score

client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def analyze_job_match(resume_text: str, job_description: str) -> dict:
    try:
        vector_score = get_match_score(resume_text, job_description)

        prompt = f"""
You are an expert career coach and ATS specialist.
Analyze this resume against the job description.

Resume:
{resume_text[:2000]}

Job Description:
{job_description[:2000]}

Respond in this exact JSON format only, no other text:
{{
    "match_score": 85,
    "matched_skills": ["React", "TypeScript", "Node.js"],
    "missing_skills": ["GraphQL", "AWS", "Docker"],
    "ats_score": 78,
    "recommendation": "Strong candidate but should highlight cloud experience."
}}
"""
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        content = response.text.strip()
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]

        result = json.loads(content)
        final_score = round((vector_score * 0.4) + (result["match_score"] * 0.6), 2)
        result["match_score"] = final_score
        result["vector_score"] = vector_score
        return result

    except Exception as e:
        print(f"Match agent error: {e}")
        score = get_match_score(resume_text, job_description)
        return {
            "match_score": score,
            "matched_skills": [],
            "missing_skills": [],
            "ats_score": score,
            "recommendation": "Analysis unavailable",
            "vector_score": score
        }