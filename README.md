📘 LearnHub – AI-Powered Interactive Learning Platform

LearnHub is a full-stack web application that allows users to upload PDFs and automatically generate AI-powered study content such as short notes, summaries, flashcards, formulas, and MCQ quizzes.
The platform is designed to help students learn faster and more effectively using modern AI models.

🚀 Live Demo

Frontend:
👉 https://nurturing-nature-production.up.railway.app

Backend API:
👉 https://learnhub-production-4f09.up.railway.app

🧠 Key Features
📂 PDF Management

Upload PDF study material

View uploaded PDFs

Delete PDFs securely

✍️ AI Content Generation

Notes & Summary generation

AI Flashcards

Key Formula extraction

MCQ & Quiz generation

Quiz regeneration

Quiz submission & scoring

🔐 Authentication & Security

JWT-based authentication

Protected API routes

Token-based authorization (Axios interceptors)

⚡ Real-Time & Scalable

RESTful API design

Cloud deployment

Environment-based configuration

🛠️ Tech Stack
Frontend

React.js

Axios

React Router

CSS (custom styling)

Backend

Node.js

Express.js

Sequelize ORM

MySQL

JWT Authentication

AI / APIs

Groq API (LLM inference)

OpenRouter (fallback AI provider)

Deployment

Railway (Backend + Frontend)

GitHub (Version control)

🧩 Project Architecture
LearnHub/
│
├── client/                  # React frontend
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.jsx
│
├── server/                  # Node.js backend
│   ├── routes/
│   │   ├── auth.js
│   │   ├── pdf.js
│   ├── controllers/
│   ├── services/
│   │   └── aiService.js
│   ├── middleware/
│   ├── models/
│   └── server.js
│
└── README.md

🧪 Error Handling & Stability

Graceful API error responses

AI fallback via OpenRouter

CI-safe production builds

Runtime environment validation

📌 What Makes This Project Strong

Real-world full-stack architecture

Secure authentication & authorization

Cloud-deployed & production-ready

AI integration with fallback logic

Clean separation of frontend & backend

Interview-ready complexity
