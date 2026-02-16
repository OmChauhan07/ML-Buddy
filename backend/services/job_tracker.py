"""
In-memory job tracker for background tasks.
Each job has: id, type ('eda' | 'train'), status ('processing' | 'completed' | 'failed'), and result.
"""
import uuid
from threading import Lock

_jobs: dict = {}
_lock = Lock()


def create_job(job_type: str) -> str:
    """Create a new job and return its ID."""
    job_id = str(uuid.uuid4())[:8]
    with _lock:
        _jobs[job_id] = {
            "id": job_id,
            "type": job_type,
            "status": "processing",
            "result": None,
            "error": None,
        }
    return job_id


def complete_job(job_id: str, result: dict):
    """Mark a job as completed with results."""
    with _lock:
        if job_id in _jobs:
            _jobs[job_id]["status"] = "completed"
            _jobs[job_id]["result"] = result


def fail_job(job_id: str, error: str):
    """Mark a job as failed with an error message."""
    with _lock:
        if job_id in _jobs:
            _jobs[job_id]["status"] = "failed"
            _jobs[job_id]["error"] = error


def get_job(job_id: str) -> dict | None:
    """Get a job's current state."""
    with _lock:
        return _jobs.get(job_id)
