const buildMCQPrompt = (text, previousQuestions = []) => `
You are an expert academic exam question generator.

STRICT RULES:
- Generate EXACTLY ONE MCQ
- Do NOT repeat, paraphrase, or slightly modify any previous question
- The new question must test a DIFFERENT concept

QUESTIONS TO AVOID (DO NOT REPEAT OR PARAPHRASE):
${previousQuestions.length > 0
  ? previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")
  : "None"}

REQUIREMENTS:
- Exam-oriented
- Medium to hard difficulty
- Prefer concepts not used earlier
- Use later or underused sections if possible

OUTPUT FORMAT (STRICT JSON ONLY — NO ARRAY, NO TEXT):
{
  "question": "Your question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": "Option A"
}

STUDY MATERIAL:
${text}
`;

module.exports = { buildMCQPrompt };
