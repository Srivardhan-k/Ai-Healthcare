"""
MediGuard AI — Health Assistant Chatbot
========================================
Integrates Ollama (Llama3) for local AI health advice.
Completely isolated from existing features.
"""

from flask import Blueprint, jsonify, request
import requests
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('chat_service')

chat_bp = Blueprint('chat', __name__)

# Local Ollama API endpoint
OLLAMA_API = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3"

# System prompt for health-focused responses
HEALTH_SYSTEM_PROMPT = """You are MediGuard AI, a helpful health assistant. You provide:
- General health and wellness information
- Medication usage guidance (not medical diagnosis)
- Fitness and nutrition tips
- Emergency disclaimer when needed

Keep responses concise, friendly, and medically safe.
IMPORTANT: Never replace professional medical advice. Always suggest consulting healthcare providers for serious issues."""


@chat_bp.route('/chat', methods=['POST'])
def chat():
    """
    Chat endpoint - communicates with Ollama/Llama3 locally.
    
    Request body:
    {
        "message": "What are the benefits of exercise?"
    }
    
    Response:
    {
        "reply": "AI-generated health advice"
    }
    """
    try:
        data = request.get_json(silent=True) or {}
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({"error": "Message is required"}), 400
        
        if len(user_message) > 500:
            user_message = user_message[:500]
        
        # Build prompt
        full_prompt = f"{HEALTH_SYSTEM_PROMPT}\n\nUser: {user_message}\n\nAssistant:"
        
        # Call Ollama
        logger.info(f"Chat request from user: {user_message[:50]}...")
        
        response = requests.post(
            OLLAMA_API,
            json={
                "model": OLLAMA_MODEL,
                "prompt": full_prompt,
                "stream": False,
                "temperature": 0.7,
            },
            timeout=30
        )
        
        if response.status_code != 200:
            logger.error(f"Ollama error: {response.status_code} - {response.text}")
            return jsonify({
                "error": "AI service temporarily unavailable. Please ensure Ollama is running.",
                "hint": "Run: ollama run llama3"
            }), 503
        
        ai_response = response.json().get('response', '').strip()
        
        if not ai_response:
            raise ValueError("Empty response from Ollama")
        
        logger.info(f"Chat response generated ({len(ai_response)} chars)")
        
        return jsonify({
            "reply": ai_response,
            "success": True
        }), 200
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Connection error to Ollama: {e}")
        return jsonify({
            "error": "Could not connect to AI service. Make sure Ollama is running.",
            "hint": "Run: ollama run llama3"
        }), 503
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return jsonify({"error": "Chat service error"}), 500


@chat_bp.route('/chat/health-check', methods=['GET'])
def health_check():
    """Check if Ollama is available."""
    try:
        response = requests.get(f"{OLLAMA_API}".replace("/api/generate", "/api/tags"), timeout=5)
        is_available = response.status_code == 200
        
        return jsonify({
            "ollama_available": is_available,
            "status": "running" if is_available else "offline"
        }), 200
        
    except:
        return jsonify({
            "ollama_available": False,
            "status": "offline"
        }), 200
