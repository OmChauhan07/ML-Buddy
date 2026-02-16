import os
import shutil
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, Form
from fastapi.responses import JSONResponse

from services.eda_service import generate_eda_report
from services.ml_service import run_compare_models

app = FastAPI(title="ML Buddy API")

TEMP_STORAGE = os.path.join(os.path.dirname(__file__), "..", "temp_storage")
os.makedirs(TEMP_STORAGE, exist_ok=True)


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
    return {"status": "ok", "filename": file.filename, "path": file_path}


# ── EDA Report (Background Task) ────────────────────────────────────
@app.post("/eda")
async def eda(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    file_path = await save_upload(file)
    background_tasks.add_task(generate_eda_report, file_path)
    return JSONResponse(
        status_code=202,
        content={
            "status": "processing",
            "message": f"EDA report for '{file.filename}' is being generated. Check /reports when done.",
        },
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
    background_tasks.add_task(run_compare_models, file_path, target, task_type)
    return JSONResponse(
        status_code=202,
        content={
            "status": "processing",
            "message": f"ML training on '{file.filename}' (target='{target}', type='{task_type}') started.",
        },
    )