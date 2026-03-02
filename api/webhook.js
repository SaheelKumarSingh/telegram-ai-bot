export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).send("OK");
    }

    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    console.log("Incoming body:", req.body);

    const message = req.body.message?.text;
    const chatId = req.body.message?.chat?.id;

    if (!message || !chatId) {
      console.log("No message or chatId");
      return res.status(200).send("No message");
    }

    console.log("User message:", message);

    // Call Groq
    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: message }]
      })
    });

    const aiData = await aiResponse.json();
    console.log("Groq response:", aiData);

    const reply = aiData.choices?.[0]?.message?.content;

    if (!reply) {
      console.log("No reply from Groq");
      return res.status(200).send("No AI reply");
    }

    // Send to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply
        })
      }
    );

    const telegramData = await telegramResponse.json();
    console.log("Telegram send response:", telegramData);

    return res.status(200).send("Done");
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).send("Server Error");
  }
}
