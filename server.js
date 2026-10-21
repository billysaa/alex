import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
const port = Number(process.env.PORT || 3000);
const model = process.env.LLAMA_MODEL || "llama-3.3-70b-versatile";

if (!process.env.GROQ_API_KEY) {
  console.warn("GROQ_API_KEY is not set. Add it to .env before using /api/chat.");
}

const client = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1"
    })
  : null;

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const instructions = `
You are Zagkas AI, powered by Llama.
- Answer in the user's language when practical; Greek and English are supported.
- Be accurate, clear, useful and honest about uncertainty.
- Help with coding, school, writing, research, planning, troubleshooting and everyday questions.
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
    configured: Boolean(process.env.GROQ_API_KEY),
    provider: "Groq",
    model
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({
        error: "Το GROQ_API_KEY δεν έχει ρυθμιστεί. Βάλε το στο .env ή στα environment variables του server."
      });
    }

    const messages = cleanMessages(req.body?.messages);
    if (!messages.length) {
      return res.status(400).json({ error: "No messages supplied." });
    }

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: instructions },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 2048
    });

    res.json({
      output: completion.choices?.[0]?.message?.content || "Δεν πήρα κείμενο από το μοντέλο.",
      response_id: completion.id
    });
  } catch (error) {
    console.error("Chat request failed:", error?.status || "", error?.message || error);
    const status = error?.status === 401 ? 401 : error?.status === 429 ? 429 : 500;
    const message = status === 401
      ? "Το Groq API key δεν είναι έγκυρο. Έλεγξε το GROQ_API_KEY."
      : status === 429
        ? "Έφτασες το όριο χρήσης του Groq. Περίμενε ή έλεγξε τα limits του λογαριασμού σου."
        : "Παρουσιάστηκε σφάλμα στον server. Έλεγξε τα logs και ότι το μοντέλο είναι διαθέσιμο.";
    res.status(status).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`Zagkas AI (Llama) running at http://localhost:${port}`);
});
