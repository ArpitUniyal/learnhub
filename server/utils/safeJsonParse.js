
function extractJSON(text) {
  if (!text || typeof text !== "string") return null;

  try {
    // 1. Remove common wrapper noise from free / instruct models
    const cleaned = text
      .replace(/<s>/gi, "")
      .replace(/<\/s>/gi, "")
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // 2. Try a complete JSON object first.
    // This is important for MCQs because the object contains
    // an "options" array inside it.
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);

    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    // 3. If there is no object, try a JSON array.
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);

    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }

    // 4. Nothing usable found
    return null;

  } catch (err) {
    return null;
  }
}
module.exports = { extractJSON };
