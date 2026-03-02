export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).send("OK");
    }

    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    const message = req.body?.message?.text;
    const chatId = req.body?.message?.chat?.id;

    if (!message || !chatId) {
      return res.status(200).send("No message");
    }

    // Call Groq with supported model
    const aiResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            {
              role: "system",
              content: "You are a concise and intelligent AI assistant.",
            },
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    const aiData = await aiResponse.json();

    if (!aiData.choices || !aiData.choices.length) {
      console.error("Groq error:", aiData);
      return res.status(200).send("Groq failed");
    }

    const reply = aiData.choices[0].message.content;

    // Send reply back to Telegram
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply,
        }),
      }
    );

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).send("Internal Server Error");
  }
}
