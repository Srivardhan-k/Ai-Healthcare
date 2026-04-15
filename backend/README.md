# MediGuard AI Backend

A Python Flask REST API backend with SQLite for the MediGuard AI healthcare application.

## Quick Start

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Server runs at: **http://localhost:5001**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update profile |
| POST | `/api/profile/medications` | Add medication |
| DELETE | `/api/profile/medications/<id>` | Remove medication |
| POST | `/api/medicines/check` | Medicine safety check |
| GET | `/api/medicines/database` | Full medicine list |
| GET | `/api/fitness/today` | Today's fitness data |
| POST | `/api/fitness` | Log fitness data |
| GET | `/api/fitness/history` | Last 7 days |
| GET | `/api/fitness/score` | Health score |
| GET | `/api/scheduler/today` | Today's meds schedule |
| POST | `/api/scheduler` | Add scheduled task |
| PATCH | `/api/scheduler/<id>/taken` | Toggle taken |
| GET | `/api/scheduler/missed` | Missed medications |
| GET | `/api/alerts` | Active alerts |
| PATCH | `/api/alerts/<id>/dismiss` | Dismiss alert |
| POST | `/api/alerts/generate` | Generate from missed meds |
| POST | `/api/risk/predict` | AI risk prediction |
| GET | `/api/risk/history` | Past risk assessments |
