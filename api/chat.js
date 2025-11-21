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

  const systemPrompt = `
You are Sanjai, a candidate interviewing for the AI Agent role at 100x.
Speak in first person, confident, concise, and human.
Keep answers short and interview-ready.
  `.trim();

  const prompt = systemPrompt + "\n\nUser: " + question + "\nSanjai:";

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.4
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({
        error: "HuggingFace API error",
        details: err
      });
    }

    const data = await response.json();
    const answer =
      data?.[0]?.generated_text?.replace(prompt, "").trim() ||
      "I couldn't generate a reply.";

    res.status(200).json({ answer });
  } catch (err) {
    res.status(500).json({
      error: "Server crashed",
      details: err.message
    });
  }
}
