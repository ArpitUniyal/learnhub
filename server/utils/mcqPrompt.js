const buildMCQPrompt = (text) => `
You are an expert academic exam question generator.

STRICT RULES:
- Generate EXACTLY 10 MCQs.
- Every MCQ must be based only on the supplied study material.
- Do NOT repeat the same question.
- Do NOT create paraphrased versions of another question in the same set.
- Each MCQ should test a different concept whenever the material allows.
- Do not invent information that is not present in the study material.

REQUIREMENTS:
- Exam-oriented
- Medium to hard difficulty
- Clear and unambiguous questions
- Exactly 4 options per question
- Exactly 1 correct answer per question

OUTPUT FORMAT:
Return ONLY a valid JSON array.
Do NOT include markdown.
Do NOT include \`\`\`json.
Do NOT include explanations outside the JSON array.

[
  {
    "question": "Question 1",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correct_answer": "Option A"
  },
  {
    "question": "Question 2",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correct_answer": "Option B"
  }
]

Continue this exact structure until there are EXACTLY 10 MCQs.

STUDY MATERIAL:
${text}
`;

module.exports = { buildMCQPrompt };
