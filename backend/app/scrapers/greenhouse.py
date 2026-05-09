import httpx
import asyncio
from typing import List, Dict
from datetime import datetime

GREENHOUSE_COMPANIES = [
    "airbnb", "stripe", "notion", "figma", "linear",
    "vercel", "supabase", "planetscale", "retool",
    "brex", "rippling", "gusto", "lattice", "mixpanel",
    "segment", "amplitude", "postman", "miro", "loom"
]

# India-based companies on Greenhouse
INDIA_GREENHOUSE_COMPANIES = [
    "freshworks", "zoho", "razorpay", "zerodha", "cred",
    "meesho", "groww", "phonepe", "paytm", "swiggy",
    "zomato", "ola", "unacademy", "byju", "sharechat"
]

def score_location_match(job_location: str, user_country: str, user_state: str, user_city: str) -> float:
    """
    Returns a bonus score (0.0 to 0.3) based on how well job location matches user location.
    Remote jobs always get a small bonus.
    """
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

    # India-specific city matching
    india_cities = ["bangalore", "bengaluru", "mumbai", "hyderabad", "chennai",
                    "pune", "delhi", "kolkata", "kochi", "ernakulam", "thiruvananthapuram",
                    "kozhikode", "thrissur", "noida", "gurgaon", "ahmedabad"]
    if any(city in loc for city in india_cities):
        if user_country and user_country.lower() in ["india", "in"]:
            bonus += 0.1

    return min(bonus, 0.3)

async def fetch_company_jobs(
    client: httpx.AsyncClient,
    company: str,
    user_country: str = "",
    user_state: str = "",
    user_city: str = ""
) -> List[Dict]:
    try:
        url = f"https://boards-api.greenhouse.io/v1/boards/{company}/jobs"
        response = await client.get(url, timeout=10.0)
        if response.status_code != 200:
            return []

        data = response.json()
        jobs = data.get("jobs", [])
        parsed = []

        for job in jobs:
            location = "Remote"
            if job.get("location") and job["location"].get("name"):
                location = job["location"]["name"]

            department = ""
            if job.get("departments") and len(job["departments"]) > 0:
                department = job["departments"][0].get("name", "")

            location_bonus = score_location_match(location, user_country, user_state, user_city)

            parsed.append({
                "title":          job.get("title", ""),
                "company":        company.title(),
                "location":       location,
                "department":     department,
                "source":         "greenhouse",
                "source_url":     job.get("absolute_url", ""),
                "external_id":    str(job.get("id", "")),
                "posted_at":      job.get("updated_at", datetime.now().isoformat()),
                "description":    "",
                "requirements":   "",
                "salary_min":     None,
                "salary_max":     None,
                "location_bonus": location_bonus,
            })

        return parsed

    except Exception as e:
        print(f"Greenhouse error for {company}: {e}")
        return []

async def scrape_greenhouse_jobs(
    companies: List[str] = None,
    keywords: List[str] = None,
    user_country: str = "",
    user_state: str = "",
    user_city: str = ""
) -> List[Dict]:
    if companies is None:
        # If user is from India, include India companies first
        if user_country.lower() in ["india", "in"]:
            companies = INDIA_GREENHOUSE_COMPANIES + GREENHOUSE_COMPANIES
        else:
            companies = GREENHOUSE_COMPANIES

    if keywords is None:
        keywords = ["developer", "engineer", "frontend", "backend", "fullstack", "react", "python"]

    all_jobs = []

    async with httpx.AsyncClient() as client:
        tasks = [
            fetch_company_jobs(client, company, user_country, user_state, user_city)
            for company in companies
        ]
        results = await asyncio.gather(*tasks)

        for company_jobs in results:
            for job in company_jobs:
                title_lower = job["title"].lower()
                if any(kw.lower() in title_lower for kw in keywords):
                    all_jobs.append(job)

    print(f"Greenhouse: Found {len(all_jobs)} matching jobs")
    return all_jobs