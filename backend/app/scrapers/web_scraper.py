from playwright.async_api import async_playwright
from typing import List, Dict
from datetime import datetime
import asyncio

async def scrape_jobs_from_url(url: str, source_name: str) -> List[Dict]:
    """
    Generic job scraper using Playwright headless browser.
    Can scrape any job board page.
    """
    jobs = []
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()

            # Set user agent to avoid bot detection
            await page.set_extra_http_headers({
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            })

            await page.goto(url, timeout=30000)
            await page.wait_for_timeout(2000)

            # Generic job card extraction
            # This works on many job boards
            job_cards = await page.query_selector_all(
                "[class*='job'], [class*='position'], [class*='listing'], [class*='posting']"
            )

            for card in job_cards[:20]:  # Limit to 20 per page
                try:
                    title_el = await card.query_selector(
                        "h2, h3, [class*='title'], [class*='name']"
                    )
                    title = await title_el.inner_text() if title_el else ""

                    location_el = await card.query_selector(
                        "[class*='location'], [class*='city']"
                    )
                    location = await location_el.inner_text() if location_el else "Remote"

                    link_el = await card.query_selector("a")
                    link = await link_el.get_attribute("href") if link_el else ""
                    if link and not link.startswith("http"):
                        link = f"https://{url.split('/')[2]}{link}"

                    if title:
                        jobs.append({
                            "title": title.strip(),
                            "company": source_name,
                            "location": location.strip(),
                            "source": "web_scraper",
                            "source_url": link or url,
                            "external_id": link or f"{source_name}_{title}",
                            "posted_at": datetime.now().isoformat(),
                            "description": "",
                            "requirements": "",
                            "salary_min": None,
                            "salary_max": None,
                        })
                except Exception:
                    continue

            await browser.close()

    except Exception as e:
        print(f"Web scraper error for {url}: {e}")

    return jobs

async def scrape_wellfound_jobs(keywords: List[str] = None) -> List[Dict]:
    """
    Scrape startup jobs from Wellfound (AngelList).
    """
    if keywords is None:
        keywords = ["react", "python", "fullstack"]

    all_jobs = []
    for keyword in keywords[:3]:  # Limit API calls
        url = f"https://wellfound.com/jobs?q={keyword}&remote=true"
        jobs = await scrape_jobs_from_url(url, "Wellfound")
        all_jobs.extend(jobs)
        await asyncio.sleep(2)  # Polite delay

    return all_jobs

async def scrape_remoteok_jobs(keywords: List[str] = None) -> List[Dict]:
    """
    Scrape remote jobs from RemoteOK API (free).
    """
    if keywords is None:
        keywords = ["react", "python", "nodejs"]

    jobs = []
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://remoteok.com/api",
                headers={"User-Agent": "CareerPilot AI Job Scraper"},
                timeout=15.0
            )
            if response.status_code == 200:
                data = response.json()
                # Skip first item (metadata)
                for job in data[1:50]:
                    title = job.get("position", "")
                    title_lower = title.lower()
                    if any(kw.lower() in title_lower for kw in keywords):
                        jobs.append({
                            "title": title,
                            "company": job.get("company", ""),
                            "location": "Remote",
                            "source": "remoteok",
                            "source_url": job.get("url", ""),
                            "external_id": str(job.get("id", "")),
                            "posted_at": job.get("date", datetime.now().isoformat()),
                            "description": job.get("description", ""),
                            "requirements": job.get("description", ""),
                            "salary_min": job.get("salary_min"),
                            "salary_max": job.get("salary_max"),
                        })
    except Exception as e:
        print(f"RemoteOK error: {e}")

    print(f"RemoteOK: Found {len(jobs)} matching jobs")
    return jobs