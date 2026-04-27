import hashlib
from typing import List, Dict, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.job import Job
from app.agents.embeddings import get_embedding, get_match_score

def generate_job_hash(title: str, company: str, location: str) -> str:
    """
    Generate unique hash for a job to detect duplicates.
    """
    key = f"{title.lower().strip()}{company.lower().strip()}{location.lower().strip()}"
    return hashlib.md5(key.encode()).hexdigest()

def is_scam_job(job: Dict) -> bool:
    """
    Basic scam detection — filter out suspicious jobs.
    """
    scam_keywords = [
        "work from home make money fast",
        "earn $1000 per day",
        "no experience needed earn",
        "data entry work from home",
        "mlm", "pyramid",
        "wire transfer",
        "send money",
    ]
    title_desc = f"{job.get('title', '')} {job.get('description', '')}".lower()
    return any(kw in title_desc for kw in scam_keywords)

def is_relevant_job(job: Dict, keywords: List[str]) -> bool:
    """
    Check if job is relevant based on keywords.
    """
    if not keywords:
        return True
    title = job.get("title", "").lower()
    return any(kw.lower() in title for kw in keywords)

async def check_duplicate(db: AsyncSession, job_hash: str) -> bool:
    """
    Check if job already exists in database.
    """
    result = await db.execute(
        select(Job).where(Job.source_url == job_hash)
    )
    return result.scalar_one_or_none() is not None

async def process_and_save_jobs(
    db: AsyncSession,
    raw_jobs: List[Dict],
    user_resume: Optional[str] = None,
    keywords: List[str] = None
) -> Dict:
    """
    Process raw scraped jobs:
    1. Filter scams
    2. Remove duplicates
    3. Generate embeddings
    4. Calculate match scores
    5. Save to database
    """
    stats = {
        "total_scraped": len(raw_jobs),
        "scams_filtered": 0,
        "duplicates_removed": 0,
        "saved": 0,
        "errors": 0
    }

    seen_hashes = set()

    for raw_job in raw_jobs:
        try:
            # Skip scam jobs
            if is_scam_job(raw_job):
                stats["scams_filtered"] += 1
                continue

            # Skip irrelevant jobs
            if keywords and not is_relevant_job(raw_job, keywords):
                continue

            # Generate hash for duplicate detection
            job_hash = generate_job_hash(
                raw_job.get("title", ""),
                raw_job.get("company", ""),
                raw_job.get("location", "")
            )

            # Skip if seen in this batch
            if job_hash in seen_hashes:
                stats["duplicates_removed"] += 1
                continue
            seen_hashes.add(job_hash)

            # Skip if already in database
            existing = await db.execute(
                select(Job).where(Job.source_url == raw_job.get("source_url", ""))
            )
            if existing.scalar_one_or_none():
                stats["duplicates_removed"] += 1
                continue

            # Generate embedding for this job
            job_text = f"{raw_job.get('title', '')} {raw_job.get('description', '')} {raw_job.get('requirements', '')}"
            embedding = get_embedding(job_text)

            # Calculate match score if resume provided
            match_score = 0.0
            ats_score = 0.0
            if user_resume:
                match_score = get_match_score(user_resume, job_text)
                ats_score = match_score

            # Parse posted_at date
            posted_at = None
            try:
                posted_str = raw_job.get("posted_at", "")
                if posted_str:
                    posted_at = datetime.fromisoformat(
                        posted_str.replace("Z", "+00:00").split("+")[0]
                    )
            except Exception:
                posted_at = datetime.now()

            # Create Job record
            job = Job(
                title=raw_job.get("title", "")[:255],
                company=raw_job.get("company", "")[:255],
                location=raw_job.get("location", "Remote")[:255],
                description=raw_job.get("description", "")[:5000],
                requirements=raw_job.get("requirements", "")[:5000],
                source=raw_job.get("source", "unknown"),
                source_url=raw_job.get("source_url", ""),
                match_score=match_score,
                ats_score=ats_score,
                embedding=embedding,
                is_active=True,
                posted_at=posted_at,
            )

            db.add(job)
            stats["saved"] += 1

        except Exception as e:
            print(f"Job processing error: {e}")
            stats["errors"] += 1
            continue

    # Commit all jobs at once
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        print(f"Database commit error: {e}")

    print(f"Job processing complete: {stats}")
    return stats