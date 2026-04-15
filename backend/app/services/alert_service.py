import logging
from datetime import datetime
from app.database import execute_db, query_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('alert_engine')

class AlertEngine:
    """
    Central alert engine function.
    Reusable across all modules for generating and managing alerts.
    """
    
    # Valid trigger types
    TRIGGERS = [
        'unsafe_medicine',
        'drug_combination',
        'missed_medication',
        'high_risk'
    ]

    @classmethod
    def trigger(cls, user_id: int, trigger_type: str, title: str, message: str, severity: str = 'warning', emergency_contact: bool = False):
        """
        Triggers an alert. Stores it in the database and handles emergency contact simulation.
        
        :param user_id: ID of the user
        :param trigger_type: One of the supported triggers
        :param title: Title of the alert
        :param message: Detailed message of the alert
        :param severity: 'info', 'warning', 'danger', 'critical'
        :param emergency_contact: whether to simulate an emergency contact action
        """
        if trigger_type not in cls.TRIGGERS:
            # Fallback or allow custom, but warn
            logger.warning(f"Unrecognized trigger type: {trigger_type}")

        # Ensure we don't spam exact identical alerts if not dismissed
        # (You could customize deduplication logic here)
        existing = query_db('''
            SELECT id FROM alerts WHERE user_id = ? AND type = ?
            AND title = ? AND message = ? AND dismissed = 0
        ''', [user_id, trigger_type, title, message], one=True)

        if existing:
            return {"status": "skipped", "message": "Identical active alert already exists", "alert_id": existing['id']}

        alert_id = execute_db('''
            INSERT INTO alerts (user_id, type, title, message, severity)
            VALUES (?, ?, ?, ?, ?)
        ''', [user_id, trigger_type, title, message, severity])

        alert_data = {
            "id": alert_id,
            "type": trigger_type,
            "title": title,
            "message": message,
            "severity": severity,
            "user_id": user_id
        }

        # Simulate sending alert to emergency contact (print/log)
        if emergency_contact or severity in ['danger', 'critical']:
            cls._simulate_emergency_contact(user_id, alert_data)
        
        return {"status": "created", "alert": alert_data}
        
    @staticmethod
    def _simulate_emergency_contact(user_id: int, alert_data: dict):
        """Simulates sending an alert to an emergency contact by printing/logging."""
        profile = query_db('SELECT name, emergency_contact FROM profile WHERE id = ?', [user_id], one=True)
        patient_name = profile['name'] if profile and profile.get('name') else f"User {user_id}"
        contact_num = profile['emergency_contact'] if profile and profile.get('emergency_contact') else "(No Contact Provided)"
        
        print("\n" + "*"*60)
        print("🚨 EMERGENY ALERT TRIGGERED 🚨")
        print(f"DISPATCH TO: {contact_num}")
        print(f"PATIENT: {patient_name}")
        print("-" * 60)
        print(f"TRIGGER:  {alert_data['type']}")
        print(f"SEVERITY: {alert_data['severity'].upper()}")
        print(f"TITLE:    {alert_data['title']}")
        print(f"DETAILS:  {alert_data['message']}")
        print("*"*60 + "\n")
        
        logger.info(f"Emergency Alert successfully dispatched to {contact_num} for Patient {patient_name}: {alert_data['message']}")

alert_engine = AlertEngine()
