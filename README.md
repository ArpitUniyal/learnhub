# 📘 LearnHub — AI-Powered Interactive Learning Platform

LearnHub is an AI-powered interactive learning platform that transforms PDF study material into a personalized study kit.

### 🌐 Live Demo

**[Open LearnHub](https://dark-band-7a4a.arpituniyal12.workers.dev)**

**Deployed Architecture**
- **Frontend:** Cloudflare Workers Static Assets
- **Backend:** Render Web Service
- **Database:** Aiven MySQL
- **AI:** Gemini → Groq → OpenRouter fallback

> The application is publicly accessible through the live URL above. The Render free backend may sleep after inactivity and can take some time to wake on the first request.

---

## ✨ Key Features

### 📂 PDF Management
- Secure PDF upload, storage, and deletion
- User-specific PDF access
- Automatic text extraction using `pdf-parse`
- Extracted text stored in MySQL
- PDF-specific learning content generation
- Generated learning content is associated with the corresponding user and PDF

### 🧠 AI-Generated Study Content
- **Smart Short Notes** — comprehensive notes covering important concepts
- **AI Flashcards** — question-answer pairs for active recall
- **Key Formula Extraction** — formulas with symbol/notation meanings
- **MCQ Quiz Generation** — generates 10 MCQs per quiz
- **Quiz Regeneration** — generates new questions using previously unused PDF sections
- **Quiz Scoring** — evaluates submitted answers and calculates scores
- **Content Caching** — previously generated notes, flashcards, and formulas can be reused from the database

### 🔊 Text-to-Speech
- Listen to generated notes using the browser's Web Speech API

### 🔐 Authentication & Security
- JWT-based authentication
- Persistent login using browser storage
- Protected routes for authenticated users
- User-scoped API access
- Axios interceptor for JWT authorization
- Secure logout
- Forgot-password and password-reset functionality
- Temporary, single-use password-reset tokens
- Password hashing with `bcryptjs`

---

## 🧪 AI Reliability & Fallback Architecture

LearnHub uses multiple AI providers so content generation does not depend on a single provider.

```text
Gemini → Groq → OpenRouter
(primary)  (fallback)  (last resort)
```

- **Primary:** Google Gemini
- **Secondary:** Groq
- **Last resort:** OpenRouter free routing
- Automatic fallback when an AI provider fails or becomes unavailable
- Provider timing and error logging
- Defensive JSON parsing and validation
- Separate prompts for notes, flashcards, formulas, and MCQs

### AI Processing

Long PDF text is divided into manageable chunks before AI generation.

```text
PDF
 ↓
Text extraction
 ↓
Chunking
 ↓
Content-specific prompt
 ↓
Gemini
 ↓ failure
Groq
 ↓ failure
OpenRouter
 ↓
Validation
 ↓
MySQL
```

This keeps requests manageable and allows large study materials to be processed without sending the entire document in one request.

---

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- Tailwind CSS
- Axios
- React Context API
- KaTeX
- Web Speech API

### Backend
- Node.js
- Express.js
- Sequelize ORM
- MySQL
- JWT Authentication
- bcryptjs
- Nodemailer
- Multer
- pdf-parse
- Winston
- Morgan
- Axios
- Razorpay

### AI / LLM Layer
- Google Gemini
- Groq
- OpenRouter
- Custom prompt-engineering utilities
- JSON response validation and parsing

### Database
- MySQL
- Sequelize ORM

Main entities:

```text
Users
PDFs
Short Notes
Flashcards
Formulas
Quiz Sessions
Quiz Questions
Quiz Submissions
```

---

## 🧩 Project Architecture

```text
LearnHub/
│
├── client/                         # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   └── PdfDetails.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── ShortNotesWithSpeech.jsx
│   │   │   ├── common/
│   │   │   └── pdf/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useSpeechHighlighter.js
│   │   └── App.jsx
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── server/                         # Node.js backend
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── utils/
│   ├── middleware/
│   ├── models/
│   ├── config/
│   ├── database/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🤖 AI Provider Architecture

The AI layer is centralized in `server/services/aiService.js`.

| Tier | Provider | Role |
|---|---|---|
| Primary | Gemini | First choice for content generation |
| Secondary | Groq | Fallback when Gemini fails |
| Last Resort | OpenRouter | Fallback when both primary providers fail |

```text
Request → Gemini → Groq → OpenRouter
```

This provider-independent design makes it easier to change or add AI providers without modifying every content-generation controller.

---

## 🧠 Learning Content Pipeline

1. **Upload** — The user uploads a PDF.
2. **Extraction** — `pdf-parse` extracts the PDF text.
3. **Storage** — Extracted text is stored in MySQL.
4. **Chunking** — Large documents are divided into manageable chunks.
5. **AI Generation** — A specialized prompt is used for the requested learning module.
6. **Fallback** — If an AI provider fails, the next provider is attempted.
7. **Validation** — Generated JSON is parsed and validated.
8. **Persistence** — Valid generated content is stored in MySQL.
9. **Reuse** — Existing generated content can be returned without making another AI request.

---

## 📊 Quiz System

Each quiz generation produces **10 MCQs**.

Each question contains:
- A question
- Four options
- One correct answer

Users can:
- Generate a quiz
- Submit answers
- View their score
- Regenerate a quiz
- Continue using new sections of the uploaded PDF

Quiz data is organized using:

```text
QuizSession
    ↓
QuizQuestion
    ↓
QuizSubmission
```

---

## 🔐 Password Reset Flow

```text
Forgot Password
      ↓
Registered Email
      ↓
Secure Reset Token
      ↓
Token Hashed + Stored
      ↓
Reset Email
      ↓
Reset Link
      ↓
New Password
      ↓
Token Verification
      ↓
Password Hashing
      ↓
Token Invalidated
      ↓
Login
```

Reset tokens are time-limited, stored as hashes, and invalidated after successful use.

---

## 🗃️ Data Persistence

MySQL provides persistent storage for:
- Users
- Uploaded PDF information and extracted text
- Generated short notes
- Flashcards
- Formulas
- Quiz sessions
- Quiz questions
- Quiz submissions

This allows generated learning content to persist across sessions and reduces unnecessary AI requests.

---

## 🔊 Text-to-Speech

LearnHub provides a listen-to-notes feature using the browser's **Web Speech API**, allowing users to listen to generated study material.

---

## 🛡️ Security

- JWT authentication
- Protected API routes
- User-scoped PDF and learning-content access
- Password hashing with `bcryptjs`
- Temporary password-reset tokens
- Environment-based API credentials
- Gmail App Password for SMTP
- AI API keys kept on the backend
- No private AI credentials exposed in the frontend

---

## 🚀 Local Development

### Prerequisites

- Node.js
- MySQL
- Gemini API key
- Groq API key
- OpenRouter API key
- Gmail SMTP/App Password for password-reset emails

### Backend

```bash
cd server
npm install
```

Create a `.env` file containing your local database, JWT, AI-provider, and SMTP configuration.

Then:

```bash
npm run dev
```

### Frontend

```bash
cd client
npm install
```

For local development, configure:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Then:

```bash
npm start
```

---

## 🌍 Deployment

LearnHub is deployed using a free-tier architecture:

```text
                     INTERNET
                         │
                         ▼
        Cloudflare Workers Static Frontend
                         │
                         ▼
              Render Node.js Backend
                         │
                ┌────────┴────────┐
                ▼                 ▼
          Aiven MySQL       AI Providers
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
                  Gemini     Groq    OpenRouter
```

### Deployment Services

| Component | Platform | Purpose |
|---|---|---|
| Frontend | Cloudflare Workers | Hosts the React production build |
| Backend | Render | Hosts the Node.js/Express API |
| Database | Aiven | Hosts the MySQL database |
| AI | Gemini / Groq / OpenRouter | AI content generation |

### Live Application

**Frontend:**  
**https://dark-band-7a4a.arpituniyal12.workers.dev**

**Backend API:**  
**https://learnhub-6qku.onrender.com**

The frontend uses the production API endpoint:

```env
REACT_APP_API_URL=https://learnhub-6qku.onrender.com/api
```

The backend health endpoint is:

```text
https://learnhub-6qku.onrender.com/api/health
```

---

## 🔑 Environment Variables

Never commit private credentials to GitHub.

Important backend secrets include:

```text
GEMINI_API_KEY
GROQ_API_KEY
OPENROUTER_API_KEY
JWT_SECRET
DB_PASSWORD
SMTP_PASS
RAZORPAY_KEY_SECRET
```

Public configuration such as the deployed API base URL can be included in the production frontend build.

---

## 📌 What Makes LearnHub Strong

- Full-stack React + Node.js + MySQL application
- AI-powered PDF-to-study-content workflow
- Short notes, flashcards, formulas, and quizzes
- Multi-provider AI fallback architecture
- Chunk-based processing for large documents
- Persistent generated content
- Quiz regeneration and scoring
- JWT authentication and user-scoped data
- Password-reset workflow
- Text-to-speech support
- Razorpay integration
- Production deployment with Cloudflare, Render, and Aiven

---

## 📈 Future Improvements

- Personalized learning paths
- Spaced repetition
- Cross-document progress tracking
- Topic-level mastery analytics
- Adaptive quiz difficulty
- Vector search / RAG
- Additional AI providers
- Further mobile optimization
- Faster AI failover and generation

---

## 📄 License

This project is open for educational and portfolio purposes.
