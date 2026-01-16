/* ================================
   LearnHub – Production DB Schema
   ================================ */

/* ================================
   USERS
   ================================ */
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student','instructor','admin') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

/* ================================
   PDF UPLOADS
   ================================ */
CREATE TABLE IF NOT EXISTS pdfs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  status VARCHAR(20) DEFAULT 'uploaded',
  extracted_text LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

/* ================================
   QUIZ SESSIONS
   ================================ */
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  pdf_id INT NOT NULL,
  status ENUM('in_progress','completed') DEFAULT 'in_progress',
  score DECIMAL(5,2),
  total_questions INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pdf_id) REFERENCES pdfs(id) ON DELETE CASCADE
);

/* ================================
   QUIZ QUESTIONS
   ================================ */
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  question TEXT NOT NULL,
  options JSON NOT NULL,
  correct_answer VARCHAR(255) NOT NULL,
  chunk_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES quiz_sessions(id) ON DELETE CASCADE
);

/* ================================
   QUIZ SUBMISSIONS
   ================================ */
CREATE TABLE IF NOT EXISTS quiz_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  question_id INT NOT NULL,
  user_answer TEXT,
  is_correct BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

/* ================================
   FLASHCARDS
   ================================ */
CREATE TABLE IF NOT EXISTS flashcards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  pdf_id INT NOT NULL,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  difficulty ENUM('easy','medium','hard') DEFAULT 'medium',
  next_review_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pdf_id) REFERENCES pdfs(id) ON DELETE CASCADE
);

/* ================================
   FORMULAS
   ================================ */
CREATE TABLE IF NOT EXISTS formulas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  pdf_id INT NOT NULL,
  formula_text TEXT NOT NULL,
  description TEXT,
  variables JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pdf_id) REFERENCES pdfs(id) ON DELETE CASCADE
);

/* ================================
   INDEXES (PERFORMANCE)
   ================================ */
CREATE INDEX idx_pdfs_user ON pdfs(user_id);
CREATE INDEX idx_quiz_sessions_user ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_pdf ON quiz_sessions(pdf_id);
CREATE INDEX idx_quiz_questions_session ON quiz_questions(session_id);
CREATE INDEX idx_quiz_submissions_session ON quiz_submissions(session_id);
CREATE INDEX idx_quiz_submissions_question ON quiz_submissions(question_id);
CREATE INDEX idx_flashcards_user ON flashcards(user_id);
CREATE INDEX idx_formulas_user ON formulas(user_id);
