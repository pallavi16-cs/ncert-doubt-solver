import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const systemPrompt = `
You are a Multilingual NCERT Doubt-Solver for students in Grades 5–10.
Respond step by step in plain text ONLY. DO NOT use markdown headings (###), LaTeX, $, _, *, or any symbols.
Use the following rules for chemical reactions:
- Represent chemicals normally: CO2, H2O, O2, C6H12O6
- Use → for reactions instead of \\xrightarrow
- Bold important words using **double asterisks**
- Write NCERT equations in a single line, easy to read
- Keep everything concise and exam-friendly
Strictly follow these rules. Do NOT deviate.
`;

const app = express();
app.use(express.json());
app.use(express.static("public"));

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";


app.post("/ask", async (req, res) => {
  const { messageText, grade, subject } = req.body;

  const systemPrompt =
    "You are a highly specialized Multilingual NCERT Doubt-Solver for students in Grades 5-10. " +
    "Explain step by step using simple plain text. Keep answers short and NCERT-based.";

  const userQuery = `Grade: ${grade}, Subject: ${subject}. Question: ${messageText}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      }
    );

    const data = await response.json();
    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No answer generated.";

    res.json({ answer });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gemini API error" });
  }
});

app.listen(3000, () => {
  console.log(" Server running at http://localhost:3000");
});
