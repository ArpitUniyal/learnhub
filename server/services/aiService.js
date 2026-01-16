const axios = require("axios");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

console.log("GROQ_API_KEY at runtime:", process.env.GROQ_API_KEY ? "FOUND" : "MISSING");


/**
 * Detect ONLY Groq quota / rate limit errors
 */
function isGroqRateLimitError(err) {
  return (
    err?.status === 429 ||
    err?.error?.error?.code === "rate_limit_exceeded" ||
    err?.message?.includes("Rate limit")
  );
}

/**
 * Primary: Groq
 */
async function callGroq(prompt) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You are an educational AI assistant." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

/**
 * Fallback: OpenRouter (FREE model)
 */
async function callOpenRouter(prompt) {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "mistralai/mistral-7b-instruct", // FREE & reliable
      messages: [
        { role: "system", content: "You are an educational AI assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 60000,
    }
  );

  return response.data.choices[0].message.content;
}

/**
 * Unified generator used by ALL controllers
 */
async function generateWithAI(prompt) {
  try {
    // Try Groq first
    return await callGroq(prompt);
  } catch (err) {
    if (isGroqRateLimitError(err)) {
      console.warn("Groq quota exhausted → using OpenRouter fallback");
      return await callOpenRouter(prompt);
    }
    throw err;
  }
}

module.exports = { generateWithAI };

