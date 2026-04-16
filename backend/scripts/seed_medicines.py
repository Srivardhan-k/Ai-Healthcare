import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'mediguard.db')
JSON_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'medicines.json')

def seed():
    if not os.path.exists(JSON_PATH):
        print("Error: medicines.json not found")
        return
        
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        medicines = json.load(f)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    inserted = 0
    for med in medicines:
        name = med.get("name", "").lower()
        if not name:
            continue
            
        mtype = med.get("type", "medicine")
        avoid = ",".join(med.get("avoid_with", []))
        cond = ",".join(med.get("conditions_not_allowed", []))
        timing = med.get("before_after_food", "")
        
        try:
            cursor.execute('''
                INSERT INTO medicine_knowledge_base (name, type, avoid_with, conditions_not_allowed, timing)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(name) DO UPDATE SET
                    type=excluded.type,
                    avoid_with=excluded.avoid_with,
                    conditions_not_allowed=excluded.conditions_not_allowed,
                    timing=excluded.timing
            ''', (name, mtype, avoid, cond, timing))
            inserted += 1
        except Exception as e:
            print(f"Error inserting {name}: {e}")
            
    conn.commit()
    conn.close()
    print(f"Successfully seeded {inserted} medicines into medicine_knowledge_base SQLite Table!")

if __name__ == '__main__':
    seed()
