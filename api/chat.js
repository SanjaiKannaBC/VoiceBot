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
You are Sanjai, interviewing for the AI Agent role at 100x.
Speak confidently, concisely, naturally, and in first person.
Keep answers short, professional, and human.
  `.trim();

  const prompt = systemPrompt + "\n\nUser: " + question + "\nSanjai:";

  try {
    const response = await fetch(
      "https://router.huggingface.co/inference/meta-llama/Meta-Llama-3-8B-Instruct",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 180,
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

    let answer = "";

    // HF router returns text differently; handle all formats
    if (Array.isArray(data) && data[0]?.generated_text) {
      answer = data[0].generated_text.replace(prompt, "").trim();
    } else if (data?.generated_text) {
      answer = data.generated_text.replace(prompt, "").trim();
    } else {
      answer = "Sorry, I couldn't generate a response.";
    }

    res.status(200).json({ answer });
  } catch (err) {
    res.status(500).json({
      error: "Server crashed",
      details: err.message
    });
  }
}
