const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");

const {
  generateFormulas,
} = require("../controllers/formulaController");

router.post("/:id/formulas", auth, generateFormulas);

module.exports = router;
