CREATE DATABASE IF NOT EXISTS ai_learning;
USE ai_learning;

-- ============================================
-- USERS
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    reset_password_token VARCHAR(255) NULL,
    reset_password_expires DATETIME NULL,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    INDEX idx_users_email (email)
);


-- ============================================
-- PDFS
-- ============================================

CREATE TABLE IF NOT EXISTS pdfs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    status VARCHAR(20) DEFAULT 'uploaded',
    extracted_text LONGTEXT NULL,
    created_at DATETIME NOT NULL,

    INDEX idx_pdfs_user (user_id),

    CONSTRAINT fk_pdfs_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================
-- SHORT NOTES
-- ============================================

CREATE TABLE IF NOT EXISTS short_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pdf_id INT NOT NULL,
    user_id INT NOT NULL,
    note TEXT NOT NULL,
    chunk_id INT NOT NULL,

    INDEX idx_short_notes_pdf (pdf_id),
    INDEX idx_short_notes_user (user_id),
    INDEX idx_short_notes_chunk (chunk_id),

    CONSTRAINT fk_short_notes_pdf
        FOREIGN KEY (pdf_id)
        REFERENCES pdfs(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_short_notes_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================
-- QUIZ SESSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS quiz_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pdf_id INT NOT NULL,
    user_id INT NOT NULL,

    used_chunk_ids JSON NOT NULL,

    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    INDEX idx_quiz_sessions_pdf (pdf_id),
    INDEX idx_quiz_sessions_user (user_id),

    CONSTRAINT fk_quiz_sessions_pdf
        FOREIGN KEY (pdf_id)
        REFERENCES pdfs(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_quiz_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================
-- QUIZ QUESTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    question TEXT NULL,
    options JSON NULL,
    correct_answer VARCHAR(255) NULL,
    chunk_id INT NULL,

    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    INDEX idx_quiz_questions_session (session_id),

    CONSTRAINT fk_quiz_questions_session
        FOREIGN KEY (session_id)
        REFERENCES quiz_sessions(id)
        ON DELETE CASCADE
);


-- ============================================
-- QUIZ SUBMISSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS quiz_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_answer VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,

    INDEX idx_quiz_submissions_session (session_id),
    INDEX idx_quiz_submissions_question (question_id),
    INDEX idx_quiz_submissions_user (user_id),

    CONSTRAINT fk_quiz_submissions_session
        FOREIGN KEY (session_id)
        REFERENCES quiz_sessions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_quiz_submissions_question
        FOREIGN KEY (question_id)
        REFERENCES quiz_questions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_quiz_submissions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================
-- FLASHCARDS
-- ============================================

CREATE TABLE IF NOT EXISTS flashcards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    pdf_id INT NOT NULL,

    front TEXT NOT NULL,
    back TEXT NOT NULL,

    chunk_id INT NOT NULL,

    INDEX idx_flashcards_user (user_id),
    INDEX idx_flashcards_pdf (pdf_id),
    INDEX idx_flashcards_chunk (chunk_id),

    CONSTRAINT fk_flashcards_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_flashcards_pdf
        FOREIGN KEY (pdf_id)
        REFERENCES pdfs(id)
        ON DELETE CASCADE
);


-- ============================================
-- FORMULAS
-- ============================================

CREATE TABLE IF NOT EXISTS formulas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    pdf_id INT NOT NULL,

    formula TEXT NOT NULL,
    explanation TEXT NOT NULL,
    formula_usage TEXT NULL,

    chunk_id INT NOT NULL DEFAULT 0,

    INDEX idx_formulas_user (user_id),
    INDEX idx_formulas_pdf (pdf_id),
    INDEX idx_formulas_chunk (chunk_id),

    CONSTRAINT fk_formulas_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_formulas_pdf
        FOREIGN KEY (pdf_id)
        REFERENCES pdfs(id)
        ON DELETE CASCADE
);
