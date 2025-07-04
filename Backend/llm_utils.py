import os
import requests
import logging
from dotenv import load_dotenv
from typing import List

load_dotenv()
logger = logging.getLogger(__name__)

BASE_URL = os.getenv("IBM_LLM_URL")
API_KEY = os.getenv("IBM_API_KEY")
PROJECT_ID = os.getenv("IBM_PROJECT_ID")
MODEL_ID = "meta-llama/llama-3-3-70b-instruct"
API_VERSION = "2024-05-01"

def get_token():
    resp = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"grant_type": "urn:ibm:params:oauth:grant-type:apikey", "apikey": API_KEY}
    )
    resp.raise_for_status()
    return resp.json()["access_token"]

def infer_text(token: str, prompt: str) -> str:
    url = f"{BASE_URL}/ml/v1/text/generation?version={API_VERSION}"
    payload = {
        "model_id": MODEL_ID,
        "project_id": PROJECT_ID,
        "input": prompt,
        "parameters": {
            "decoding_method": "greedy",
            "max_new_tokens": 80,
            "temperature": 0.7,
            "top_k": 10,
            "top_p": 0.9,
            "stop_sequences": ["Symptom description:", "Your answer:"]
        }
    }
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    resp = requests.post(url, headers=headers, json=payload)
    resp.raise_for_status()
    return resp.json().get("results", [{}])[0].get("generated_text", "").strip()

def ask_ibm_llm(question: str, context_chunks: List[str]) -> str:
    if not all([BASE_URL, API_KEY, PROJECT_ID]):
        return "[ERROR] Missing IBM credentials"

    try:
        token = get_token()
        prompt = f"""You are a helpful medical assistant. A user will describe a symptom.

Respond in 2-3 short sentences with friendly, clear advice and recommend one medical department only. Unless, there are two symptoms which are not of the same department then give response in 5-6 lines and recommend the medical departments accordingly.
Department: <Department Name> <Emoji> (the number should be same as the number of departments recommended.)

Here are some valid departments:
- Cardiology ❤️
- Dermatology 🧴
- General Medicine 💊
- Neurology 🧠
- Orthopedics 🦴
- Gastroenterology 🍽️
- Ophthalmology 👁️
Symptom: {question}

Answer:"""

        return infer_text(token, prompt)
    except Exception as e:
        logger.error(e)
        return f"[ERROR] {e}"
