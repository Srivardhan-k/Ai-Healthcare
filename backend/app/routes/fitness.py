from flask import Blueprint, jsonify, request
from app.services.fitness_service import fitness_service

fitness_bp = Blueprint('fitness', __name__)

@fitness_bp.route('/fitness/today', methods=['GET'])
def get_today():
    return jsonify(fitness_service.get_today_log())

@fitness_bp.route('/fitness', methods=['POST'])
def log_fitness():
    data = request.get_json()
    fitness_service.save_fitness_data(
        steps=data.get('steps', 0),
        sleep=data.get('sleep', 0),
        water=data.get('water', 0)
    )
    return jsonify({'success': True, 'message': 'Fitness logged for today.'})

@fitness_bp.route('/fitness/history', methods=['GET'])
def get_history():
    return jsonify(fitness_service.get_history())

@fitness_bp.route('/fitness/score', methods=['GET'])
def get_health_score():
    return jsonify(fitness_service.calculate_health_score())
