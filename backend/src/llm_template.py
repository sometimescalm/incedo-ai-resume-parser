PROMPT_BASIC_CONVERSION_TEMPLATE = """
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
- key_skills: strictly only Top 2-3 technical skills (comma-separated, no duplicates, no soft skills).Extract only the skills that are explicitly mentioned in the resume.
- education: Provide recent education details.
- exerience: Total years of professional experience as a string.
Return only the JSON object, in a single line, with no formatting, no extra explanation, and no markdown wrappers.
JSON structure:
{{
    "full_name": "",
    "email_id": "",
    "phone": "",
    "key_skills": "",
    "education": "",
    "experience": ""
}}

Resume content: {resume_text}
"""


PROMPT_CONVERSION_TEMPLATE = """
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
  Strictly for all resumes the description for each should be in bullet points and each point on new line. 
  Strictly each bullet point on new line.
  Strictly each description should be maximum 450 characters
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


# Prompt template for scoring a resume against a JD/role. Returns strict JSON.
PROMPT_RANK_TEMPLATE = """
You are an expert recruiter and hiring reviewer. Given a Job Description (JD), a role, and a candidate resume, score the candidate against the JD and role.
Output requirements:
- Return only a single valid JSON object (no markdown, no extra text, no backticks).
- The entire JSON must be on one line.
- The JSON must contain these keys: `score` (integer 0-100), `strength` (one-line string), `gaps` (one-line string), and optionally `skills_match` (integer 0-100).
- `strength` and `gaps` must each be a concise one-line sentence (no newlines).

Job Description:
{jd_text}

Role: {role}

Resume:
{resume_text}

Provide the JSON now. Example:
{"score": 92, "strength": "Strong backend experience and cloud skills.", "gaps": "Limited experience with Kubernetes.", "skills_match": 85}
"""


PROMPT_INTERVIEW_TEMPLATE = """
You are an expert technical interviewer. Generate interview questions tailored to the Job Description (JD), the candidate's resume, and the dynamic role metadata provided below.

Role Metadata:
- Role: {role}
- Domain: {domain}
- Experience Level: {experience_level}
- Key Skills: {skills}
- Number of Questions Required: {num_questions}

Output Requirements:
- Output must be a valid JSON object.
- Do not include triple backticks, markdown formatting, or labels like "json".
- The entire JSON must be on a single line.
- All strings must escape line breaks using \\n, except for the `sample_code` field.
- The `sample_code` field must contain actual newline characters without escaping.
- Return only the JSON object in a single line, with no additional explanation.

The JSON schema must be exactly:
{{
    "questions": [
        {{
            "question": "string",
            "type": "technical" | "behavioral" | "coding",
            "difficulty": "easy" | "medium" | "hard",
            "expected_answer": "string",
            "sample_code": "string (optional)",
            "hints": ["string"] (optional)
        }}
    ]
}}

Question Distribution Rules:
- The total number of questions must be exactly {num_questions}.
- Distribute questions dynamically using the following logic:
  - Coding Questions: 1–3 max, ~20% of total. Use:
      coding_count = min(3, max(1, round({num_questions} * 0.2)))
  - Behavioral Questions: ~20% of total, minimum 2. Use:
      behavioral_count = max(2, round({num_questions} * 0.2))
  - Technical Questions: All remaining questions after allocating coding + behavioral.
- The distribution must always sum to {num_questions}.
- Technical questions should span easy, medium, and hard difficulty levels.
- Behavioral questions should map to {role}, {domain}, and {experience_level}.
- Coding questions should include optional `sample_code` where helpful.
- `expected_answer` must be concise (max 200 words) and escape line breaks with \\n.

Job Description:
{jd_text}

Resume:
{resume_text}
"""
