from sentence_transformers import SentenceTransformer
import numpy as np

# Load model once when app starts
# This runs locally — completely free, no API needed
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(text: str) -> list:
    """
    Convert any text into a vector (list of numbers)
    Example: "React Developer" → [0.23, 0.87, 0.12, ...]
    """
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()

def get_similarity(vec1: list, vec2: list) -> float:
    """
    Compare two vectors and return similarity score (0 to 1)
    1.0 = identical meaning
    0.0 = completely different
    """
    a = np.array(vec1)
    b = np.array(vec2)
    similarity = np.dot(a, b)
    return float(similarity)

def get_match_score(resume_text: str, job_text: str) -> float:
    """
    Calculate match score between resume and job
    Returns percentage 0-100
    """
    resume_vec = get_embedding(resume_text)
    job_vec    = get_embedding(job_text)
    similarity = get_similarity(resume_vec, job_vec)
    # Convert to percentage
    score = round(similarity * 100, 2)
    return max(0, min(100, score))