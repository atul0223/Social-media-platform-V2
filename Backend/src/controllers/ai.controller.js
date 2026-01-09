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
    console.error("OpenAI description generation failed:", error.response?.data || error.message);
    next(new Error("Failed to generate description"));
  }
};

export { generateDescription };
