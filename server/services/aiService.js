const axios = require("axios");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Primary: Groq
 */
async function callGroq(prompt) {
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
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
       model: "nvidia/nemotron-3.5-lightning:free", // primary fallback model
       
        models: [
        "openrouter/free"
      ],// available free model
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

  } catch (groqError) {
    // Any Groq error → fallback to OpenRouter
    console.warn(
      "Groq request failed → using OpenRouter fallback:",
      groqError.message
    );

    try {
      return await callOpenRouter(prompt);

    } catch (openRouterError) {
      console.error(
  "OpenRouter request failed:",
  openRouterError.response?.data || openRouterError.message
);

      throw new Error(
        `Both AI providers failed. Groq: ${groqError.message} | OpenRouter: ${openRouterError.message}`
      );
    }
  }
}

module.exports = { generateWithAI };
