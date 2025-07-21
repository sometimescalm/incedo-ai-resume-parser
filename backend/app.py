from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
from src.gemini_parser import parse_resume_with_gemini
import aiofiles

app = FastAPI()

# Serve the temp_uploads directory and backend root for images
app.mount("/images", StaticFiles(directory=os.path.abspath(".")), name="images")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Only allow React dev server
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/parse_resume")
async def parse_resume(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")
    temp_filename = f"{uuid.uuid4()}{ext}"
    temp_filepath = os.path.join(UPLOAD_DIR, temp_filename)
    try:
        async with aiofiles.open(temp_filepath, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):
                await buffer.write(chunk)
        result = parse_resume_with_gemini(temp_filepath)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)
