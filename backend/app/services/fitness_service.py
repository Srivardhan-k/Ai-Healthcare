from app.database import query_db, execute_db
from datetime import date

class FitnessService:
    def __init__(self, user_id=1):
        self.user_id = user_id

    def get_today_log(self):
        today = date.today().isoformat()
        log = query_db(
            'SELECT * FROM fitness_logs WHERE user_id = ? AND date = ?',
            [self.user_id, today], one=True
        )
        if not log:
            return {'date': today, 'steps': 0, 'sleep': 0.0, 'water': 0.0}
        return {'date': log['date'], 'steps': log['steps'], 'sleep': log['sleep'], 'water': log['water']}

    def save_fitness_data(self, steps=0, sleep=0.0, water=0.0):
        today = date.today().isoformat()
        existing = query_db(
            'SELECT id FROM fitness_logs WHERE user_id = ? AND date = ?',
            [self.user_id, today], one=True
        )
        if existing:
            execute_db('''
                UPDATE fitness_logs SET steps = ?, sleep = ?, water = ?
                WHERE user_id = ? AND date = ?
            ''', [steps, sleep, water, self.user_id, today])
        else:
            execute_db('''
                INSERT INTO fitness_logs (user_id, date, steps, sleep, water)
                VALUES (?, ?, ?, ?, ?)
            ''', [self.user_id, today, steps, sleep, water])
        return True

    def get_history(self, limit=7):
        logs = query_db('''
            SELECT date, steps, sleep, water FROM fitness_logs
            WHERE user_id = ?
            ORDER BY date DESC
            LIMIT ?
        ''', [self.user_id, limit])
        return [{'date': l['date'], 'steps': l['steps'], 'sleep': l['sleep'], 'water': l['water']} for l in logs]

    def calculate_health_score(self):
        log = self.get_today_log()
        score = 50
        
        # Calculate numerical score
        if log['steps'] > 0 or log['sleep'] > 0 or log['water'] > 0:
            if log['steps'] >= 8000:
                score += 20
            elif log['steps'] >= 5000:
                score += 10
                
            if 7 <= log['sleep'] <= 9:
                score += 15
            elif log['sleep'] > 0 and log['sleep'] < 5:
                score -= 10
                
            if log['water'] >= 2:
                score += 10
            elif log['water'] > 0 and log['water'] < 1:
                score -= 5

        # Determine logic for Good / Moderate / Risk
        # "Good (green): good sleep + activity" -> translates to high score
        score = max(0, min(100, score)) # cap between 0 and 100
        
        if score >= 75:
            status = 'Good'
        elif score >= 50:
            status = 'Moderate'
        else:
            status = 'Risk'
            
        return {
            'health_score': score,
            'status': status
        }

fitness_service = FitnessService()
