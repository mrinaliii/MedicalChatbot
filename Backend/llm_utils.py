import requests
import os
from dotenv import load_dotenv

load_dotenv()


def get_medical_advice(user_question: str) -> str:
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        print("❌ No Groq API key found")
        return get_fallback_response(user_question)

    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    # Your exact prompt format
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

Symptom: {user_question}

Answer:"""

    payload = {
        "messages": [{"role": "user", "content": prompt}],
        "model": "llama-3.1-8b-instant",
        "temperature": 0.7,
        "max_tokens": 200,
    }

    try:
        print("🔍 Making request to Groq API...")
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30,
        )

        print(f"🔍 Groq response status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            answer = result["choices"][0]["message"]["content"]
            print(f"✅ Groq AI response: {answer}")
            return answer
        else:
            print(f"❌ Groq API error: {response.status_code} - {response.text}")
            return get_fallback_response(user_question)

    except Exception as e:
        print(f"❌ Groq API exception: {str(e)}")
        return get_fallback_response(user_question)


def get_fallback_response(question: str) -> str:
    """Fallback responses when AI model is unavailable"""
    question_lower = question.lower()

    # Single symptom responses (2-3 sentences)
    if any(word in question_lower for word in ["dizzy", "vertigo", "lightheaded"]):
        return "Feeling dizzy can be concerning. It might be related to inner ear issues, dehydration, or blood pressure changes. Try to sit down, stay hydrated, and avoid sudden movements.\n\nDepartment: Neurology 🧠"

    elif any(word in question_lower for word in ["headache", "migraine", "head pain"]):
        return "Headaches can have various causes like tension, dehydration, or sinus issues. Rest in a quiet room, stay hydrated, and consider over-the-counter pain relief if appropriate.\n\nDepartment: Neurology 🧠"

    elif any(word in question_lower for word in ["chest pain", "heart", "palpitation"]):
        return "Chest symptoms should always be taken seriously. If you're experiencing chest pain or palpitations, seek medical attention promptly to rule out any cardiac issues.\n\nDepartment: Cardiology ❤️"

    elif any(
        word in question_lower for word in ["stomach", "abdominal", "nausea", "vomit"]
    ):
        return "Abdominal discomfort can stem from various digestive issues. Try resting, sipping clear fluids, and eating bland foods until you can see a doctor.\n\nDepartment: Gastroenterology 🍽️"

    elif any(
        word in question_lower
        for word in ["skin", "rash", "acne", "dermatology", "itch"]
    ):
        return "Skin issues like rashes can be uncomfortable. Keep the area clean and dry, avoid scratching, and use gentle skincare products until you get professional advice.\n\nDepartment: Dermatology 🧴"

    elif any(
        word in question_lower
        for word in ["bone", "joint", "fracture", "ortho", "sprain"]
    ):
        return "For bone or joint concerns, it's best to rest the affected area and avoid putting weight on it. Apply ice if there's swelling and keep it elevated.\n\nDepartment: Orthopedics 🦴"

    elif any(
        word in question_lower for word in ["eye", "vision", "ophthalmology", "red eye"]
    ):
        return "Eye symptoms should be addressed promptly. Avoid rubbing your eyes and protect them from bright light until you can see an eye specialist.\n\nDepartment: Ophthalmology 👁️"

    else:
        return "I understand you're experiencing health concerns. It's always best to consult with a healthcare professional who can properly evaluate your symptoms and provide personalized advice.\n\nDepartment: General Medicine 💊"
