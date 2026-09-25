const { Pdf, User } = require("../models");
const pdfParse = require("pdf-parse");


// ===============================
// Upload PDF
// ===============================
const uploadPdf = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!req.file) {
      return res.status(400).json({
        message: "No PDF file uploaded"
      });
    }

    // Find user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Check free-user upload limit
    if (!user.is_premium) {
      const pdfCount = await Pdf.count({
        where: {
          user_id: userId
        }
      });

      if (pdfCount >= 3) {
        return res.status(403).json({
          message:
            "Free users can upload up to 3 PDFs. Upgrade to Premium for unlimited uploads."
        });
      }
    }

    // Extract PDF text
    const parsed = await pdfParse(req.file.buffer);

    // Save PDF information
    const pdf = await Pdf.create({
      user_id: userId,
      original_name: req.file.originalname,
      file_name: req.file.originalname,
      file_path: "memory-only",
      file_size: req.file.size,
      extracted_text: parsed.text,
      status: "processed"
    });

    return res.status(200).json({
      pdf
    });

  } catch (error) {
    console.error("PDF upload failed:", error);

    return res.status(500).json({
      message: "PDF upload failed"
    });
  }
};


// ===============================
// Get all PDFs
// ===============================
const getAllPdfs = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    const pdfs = await Pdf.findAll({
      where: {
        user_id: userId
      },
      order: [
        ["created_at", "DESC"]
      ]
    });

    return res.json(pdfs);

  } catch (error) {
    console.error("Failed to fetch PDFs:", error);

    return res.status(500).json({
      message: "Failed to fetch PDFs"
    });
  }
};


// ===============================
// Get single PDF
// ===============================
const getPdfById = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.params;

    const pdf = await Pdf.findOne({
      where: {
        id,
        user_id: userId
      }
    });

    if (!pdf) {
      return res.status(404).json({
        message: "PDF not found"
      });
    }

    return res.status(200).json({
      pdf
    });

  } catch (error) {
    console.error("Failed to fetch PDF:", error);

    return res.status(500).json({
      message: "Failed to fetch PDF"
    });
  }
};


// ===============================
// Delete PDF
// ===============================
const deletePdf = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.params;

    const pdf = await Pdf.findOne({
      where: {
        id,
        user_id: userId
      }
    });

    if (!pdf) {
      return res.status(404).json({
        message: "PDF not found"
      });
    }

    await pdf.destroy();

    return res.status(200).json({
      message: "PDF deleted successfully"
    });

  } catch (error) {
    console.error("Failed to delete PDF:", error);

    return res.status(500).json({
      message: "Failed to delete PDF"
    });
  }
};


module.exports = {
  uploadPdf,
  getAllPdfs,
  getPdfById,
  deletePdf
};