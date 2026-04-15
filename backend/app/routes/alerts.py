from flask import Blueprint, jsonify, request
from app.database import query_db, execute_db
from datetime import datetime

alerts_bp = Blueprint('alerts', __name__)
USER_ID = 1


@alerts_bp.route('/alerts', methods=['GET'])
def get_alerts():
    alerts = query_db('''
        SELECT id, type, title, message, severity, created_at
        FROM alerts
        WHERE user_id = ? AND dismissed = 0
        ORDER BY created_at DESC
    ''', [USER_ID])
    return jsonify([{
        'id': a['id'], 'type': a['type'], 'title': a['title'],
        'message': a['message'], 'severity': a['severity'],
        'created_at': a['created_at']
    } for a in alerts])


@alerts_bp.route('/alerts/<int:alert_id>/dismiss', methods=['PATCH'])
def dismiss_alert(alert_id):
    execute_db(
        'UPDATE alerts SET dismissed = 1 WHERE id = ? AND user_id = ?',
        [alert_id, USER_ID]
    )
    return jsonify({'success': True})


@alerts_bp.route('/alerts/generate', methods=['POST'])
def generate_alerts():
    """Auto-generate alerts from missed medications and interaction checks."""
    from datetime import date
    from app.services.alert_service import alert_engine
    today = date.today().isoformat()

    # Check for missed medications
    missed = query_db('''
        SELECT name, scheduled_time FROM medication_schedule
        WHERE user_id = ? AND date = ? AND taken = 0
    ''', [USER_ID, today])

    generated = []
    for task in missed:
        result = alert_engine.trigger(
            user_id=USER_ID,
            trigger_type='missed_medication',
            title='Missed Medication',
            message=f'{task["name"]} (scheduled at {task["scheduled_time"]}) has not been marked as taken.',
            severity='warning'
        )
        if result['status'] == 'created':
            generated.append(result['alert'])

    return jsonify({'success': True, 'alerts_generated': len(generated), 'alerts': generated})
