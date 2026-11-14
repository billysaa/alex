import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
const port = Number(process.env.PORT || 3000);
const FAST_MODEL = process.env.FAST_MODEL || "openai/gpt-oss-20b";
const DEEP_MODEL = process.env.DEEP_MODEL || "openai/gpt-oss-120b";
const VISION_MODEL = process.env.VISION_MODEL || "qwen/qwen3.8-27b";

const client = process.env.GROQ_API_KEY ? new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  timeout: 60000,
  maxRetries: 1
}) : null;

app.use(express.json({ limit: "45mb" }));
app.use(express.static("public"));

const instructions = `You are Zagkas AI, a polished, helpful Greek/English assistant.
Answer in the user's language. Give ONE clear final answer. Be accurate and honest.
Help with coding, school, writing, research, planning, troubleshooting and image understanding.
Never reveal API keys or server secrets. Do not claim actions you did not perform.
Be concise by default and expand when asked.`;

function cleanMessages(input) {
  if (!Array.isArray(input)) return [];
  return input.filter(m => m && ["user","assistant"].includes(m.role)).slice(-12).map(m => {
    if (m.role === "assistant") return { role:"assistant", content:String(m.content || "").slice(0,8000) };
    if (typeof m.content === "string") return { role:"user", content:m.content.slice(0,8000) };
    if (Array.isArray(m.content)) {
      const parts = m.content.filter(p => p && (
        (p.type === "text" && typeof p.text === "string") ||
        (p.type === "image_url" && typeof p.image_url?.url === "string" && p.image_url.url.startsWith("data:image/"))
      ));
      return { role:"user", content:parts };
    }
    return null;
  }).filter(Boolean);
}
function lastUserText(messages) {
  const m=[...messages].reverse().find(x=>x.role==="user");
  if (!m) return "";
  return typeof m.content==="string" ? m.content : m.content.filter(p=>p.type==="text").map(p=>p.text).join(" ");
}
function imageParts(messages) {
  const m=[...messages].reverse().find(x=>x.role==="user");
  return m && Array.isArray(m.content) ? m.content.filter(p=>p.type==="image_url") : [];
}
function needsDeep(text) {
  const t=text.toLowerCase();
  return text.length>1400 || ["αναλυτικά","σε βάθος","σύγκρινε","σύγκριση","αρχιτεκτονική","debug","step by step","in detail","compare","architecture","comprehensive"].some(s=>t.includes(s));
}

app.get("/api/health",(_req,res)=>res.json({
  ok:true,configured:Boolean(client),provider:"Groq",
  model:FAST_MODEL,deepModel:DEEP_MODEL,visionModel:VISION_MODEL
}));

app.post("/api/chat",async(req,res)=>{
  try {
    if(!client) return res.status(503).json({error:"Λείπει το GROQ_API_KEY από το αρχείο .env."});
    const messages=cleanMessages(req.body?.messages);
    if(!messages.length) return res.status(400).json({error:"Δεν δόθηκε μήνυμα."});
    const userText=lastUserText(messages);
    const images=imageParts(messages);
    if(images.length>12) return res.status(400).json({error:"Μπορείς να στείλεις έως 12 εικόνες ανά μήνυμα."});
    for(const p of images) if(p.image_url.url.length>8_000_000) return res.status(413).json({error:"Μία από τις εικόνες είναι πολύ μεγάλη. Δοκίμασε μικρότερη εικόνα."});

    let output, selectedModel, mode;
    if(images.length) {
      // Groq vision currently accepts up to 3 images per request. Process all selected images in batches.
      const batches=[];
      for(let i=0;i<images.length;i+=3) batches.push(images.slice(i,i+3));
      const analyses=await Promise.all(batches.map(async(batch,index)=>{
        const completion=await client.chat.completions.create({
          model:VISION_MODEL,
          messages:[
            {role:"system",content:instructions+" Analyze the supplied images carefully. Follow the user's requested operation. If this is one of several image batches, describe only what is visible in this batch and do not guess missing context."},
            {role:"user",content:[{type:"text",text:userText || "Περιέγραψε και ανάλυσε αυτές τις εικόνες."},...batch]}
          ],
          temperature:0.4,
          max_completion_tokens:900
        });
        return "Ομάδα εικόνων "+(index+1)+": "+(completion.choices?.[0]?.message?.content || "");
      }));
      if(analyses.length===1) output=analyses[0].replace(/^Ομάδα εικόνων 1:\s*/,"");
      else {
        const final=await client.chat.completions.create({
          model:FAST_MODEL,
          messages:[
            {role:"system",content:instructions+" Combine the visual analyses into ONE coherent final answer to the user's original request. Avoid repeating batch labels."},
            {role:"user",content:"Αρχικό αίτημα: "+userText+"\n\nΑναλύσεις εικόνων:\n"+analyses.join("\n\n")}
          ],
          temperature:0.4,max_completion_tokens:1200
        });
        output=final.choices?.[0]?.message?.content || analyses.join("\n\n");
      }
      selectedModel=VISION_MODEL; mode="vision";
    } else {
      const useDeep=needsDeep(userText);
      selectedModel=useDeep?DEEP_MODEL:FAST_MODEL;
      mode=useDeep?"deep":"fast";
      const completion=await client.chat.completions.create({
        model:selectedModel,
        messages:[{role:"system",content:instructions},...messages],
        temperature:0.5,max_completion_tokens:useDeep?1400:850
      });
      output=completion.choices?.[0]?.message?.content || "Δεν πήρα απάντηση.";
    }
    res.json({output,model:selectedModel,mode});
  } catch(error) {
    console.error("Chat request failed:",error?.status||"",error?.message||error);
    const status=error?.status===401?401:error?.status===429?429:error?.status===413?413:500;
    const message=status===401?"Το Groq API key δεν είναι έγκυρο.":status===429?"Έφτασες προσωρινά το δωρεάν όριο χρήσης. Δοκίμασε ξανά αργότερα.":status===413?"Το αίτημα είναι πολύ μεγάλο. Μείωσε το μέγεθος των εικόνων.":"Παρουσιάστηκε σφάλμα στην ανάλυση. Έλεγξε αν το μοντέλο είναι διαθέσιμο στο Groq.";
    res.status(status).json({error:message});
  }
});
app.listen(port,()=>console.log(`Zagkas AI ready at http://localhost:${port}`));
