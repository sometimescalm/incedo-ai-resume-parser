import pdfplumber
import docx2txt
import os
import json
import google.generativeai as genai
import fitz
from PIL import Image
import cv2
import numpy as np

try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False


PROMPT_TEMPLATE = """
You are an AI bot designed to act as a professional resume parser. You are given a resume, and your task is to extract the following fields and return them in valid JSON format, matching the structure below.
If a field is not present, leave it as an empty string or empty list.
Output Requirements:
- Output must be a valid JSON object.
- Do not include triple backticks (```), markdown formatting, or labels like “json”.
- The entire JSON must be on a single line.
- If there are line breaks in any string, they must be escaped using \\n.
- Return only the JSON object, in a single line, with no formatting, no extra explanation, and no markdown wrappers.

Extract these exact fields:
- full_name: Full name of the candidate.
- email_id: Email address.
- phone: Phone number.
- professional_summary: A concise 3–4 line summary. If not present, generate one based on work experience and skills. Escape line breaks with \\n.
- github_portfolio: GitHub profile URL, if available.
- linkedin_id: LinkedIn profile URL.
- work_experience:  Return as an array of objects sorted in **reverse chronological order** in the below json format.
- skills: strictly only Top 10–15 technical skills (comma-separated, no duplicates, no soft skills).Extract only the skills that are explicitly mentioned in the resume.
- education: Return as an array of objects sorted in **reverse chronological order** in the below json format.
- certifications: Combine all certifications into one comma-separated string.
- designation: Current or most recent job title.
- projects: Summarized projects and descriptions as per below json structure.
Return only the JSON object, in a single line, with no formatting, no extra explanation, and no markdown wrappers.
JSON structure:
{{
    "full_name": "",
    "email_id": "",
    "phone": "",
    "professional_summary": "",
    "github_portfolio": "",
    "linkedin_id": "",
    "designation": "",
    "certifications": "",
    "skills": "",
    "education": [
        {{
            "degree": "",
            "school": "",
            "location": "",
            "date": "",
            "gpa": "",
            "info": ""
        }} 
    ],
    "work_experience": [
        {{
            "company_name": "",
            "project_duration": "",
            "project_description": "",
            "role_name": "",
            "technologies": ""
        }}
    ],
    "projects": [
        {{
            "project_name":"",
            "project_description":""
        }}
    ]
}}

Resume content: {resume_text}
"""


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


def parse_resume_with_gemini(file_path):
    genai.configure(api_key="AIzaSyBZbKeZYnMy-BlDCycaNGrJHfq1KwoGXiY")
    model = genai.GenerativeModel('gemini-2.5-flash')

    resume_text = extract_text(file_path)
    prompt = PROMPT_TEMPLATE.format(resume_text=resume_text)
    response = model.generate_content(prompt)

    print("Response from Gemini:", response.text)
    # print(response.text)
    #response.raise_for_status()
    
    result = response.text.strip()
    result = json.loads(result)

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

    doc = fitz.open(pdf_path)
    page = doc.load_page(0)
    pix = page.get_pixmap(dpi=500)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    img_np = np.array(img)

    face_locations = face_recognition.face_locations(img_np)
    print(f"Detected faces: {len(face_locations)}")

    for i, (top, right, bottom, left) in enumerate(face_locations):
        # Add padding around face
        extended_top = max(top - 20, 0)
        extended_bottom = min(bottom + int((bottom - top) * 0.25), img_np.shape[0])
        extended_left = max(left - 20, 0)
        extended_right = min(right + 20, img_np.shape[1])

        # Crop face from image
        face = img_np[extended_top:extended_bottom, extended_left:extended_right]

        # Save face directly without additional zooming
        face_image_path = os.path.join(output_dir, f"FaceImage_face{i+1}.jpg")
        cv2.imwrite(face_image_path, cv2.cvtColor(face, cv2.COLOR_RGB2BGR))
        image_paths.append(f"/static/face_images/FaceImage_face{i+1}.jpg")
        print(f"Saved face image: {face_image_path}")

    return image_paths


if __name__ == "__main__":
    file_path = "Shubham_Wadkar_Resume.pdf"
    parsed = parse_resume_with_gemini(file_path)
    print(json.dumps(parsed, indent=2))
