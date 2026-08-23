const flashcardPrompt = (text) => `
You are an academic study assistant.

Create the most important flashcards from ONLY the supplied study material.

Rules:
- Generate a maximum of 20 flashcards.
- Prefer important concepts, definitions, facts, and exam-relevant information.
- Do NOT generate more than 20 flashcards.
- Do NOT invent information.
- Do NOT repeat or paraphrase the same concept.
- Each flashcard must test one distinct concept.
- "front" must be a concise key term or direct question.
- "back" must be a concise factual answer or definition.
- Keep the front and back short.
- Return ONLY valid JSON.
- Return a JSON array, not an object.
- Do NOT include markdown or \`\`\`json.
- Do NOT include any text before or after the JSON.
- Ensure the JSON array is fully closed before ending the response.
- If no useful flashcards can be generated, return [].

OUTPUT FORMAT:
[
  {
    "front": "Term or direct question",
    "back": "Concise answer or definition"
  }
]

STUDY MATERIAL:
${text}
`;

module.exports = { flashcardPrompt };
