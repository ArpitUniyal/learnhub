const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

console.log("GROQ_API_KEY at runtime:", process.env.GROQ_API_KEY ? "FOUND" : "MISSING");


module.exports = groq;

