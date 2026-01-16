/**
 * Safely extract and parse JSON from LLM output.
 * Works with Groq, OpenRouter, and other free models
 * that may include extra text, markdown, or <s> tokens.
 */
function extractJSON(text) {
  if (!text || typeof text !== "string") return null;

  try {
    // 1. Remove common wrapper noise from free / instruct models
    let cleaned = text
      .replace(/<s>/gi, "")
      .replace(/<\/s>/gi, "")
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // 2. Attempt to extract a JSON array first: [ ... ]
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }

    // 3. Attempt to extract a JSON object next: { ... }
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    // 4. Nothing usable found
    return null;
  } catch (err) {
    // Parsing failed
    return null;
  }
}

module.exports = { extractJSON };
