# 📘 LearnHub — AI-Powered Interactive Learning Platform

LearnHub is an AI-powered interactive learning platform that transforms PDF study material into a complete, personalized study kit.

Upload your notes, textbook chapter, lecture material, or research paper, and LearnHub automatically generates:

- Smart short notes
- AI-generated flashcards
- Key formulas
- MCQ quizzes
- Quiz scoring and analytics

The platform combines a React frontend, a Node.js/Express backend, a MySQL database, JWT authentication, and multiple AI providers with automatic fallback for reliable content generation.

---

## ✨ Key Features

### 📂 PDF Management

- Secure PDF upload, storage, and deletion
- User-specific PDF isolation
- Automatic text extraction using `pdf-parse`
- Extracted text stored in MySQL so PDFs don't need to be re-parsed for every AI request
- PDF-specific learning content generation
- Deleting a PDF also removes its associated generated learning data
- Free plan supports up to 3 uploaded PDFs
- Premium users can upload unlimited PDFs

### 🧠 AI-Generated Study Content

- **Smart Short Notes** — comprehensive, exam-oriented notes covering important concepts from the uploaded material
- **AI Flashcards** — automatically generated question-answer pairs for active recall
- **Key Formula Extraction** — extracts formulas along with their symbol/notation meanings
- **MCQ Quiz Generation** — generates 10 MCQs per quiz from the uploaded PDF
- **Quiz Regeneration** — generates new questions from previously unused sections of the PDF
- **Quiz Scoring** — evaluates submitted answers and calculates the score
- **Quiz Question Persistence** — quiz sessions track which PDF sections have already been used
- **Content Caching** — previously generated notes, flashcards, and formulas are reused from the database instead of calling the AI again

### 💳 Free & Premium Plans

LearnHub includes a subscription system with Razorpay payment integration:

- Free users can upload up to **3 PDFs**
- Free users can generate up to **2 successful quizzes per PDF per day**
- Failed AI quiz-generation attempts do not consume the daily quiz quota
- Premium users get unlimited PDF uploads
- Premium users get unlimited quiz generation and regeneration
- Razorpay payment order creation and server-side payment verification

### 🔊 Accessibility

- Text-to-speech for listening to generated notes
- Built on the Web Speech API
- Designed to work across supported desktop and mobile browsers

### 🔐 Authentication & Security

- JWT-based authentication
- Persistent login using browser storage
- Protected routes for authenticated users
- User-scoped API access
- Free/Premium feature authorization based on `is_premium`
- Axios interceptor automatically attaches JWT tokens to API requests
- Secure logout flow
- Forgot password and password reset functionality
- Password reset tokens are temporary and single-use
- Password reset emails sent via Gmail SMTP
- Passwords securely hashed using `bcryptjs`

### 🧪 AI Reliability & Fallback Architecture

LearnHub uses a multi-provider AI architecture so content generation keeps working even if one provider fails or rate-limits:

```
Gemini 3.5 Flash-Lite  →  Groq GPT-OSS-20B  →  OpenRouter Free
   (primary)               (secondary)          (last resort)
```

- **Primary AI:** Google Gemini 3.5 Flash-Lite
- **Secondary fallback:** Groq GPT-OSS-20B
- **Last-resort fallback:** OpenRouter Free Router / available free model
- Automatic provider fallback when the primary provider fails or reaches a rate limit
- Provider-specific timing and error logging
- Defensive JSON parsing and validation for AI-generated content
- Content-specific prompt engineering for summaries, flashcards, formulas, and MCQs

### ⚡ AI Performance

The AI pipeline is built around chunk-based processing:

- PDF text is split into manageable chunks
- Each learning module processes chunks independently
- Chunk size can be tuned according to model performance and output quality
- Smaller requests reduce oversized prompts and improve reliability
- AI responses are validated before being saved to the database

---

## 🛠️ Tech Stack

**Frontend**
- React.js
- React Router
- Chakra UI + Tailwind CSS
- Axios
- Razorpay Checkout
- React Context API
- Recharts
- KaTeX
- Web Speech API

**Backend**
- Node.js
- Express.js
- Sequelize ORM
- MySQL
- JWT Authentication
- bcryptjs
- Nodemailer
- Multer
- pdf-parse
- express-validator
- Winston
- Morgan
- Razorpay Node.js SDK

**AI / LLM Layer**
- Google Gemini 3.5 Flash-Lite — primary AI model
- Groq GPT-OSS-20B — secondary fallback model
- OpenRouter Free Router — last-resort free AI provider
- Custom prompt-engineering utilities for short notes, flashcards, formulas, and MCQs
- JSON response validation and parsing

**Database**
- MySQL
- Sequelize ORM

Main entities: `Users`, `PDFs`, `Short Notes`, `Flashcards`, `Formulas`, `Quiz Sessions`, `Quiz Questions`, `Quiz Submissions`

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
│   │   │   ├── Dashboard.jsx            # Main authenticated dashboard
│   │   │   ├── Home.jsx                 # Public landing page
│   │   │   ├── Login.jsx                # Login page
│   │   │   ├── Register.jsx             # Registration page
│   │   │   ├── ForgotPassword.jsx       # Forgot password page
│   │   │   ├── ResetPassword.jsx        # Password reset page
│   │   │   └── PdfDetails.jsx           # PDF learning workspace
│   │   │
│   │   ├── components/
│   │   │   ├── Header.jsx               # Application header + premium/payment UI + logout
│   │   │   ├── ShortNotesWithSpeech.jsx # Notes + text-to-speech
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── ProtectedRoute.jsx   # Authentication route guard
│   │   │   └── pdf/
│   │   │       ├── PdfUpload.jsx
│   │   │       └── PdfList.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # Global authentication state
│   │   │
│   │   ├── hooks/
│   │   │   └── useSpeechHighlighter.js
│   │   │
│   │   └── App.jsx                      # Application routes
│   │
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── server/                              # Node.js backend
│   ├── routes/
│   │   ├── auth.js                      # Register, login, password reset
│   │   ├── user.js                      # User routes
│   │   ├── pdf.js                       # PDF routes
│   │   ├── flashcards.js                # Flashcard routes
│   │   ├── formulas.js                  # Formula routes
│   │   |── quizGeneration.js            # Quiz routes
│   │   └── Payment.js                   # Payment routes
|
│   ├── controllers/
│   │   ├── authController.js            # Authentication + password reset
│   │   ├── summaryController.js         # Short note generation
│   │   ├── flashcardController.js       # Flashcard generation
│   │   ├── formulaController.js         # Formula extraction
│   │   |── quizController.js            # Quiz generation/submission/scoring
│   │   └──paymentController.js          # payment order creation and verification
|  
│   ├── services/
│   │   ├── aiService.js                 # Gemini → Groq → OpenRouter
│   │   └── mailService.js               # Gmail SMTP password-reset email
│   │
│   ├── utils/
│   │   ├── chunkText.js                 # PDF chunking
│   │   ├── safeJsonParse.js             # AI JSON parsing
│   │   ├── logger.js                    # Winston logger
│   │   ├── summaryPrompt.js
│   │   ├── flashcardPrompt.js
│   │   ├── formulaPrompt.js
│   │   └── mcqPrompt.js
│   │
│   ├── middleware/
│   │   └── auth.js                      # JWT authentication middleware
│   │
│   ├── models/
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Pdf.js
│   │   ├── ShortNote.js
│   │   ├── Flashcard.js
│   │   ├── Formula.js
│   │   ├── QuizSession.js
│   │   ├── QuizQuestion.js
│   │   └── QuizSubmission.js
│   │   
│   ├── config/
│   │   └── razorpay.js
|
│   ├── database/
│   │   └── schema.sql
│   │
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🤖 AI Provider Architecture

LearnHub uses a layered AI fallback architecture to improve availability and reduce dependency on a single provider.

| Tier | Provider | Model | Role |
|------|----------|-------|------|
| Primary | Gemini | Gemini 3.5 Flash-Lite | Used first for its response quality and low latency |
| Secondary | Groq | GPT-OSS-20B | Used when Gemini is unavailable or fails |
| Last Resort | OpenRouter | OpenRouter Free Router | Used when both Gemini and Groq fail or become unavailable |

```
Request → Gemini → (on failure) → Groq → (on failure) → OpenRouter Free
```

The application code remains provider-independent through a centralized AI service (`aiService.js`).

---

## 🧠 Learning Content Pipeline

1. **Upload** — The user uploads a PDF through the React frontend.
2. **Extraction** — `pdf-parse` extracts the text from the PDF; the extracted text is stored in MySQL.
3. **Chunking** — Long PDF text is divided into manageable chunks before AI generation, allowing large study materials to be processed without sending the entire PDF in a single request.
4. **AI Generation** — Each content type uses its own specialized prompt:

   ```
   PDF chunk → Content-specific prompt → Gemini → Groq fallback → OpenRouter fallback
   ```

   Generated content includes short notes, flashcards, formulas, and MCQs.
5. **Validation** — AI output is parsed and validated before being persisted.
6. **Database Storage** — Generated learning content is stored in MySQL and reused on subsequent requests, avoiding unnecessary AI calls when content already exists.

---

## 🔐 Password Reset Flow

```
User clicks "Forgot Password"
        ↓
Enters registered email
        ↓
Backend generates secure reset token
        ↓
Token is hashed before database storage
        ↓
Reset email sent using Gmail SMTP
        ↓
User opens reset link
        ↓
New password submitted
        ↓
Token verified + expiry checked
        ↓
Password securely hashed
        ↓
Reset token invalidated
        ↓
User can log in with new password
```

Reset tokens are:

- Time-limited
- Stored securely as hashes
- Single-use
- Invalidated after a successful password reset

---

## 🗃️ Data Persistence

LearnHub stores generated learning content in MySQL, which enables:

- Fast retrieval of previously generated content
- Reduced AI API usage
- Persistent learning material across sessions
- User-specific content isolation
- Cleanup when PDFs are deleted

Quiz sessions additionally track previously used PDF chunks so quiz regeneration can produce new questions from new source material.

---

## 📊 Quiz System

The quiz system generates exactly **10 MCQs** per quiz generation. Each MCQ contains:

- A question
- Four options
- One correct answer

Users can:

- Generate a quiz
- Submit answers
- View scores
- Regenerate another quiz
- Continue through new sections of the uploaded PDF

Quiz data is stored using a `QuizSession → QuizQuestion → QuizSubmission` relationship.

---

## 🔊 Text-to-Speech

LearnHub provides a "listen to your notes" feature using the browser's Web Speech API, letting users listen to generated study notes without manually reading the entire content.

---

## 🛡️ Security

- JWT authentication
- Protected API routes
- User-scoped PDF access
- User-scoped generated content
- Password hashing with `bcryptjs`
- Secure password-reset tokens
- Environment-based API credentials
- Razorpay server-side payment signature verification
- Razorpay Key Secret kept on the backend
- Gmail App Password authentication for SMTP
- No API keys exposed in the frontend

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16
- MySQL
- Google Gemini API key
- Groq API key
- OpenRouter API key
- Gmail SMTP account for password-reset emails

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file:

```env
NODE_ENV=development
PORT=5000

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

DATABASE_URL=your_database_url

DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database
DB_USER=your_database_user
DB_PASSWORD=your_database_password

GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

SMTP_USER=your_learnhub_gmail@gmail.com
SMTP_PASS=your_gmail_app_password

CLIENT_URL=http://localhost:3000

DB_LOGGING=true

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Then start the backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
```

Configure the frontend environment:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Then start the frontend:

```bash
npm start
```

---

## 📌 What Makes LearnHub Strong

- Full-stack React + Node.js + MySQL architecture
- Secure JWT authentication with persistent login across browser restarts
- Complete forgot-password and password-reset workflow
- PDF text extraction and persistent storage
- AI-generated short notes, flashcards, formulas, and quizzes
- Free and Premium subscription system with ₹499 Razorpay payments
- PDF and quiz-generation usage limits for Free users
- Unlimited PDF uploads and quiz generation for Premium users
- Server-side Razorpay payment verification
- Multi-provider AI fallback architecture (Gemini → Groq → OpenRouter)
- Chunk-based processing for large documents
- Database caching to reduce repeated AI calls
- Quiz regeneration using new PDF sections
- User-specific data isolation
- Text-to-speech accessibility
- Structured backend architecture with routes, controllers, services, middleware, utilities, and models
- Environment-based configuration and centralized AI provider management

---
