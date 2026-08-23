const { QuizSession, QuizQuestion, QuizSubmission, Pdf } = require("../models");
const { generateWithAI } = require("../services/aiService");
const { buildMCQPrompt } = require("../utils/mcqPrompt");

function parseQuizMCQs(raw) {
    if (!raw || typeof raw !== "string") {
        return null;
    }

    try {
        const parsed = JSON.parse(raw.trim());

        if (!Array.isArray(parsed) || parsed.length !== 10) {
            return null;
        }

        for (const mcq of parsed) {
            if (
                !mcq ||
                typeof mcq !== "object" ||
                Array.isArray(mcq) ||
                typeof mcq.question !== "string" ||
                !Array.isArray(mcq.options) ||
                mcq.options.length !== 4 ||
                typeof mcq.correct_answer !== "string"
            ) {
                return null;
            }
        }

        return parsed;
    } catch {
        return null;
    }
}

async function generateMCQ(chunkText) {
    const prompt = buildMCQPrompt(chunkText);

    // First attempt: normal centralized provider logic
    let raw = await generateWithAI(prompt);

    let mcqs = parseQuizMCQs(raw);

    if (!mcqs) {
    console.warn("⚠️ Invalid MCQ response → retrying with primary AI provider");

    raw = await generateWithAI(prompt);
    mcqs = parseQuizMCQs(raw);
}

    if (!mcqs) {
        throw new Error("AI returned invalid or incomplete MCQ JSON");
    }

    return mcqs;
}
/* ======================================================
   Generate Quiz (INITIAL)
====================================================== */
exports.generateQuiz = async(req, res) => {
    try {

        const userId = req.user?.userId || req.user?.id;

        const pdfId = parseInt(req.params.id, 10);

        if (!userId) {
            return res.status(401).json({ message: "Invalid user session" });
        }

        const pdf = await Pdf.findOne({
            where: { id: pdfId, user_id: userId }
        });

        if (!pdf || !pdf.extracted_text) {
            return res.status(404).json({ message: "PDF not found" });
        }

        let session = await QuizSession.findOne({
            where: { pdf_id: pdfId, user_id: userId }
        });

        if (!session) {
            session = await QuizSession.create({
                pdf_id: pdfId,
                user_id: userId,
                used_chunk_ids: []
            });
        }


        const chunks = pdf.extracted_text.match(/(.|\n){1,4000}/g) || [];
        const usedChunks = new Set(session.used_chunk_ids || []);

        console.log("TOTAL CHUNKS:", chunks.length);
        console.log("USED CHUNKS:", Array.from(usedChunks));
        console.log("UNUSED CHUNKS:", chunks.length - usedChunks.size);

const generated = [];

// Select the first unused chunk
let selectedChunkIndex = -1;

for (let i = 0; i < chunks.length; i++) {
    if (!usedChunks.has(i)) {
        selectedChunkIndex = i;
        break;
    }
}

if (selectedChunkIndex === -1) {
    return res.status(409).json({
        message: "You have reached the end of the available quiz questions for this PDF."
    });
}

const selectedChunk = chunks[selectedChunkIndex];

let mcqs;

try {
    mcqs = await generateMCQ(selectedChunk);
} catch (error) {
    console.error("MCQ GENERATION ERROR:", error.message);

    return res.status(500).json({
        message: "Unable to generate quiz questions"
    });
}

for (const mcq of mcqs) {
    const q = await QuizQuestion.create({
        session_id: session.id,
        question: mcq.question,
        options: mcq.options,
        correct_answer: mcq.correct_answer,
        chunk_id: selectedChunkIndex
    });

    generated.push(q);
}

console.log(
    `Generated ${generated.length} MCQs from chunk ${selectedChunkIndex}.`
);

usedChunks.add(selectedChunkIndex);

        session.used_chunk_ids = Array.from(usedChunks);
        await session.save();

        return res.json({ mcqs: generated });

    } catch (err) {
        console.error("GENERATE QUIZ ERROR:", err);
        return res.status(500).json({ message: "Quiz generation failed" });
    }
};

/* ======================================================
   Regenerate Quiz (SAFE)
====================================================== */
exports.regenerateQuiz = async(req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const pdfId = parseInt(req.params.id, 10);

        if (!userId) {
            return res.status(401).json({ message: "Invalid user session" });
        }

        const session = await QuizSession.findOne({
            where: { pdf_id: pdfId, user_id: userId }
        });

        if (!session) {
            // No previous quiz → behave like fresh generation
            return exports.generateQuiz(req, res);
        }

        await QuizSubmission.destroy({ where: { session_id: session.id } });
        await QuizQuestion.destroy({ where: { session_id: session.id } });

        return exports.generateQuiz(req, res);

    } catch (err) {
        console.error("REGENERATE QUIZ ERROR:", err);
        return res.status(500).json({ message: "Failed to regenerate quiz" });
    }
};
/* ======================================================
   Submit Quiz
====================================================== */
exports.submitQuiz = async(req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const pdfId = parseInt(req.params.id, 10);
        const { answers } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Invalid user session" });
        }

        const session = await QuizSession.findOne({
            where: { pdf_id: pdfId, user_id: userId }
        });

        if (!session) {
            return res.status(404).json({ message: "Quiz session not found" });
        }

        for (const ans of answers) {
            await QuizSubmission.create({
                session_id: session.id,
                question_id: ans.question_id,
                selected_answer: ans.selected_answer,
                user_id: userId
            });
        }

        return res.json({ message: "Quiz submitted successfully" });

    } catch (err) {
        console.error("SUBMIT QUIZ ERROR:", err);
        return res.status(500).json({ message: "Quiz submission failed" });
    }
};

/* ======================================================
   Quiz Score
====================================================== */
exports.getQuizScore = async(req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const pdfId = parseInt(req.params.id, 10);

        if (!userId) {
            return res.status(401).json({ message: "Invalid user session" });
        }

        const session = await QuizSession.findOne({
            where: { pdf_id: pdfId, user_id: userId }
        });

        if (!session) {
            return res.status(404).json({ message: "Quiz session not found" });
        }

        const submissions = await QuizSubmission.findAll({
            where: { session_id: session.id, user_id: userId }
        });

        const questions = await QuizQuestion.findAll({
            where: { session_id: session.id }
        });

        let correct = 0;
        const details = [];

        for (const s of submissions) {
            const q = questions.find(q => q.id === s.question_id);
            const isCorrect = q && q.correct_answer === s.selected_answer;
            if (isCorrect) correct++;

            details.push({
                question_id: s.question_id,
                selected_answer: s.selected_answer,
                correct_answer: q.correct_answer,
                is_correct: isCorrect
            });
        }

        return res.json({
            total_questions: questions.length,
            attempted: submissions.length,
            correct,
            score: correct,
            details
        });

    } catch (err) {
        console.error("SCORE ERROR:", err);
        return res.status(500).json({ message: "Failed to calculate score" });
    }
};