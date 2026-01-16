const { Pdf } = require("../models");
/*const groq = require("../utils/groqClient");*/
const { generateWithAI } = require("../services/aiService");
const { extractJSON } = require("../utils/safeJsonParse");


const { summaryPrompt } = require("../utils/summaryPrompt");
const { chunkText } = require("../utils/chunkText");

exports.generateSummary = async (req, res) => {
  try {
    const pdf = await Pdf.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!pdf || !pdf.extracted_text) {
      return res.status(404).json({
        message: "PDF not found or no extracted text"
      });
    }

    // 1️⃣ Split PDF into chunks
    const chunks = chunkText(pdf.extracted_text, 3000);

    const allNotes = [];

    // 2️⃣ Process each chunk sequentially (safe & predictable)
    for (let i = 0; i < chunks.length; i++) {
      const prompt = summaryPrompt(chunks[i]);
const raw = await generateWithAI(prompt);


      /*const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You generate academic short notes in strict JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1
      });

      const raw = response.choices[0].message.content;*/

      try {
        const parsed = extractJSON(raw);

// Case 1: { short_notes: [...] }
if (parsed && Array.isArray(parsed.short_notes)) {
  allNotes.push(...parsed.short_notes);
}

// Case 2: { notes: [...] }
else if (parsed && Array.isArray(parsed.notes)) {
  allNotes.push(...parsed.notes);
}

// Case 3: [...] (array directly)
else if (Array.isArray(parsed)) {
  allNotes.push(...parsed);
}

        /*const parsed = JSON.parse(raw);

        if (Array.isArray(parsed.short_notes)) {
          allNotes.push(...parsed.short_notes);
        }*/
      } catch (err) {
        console.error(`JSON parse failed for chunk ${i + 1}`);
        console.error(raw.slice(0, 300));
        // Continue instead of failing entire request
      }
    }

    // 3️⃣ Return ONE combined response
    return res.json({
      pdfId: pdf.id,
      total_chunks: chunks.length,
      short_notes: allNotes
    });

  } catch (error) {
    console.error("SUMMARY ERROR:", error.message);
    return res.status(500).json({
      message: "Notes generation failed"
    });
  }
};
