import generateContent from "../backend/src/services/ai.services.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code, language } = req.body;

    const result = await generateContent(code, language);

    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
