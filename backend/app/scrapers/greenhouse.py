import httpx
import asyncio
from typing import List, Dict
from datetime import datetime

# List of companies using Greenhouse ATS
# Add more company slugs from job boards
GREENHOUSE_COMPANIES = [
    "airbnb", "stripe", "notion", "figma", "linear",
    "vercel", "supabase", "planetscale", "retool",
    "brex", "rippling", "gusto", "lattice", "mixpanel",
    "segment", "amplitude", "postman", "miro", "loom"
]

async def fetch_company_jobs(client: httpx.AsyncClient, company: str) -> List[Dict]:
    """
    Fetch all jobs from a company's Greenhouse board.
    Free public API — no key needed.
    """
    try:
        url = f"https://boards-api.greenhouse.io/v1/boards/{company}/jobs"
        response = await client.get(url, timeout=10.0)

        if response.status_code != 200:
            return []

        data = response.json()
        jobs = data.get("jobs", [])

        parsed = []
        for job in jobs:
            # Extract location
            location = "Remote"
            if job.get("location") and job["location"].get("name"):
                location = job["location"]["name"]

            # Extract department
            department = ""
            if job.get("departments") and len(job["departments"]) > 0:
                department = job["departments"][0].get("name", "")

            parsed.append({
                "title": job.get("title", ""),
                "company": company.title(),
                "location": location,
                "department": department,
                "source": "greenhouse",
                "source_url": job.get("absolute_url", ""),
                "external_id": str(job.get("id", "")),
                "posted_at": job.get("updated_at", datetime.now().isoformat()),
                "description": "",
                "requirements": "",
                "salary_min": None,
                "salary_max": None,
            })

        return parsed

    except Exception as e:
        print(f"Greenhouse error for {company}: {e}")
        return []

async def fetch_job_details(client: httpx.AsyncClient, company: str, job_id: str) -> Dict:
    """
    Fetch full job description for a specific job.
    """
    try:
        url = f"https://boards-api.greenhouse.io/v1/boards/{company}/jobs/{job_id}"
        response = await client.get(url, timeout=10.0)

        if response.status_code != 200:
            return {}

        data = response.json()
        return {
            "description": data.get("content", ""),
            "requirements": data.get("content", ""),
        }

    except Exception as e:
        print(f"Job detail error: {e}")
        return {}

async def scrape_greenhouse_jobs(
    companies: List[str] = None,
    keywords: List[str] = None
) -> List[Dict]:
    """
    Scrape jobs from multiple Greenhouse companies.
    Filters by keywords if provided.
    """
    if companies is None:
        companies = GREENHOUSE_COMPANIES

    if keywords is None:
        keywords = ["developer", "engineer", "frontend", "backend", "fullstack", "react", "python"]

    all_jobs = []

    async with httpx.AsyncClient() as client:
        # Fetch jobs from all companies concurrently
        tasks = [fetch_company_jobs(client, company) for company in companies]
        results = await asyncio.gather(*tasks)

        for company_jobs in results:
            for job in company_jobs:
                # Filter by keywords
                title_lower = job["title"].lower()
                if any(kw.lower() in title_lower for kw in keywords):
                    all_jobs.append(job)

    print(f"Greenhouse: Found {len(all_jobs)} matching jobs")
    return all_jobs