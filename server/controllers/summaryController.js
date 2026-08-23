const { Pdf, ShortNote } = require("../models");
const { generateWithAI } = require("../services/aiService");
const { extractJSON } = require("../utils/safeJsonParse");


const { summaryPrompt } = require("../utils/summaryPrompt");
const { chunkText } = require("../utils/chunkText");

exports.generateSummary = async(req, res) => {
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
        // Check whether notes are already generated for this PDF.
const existingNotes = await ShortNote.findAll({
    where: {
        pdf_id: pdf.id,
        user_id: req.user.id
    },
    order: [["id", "ASC"]]
});

if (existingNotes.length > 0) {
    return res.json({
        pdfId: pdf.id,
        total_chunks: 0,
        short_notes: existingNotes.map(note => note.note)
    });
}

      const chunks = chunkText(pdf.extracted_text);
      const allNotes = [];

for (let start = 0; start < chunks.length; start++) {

    const currentChunk = chunks[start];

    try {
        const prompt = summaryPrompt(currentChunk);
        const raw = await generateWithAI(prompt);
        const parsed = extractJSON(raw);

        if (parsed && Array.isArray(parsed.short_notes)) {
            parsed.short_notes.forEach(note => {
                allNotes.push({
                    note,
                    chunk_id: start
                });
            });
        } else if (parsed && Array.isArray(parsed.notes)) {
            parsed.notes.forEach(note => {
                allNotes.push({
                    note,
                    chunk_id: start
                });
            });
        } else if (Array.isArray(parsed)) {
            parsed.forEach(note => {
                allNotes.push({
                    note,
                    chunk_id: start
                });
            });
            
        }
        
    } catch (err) {
        console.error(`Summary chunk failed for chunk ${start}:`, err.message);
        continue;
    }
}

       

if (allNotes.length > 0) {
    await ShortNote.bulkCreate(
        allNotes.map(item => ({
            pdf_id: pdf.id,
            user_id: req.user.id,
            note: item.note,
            chunk_id: item.chunk_id
        }))
    );
}

return res.json({
    pdfId: pdf.id,
    total_chunks: chunks.length,
    short_notes: allNotes.map(item => item.note)
});

    } catch (error) {
        console.error("SUMMARY ERROR:", error.message);
        return res.status(500).json({
            message: "Notes generation failed"
        });
    }
};