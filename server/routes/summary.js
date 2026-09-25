const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");
const { generateSummary } = require("../controllers/summaryController");

router.post("/:id/summary", auth, generateSummary);

module.exports = router;