# 📘 LearnHub — AI-Powered Interactive Learning Platform

LearnHub turns any PDF into a complete study kit. Upload your notes, textbook chapter, or research paper, and the platform automatically generates **summaries, flashcards, key formula sheets, and adaptive MCQ quizzes** — powered by LLMs, backed by a production-style full-stack architecture.

Built to solve a real student problem: turning passive reading material into active, testable learning content in seconds.

---

## ✨ Key Features

### 📂 PDF Management
- Secure upload, storage, and deletion of PDF study material
- Text extraction pipeline that processes documents on upload, not on every AI request

### 🧠 AI-Generated Study Content
- **Smart Summaries & Notes** — condensed, exam-ready notes from dense material
- **AI Flashcards** — auto-generated Q&A pairs for active recall
- **Key Formula Extraction** — pulls and renders formulas using KaTeX, ideal for math/science PDFs
- **Adaptive MCQ Quizzes** — generated chunk-by-chunk from the source PDF so questions stay grounded in the actual content, with duplicate-avoidance across regenerations
- **Quiz Scoring & Analytics** — score visualization with Recharts

### 🔊 Accessibility
- Text-to-speech "listen to your notes" feature using the Web Speech API, with a mobile-safe voice-loading fix

### 🔐 Authentication & Security
- JWT-based authentication with normalized token payloads
- Protected, user-scoped API routes (every resource is isolated per user)
- Axios interceptors for automatic token attachment on every request

### ⚡ Real-Time Layer
- WebSocket server for live quiz events (question changes, answer submissions, typing indicators) using room-based broadcasting

### 🧪 Reliability Engineering
- **Dual-LLM fallback**: Primary generation via Groq (LLaMA 3.3 70B); automatic failover to OpenRouter (Mistral 7B) on rate-limit errors, so AI generation doesn't hard-fail under load
- **Resilient JSON parsing**: Strips markdown fences and stray model tokens before parsing LLM output, since open models don't always return clean JSON
- **Chunk-based generation**: Long PDFs are split into manageable text chunks before being sent to the LLM, keeping output focused and within context limits

---

## 🛠️ Tech Stack

**Frontend**
- React.js (Create React App)
- Chakra UI + Tailwind CSS for styling
- React Router for navigation
- Axios with request interceptors
- Formik + Yup for form handling & validation
- Recharts for quiz score visualization
- KaTeX for rendering mathematical formulas
- React Context API for global auth state
- Jest + React Testing Library

**Backend**
- Node.js + Express.js
- Sequelize ORM over MySQL
- JWT for authentication
- Multer for multipart PDF uploads
- pdf-parse for text extraction
- ws for WebSocket-based real-time communication
- Winston for structured logging + Morgan for request logging
- express-validator for input validation

**AI / LLM Layer**
- Groq API (LLaMA 3.3 70B) — primary inference engine
- OpenRouter (Mistral 7B Instruct) — automatic fallback provider
- Custom prompt-engineering utilities per content type (summary, flashcards, formulas, MCQs)

---

## 🧩 Project Architecture

```
LearnHub/
│
├── client/                              # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js                 # Axios instance + JWT interceptor
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx            # Main authenticated landing page
│   │   │   ├── Home.jsx                 # Public landing page
│   │   │   ├── Login.jsx                # Login form
│   │   │   ├── Register.jsx             # Signup form
│   │   │   └── PdfDetails.jsx           # PDF view: notes, flashcards, formulas, quiz
│   │   │
│   │   ├── components/
│   │   │   ├── Header.jsx               # App header
│   │   │   ├── ShortNotesWithSpeech.jsx # Notes view with TTS playback
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   │   └── ProtectedRoute.jsx   # Route guard for authenticated pages
│   │   │   └── pdf/
│   │   │       ├── PdfUpload.jsx        # Upload UI + progress handling
│   │   │       └── PdfList.jsx          # List of uploaded PDFs
│   │   │
│   │   ├── hooks/
│   │   │   └── useSpeechHighlighter.js  # Web Speech API hook (TTS + mobile fix)
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # Global auth state (JWT, user)
│   │   │
│   │   ├── utils/
│   │   │   ├── buildWordMap.js          # Maps spoken words to text for highlighting
│   │   │   └── normalizeNotes.js        # Cleans/normalizes AI-generated notes
│   │   │
│   │   ├── App.jsx                      # Route definitions
│   │   └── index.js                     # React entry point
│   │
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── server/                              # Node.js backend
│   ├── routes/
│   │   ├── auth.js                      # Register / login endpoints
│   │   ├── user.js                      # User profile endpoints
│   │   ├── pdf.js                       # Upload, list, delete, summary, quiz routes
│   │   ├── flashcards.js                # Flashcard generation endpoints
│   │   ├── formulas.js                  # Formula extraction endpoints
│   │   ├── quizGeneration.js            # Quiz-specific routes
│   │   
│   │
│   ├── controllers/
│   │   ├── authController.js            # Register/login logic, JWT issuing
│   │   ├── summaryController.js         # Notes/summary generation
│   │   ├── flashcardController.js       # Flashcard generation
│   │   ├── formulaController.js         # Formula extraction logic
│   │   └── quizController.js            # Quiz generate/regenerate/submit/score
│   │
│   ├── services/
│   │   ├── aiService.js                 # Groq → OpenRouter fallback orchestration
│   │   └── quizWebSocket.js             # Real-time quiz events (ws server)
│   │
│   ├── utils/
│   │   ├── chunkText.js                 # PDF text chunking for LLM calls
│   │   ├── safeJsonParse.js             # Resilient LLM-output JSON extraction
│   │   ├── groqClient.js                # Configured Groq SDK client
│   │   ├── logger.js                    # Winston logger config
│   │   ├── summaryPrompt.js             # Prompt template — summaries
│   │   ├── flashcardPrompt.js           # Prompt template — flashcards
│   │   ├── formulaPrompt.js             # Prompt template — formulas
│   │   └── mcqPrompt.js                 # Prompt template — MCQs
│   │
│   ├── middleware/
│   │   ├── auth.js                      # JWT verification + user normalization
│   │
│   ├── models/
│   │   ├── index.js                     # Sequelize init + model loader/associations
│   │   ├── User.js
│   │   ├── Pdf.js
│   │   ├── Flashcard.js
│   │   ├── Formula.js
│   │   ├── QuizSession.js
│   │   ├── QuizQuestion.js
│   │   └── QuizSubmission.js
│   │
│   ├── config/
│   │   └── database.js                  # Sequelize/MySQL connection config
│   │
│   ├── database/
│   │   └── schema.sql                   # Raw SQL schema
│   │
│   ├── listGroqModel.js                 # Utility script to list available Groq models
│   ├── server.js                        # Express app entry point + WebSocket bootstrap
│   └── package.json
│
└── README.md
```

---

## 🧪 How the AI Pipeline Works

1. **Upload** — PDF is uploaded via Multer, validated (type + size), and stored.
2. **Extraction** — `pdf-parse` extracts raw text once at upload time and persists it to MySQL, so repeated AI requests never re-parse the file.
3. **Chunking** — Extracted text is split into bounded chunks to stay within LLM context limits and keep generated content focused.
4. **Generation** — Each chunk is sent to Groq's LLaMA 3.3 70B with a content-specific prompt (summary / flashcard / formula / MCQ). Previously generated questions are passed back into the prompt to avoid repetition on regeneration.
5. **Fallback** — If Groq returns a rate-limit error, the request automatically retries against OpenRouter's free Mistral model — transparent to the user.
6. **Parsing** — Raw LLM output is cleaned and safely parsed into structured JSON before being saved and returned to the client.

---

## 📌 What Makes This Project Strong

- Real-world full-stack architecture with clear separation of concerns
- Secure, user-scoped authentication and authorization
- Production-grade error handling, logging, and environment-based configuration
- Thoughtful reliability engineering around third-party AI APIs (fallback providers, defensive JSON parsing)
- Real-time capability via WebSockets, not just REST
- Accessibility consideration (text-to-speech) beyond core functionality

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16
- MySQL database

### Backend Setup
```bash
cd server
npm install
# Configure your .env (DB credentials, JWT_SECRET, GROQ_API_KEY, OPENROUTER_API_KEY)
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
# Configure REACT_APP_API_URL in .env
npm start
```

---

## 📄 License

This project is open for educational and portfolio purposes.
