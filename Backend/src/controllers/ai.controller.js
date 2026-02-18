import axios from "axios";

const generateDescription = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: "OPENAI_API_KEY is not configured" });
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You write short, catchy social post descriptions.",
          },
          {
            role: "user",
            content: `Post title: ${title}\nGenerate one short, catchy description.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 80,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const description = response.data?.choices?.[0]?.message?.content?.trim();
    return res.status(200).json({ description: description || "" });
  } catch (error) {
    const status = error?.response?.status;
    const openaiError = error?.response?.data;

    console.error("[AI][generate-description] Internal server error", {
      message: error?.message,
      status,
      openaiError,
      method: req.method,
      path: req.originalUrl,
      userId: req.user?._id || req.user?.id || "unknown",
      titleLength: typeof req.body?.title === "string" ? req.body.title.length : 0,
    });

    return res.status(500).json({
      message: "Failed to generate description",
      details: status ? `Upstream status: ${status}` : "Unexpected AI generation failure",
    });
  }
};

export { generateDescription };
