const axios = require("axios");
const Groq = require("groq-sdk");
const { GoogleGenAI } = require("@google/genai");

// ======================================================
// CLIENTS
// ======================================================

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  httpOptions: {
    timeout: 20000,
  },
});

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    timeout: 10000,
  },
});


// ======================================================
// PRIMARY: GEMINI
// ======================================================

async function callGemini(prompt) {
  const start = Date.now();

  console.log("🟣 Gemini request START");

  try {
    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    const duration = Date.now() - start;

    console.log(`🟢 Gemini SUCCESS in ${duration} ms`);

    const content = response.text;

    if (!content || typeof content !== "string") {
      throw new Error("Gemini returned an empty response");
    }

    return content;

  } catch (error) {
    const duration = Date.now() - start;

    console.error(`🔴 Gemini FAILED after ${duration} ms`);
    console.error(error.message);

    throw error;
  }
}


// ======================================================
// SECONDARY: GROQ
// ======================================================

async function callGroq(prompt) {
  const start = Date.now();

  console.log("🟡 Groq request START");

  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
          content: "You are an educational AI assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.7,
    });

    const duration = Date.now() - start;

    console.log(`🟢 Groq SUCCESS in ${duration} ms`);

    const content =
      completion.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      throw new Error("Groq returned an empty response");
    }

    return content;

  } catch (error) {
    const duration = Date.now() - start;

    console.error(`🔴 Groq FAILED after ${duration} ms`);

    console.error(error.message);

    throw error;
  }
}


// ======================================================
// LAST RESORT: OPENROUTER FREE
// ======================================================

async function callOpenRouter(prompt) {
  const start = Date.now();

  console.log("🔵 OpenRouter request START");

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",

        messages: [
          {
            role: "system",
            content: "You are an educational AI assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
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

    const duration = Date.now() - start;

    console.log(`🟢 OpenRouter SUCCESS in ${duration} ms`);

    console.log(
      "🤖 OpenRouter model:",
      response.data?.model || "unknown"
    );

    const content =
      response.data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      throw new Error("OpenRouter returned an empty response");
    }

    return content;

  } catch (error) {
    const duration = Date.now() - start;

    console.error(
      `🔴 OpenRouter FAILED after ${duration} ms`
    );

    console.error(
      error.response?.data || error.message
    );

    throw error;
  }
}


// ======================================================
// PROVIDER ROUTER
//
// Gemini → Groq → OpenRouter
// ======================================================

async function generateWithAI(prompt) {
  let geminiError;
  let groqError;

  // ----------------------------------------------------
  // 1. GEMINI PRIMARY
  // ----------------------------------------------------

  try {
    return await callGemini(prompt);

  } catch (error) {
    geminiError = error;

    console.warn(
      "Gemini request failed → trying Groq:",
      error.message
    );
  }


  // ----------------------------------------------------
  // 2. GROQ SECONDARY
  // ----------------------------------------------------

  try {
    return await callGroq(prompt);

  } catch (error) {
    groqError = error;

    console.warn(
      "Groq request failed → trying OpenRouter:",
      error.message
    );
  }


  // ----------------------------------------------------
  // 3. OPENROUTER LAST RESORT
  // ----------------------------------------------------

  try {
    return await callOpenRouter(prompt);

  } catch (openRouterError) {
    console.error(
      "All AI providers failed."
    );

    throw new Error(
      `Gemini: ${geminiError?.message || "failed"} | ` +
      `Groq: ${groqError?.message || "failed"} | ` +
      `OpenRouter: ${openRouterError?.message || "failed"}`
    );
  }
}


module.exports = {
  generateWithAI,
};
