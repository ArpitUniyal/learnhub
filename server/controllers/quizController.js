const { QuizSession, QuizQuestion, QuizSubmission, Pdf } = require("../models");
const groq = require("../utils/groqClient");

const {buildMCQPrompt} = require("../utils/mcqPrompt");
const { extractJSON } = require("../utils/safeJsonParse");


/* ======================================================
   Helper: Generate ONE MCQ from Groq
====================================================== */
async function generateMCQFromGroq(chunkText, previousQuestions = []) {
  const prompt = buildMCQPrompt(chunkText, previousQuestions);


  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You generate high-quality academic MCQs." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7
  });

  return JSON.parse(response.choices[0].message.content);

}
/* ======================================================
   Generate Quiz (INITIAL)
====================================================== */
exports.generateQuiz = async (req, res) => {
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
    const previousQuestions = await QuizQuestion.findAll({
  attributes: ["question"],
  where: { session_id: session.id }
});

const previousQuestionTexts = previousQuestions.map(q => q.question);


    const chunks = pdf.extracted_text.match(/(.|\n){1,1200}/g) || [];
    const usedChunks = new Set(session.used_chunk_ids || []);
    const generated = [];

    for (let i = 0; i < chunks.length && generated.length < 10; i++) {
      if (usedChunks.has(i)) continue;

      const mcq = await generateMCQFromGroq(chunks[i], previousQuestionTexts);

      const q = await QuizQuestion.create({
        session_id: session.id,
        question: mcq.question,
        options: mcq.options,
        correct_answer: mcq.correct_answer,
        chunk_id: i
      });
      
      generated.push(q);
      usedChunks.add(i);
    }

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
exports.regenerateQuiz = async (req, res) => {
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

    session.used_chunk_ids = [];
    await session.save();

    return exports.generateQuiz(req, res);

  } catch (err) {
    console.error("REGENERATE QUIZ ERROR:", err);
    return res.status(500).json({ message: "Failed to regenerate quiz" });
  }
};

/* ======================================================
   Submit Quiz
====================================================== */
exports.submitQuiz = async (req, res) => {
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
exports.getQuizScore = async (req, res) => {
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
