const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { auth } = require('../middleware/auth');
const { Pdf } = require('../models');
const { generateSummary } = require('../controllers/summaryController');
const quizController = require("../controllers/quizController");

console.log("🔥 PDF ROUTES FILE LOADED:", __filename);

// Ensure uploads directory
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config (⚠️ UNCHANGED)
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}.pdf`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files allowed'));
    }
    cb(null, true);
  }
});

/**
 * ============================
 * POST /api/pdf/upload
 * (⚠️ UNCHANGED – DO NOT TOUCH)
 * ============================
 */
router.post(
  "/upload",
  auth,
  upload.single("pdf"),

  // 🔍 DEBUG MIDDLEWARE — TEMPORARY
  (req, res, next) => {
    console.log("🧪 DEBUG req.file =", req.file);
    next();
  },

  async (req, res) => {
    try {
      console.log("📥 Upload request received");

      if (!req.file) {
        console.log("❌ No file received by Multer");
        return res.status(400).json({ message: "No PDF file uploaded" });
      }

      console.log("📄 File saved by Multer:", req.file.path);

      const buffer = fs.readFileSync(req.file.path);
      console.log("📦 File read into buffer");

      const parsed = await pdfParse(buffer);
      console.log("🧠 PDF parsed successfully");

      const pdf = await Pdf.create({
        user_id: req.user.id,
        original_name: req.file.originalname,
        file_name: req.file.filename,
        file_path: req.file.path,
        file_size: req.file.size,
        extracted_text: parsed.text,
        status: "processed",
      });

      console.log("💾 PDF saved to DB");

      return res.status(200).json({ pdf });

    } catch (err) {
      console.error("❌ PDF upload failed:", err);
      return res.status(500).json({ message: "PDF upload failed" });
    }
  }
);

/**
 * ============================
 * GET /api/pdf
 * ============================
 */
router.get('/', auth, async (req, res) => {
  const pdfs = await Pdf.findAll({
    where: { user_id: req.user.id },
    order: [['created_at', 'DESC']]
  });

  res.json(pdfs);
});

/**
 * ============================
 * DELETE /api/pdf/:id
 * ✅ NEW – SAFE & ISOLATED
 * ============================
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find PDF
    const pdf = await Pdf.findOne({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!pdf) {
      return res.status(404).json({
        message: "PDF not found"
      });
    }

    // 2. Delete file from disk (safe)
    if (pdf.file_path && fs.existsSync(pdf.file_path)) {
      fs.unlinkSync(pdf.file_path);
      console.log("🗑️ PDF file deleted:", pdf.file_path);
    } else {
      console.warn("⚠️ PDF file not found on disk:", pdf.file_path);
    }

    // 3. Delete DB record
    await pdf.destroy();
    console.log("🗑️ PDF record deleted from DB:", id);

    return res.status(200).json({
      message: "PDF deleted successfully"
    });

  } catch (err) {
    console.error("❌ Failed to delete PDF:", err);
    return res.status(500).json({
      message: "Failed to delete PDF"
    });
  }
});

/**
 * ============================
 * GET /api/pdf/:id
 * (READ-ONLY – SAFE)
 * ============================
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const pdf = await Pdf.findOne({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!pdf) {
      return res.status(404).json({
        message: "PDF not found"
      });
    }

    return res.status(200).json({ pdf });

  } catch (err) {
    console.error("❌ Failed to fetch PDF:", err);
    return res.status(500).json({
      message: "Failed to fetch PDF"
    });
  }
});


/**
 * ============================
 * EXISTING AI ROUTES (UNCHANGED)
 * ============================
 */
router.post('/:id/summary', auth, generateSummary);
router.post('/:id/quiz', auth, quizController.generateQuiz);
//router.get('/:id/quiz', auth, quizController.getQuiz);
router.post("/:id/quiz/regenerate", auth, quizController.regenerateQuiz);

router.post("/:id/quiz/submit", auth, quizController.submitQuiz);
router.get('/:id/quiz/score', auth, quizController.getQuizScore);

module.exports = router;
