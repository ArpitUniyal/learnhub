const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const { validateRequest } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const quizGenerationController = require('../controllers/quizGenerationController');

// ===============================
// Generate quiz from PDF
// ===============================
router.post(
  '/pdf/:pdfId/generate',
  auth,
  [
    param('pdfId')
      .isInt()
      .withMessage('Invalid PDF ID'),

    body('numQuestions')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Number of questions must be between 1 and 20'),

    body('difficulty')
      .optional()
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Invalid difficulty level'),

    body('questionTypes')
      .optional()
      .isArray()
      .withMessage('Question types must be an array'),

    body('questionTypes.*')
      .isIn(['multiple_choice', 'true_false', 'short_answer'])
      .withMessage('Invalid question type'),

    body('topics')
      .optional()
      .isArray()
      .withMessage('Topics must be an array'),

    body('topics.*')
      .isString()
      .withMessage('Each topic must be a string'),
  ],
  validateRequest,
  (req, res) => quizGenerationController.generateFromPdf(req, res)
);

// ===============================
// Generate quiz from custom text
// ===============================
router.post(
  '/generate',
  auth,
  [
    body('text')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Text content is required'),

    body('title')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Quiz title is required'),

    body('numQuestions')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Number of questions must be between 1 and 20'),

    body('difficulty')
      .optional()
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Invalid difficulty level'),

    body('questionTypes')
      .optional()
      .isArray()
      .withMessage('Question types must be an array'),

    body('questionTypes.*')
      .isIn(['multiple_choice', 'true_false', 'short_answer'])
      .withMessage('Invalid question type'),

    body('topics')
      .optional()
      .isArray()
      .withMessage('Topics must be an array'),

    body('topics.*')
      .isString()
      .withMessage('Each topic must be a string'),
  ],
  validateRequest,
  (req, res) => quizGenerationController.generateFromText(req, res)
);

module.exports = router;
