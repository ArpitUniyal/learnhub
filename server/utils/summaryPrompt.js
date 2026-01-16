/**
 * Chunk-level short notes prompt
 * Each chunk is summarized independently
 */

const summaryPrompt = (text) => `
You are an academic study assistant.

TASK:
Generate SHORT NOTES that capture ALL IMPORTANT POINTS
from the given study material section.

RULES:
- Each note must capture one important concept
- Prefer MORE notes over fewer
- Do NOT over-compress
- Do NOT add new information
- Notes must be suitable for exam preparation

OUTPUT RULES (STRICT):
- Output MUST be valid JSON
- Do NOT use bullet symbols (*, -, •)
- Do NOT include markdown
- Do NOT include any text outside JSON

JSON FORMAT:
{
  "short_notes": [
    "Each item must be a plain sentence"
  ]
}

STUDY MATERIAL:
${text}
`;

module.exports = { summaryPrompt };
