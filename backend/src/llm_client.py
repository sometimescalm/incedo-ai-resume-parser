import os
import google.generativeai as genai
import openai


class LLMResponse:
    def __init__(self, text: str):
        self.text = text


class LLMClient:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "gemini").lower()
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self.openai_model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

    def _ensure_gemini_config(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

    def _ensure_openai_config(self):
        # Require modern OpenAI SDK (openai>=1.0.0) and create client
        try:
            from openai import OpenAI as OpenAIClient
        except Exception:
            raise RuntimeError("openai package not installed or incompatible. Please install openai>=1.0.0")
        self._openai_client = OpenAIClient(api_key=os.getenv("OPENAI_API_KEY"))

    def generate(self, prompt: str, temperature: float = 0.0):
        if self.provider == "openai":
            print("openai LLM")
            self._ensure_openai_config()

            try:
                resp = self._openai_client.chat.completions.create(
                    model=self.openai_model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=temperature,
                )

                # Extract text from the canonical modern response
                text = None
                if getattr(resp, "choices", None):
                    first = resp.choices[0]
                    msg = getattr(first, "message", None)
                    if msg is not None:
                        text = getattr(msg, "content", None)
                    if not text:
                        text = getattr(first, "text", None)

                if text is None:
                    text = str(resp)

                return LLMResponse(text.strip())
            except Exception as e:
                raise RuntimeError(f"openai_call_failed: {e}") from e

        # default: gemini
        try:
            self._ensure_gemini_config()
            print("gemini LLM")
            model = genai.GenerativeModel(self.gemini_model)
            resp = model.generate_content(prompt)
            text = getattr(resp, "text", None)
            return LLMResponse((text or "").strip())
        except Exception as e:
            raise RuntimeError(f"gemini_call_failed: {e}") from e


# module-level instance
llm_client = LLMClient()
