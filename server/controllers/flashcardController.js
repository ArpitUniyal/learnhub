const { Pdf, Flashcard } = require("../models");
const { generateWithAI } = require("../services/aiService");
const { flashcardPrompt } = require("../utils/flashcardPrompt");
const { chunkText } = require("../utils/chunkText");

/**
 * POST /api/pdf/:id/flashcards
 * Generate flashcards using CHUNKING (safe & scalable)
 */
const generateFlashcards = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const pdfId = parseInt(req.params.id, 10);

    const pdf = await Pdf.findOne({
      where: { id: pdfId, user_id: userId }
    });

    if (!pdf || !pdf.extracted_text) {
      return res.status(404).json({
        message: "PDF not found or no extracted text"
      });
    }
    // Check whether flashcards are already generated for this PDF.
const existingFlashcards = await Flashcard.findAll({
  where: {
    pdf_id: pdfId,
    user_id: userId
  },
  order: [["id", "ASC"]]
});

if (existingFlashcards.length > 0) {
  return res.json({
    flashcards: existingFlashcards
  });
}

const chunks = chunkText(pdf.extracted_text,3000);

const allFlashcards = [];
const seen = new Set();

for (let start = 0; start < chunks.length; start++) {
  const currentChunk = chunks[start];
  try {
    const prompt = flashcardPrompt(currentChunk);

const raw = await generateWithAI(prompt);

if (!raw) {
  continue;
}

let parsed;

try {
  parsed = JSON.parse(raw);
} catch (err) {
  console.error(
    `Flashcard JSON parse failed for chunk ${start}:`,
    err.message
  );
  continue;
}

if (!Array.isArray(parsed)) {
  console.error(
    `Flashcard response was not an array for chunk ${start}`
  );
  continue;
}

    // 3️⃣ Deduplicate + accumulate
    for (const card of parsed) {
      if (!card.front || !card.back) continue;

      const key =
        card.front.trim().toLowerCase() +
        "||" +
        card.back.trim().toLowerCase();

      if (seen.has(key)) continue;

      seen.add(key);

      allFlashcards.push({
        pdf_id: pdfId,
        user_id: userId,
        front: card.front.trim(),
        back: card.back.trim(),
        chunk_id: start
      });
    }

  } catch (err) {
    console.error(
      `Flashcard generation failed for chunk ${start}:`,
      err.message
    );

    continue;
  }
}
    // 4️⃣ Save to DB (only if generated)
    if (allFlashcards.length > 0) {
      await Flashcard.bulkCreate(allFlashcards);
    }

    return res.json({ flashcards: allFlashcards });

  } catch (err) {
    console.error("Generate flashcards error:", err);
    return res.status(500).json({
      message: "Failed to generate flashcards"
    });
  }
};

/**
 * GET /api/pdf/:id/flashcards
 */
const getFlashcards = async (req, res) => {
  try {
    const pdfId = req.params.id;
    const userId = req.user.id;

    const flashcards = await Flashcard.findAll({
      where: {
        pdf_id: pdfId,
        user_id: userId
      },
      order: [["created_at", "ASC"]]
    });

    return res.json({ flashcards });
  } catch (error) {
    console.error("Fetch flashcards error:", error);
    return res.status(500).json({ message: "Failed to fetch flashcards" });
  }
};

module.exports = {
  generateFlashcards,
  getFlashcards
};
