from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

guideprompt = """
You are a medical assistant. Based on the user's symptoms, recommend the correct medical department.

Mapping:
- Chest pain, breathlessness → Cardiology
- Rashes, acne → Dermatology
- Headaches, dizziness → Neurology
- Fever, sore throat → General Medicine
- Stomach issues → Gastroenterology
- Joint pain → Orthopedics
- Eye problems → Ophthalmology

User Symptoms: {symptoms}
Your Answer:
"""

def analyze_symptoms(symptoms):
    prompt = guideprompt.format(symptoms=symptoms)

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={"model": "llama3", "prompt": prompt, "stream": False}
        )

        if response.status_code == 200:
            output = response.json()["response"]
            if "Your Answer:" in output:
                return output.split("Your Answer:")[-1].strip()
            return output.strip()
        else:
            return "Error: Could not get response from the AI model."
    except Exception as e:
        return f"Error: {str(e)}"

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        if not data or 'question' not in data:
            return jsonify({'detail': 'Missing question in request body'}), 400
        
        question = data['question']
        
        if not question.strip():
            return jsonify({'detail': 'Question cannot be empty'}), 400
        
        answer = analyze_symptoms(question)
        
        return jsonify({'answer': answer})
    
    except Exception as e:
        return jsonify({'detail': f'Internal server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)