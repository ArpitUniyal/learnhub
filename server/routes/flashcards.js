const express = require("express");
const router = express.Router();

// IMPORTANT: destructure auth
const { auth } = require("../middleware/auth");

const {
  generateFlashcards,
} = require("../controllers/flashcardController");

// Generate flashcards
router.post("/:id/flashcards", auth, generateFlashcards);

module.exports = router;
