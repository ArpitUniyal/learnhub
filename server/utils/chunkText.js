/**
 * Split text into safe chunks for LLM processing
 * Default size works well for Groq models
 */

function chunkText(text, chunkSize = 3000) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize;
  }

  return chunks;
}

module.exports = { chunkText };
