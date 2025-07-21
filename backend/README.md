# incedo-ai-resume-parser
A cutting edge AI Resume Parser developed by the Incedo Team

## Setup

1. **Install dependencies:**

```bash
pip install -r requirements.txt
```

Or, if you want to ensure FastAPI and Uvicorn are installed:

```bash
pip install fastapi uvicorn[standard] aiofiles
```

2. **Set your Gemini API key:**

Export your API key as an environment variable:

```bash
export API_KEY=your_gemini_api_key_here
```

## Running the FastAPI Server

From the project root, run:

```bash
uvicorn app:app --reload
```

This will start the server at `http://127.0.0.1:8000`.

## Usage Example

### Parse a Resume via API

Send a POST request to `/parse_resume` with a PDF or DOCX file:

#### Using `curl`:

```bash
curl -X POST "http://127.0.0.1:8000/parse_resume" \
  -H  "accept: application/json" \
  -H  "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/resume.pdf"
```

#### Using Swagger UI:

Visit `http://127.0.0.1:8000/docs` in your browser and use the interactive interface to upload a file and see the JSON response.

### Example Response

When you upload a resume, you will receive a JSON response in the following format:

```json
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
```

---

The old CLI usage is deprecated for this API version. resumes (PDF or DOCX) using the Gemini AI model and returns structured JSON output.

python3.10 -m uvicorn app:app --reload
