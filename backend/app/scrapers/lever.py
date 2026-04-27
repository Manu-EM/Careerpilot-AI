import httpx
import asyncio
from typing import List, Dict
from datetime import datetime

# Companies using Lever ATS
LEVER_COMPANIES = [
    "netflix", "twitter", "reddit", "coinbase", "robinhood",
    "plaid", "carta", "checkr", "benchling", "scale",
    "nerdwallet", "outreach", "heap", "clubhouse", "vanta",
    "census", "dbt-labs", "airbyte", "dagster", "prefect"
]

async def fetch_lever_jobs(client: httpx.AsyncClient, company: str) -> List[Dict]:
    """
    Fetch all jobs from a company's Lever board.
    Free public API — no key needed.
    """
    try:
        url = f"https://api.lever.co/v0/postings/{company}?mode=json"
        response = await client.get(url, timeout=10.0)

        if response.status_code != 200:
            return []

        jobs = response.json()
        if not isinstance(jobs, list):
            return []

        parsed = []
        for job in jobs:
            # Extract location
            categories = job.get("categories", {})
            location = categories.get("location", "Remote")
            department = categories.get("department", "")
            team = categories.get("team", "")

            # Extract salary from text if available
            salary_min = None
            salary_max = None
            salary_range = job.get("salaryRange", {})
            if salary_range:
                salary_min = salary_range.get("min")
                salary_max = salary_range.get("max")

            # Get description
            lists = job.get("lists", [])
            description = job.get("descriptionPlain", "")
            for item in lists:
                description += f"\n{item.get('text', '')}: {item.get('content', '')}"

            parsed.append({
                "title": job.get("text", ""),
                "company": company.title(),
                "location": location,
                "department": department,
                "team": team,
                "source": "lever",
                "source_url": job.get("hostedUrl", ""),
                "external_id": job.get("id", ""),
                "posted_at": datetime.fromtimestamp(
                    job.get("createdAt", 0) / 1000
                ).isoformat() if job.get("createdAt") else datetime.now().isoformat(),
                "description": description,
                "requirements": description,
                "salary_min": salary_min,
                "salary_max": salary_max,
            })

        return parsed

    except Exception as e:
        print(f"Lever error for {company}: {e}")
        return []

async def scrape_lever_jobs(
    companies: List[str] = None,
    keywords: List[str] = None
) -> List[Dict]:
    """
    Scrape jobs from multiple Lever companies.
    """
    if companies is None:
        companies = LEVER_COMPANIES

    if keywords is None:
        keywords = ["developer", "engineer", "frontend", "backend", "fullstack", "react", "python"]

    all_jobs = []

    async with httpx.AsyncClient() as client:
        tasks = [fetch_lever_jobs(client, company) for company in companies]
        results = await asyncio.gather(*tasks)

        for company_jobs in results:
            for job in company_jobs:
                title_lower = job["title"].lower()
                if any(kw.lower() in title_lower for kw in keywords):
                    all_jobs.append(job)

    print(f"Lever: Found {len(all_jobs)} matching jobs")
    return all_jobs