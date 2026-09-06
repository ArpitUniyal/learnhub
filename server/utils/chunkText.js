function chunkText(text, chunkSize = 10000, overlap = 100) {
  const chunks = [];
  let start = 0;

  if (overlap >= chunkSize) {
    throw new Error("Overlap must be smaller than chunk size");
  }

  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));

    start += chunkSize - overlap;
  }

  return chunks;
}

module.exports = { chunkText };
