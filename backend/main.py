from fastapi import FastAPI, UploadFile, File

app = FastAPI()


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    print(f"File Received: {file.filename}")
    return {"status": "ok", "filename": file.filename}