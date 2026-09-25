const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
  uploadPdf,
  getAllPdfs,
  getPdfById,
  deletePdf
} = require("../controllers/pdfController");


// Upload PDF
router.post(
  "/upload",
  auth,
  upload.single("pdf"),
  uploadPdf
);


// Get all PDFs
router.get(
  "/",
  auth,
  getAllPdfs
);


// Get single PDF
router.get(
  "/:id",
  auth,
  getPdfById
);


// Delete PDF
router.delete(
  "/:id",
  auth,
  deletePdf
);


module.exports = router;