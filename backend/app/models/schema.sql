-- MediGuard AI Database Schema

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL DEFAULT 'User',
    age INTEGER,
    height REAL,
    weight REAL,
    allergies TEXT DEFAULT '',
    conditions TEXT DEFAULT '',
    emergency_phone TEXT DEFAULT '',
    emergency_email TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS fitness_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    date TEXT NOT NULL,
    steps INTEGER DEFAULT 0,
    sleep REAL DEFAULT 0.0,
    water REAL DEFAULT 0.0,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS medication_schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    dosage TEXT DEFAULT '',
    scheduled_time TEXT NOT NULL,
    taken INTEGER DEFAULT 0,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'warning',
    dismissed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS risk_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    age INTEGER,
    bmi REAL,
    symptoms TEXT DEFAULT '',
    risk_score INTEGER DEFAULT 0,
    risk_level TEXT DEFAULT 'Low Risk',
    explanation TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS medicine_knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT,
    avoid_with TEXT DEFAULT '',
    conditions_not_allowed TEXT DEFAULT '',
    timing TEXT DEFAULT ''
);

-- Seed default user (single-user offline mode)
INSERT OR IGNORE INTO users (id, name, age, height, weight, allergies, conditions)
VALUES (1, 'Sarah Johnson', 28, 165, 62, 'Penicillin, Peanuts', 'Mild Asthma, Hypertension');

-- Seed default medications
INSERT OR IGNORE INTO medicines (user_id, name) VALUES (1, 'Lisinopril 10mg daily');

-- Seed today's scheduler tasks
INSERT OR IGNORE INTO medication_schedule (user_id, name, dosage, scheduled_time, taken, date)
VALUES
    (1, 'Lisinopril', '10mg', '08:00 AM', 1, date('now')),
    (1, 'Vitamin D3', '2000 IU', '12:30 PM', 0, date('now')),
    (1, 'Atorvastatin', '20mg', '08:00 PM', 0, date('now'));

-- Seed initial fitness log
INSERT OR IGNORE INTO fitness_logs (user_id, date, steps, sleep, water)
VALUES (1, date('now'), 8234, 7.5, 2.1);
