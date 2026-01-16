const express = require("express");
const router = express.Router();

// IMPORTANT: destructure auth
const { auth } = require("../middleware/auth");

const {
  generateFlashcards,
  getFlashcards,
} = require("../controllers/flashcardController");

// Generate flashcards
router.post("/:id/flashcards", auth, generateFlashcards);

// Fetch flashcards
router.get("/:id/flashcards", auth, getFlashcards);

module.exports = router;
