const generateContent = require("../services/ai.services");

exports.getReview = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        error: "Code and language are required.",
      });
    }

    const result = await generateContent(code, language);
    res.send(result);

  } catch (err) {
    console.error("AI Review Error:", err);
    res.status(500).json({ error: "Failed to generate code review." });
  }
};
