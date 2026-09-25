const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");

const {
  generateQuiz,
  regenerateQuiz,
  submitQuiz,
  getQuizScore
} = require("../controllers/quizController");


// Generate quiz
router.post(
  "/:id/quiz",
  auth,
  generateQuiz
);


// Regenerate quiz
router.post(
  "/:id/quiz/regenerate",
  auth,
  regenerateQuiz
);


// Submit quiz
router.post(
  "/:id/quiz/submit",
  auth,
  submitQuiz
);


// Get quiz score
router.get(
  "/:id/quiz/score",
  auth,
  getQuizScore
);


module.exports = router;