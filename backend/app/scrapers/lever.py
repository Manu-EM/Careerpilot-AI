import httpx
import asyncio
from typing import List, Dict
from datetime import datetime

LEVER_COMPANIES = [
    "netflix", "twitter", "reddit", "coinbase", "robinhood",
    "plaid", "carta", "checkr", "benchling", "scale",
    "nerdwallet", "outreach", "heap", "clubhouse", "vanta",
    "census", "dbt-labs", "airbyte", "dagster", "prefect"
]

# India-based companies on Lever
INDIA_LEVER_COMPANIES = [
    "flipkart", "myntra", "nykaa", "cleartax", "darwinbox",
    "chargebee", "postman", "browserstack", "hasura", "setu"
]

def score_location_match(job_location: str, user_country: str, user_state: str, user_city: str) -> float:
    loc = job_location.lower()
    bonus = 0.0
    if "remote" in loc:
        return 0.1
    if user_country and user_country.lower() in loc:
        bonus += 0.15
    if user_state and user_state.lower() in loc:
        bonus += 0.1
    if user_city and user_city.lower() in loc:
        bonus += 0.05
    india_cities = ["bangalore", "bengaluru", "mumbai", "hyderabad", "chennai",
                    "pune", "delhi", "kochi", "ernakulam", "thiruvananthapuram", "noida", "gurgaon"]
    if any(city in loc for city in india_cities):
        if user_country and user_country.lower() in ["india", "in"]:
            bonus += 0.1
    return min(bonus, 0.3)

async def fetch_lever_jobs(
    client: httpx.AsyncClient,
    company: str,
    user_country: str = "",
    user_state: str = "",
    user_city: str = ""
) -> List[Dict]:
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
            categories = job.get("categories", {})
            location   = categories.get("location", "Remote")
            department = categories.get("department", "")
            team       = categories.get("team", "")

            salary_min = None
            salary_max = None
            salary_range = job.get("salaryRange", {})
            if salary_range:
                salary_min = salary_range.get("min")
                salary_max = salary_range.get("max")

            description = job.get("descriptionPlain", "")
            for item in job.get("lists", []):
                description += f"\n{item.get('text', '')}: {item.get('content', '')}"

            location_bonus = score_location_match(location, user_country, user_state, user_city)

            parsed.append({
                "title":          job.get("text", ""),
                "company":        company.title(),
                "location":       location,
                "department":     department,
                "team":           team,
                "source":         "lever",
                "source_url":     job.get("hostedUrl", ""),
                "external_id":    job.get("id", ""),
                "posted_at":      datetime.fromtimestamp(
                    job.get("createdAt", 0) / 1000
                ).isoformat() if job.get("createdAt") else datetime.now().isoformat(),
                "description":    description,
                "requirements":   description,
                "salary_min":     salary_min,
                "salary_max":     salary_max,
                "location_bonus": location_bonus,
            })

        return parsed

    except Exception as e:
        print(f"Lever error for {company}: {e}")
        return []

async def scrape_lever_jobs(
    companies: List[str] = None,
    keywords: List[str] = None,
    user_country: str = "",
    user_state: str = "",
    user_city: str = ""
) -> List[Dict]:
    if companies is None:
        if user_country.lower() in ["india", "in"]:
            companies = INDIA_LEVER_COMPANIES + LEVER_COMPANIES
        else:
            companies = LEVER_COMPANIES

    if keywords is None:
        keywords = ["developer", "engineer", "frontend", "backend", "fullstack", "react", "python"]

    all_jobs = []

    async with httpx.AsyncClient() as client:
        tasks = [
            fetch_lever_jobs(client, company, user_country, user_state, user_city)
            for company in companies
        ]
        results = await asyncio.gather(*tasks)

        for company_jobs in results:
            for job in company_jobs:
                title_lower = job["title"].lower()
                if any(kw.lower() in title_lower for kw in keywords):
                    all_jobs.append(job)

    print(f"Lever: Found {len(all_jobs)} matching jobs")
    return all_jobs