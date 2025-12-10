from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
from src.gemini_parser import parse_resume_with_gemini, extract_text, generate_interview_questions
import aiofiles
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from typing import List


app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
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

@app.post("/interview_question")
async def gen_interview_question(resume: UploadFile = File(...),
                                 jobd: UploadFile = File(...)):
    """Accept a Resume file and a Job Description file, extract text, call Gemini to generate questions, and return JSON."""
    try:
        allowed_exts = [".pdf", ".docx", ".txt"]

        # Validate extensions        
        resume_ext = os.path.splitext(resume.filename)[1].lower()
        jd_ext = os.path.splitext(jobd.filename)[1].lower()
        if resume_ext not in allowed_exts or jd_ext not in allowed_exts:
            raise HTTPException(status_code=400, detail="Only PDF, DOCX and TXT files are supported for resume and JD.")

        resume_temp = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}{resume_ext}")
        jd_temp = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}{jd_ext}")

  
        # Save uploaded files to disk
        async with aiofiles.open(resume_temp, "wb") as f:
            while chunk := await resume.read(1024 * 1024):
                await f.write(chunk)

        async with aiofiles.open(jd_temp, "wb") as f:
            while chunk := await jobd.read(1024 * 1024):
                await f.write(chunk)

        # Extract text
        if resume_ext == ".txt":
            async with aiofiles.open(resume_temp, "r", encoding="utf-8", errors="ignore") as f:
                resume_text = await f.read()
        else:
            resume_text = extract_text(resume_temp)

        if jd_ext == ".txt":
            async with aiofiles.open(jd_temp, "r", encoding="utf-8", errors="ignore") as f:
                jd_text = await f.read()
        else:
            jd_text = extract_text(jd_temp)

        # Build prompt and call Gemini via helper
        result = generate_interview_questions(jd_text, resume_text)
        return JSONResponse(content=result)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        try:
            if os.path.exists(resume_temp):
                os.remove(resume_temp)
            if os.path.exists(jd_temp):
                os.remove(jd_temp)
        except Exception:
            pass
