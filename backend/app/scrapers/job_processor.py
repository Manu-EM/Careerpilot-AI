import hashlib
from typing import List, Dict, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.job import Job
from app.agents.embeddings import get_embedding, get_match_score

def generate_job_hash(title: str, company: str, location: str) -> str:
    key = f"{title.lower().strip()}{company.lower().strip()}{location.lower().strip()}"
    return hashlib.md5(key.encode()).hexdigest()

def is_scam_job(job: Dict) -> bool:
    scam_keywords = [
        "work from home make money fast", "earn ₹1000 per day",
        "no experience needed earn", "data entry work from home",
        "mlm", "pyramid", "wire transfer", "send money",
    ]
    title_desc = f"{job.get('title', '')} {job.get('description', '')}".lower()
    return any(kw in title_desc for kw in scam_keywords)

def is_relevant_job(job: Dict, keywords: List[str]) -> bool:
    if not keywords:
        return True
    title = job.get("title", "").lower()
    return any(kw.lower() in title for kw in keywords)

async def process_and_save_jobs(
    db: AsyncSession,
    raw_jobs: List[Dict],
    user_resume: Optional[str] = None,
    keywords: List[str] = None,
    user_country: str = "",
    user_state: str = "",
    user_city: str = ""
) -> Dict:
    stats = {
        "total_scraped":    len(raw_jobs),
        "scams_filtered":   0,
        "duplicates_removed": 0,
        "saved":            0,
        "errors":           0
    }

    seen_hashes = set()

    for raw_job in raw_jobs:
        try:
            if is_scam_job(raw_job):
                stats["scams_filtered"] += 1
                continue

            if keywords and not is_relevant_job(raw_job, keywords):
                continue

            job_hash = generate_job_hash(
                raw_job.get("title", ""),
                raw_job.get("company", ""),
                raw_job.get("location", "")
            )

            if job_hash in seen_hashes:
                stats["duplicates_removed"] += 1
                continue
            seen_hashes.add(job_hash)

            existing = await db.execute(
                select(Job).where(Job.source_url == raw_job.get("source_url", ""))
            )
            if existing.scalar_one_or_none():
                stats["duplicates_removed"] += 1
                continue

            job_text = f"{raw_job.get('title', '')} {raw_job.get('description', '')} {raw_job.get('requirements', '')}"
            embedding = get_embedding(job_text)

            # Base match score from resume similarity
            match_score = 0.0
            ats_score   = 0.0
            if user_resume:
                match_score = get_match_score(user_resume, job_text)
                ats_score   = match_score

            # Add location bonus — boosts jobs in user's country/state/city
            location_bonus = raw_job.get("location_bonus", 0.0)
            if location_bonus == 0.0 and (user_country or user_state or user_city):
                # Calculate for RemoteOK jobs that don't have pre-calculated bonus
                job_location = raw_job.get("location", "").lower()
                if "remote" in job_location:
                    location_bonus = 0.1
                elif user_country and user_country.lower() in job_location:
                    location_bonus = 0.15
                elif user_state and user_state.lower() in job_location:
                    location_bonus = 0.1
                elif user_city and user_city.lower() in job_location:
                    location_bonus = 0.05

            # Final score = match score + location bonus (capped at 100)
            final_score = min(match_score + location_bonus, 1.0)

            posted_at = None
            try:
                posted_str = raw_job.get("posted_at", "")
                if posted_str:
                    posted_at = datetime.fromisoformat(
                        posted_str.replace("Z", "+00:00").split("+")[0]
                    )
            except Exception:
                posted_at = datetime.now()

            job = Job(
                title       = raw_job.get("title", "")[:255],
                company     = raw_job.get("company", "")[:255],
                location    = raw_job.get("location", "Remote")[:255],
                description = raw_job.get("description", "")[:5000],
                requirements= raw_job.get("requirements", "")[:5000],
                source      = raw_job.get("source", "unknown"),
                source_url  = raw_job.get("source_url", ""),
                match_score = final_score,
                ats_score   = ats_score,
                embedding   = embedding,
                is_active   = True,
                posted_at   = posted_at,
            )

            db.add(job)
            stats["saved"] += 1

        except Exception as e:
            print(f"Job processing error: {e}")
            stats["errors"] += 1
            continue

    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        print(f"Database commit error: {e}")

    print(f"Job processing complete: {stats}")
    return stats