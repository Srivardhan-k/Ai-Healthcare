"""
MediGuard AI — Medication Scheduler Service
===========================================
Handles:
  - Adding/Updating medication schedules
  - Marking medications as taken
  - Detecting missed medications
  - Triggering reminders and emergency alerts
"""

from datetime import datetime, timedelta
from app.database import query_db, execute_db

class SchedulerService:
    def __init__(self, user_id=1):
        self.user_id = user_id

    def get_today_schedule(self):
        """Fetch all tasks for today."""
        today = datetime.now().date().isoformat()
        return query_db('SELECT * FROM medication_schedule WHERE user_id = ? AND date = ? ORDER BY scheduled_time ASC', [self.user_id, today])

    def add_task(self, name, dosage, time, date=None):
        """Add a new scheduled medication."""
        if not date:
            date = datetime.now().date().isoformat()
        
        task_id = execute_db(
            'INSERT INTO medication_schedule (user_id, name, dosage, scheduled_time, taken, date) VALUES (?, ?, ?, ?, 0, ?)',
            [self.user_id, name, dosage, time, date]
        )
        return task_id

    def mark_as_taken(self, task_id):
        """Mark a specific task as taken."""
        execute_db('UPDATE medication_schedule SET taken = 1 WHERE id = ? AND user_id = ?', [task_id, self.user_id])
        return True

    def check_for_missed_doses(self):
        """
        Check for doses that are past their scheduled time and not taken.
        This is the core of the 'periodic check' simulation.
        """
        now = datetime.now()
        today_date = now.date().isoformat()
        
        # Get all untaken tasks for today
        tasks = query_db('SELECT * FROM medication_schedule WHERE user_id = ? AND date = ? AND taken = 0', [self.user_id, today_date])
        
        missed_tasks = []
        for task in tasks:
            # Parse scheduled time (e.g., '08:00 AM')
            try:
                task_time_str = task['scheduled_time']
                task_time = datetime.strptime(f"{today_date} {task_time_str}", "%Y-%m-%d %I:%M %p")
                
                # If current time is 15 mins past scheduled time, it's 'missed' for reminder
                if now > task_time + timedelta(minutes=15):
                    missed_tasks.append(task)
            except Exception as e:
                print(f"Error parsing time for task {task['id']}: {e}")

        # Process missed tasks (trigger alerts)
        for task in missed_tasks:
            self._trigger_reminder(task)
            
            # If current time is 1 hour past, trigger emergency alert simulation
            task_time = datetime.strptime(f"{today_date} {task['scheduled_time']}", "%Y-%m-%d %I:%M %p")
            if now > task_time + timedelta(hours=1):
                self._trigger_emergency_alert(task)

        return len(missed_tasks)

    def _trigger_reminder(self, task):
        """Create a reminder alert in the database."""
        from app.services.alert_service import alert_engine
        alert_engine.trigger(
            user_id=self.user_id,
            trigger_type='missed_medication',
            title=f"Reminder: {task['name']}",
            message=f"It's past time for your {task['dosage']} of {task['name']}. Please take it as soon as possible.",
            severity='warning'
        )

    def _trigger_emergency_alert(self, task):
        """Create a high-severity emergency alert."""
        from app.services.alert_service import alert_engine
        alert_engine.trigger(
            user_id=self.user_id,
            trigger_type='missed_medication',
            title=f"CRITICAL: Missed {task['name']}",
            message=f"Medication {task['name']} is over 1 hour overdue. Emergency contacts may be notified if this data was shared.",
            severity='critical',
            emergency_contact=True
        )

scheduler_service = SchedulerService()
