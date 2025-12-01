import generateContent from "../backend/src/services/ai.services.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: "Missing code or language" });
    }

    const result = await generateContent(code, language);

    return res.status(200).send(result);
  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
