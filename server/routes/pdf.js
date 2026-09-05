const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { auth } = require('../middleware/auth');
const { Pdf, User } = require('../models');
const { generateSummary } = require('../controllers/summaryController');
const quizController = require("../controllers/quizController");

console.log("🔥 PDF ROUTES FILE LOADED:", __filename);

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
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
      // Check user's PDF upload limit
const user = await User.findByPk(req.user.id);

if (!user) {
  return res.status(404).json({ message: "User not found" });
}

if (!user.is_premium) {
  const pdfCount = await Pdf.count({
    where: { user_id: req.user.id }
  });

  if (pdfCount >= 3) {
    return res.status(403).json({
      message:
        "Free users can upload up to 3 PDFs. Upgrade to Premium for unlimited uploads."
    });
  }
}

     console.log("📄 PDF received in memory:", req.file.originalname);

     const buffer = req.file.buffer;
     console.log("📦 PDF buffer ready");

      const parsed = await pdfParse(buffer);
      console.log("🧠 PDF parsed successfully");

      const pdf = await Pdf.create({
        user_id: req.user.id,
        original_name: req.file.originalname,
        file_name: req.file.originalname,
        file_path: "memory-only",
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

    // Delete the database record.
// The original PDF is not permanently stored on the server.
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
