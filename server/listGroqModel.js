require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});
console.log("GROQ_API_KEY at runtime:", process.env.GROQ_API_KEY ? "FOUND" : "MISSING");


(async () => {
  try {
    const models = await groq.models.list();
    console.log("Available Groq Models:\n");
    models.data.forEach(m => {
      console.log("-", m.id);
    });
  } catch (err) {
    console.error("Error fetching models:", err.message);
  }
})();

