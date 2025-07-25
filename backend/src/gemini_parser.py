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
- awards_recognitions: List of awards, achievements, scholarships, or honors received.
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
    ]
    "projects": [
        {{
            "project_name":"",
            "project_description":""
        }}
    ],
    "awards": [
        ""
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
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    model = genai.GenerativeModel('gemini-2.5-flash')

    resume_text = extract_text(file_path)
    prompt = PROMPT_TEMPLATE.format(resume_text=resume_text)
    response = model.generate_content(prompt)

    print("Response from Gemini:", response.text)
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



if __name__ == "__main__":
    file_path = "Shubham_Wadkar_Resume.pdf"
    # Parse resume
    parsed = parse_resume_with_gemini(file_path)
    print(json.dumps(parsed, indent=2))