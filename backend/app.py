from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
from src.gemini_parser import parse_resume_with_gemini, extract_text, generate_interview_questions, score_resume_against_jd, get_basic_resume_info_with_gemini
import zipfile
import tempfile
import aiofiles
import asyncio
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


def process_resume_sync(fpath, fname, jd_text, role):
    """Synchronous helper to parse, extract and score a single resume file.

    Returns a dict entry with parsed info or an error dict.
    """
    try:
        parsed = get_basic_resume_info_with_gemini(fpath)
        resume_text = extract_text(fpath)
        score_res = score_resume_against_jd(jd_text, resume_text, role)
        print(f"Scored resume {fname}: {score_res}")

        entry = {
            "filename": fname,
            "name": parsed.get('full_name') or parsed.get('fullName') or os.path.splitext(fname)[0],
            "email": parsed.get('email_id') or parsed.get('email'),
            "score": score_res.get('score') if isinstance(score_res.get('score'), int) else int(score_res.get('score') or 0),
            "experience": parsed.get('experience'),
            "skills_match": score_res.get('skills_match'),
            "education": parsed.get('education', []),
            "key_skills": parsed.get('key_skills'),
            "gap_analysis": score_res.get('gaps'),
            "summary": score_res.get('strength'),
        }
        return entry
    except Exception as e:
        return {"filename": fname, "error": str(e)}
    

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
async def gen_interview_question(
    resume: UploadFile = File(...),
    jobd: UploadFile = File(...),
    role: str = Form(None),
    domain: str = Form(None),
    experience_level: str = Form(None),
    skills: str = Form(None),
    num_questions: int = Form(10),
):
    """Accept a Resume file and a Job Description file, extract text, call Gemini to generate questions, and return JSON."""
    try:
        allowed_exts = [".pdf", ".docx"]

        # Validate extensions        
        resume_ext = os.path.splitext(resume.filename)[1].lower()
        jd_ext = os.path.splitext(jobd.filename)[1].lower()
        if resume_ext not in allowed_exts or jd_ext not in allowed_exts:
            raise HTTPException(status_code=400, detail="Only PDF, DOCX files are supported for resume and JD.")

        resume_temp = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}{resume_ext}")
        jd_temp = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}{jd_ext}")

  
        # Save uploaded files to disk
        async with aiofiles.open(resume_temp, "wb") as f:
            while chunk := await resume.read(1024 * 1024):
                await f.write(chunk)

        async with aiofiles.open(jd_temp, "wb") as f:
            while chunk := await jobd.read(1024 * 1024):
                await f.write(chunk)

        # Extract text (always use PDF/DOCX parser)
        resume_text = extract_text(resume_temp)
        jd_text = extract_text(jd_temp)

        # Build context metadata
        context_metadata = {
        "role": role,
        "domain": domain,
        "num_questions": num_questions,
        "skills": skills,
        "experience_level": experience_level,
        "jd_text": jd_text,
        "resume_text": resume_text
        }

        # Build prompt and call Gemini via helper
        result = generate_interview_questions(context_metadata)
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

@app.post("/rank_resumes")
async def rank_resumes(
    resumes: UploadFile = File(...),
    jobd: UploadFile = File(...),
    role: str = Form(None),
):
    """Accept a ZIP of resumes and a Job Description file, score each resume vs JD, return ranked results."""
    try:
        # Validate JD file
        jd_ext = os.path.splitext(jobd.filename)[1].lower()
        if jd_ext not in [".pdf", ".docx"]:
            raise HTTPException(status_code=400, detail="JD must be PDF or DOCX")

        # Ensure uploaded resumes is a zip
        resumes_ext = os.path.splitext(resumes.filename)[1].lower()
        if resumes_ext != ".zip":
            raise HTTPException(status_code=400, detail="Resumes must be provided as a ZIP file")

        # Save JD and zip to temp files
        jd_temp = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}{jd_ext}")
        zip_temp = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}.zip")

        async with aiofiles.open(jd_temp, "wb") as f:
            while chunk := await jobd.read(1024 * 1024):
                await f.write(chunk)

        async with aiofiles.open(zip_temp, "wb") as f:
            while chunk := await resumes.read(1024 * 1024):
                await f.write(chunk)

        # Extract JD text
        jd_text = extract_text(jd_temp)

        # Extract zip contents
        extract_dir = os.path.join(UPLOAD_DIR, f"extracted_{uuid.uuid4()}")
        os.makedirs(extract_dir, exist_ok=True)
        with zipfile.ZipFile(zip_temp, 'r') as z:
            z.extractall(extract_dir)

        allowed_exts = [".pdf", ".docx"]
        results = []

        results = []

        for root, _, files in os.walk(extract_dir):
            for fname in files:
                fpath = os.path.join(root, fname)
                ext = os.path.splitext(fpath)[1].lower()
                print(f"Processing file: {fpath}")
                if ext not in allowed_exts:
                    continue
                # process sequentially to avoid parallel LLM calls
                res = process_resume_sync(fpath, fname, jd_text, role)
                results.append(res)

        # assign ranks based on score desc
        results.sort(key=lambda x: (x.get('score') is not None, x.get('score')), reverse=True)
        for idx, item in enumerate(results, start=1):
            item['rank'] = idx

        final = {"candidates": results}

        return JSONResponse(content=final)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # cleanup temp files and extracted dir
        try:
            if os.path.exists(jd_temp):
                os.remove(jd_temp)
            if os.path.exists(zip_temp):
                os.remove(zip_temp)
            if os.path.exists(extract_dir):
                shutil.rmtree(extract_dir)
        except Exception:
            pass