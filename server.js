import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
const port = Number(process.env.PORT || 3000);

// Fast default model; use the larger model only for clearly complex requests.
const FAST_MODEL = process.env.FAST_MODEL || "openai/gpt-oss-20b";
const DEEP_MODEL = process.env.DEEP_MODEL || "openai/gpt-oss-120b";

const client = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
      timeout: 30000,
      maxRetries: 1
    })
  : null;

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const instructions = `
You are Zagkas AI, a fast and helpful Greek/English assistant.
- Answer in the user's language.
- Give one clear, direct final answer, not multiple alternative answers.
- Be accurate, useful and honest about uncertainty.
- Help with coding, school, writing, research, planning and troubleshooting.
- Never reveal API keys, secrets or server environment variables.
- Do not claim to have performed an action unless a real tool performed it.
- Be concise by default; expand only when useful or requested.
`;

function cleanMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-16)
    .map(m => ({ role: m.role, content: m.content.slice(0, 8000) }));
}

function latestUserText(messages) {
  return [...messages].reverse().find(m => m.role === "user")?.content || "";
}

function needsDeeperModel(text) {
  const t = text.toLowerCase();
  const complexSignals = [
    "αναλυτικά", "σε βάθος", "σύγκρινε", "σύγκριση", "σχεδίασε", "αρχιτεκτονική",
    "debug", "διόρθωσε όλο", "ολόκληρο project", "νομική ανάλυση", "μαθηματική απόδειξη",
    "step by step", "in detail", "compare", "architecture", "debug", "prove", "comprehensive"
  ];
  return text.length > 1400 || complexSignals.some(s => t.includes(s));
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    configured: Boolean(client),
    provider: "Groq",
    model: FAST_MODEL,
    deepModel: DEEP_MODEL,
    routing: "fast-first"
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({
        error: "Δεν έχει ρυθμιστεί το GROQ_API_KEY. Βάλε δωρεάν Groq API key στο αρχείο .env."
      });
    }

    const messages = cleanMessages(req.body?.messages);
    if (!messages.length) {
      return res.status(400).json({ error: "No messages supplied." });
    }

    const useDeep = needsDeeperModel(latestUserText(messages));
    const selectedModel = useDeep ? DEEP_MODEL : FAST_MODEL;

    const completion = await client.chat.completions.create({
      model: selectedModel,
      messages: [{ role: "system", content: instructions }, ...messages],
      temperature: 0.5,
      max_tokens: useDeep ? 1400 : 850
    });

    res.json({
      output: completion.choices?.[0]?.message?.content || "Δεν πήρα κείμενο από το μοντέλο.",
      response_id: completion.id,
      model: selectedModel,
      mode: useDeep ? "deep" : "fast"
    });
  } catch (error) {
    console.error("Chat request failed:", error?.status || "", error?.message || error);
    const status = error?.status === 401 ? 401 : error?.status === 429 ? 429 : 500;
    const message = status === 401
      ? "Το Groq API key δεν είναι έγκυρο. Έλεγξε το GROQ_API_KEY."
      : status === 429
        ? "Έφτασες το δωρεάν όριο του Groq. Περίμενε να ανανεωθεί ή δοκίμασε αργότερα."
        : "Παρουσιάστηκε σφάλμα σύνδεσης με το AI. Έλεγξε το server log και αν το μοντέλο είναι διαθέσιμο.";
    res.status(status).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`Zagkas AI ready at http://localhost:${port}`);
  console.log(`Fast model: ${FAST_MODEL} | Deep model: ${DEEP_MODEL}`);
});
