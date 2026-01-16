const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");

const {
  generateFormulas,
  getFormulas,
} = require("../controllers/formulaController");

router.post("/:id/formulas", auth, generateFormulas);
router.get("/:id/formulas", auth, getFormulas);

module.exports = router;
