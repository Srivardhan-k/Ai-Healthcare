"""
MediGuard AI — Medication Scheduler API Routes
===============================================

GET    /api/scheduler/today      → Get all tasks for today
POST   /api/scheduler            → Add a new scheduled medication
PATCH  /api/scheduler/<id>/taken → Mark task as taken (toggle)
GET    /api/scheduler/status     → Summary of today's progress
POST   /api/scheduler/check      → Manually trigger missed dose check
"""

from flask import Blueprint, jsonify, request
from app.services.scheduler_service import scheduler_service
from app.database import query_db

scheduler_bp = Blueprint('scheduler', __name__)
USER_ID = 1


@scheduler_bp.route('/scheduler/today', methods=['GET'])
def get_today():
    """Fetch today's medication tasks."""
    tasks = scheduler_service.get_today_schedule()
    return jsonify([{
        'id': t['id'],
        'name': t['name'],
        'dosage': t['dosage'],
        'time': t['scheduled_time'],
        'taken': bool(t['taken']),
        'date': t['date']
    } for t in tasks])


@scheduler_bp.route('/scheduler', methods=['POST'])
def add_task():
    """Add a new scheduled medication."""
    data = request.get_json(silent=True) or {}
    name = data.get('name')
    time = data.get('time')
    dosage = data.get('dosage', '')
    
    if not name or not time:
        return jsonify({"error": "Name and time are required."}), 400
        
    task_id = scheduler_service.add_task(name, dosage, time, data.get('date'))
    return jsonify({'success': True, 'id': task_id}), 201


@scheduler_bp.route('/scheduler/<int:task_id>/taken', methods=['PATCH'])
def toggle_taken(task_id):
    """Mark a task as taken."""
    # We fetch current status just to report it back or if we wanted to toggle
    task = query_db('SELECT taken FROM medication_schedule WHERE id = ? AND user_id = ?', [task_id, USER_ID], one=True)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
        
    scheduler_service.mark_as_taken(task_id)
    return jsonify({'success': True, 'taken': True})


@scheduler_bp.route('/scheduler/status', methods=['GET'])
def get_status():
    """Return a summary of today's progress."""
    tasks = scheduler_service.get_today_schedule()
    total = len(tasks)
    taken = sum(1 for t in tasks if t['taken'])
    return jsonify({
        "total": total,
        "taken": taken,
        "remaining": total - taken,
        "progress_percent": round((taken / total * 100), 1) if total > 0 else 0
    })


@scheduler_bp.route('/scheduler/check', methods=['POST'])
def trigger_check():
    """Manually trigger the missed dose detection engine."""
    missed_count = scheduler_service.check_for_missed_doses()
    return jsonify({
        "success": True,
        "message": f"Checked for missed medications. {missed_count} new issues detected.",
        "missed_detected": missed_count
    })
