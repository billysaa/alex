import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_MODEL || "gpt-6-luna";

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. Add it to .env before using /api/chat.");
}

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const instructions = `
You are Alex, a capable general-purpose AI assistant.
- Answer in the user's language when practical; Greek and English are both supported.
- Be accurate, clear, useful and honest about uncertainty.
- When the user asks for current information, use web search.
- You can help with coding, school, writing, research, planning, troubleshooting and everyday questions.
- Never reveal API keys, secrets or server environment variables.
- Do not claim to have performed an action outside this application unless a real tool performed it.
- Keep answers reasonably concise unless the user asks for detail.
`;

function cleanMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-30)
    .map(m => ({ role: m.role, content: m.content.slice(0, 12000) }));
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    configured: Boolean(process.env.OPENAI_API_KEY),
    model
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({
        error: "OpenAI API key is not configured. Create a .env file from .env.example."
      });
    }

    const messages = cleanMessages(req.body?.messages);
    if (!messages.length) {
      return res.status(400).json({ error: "No messages supplied." });
    }

    const response = await client.responses.create({
      model,
      instructions,
      input: messages,
      tools: [{ type: "web_search" }],
      store: false
    });

    res.json({
      output: response.output_text || "Δεν πήρα κείμενο από το μοντέλο.",
      response_id: response.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error?.message || "Unexpected server error."
    });
  }
});

app.listen(port, () => {
  console.log(`Alex AI running at http://localhost:${port}`);
});
