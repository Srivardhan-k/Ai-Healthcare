from flask import Blueprint, jsonify, request
from app.database import query_db, execute_db
from app.services.risk_engine import calculate_risk

risk_bp = Blueprint('risk', __name__)
USER_ID = 1


@risk_bp.route('/risk/predict', methods=['POST'])
def predict_risk():
    data = request.get_json()
    age = int(data.get('age', 30))
    bmi = float(data.get('bmi', 22.0))
    symptoms = data.get('symptoms', '')

    result = calculate_risk(age, bmi, symptoms)

    # Save to history
    execute_db('''
        INSERT INTO risk_predictions (user_id, age, bmi, symptoms, risk_score, risk_level, explanation)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', [USER_ID, age, bmi, symptoms, result['risk_score'], result['risk_level'], result['explanation']])

    return jsonify({
        'risk': result['risk_score'],
        'level': result['risk_level'],
        'expl': result['explanation'],
        'factors': result.get('factors', [])
    })


@risk_bp.route('/risk/history', methods=['GET'])
def risk_history():
    records = query_db('''
        SELECT age, bmi, symptoms, risk_score, risk_level, explanation, created_at
        FROM risk_predictions
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
    ''', [USER_ID])
    return jsonify([{
        'age': r['age'], 'bmi': r['bmi'], 'symptoms': r['symptoms'],
        'risk_score': r['risk_score'], 'risk_level': r['risk_level'],
        'explanation': r['explanation'], 'created_at': r['created_at']
    } for r in records])


@risk_bp.route('/risk/update_model', methods=['POST'])
def update_model():
    """Optional online hook to strictly pull updated AI weights."""
    from app.services.model_updater import updater
    result = updater.check_for_updates()
    return jsonify(result)
