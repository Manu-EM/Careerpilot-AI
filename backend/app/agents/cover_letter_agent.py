from google import genai
from app.core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate_cover_letter(
    resume_text: str,
    job_description: str,
    job_title: str,
    company: str,
    candidate_name: str = "Candidate"
) -> dict:
    try:
        prompt = f"""
Write a professional cover letter for {candidate_name} applying for {job_title} at {company}.
Keep it to 3 paragraphs. Be specific and genuine. Do not start with 'I am writing to apply'.

Resume Summary:
{resume_text[:2000]}

Job Description:
{job_description[:1500]}

Write the cover letter only.
"""
        response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
        return {"cover_letter": response.text, "status": "success"}

    except Exception as e:
        print(f"Cover letter error: {e}")
        return {"cover_letter": "", "status": "error", "error": str(e)}

async def answer_screening_question(
    question: str,
    resume_text: str,
    job_description: str
) -> str:
    try:
        prompt = f"""
Answer this job screening question in 2-3 sentences based on the resume.

Question: {question}
Resume: {resume_text[:1500]}
Job: {job_description[:800]}

Write only the answer.
"""
        response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
        return response.text

    except Exception as e:
        print(f"Screening error: {e}")
        return "Unable to generate answer."