import requests
import pdfplumber
import docx2txt
import os
import json

import google.generativeai as genai

try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
from PIL import Image
import numpy as np
import io


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
- work_experience: Summarized work history and responsibilities as per below json structure.
- skills: Combine all relevant technical skills into one comma-separated string.
- education: Extract highest education detail in a single line.
- certifications: Combine all certifications into one comma-separated string.
- designation: Current or most recent job title.
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
    "education": "",
    "work_experience": [
        {{
            "company_name": "",
            "project_duration": "",
            "project_description": "",
            "role_name": "",
            "technologies": ""
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
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    model = genai.GenerativeModel('gemini-2.5-flash')

    resume_text = extract_text(file_path)
    prompt = PROMPT_TEMPLATE.format(resume_text=resume_text)
    response = model.generate_content(prompt)

    print("Response from Gemini:", response.text)
    result = response.text.strip()
    print(f"type Response from Gemini: {type(result)}   lenght  {len(result)}")
    result = json.loads(result)

    # Extract face images if PDF
    ext = os.path.splitext(file_path)[1].lower()
    face_images = []
    if ext == ".pdf":
        output_path = "../../temp_uploads"
        face_images = extract_face_from_pdf(file_path, output_path)
    result["face_images"] = face_images
    return result

def extract_face_from_pdf(pdf_path, output_image_path):
    image_paths = []
    if not FACE_RECOGNITION_AVAILABLE:
        print("face_recognition not installed, skipping face extraction.")
        return ["default_face.jpg"]
    with pdfplumber.open(pdf_path) as pdf:
        # Process only the first page
        page = pdf.pages[0]
        img_bytes = page.to_image(resolution=300).original.convert("RGB")

        # Convert PIL image to numpy array
        img_np = np.array(img_bytes)

        # Find face locations
        face_locations = face_recognition.face_locations(img_np)

        if not face_locations:
            print("No face detected. Returning default face image.")
            return ["default_face.jpg"]

        for i, (top, right, bottom, left) in enumerate(face_locations):
            # Extend box downward for shoulders and slightly upward
            extended_top = max(top - 20, 0)
            extended_bottom = min(bottom + int((bottom - top) * 0.25), img_np.shape[0])

            # Crop the region
            face_img = img_bytes.crop((left, extended_top, right, extended_bottom))

            # Save the image
            img_path = f"{output_image_path}_face{i+1}.jpg"
            face_img.save(img_path)
            image_paths.append(img_path)
            print(f"Saved: {img_path}")
    return image_paths

if __name__ == "__main__":
    file_path = "Shubham_Wadkar_Resume.pdf"
    # Parse resume
    parsed = parse_resume_with_gemini(file_path)
    print(json.dumps(parsed, indent=2))
    
    # Extract face from the resume
    output_path = os.path.splitext(file_path)[0]  # Use the same name as resume without extension
    extract_face_from_pdf(file_path, output_path)