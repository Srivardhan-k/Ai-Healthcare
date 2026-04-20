# Ai-Healthcare

MediGuard AI is an intelligent healthcare web application that helps users manage their medical data, track fitness, and get AI-powered medicine safety insights.

It combines **health monitoring, AI chat assistance, and risk prediction** into a single platform with offline-first capability.

---

📱 Application Preview

🏠 Dashboard
- Health Score tracking
- Steps, Sleep, Water monitoring
- Quick access to medicine tools

💬 AI Chat Assistant
- Ask about medicines (e.g., Paracetamol)
- Get dosage guidance
- Safety warnings & interactions

⚠️ AI Risk Analysis
- Input age, BMI, symptoms
- Get predictive health insights

🏃 Fitness Tracking
- Steps tracking
- Sleep hours
- Water intake

👤 Profile Management
- Height, Weight → BMI auto calculation
- Allergies detection
- Medical conditions
- Current medications

📅 Schedule
- Daily medicine planning (expandable)

---
🚀 Key Features
🧠 AI-Powered Healthcare
- Medicine information assistant
- Drug safety suggestions
- Basic interaction awareness

📊 Health Monitoring
- Real-time health score
- Fitness tracking (Steps, Sleep, Water)
- BMI calculation

⚠️ Risk Prediction
- Symptom-based AI insights
- Preventive health awareness

👤 Personal Medical Profile
- Allergies tracking
- Medical conditions
- Medication history

🔒 Privacy & Offline Support
- Runs locally (localhost-based system)
- Minimal external dependency
- Secure handling of user data

---
🧱 Tech Stack
Frontend
- HTML / CSS / JavaScript
- Mobile-first responsive UI

Backend
- Node.js + Express

AI Integration
- Local LLM (Ollama / LLaMA3)
- REST API (`/chat` endpoint)

Database (Pluggable)
- JSON / MongoDB (extendable)

📁 Project Structure
Ai-Healthcare/
│
├── frontend/
│ ├── pages/
│ │ ├── home.html # Dashboard
│ │ ├── chat.html # AI chat interface
│ │ ├── fitness.html # Fitness tracking
│ │ ├── profile.html # User profile
│ │ ├── schedule.html # Medicine schedule
│ │ └── risk.html # AI risk prediction
│ │
│ ├── css/
│ ├── js/
│ │ ├── app.js
│ │ ├── chat.js
│ │ ├── fitness.js
│ │ ├── profile.js
│ │ └── risk.js
│ │
│ └── assets/
│
├── backend/
│ ├── server.js # Express server
│ ├── routes/
│ │ └── chat.js # AI endpoint
│ └── controllers/
│
├── ai/
│ └── aiEngine.js # AI request handler
│
├── .env
├── package.json
└── README.md

* Install Backend Dependencies
cd backend
npm install

* Setup Environment Variables
- Create .env file inside backend:

PORT=5175
AI_API=// http://localhost:11434/api/generate//

* Run AI Model (Required)

- Install Ollama and run:
ollama run llama3

* Start Backend Server
-> node server.js
