export function normalizeNotes(notes) {
  return notes
    .map(n =>
      n
        .replace(/^[•\-*]\s*/, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .join(". ");
}
