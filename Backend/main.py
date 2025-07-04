import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from llm_utils import ask_ibm_llm

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Medical Chatbot API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionInput(BaseModel):
    question: str

@app.get("/")
async def root():
    return {"message": "Medical Chatbot API", "status": "running"}

@app.post("/api/predict")
async def predict(input: QuestionInput):
    if not input.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    # Since we're removing PDF context, just send a default placeholder context
    context_chunks = ["Symptom classification and department mapping required."]
    answer = ask_ibm_llm(input.question, context_chunks)
    return JSONResponse(content={"question": input.question, "answer": answer})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
