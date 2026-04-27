from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional
from app.agents.match_agent import analyze_job_match
from app.agents.resume_agent import tailor_resume, extract_skills
from app.agents.cover_letter_agent import generate_cover_letter

# ── State Definition ──────────────────────────────
# This is the data that flows through all agents
class CareerPilotState(TypedDict):
    # Inputs
    resume_text:      str
    job_description:  str
    job_title:        str
    company:          str
    candidate_name:   str
    user_id:          str
    job_id:           str

    # Outputs from each agent
    match_result:     Optional[dict]
    resume_result:    Optional[dict]
    cover_letter:     Optional[str]
    skills:           Optional[dict]
    should_apply:     Optional[bool]
    error:            Optional[str]

# ── Agent Nodes ───────────────────────────────────

async def match_node(state: CareerPilotState) -> CareerPilotState:
    """
    Step 1: Analyze how well resume matches the job
    Calculates match score and skill gaps
    """
    print(f"[Match Agent] Analyzing job: {state['job_title']} at {state['company']}")
    try:
        result = await analyze_job_match(
            state["resume_text"],
            state["job_description"]
        )
        return {**state, "match_result": result}
    except Exception as e:
        return {**state, "error": str(e), "match_result": None}

async def skills_node(state: CareerPilotState) -> CareerPilotState:
    """
    Step 2: Extract skills from resume
    """
    print(f"[Skills Agent] Extracting skills from resume")
    try:
        skills = await extract_skills(state["resume_text"])
        return {**state, "skills": skills}
    except Exception as e:
        return {**state, "error": str(e), "skills": None}

async def decide_apply(state: CareerPilotState) -> str:
    """
    Decision node: Should we tailor resume for this job?
    Only proceed if match score is above 60%
    """
    match_result = state.get("match_result")
    if match_result and match_result.get("match_score", 0) >= 60:
        print(f"[Decision] Match score {match_result['match_score']}% — proceeding")
        return "tailor"
    else:
        score = match_result.get("match_score", 0) if match_result else 0
        print(f"[Decision] Match score {score}% — too low, skipping")
        return "skip"

async def tailor_node(state: CareerPilotState) -> CareerPilotState:
    """
    Step 3: Tailor the resume for this specific job
    """
    print(f"[Resume Agent] Tailoring resume for {state['job_title']}")
    try:
        result = await tailor_resume(
            state["resume_text"],
            state["job_description"],
            state["job_title"],
            state["company"]
        )
        return {**state, "resume_result": result}
    except Exception as e:
        return {**state, "error": str(e), "resume_result": None}

async def cover_letter_node(state: CareerPilotState) -> CareerPilotState:
    """
    Step 4: Generate cover letter for this job
    """
    print(f"[Cover Letter Agent] Writing cover letter for {state['company']}")
    try:
        result = await generate_cover_letter(
            state["resume_text"],
            state["job_description"],
            state["job_title"],
            state["company"],
            state.get("candidate_name", "Candidate")
        )
        return {**state, "cover_letter": result.get("cover_letter", "")}
    except Exception as e:
        return {**state, "error": str(e), "cover_letter": None}

async def skip_node(state: CareerPilotState) -> CareerPilotState:
    """
    Skip node: Job not a good match
    """
    print(f"[Skip] Job skipped due to low match score")
    return {**state, "should_apply": False}

async def finalize_node(state: CareerPilotState) -> CareerPilotState:
    """
    Final step: Mark job as ready to apply
    """
    print(f"[Finalize] Job processing complete")
    return {**state, "should_apply": True}

# ── Build the Graph ───────────────────────────────

def build_career_workflow():
    """
    Build and compile the LangGraph workflow.

    Flow:
    match → skills → decide → tailor → cover_letter → finalize
                           ↘ skip (if score too low)
    """
    workflow = StateGraph(CareerPilotState)

    # Add all nodes
    workflow.add_node("match",        match_node)
    workflow.add_node("skills",       skills_node)
    workflow.add_node("tailor",       tailor_node)
    workflow.add_node("cover_letter", cover_letter_node)
    workflow.add_node("finalize",     finalize_node)
    workflow.add_node("skip",         skip_node)

    # Set entry point
    workflow.set_entry_point("match")

    # Add edges (connections between nodes)
    workflow.add_edge("match", "skills")

    # Conditional edge — decides whether to tailor or skip
    workflow.add_conditional_edges(
        "skills",
        decide_apply,
        {
            "tailor": "tailor",
            "skip":   "skip"
        }
    )

    workflow.add_edge("tailor",       "cover_letter")
    workflow.add_edge("cover_letter", "finalize")
    workflow.add_edge("finalize",     END)
    workflow.add_edge("skip",         END)

    return workflow.compile()

# Create the compiled workflow
career_workflow = build_career_workflow()

async def run_career_workflow(
    resume_text:    str,
    job_description: str,
    job_title:      str,
    company:        str,
    candidate_name: str = "Candidate",
    user_id:        str = "",
    job_id:         str = ""
) -> dict:
    """
    Run the full career agent workflow for one job.
    Returns all results from all agents.
    """
    initial_state = CareerPilotState(
        resume_text=resume_text,
        job_description=job_description,
        job_title=job_title,
        company=company,
        candidate_name=candidate_name,
        user_id=user_id,
        job_id=job_id,
        match_result=None,
        resume_result=None,
        cover_letter=None,
        skills=None,
        should_apply=None,
        error=None
    )

    result = await career_workflow.ainvoke(initial_state)
    return result