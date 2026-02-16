import os
import shutil
import pandas as pd
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, Form
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from services.job_tracker import create_job, get_job
from services.eda_service import generate_eda_report
from services.ml_service import run_compare_models

app = FastAPI(title="ML Buddy API")

TEMP_STORAGE = os.path.join(os.path.dirname(__file__), "..", "temp_storage")
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "reports")
os.makedirs(TEMP_STORAGE, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

# Serve generated EDA reports as static files
app.mount("/reports", StaticFiles(directory=REPORTS_DIR), name="reports")


async def save_upload(file: UploadFile) -> str:
    """Save an uploaded file to temp_storage and return the path."""
    file_path = os.path.join(TEMP_STORAGE, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return file_path


# ── Upload endpoint ──────────────────────────────────────────────────
@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    file_path = await save_upload(file)
    print(f"File Received: {file.filename}")

    # Read columns and their dtypes from the uploaded file
    columns = []
    try:
        df = pd.read_csv(file_path, nrows=5)  # only read a few rows for speed
        columns = [
            {"name": col, "dtype": str(df[col].dtype)}
            for col in df.columns
        ]
    except Exception as e:
        print(f"Could not parse columns: {e}")

    return {"status": "ok", "filename": file.filename, "path": file_path, "columns": columns}


# ── Job Status (Polling Endpoint) ───────────────────────────────────
@app.get("/status/{job_id}")
async def job_status(job_id: str):
    job = get_job(job_id)
    if job is None:
        return JSONResponse(status_code=404, content={"error": "Job not found"})
    return job


# ── EDA Report (Background Task) ────────────────────────────────────
@app.post("/eda")
async def eda(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    file_path = await save_upload(file)
    job_id = create_job("eda")
    background_tasks.add_task(generate_eda_report, job_id, file_path)
    return JSONResponse(
        status_code=202,
        content={"status": "processing", "job_id": job_id},
    )


# ── ML Model Comparison (Background Task) ───────────────────────────
@app.post("/train")
async def train(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target: str = Form(...),
    task_type: str = Form("classification"),
):
    file_path = await save_upload(file)
    job_id = create_job("train")
    background_tasks.add_task(run_compare_models, job_id, file_path, target, task_type)
    return JSONResponse(
        status_code=202,
        content={"status": "processing", "job_id": job_id},
    )