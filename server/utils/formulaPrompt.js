const formulaPrompt = (text) => `
You are an academic assistant.

Extract ALL formulas from the content below.

Rules:
- Extract ONLY formulas explicitly present
- Do NOT invent formulas
- Do NOT explain derivation
- Do NOT describe usage
- Provide ONLY symbol meanings (notation)
- If no formulas exist, return an empty JSON array
- Return STRICT JSON only

Output format:
[
  {
    "formula": "F = ma",
    "meaning": "F: Force, m: Mass, a: Acceleration"
  }
]

CONTENT:
${text}
`;

module.exports = { formulaPrompt };


