const { Pdf, Formula } = require("../models");
const { generateWithAI } = require("../services/aiService");

const { formulaPrompt } = require("../utils/formulaPrompt");
const { chunkText } = require("../utils/chunkText");

/**
 * POST /api/pdf/:id/formulas
 * Generate ALL formulas ONCE per PDF using CHUNKING
 */
const generateFormulas = async (req, res) => {
  try {
    const pdfId = req.params.id;
    const userId = req.user.id;

    // 1️⃣ If formulas already exist, return them (generate-once rule)
    const existing = await Formula.findAll({
      where: { pdf_id: pdfId, user_id: userId },
      order: [["created_at", "ASC"]],
    });

    if (existing.length > 0) {
      return res.json({ formulas: existing });
    }

    // 2️⃣ Validate PDF
    const pdf = await Pdf.findOne({
      where: { id: pdfId, user_id: userId },
    });

    if (!pdf || !pdf.extracted_text) {
      return res.status(404).json({
        message: "PDF not found or text not extracted",
      });
    }

const chunks = chunkText(pdf.extracted_text);

const collected = [];
const seen = new Set();

for (let start = 0; start < chunks.length; start++) {
  const currentChunk = chunks[start];

  try {
    const raw = await generateWithAI(
      formulaPrompt(currentChunk)
    );

    if (!raw) continue;

    const cleaned = raw
  .replace(/```json/gi, "")
  .replace(/```/g, "")
  .trim();

const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) continue;

    for (const f of parsed) {
      if (!f.formula || !f.meaning) continue;

      const formulaKey = f.formula.trim().toLowerCase();

      if (seen.has(formulaKey)) continue;

      seen.add(formulaKey);

      collected.push({
        pdf_id: pdfId,
        user_id: userId,
        formula: f.formula.trim(),
        explanation: f.meaning.trim(),
        formula_usage: null,
        chunk_id: start
      });
    }

  } catch (err) {
    console.error(
      `Formula generation failed for chunk ${start}:`,
      err.message
    );

    continue;
  }
}

    // 5️⃣ Save formulas (only if found)
    let savedFormulas = [];
    if (collected.length > 0) {
      savedFormulas = await Formula.bulkCreate(collected);
    }

    return res.json({ formulas: savedFormulas });

  } catch (error) {
    console.error("Generate formulas error:", error);
    return res.status(500).json({ message: "Failed to generate formulas" });
  }
};

/**
 * GET /api/pdf/:id/formulas
 */
const getFormulas = async (req, res) => {
  try {
    const pdfId = req.params.id;
    const userId = req.user.id;

    const formulas = await Formula.findAll({
      where: { pdf_id: pdfId, user_id: userId },
      order: [["created_at", "ASC"]],
    });

    return res.json({ formulas });
  } catch (error) {
    console.error("Fetch formulas error:", error);
    return res.status(500).json({ message: "Failed to fetch formulas" });
  }
};

module.exports = {
  generateFormulas,
  getFormulas,
};
