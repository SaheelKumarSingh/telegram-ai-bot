export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }

  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  const body = req.body;
  const message = body.message?.text;
  const chatId = body.message?.chat?.id;

  if (!message || !chatId) {
    return res.status(200).send("No message");
  }

  // Call Groq API
  const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: "You are a concise AI assistant." },
        { role: "user", content: message }
      ]
    })
  });

  const aiData = await aiResponse.json();
  const reply = aiData.choices?.[0]?.message?.content || "Error";

  // Send reply back to Telegram
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: reply
    })
  });

  return res.status(200).send("OK");
}