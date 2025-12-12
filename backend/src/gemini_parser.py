import pdfplumber
import docx2txt
import os
import json
from .llm_client import llm_client
from PIL import Image
import numpy as np
from .llm_template import PROMPT_CONVERSION_TEMPLATE, PROMPT_INTERVIEW_TEMPLATE, PROMPT_BASIC_CONVERSION_TEMPLATE, PROMPT_RANK_TEMPLATE

try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False


from .llm_client import llm_client



def extract_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                content = page.extract_text()
                if content:
                    text += content + "\n"
        return text
    elif ext == ".docx":
        return docx2txt.process(file_path)
    else:
        raise ValueError("Unsupported file format")


def get_basic_resume_info_with_gemini(file_path):
    resume_text = extract_text(file_path)
    prompt = PROMPT_BASIC_CONVERSION_TEMPLATE.format(resume_text=resume_text)

    response = llm_client.generate(prompt)
    result_text = getattr(response, "text", "") or ""
    result = json.loads(result_text)
    return result

def parse_resume_with_gemini(file_path):
    resume_text = extract_text(file_path)
    prompt = PROMPT_CONVERSION_TEMPLATE.format(resume_text=resume_text)

    response = llm_client.generate(prompt)
    result_text = getattr(response, "text", "") or ""
    result = json.loads(result_text)

    # Extract face images if PDF
    ext = os.path.splitext(file_path)[1].lower()
    face_images = []
    if ext == ".pdf":
        face_images = extract_face_from_pdf(file_path)
    result["face_images"] = face_images
    return result

def extract_face_from_pdf(pdf_path, output_dir="static/face_images"):
    os.makedirs(output_dir, exist_ok=True)
    image_paths = []

    if not FACE_RECOGNITION_AVAILABLE:
        print("face_recognition not installed.")
        return ["default_face.jpg"]

    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        img_bytes = page.to_image(resolution=300).original.convert("RGB")

        img_np = np.array(img_bytes)
        face_locations = face_recognition.face_locations(img_np)

        if not face_locations:
            print("No face detected.")
            return []

        for i, (top, right, bottom, left) in enumerate(face_locations):
            face_height = bottom - top
            face_width = right - left

            padding_vertical = int(face_height * 0.5)
            padding_horizontal = int(face_width * 0.5)

            extended_top = max(top - padding_vertical, 0)
            extended_bottom = min(bottom + padding_vertical, img_np.shape[0])
            extended_left = max(left - padding_horizontal, 0)
            extended_right = min(right + padding_horizontal, img_np.shape[1])

            face_img = img_bytes.crop((extended_left, extended_top, extended_right, extended_bottom))
            output_file = os.path.join(output_dir, f"FaceImage_face{i+1}.png")
            face_img.save(output_file)
            image_paths.append(output_file)
            print(f"Saved: {output_file}")

    return image_paths


def generate_interview_questions(context_metadata):
    result_text = ""
    try:
        prompt = PROMPT_INTERVIEW_TEMPLATE.format(**context_metadata)
        response = llm_client.generate(prompt)
        result_text = getattr(response, 'text', '')
        if result_text is None:
            result_text = ''
        result_text = result_text.strip()

        result = json.loads(result_text)
    except Exception as e:
        err_msg = str(e)
        raise ValueError({
            "error": "LLM response not valid JSON or call failed",
            "message": err_msg,
            "raw": result_text
        })

    return result


def score_resume_against_jd(jd_text, resume_text, role=None):
    """Call the LLM with PROMPT_RANK_TEMPLATE to get a score, strength and gaps for the resume vs JD.

    Returns a dict with at least keys: score (int), strength (str), gaps (str), skills_match (int, optional).
    On error returns a dict with keys: error, message, raw.
    """
    # sanitize inputs (reuse same sanitizer logic)

    jd_text = jd_text
    resume_text = resume_text
    role_text = (role or "").strip()

    try:
        prompt = PROMPT_RANK_TEMPLATE.replace("{jd_text}", jd_text).replace("{resume_text}", resume_text).replace("{role}", role_text)
        response = llm_client.generate(prompt)
        result_text = getattr(response, 'text', '') or ''
        result_text = result_text.strip()
        try:
            parsed = json.loads(result_text)
        except Exception:
            # try to extract a JSON object substring
            import re
            m = re.search(r"\{.*\}", result_text, flags=re.S)
            if m:
                try:
                    parsed = json.loads(m.group(0))
                except Exception:
                    raise RuntimeError(f"invalid_json: Could not parse JSON from LLM response. Raw: {result_text[:2000]}")
            else:
                raise RuntimeError(f"no_json_found: LLM did not return JSON. Raw: {result_text[:2000]}")

        # normalize fields
        out = {}
        score_val = parsed.get('score', 0)
        try:
            out['score'] = int(score_val)
        except Exception:
            raise ValueError(f"invalid_score: Could not convert score to int: {score_val}")

        out['strength'] = str(parsed.get('strength', ''))
        out['gaps'] = str(parsed.get('gaps', ''))
        if 'skills_match' in parsed:
            try:
                out['skills_match'] = int(parsed.get('skills_match'))
            except Exception:
                out['skills_match'] = None
        return out
    except Exception as e:
        raise RuntimeError(f"llm_call_failed: {e}") from e



if __name__ == "__main__":
    file_path = "Shubham_Wadkar_Resume.pdf"
    # Parse resume
    parsed = parse_resume_with_gemini(file_path)
    print(json.dumps(parsed, indent=2))