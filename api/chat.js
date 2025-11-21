export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(200).end();
    return;
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const question = (req.body?.question || "").trim();
  if (!question) {
    res.status(400).json({ error: "Missing question" });
    return;
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    res.status(500).json({
      error: "OPENAI_API_KEY not set on server. Add it in Vercel → Project → Settings → Environment Variables."
    });
    return;
  }

  const systemPrompt = `
You are Sanjai, a candidate interviewing for the AI Agent role at 100x.
You respond in first person, clearly, concisely, and confidently.
Keep answers short and interview-ready. Speak as a real person, not an AI.
  `.trim();

  try {
    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        max_tokens: 300,
        temperature: 0.2
      })
    });

    if (!apiRes.ok) {
      const err = await apiRes.text();
      res.status(500).json({
        error: "OpenAI API error",
        details: err
      });
      return;
    }

    const data = await apiRes.json();
    const answer = data.choices?.[0]?.message?.content?.trim() || "I couldn't generate a reply.";

    res.status(200).json({ answer });

  } catch (err) {
    res.status(500).json({
      error: "Server crashed",
      details: err.message
    });
  }
}
