export function buildWordMap(text) {
  const words = [];
  let cursor = 0;

  text.split(/\s+/).forEach(word => {
    const start = text.indexOf(word, cursor);
    const end = start + word.length;

    words.push({ word, start, end });
    cursor = end;
  });

  return words;
}
