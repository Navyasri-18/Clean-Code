// api/get-review.js
import { GoogleGenerativeAI } from "@google/generative-ai";

/*
  Vercel serverless function.
  Receives POST { code, language } and returns a plain markdown string (text).
*/

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code, language } = req.body ?? {};
    if (!code) return res.status(400).json({ error: "Missing code in request body" });

    const apiKey = process.env.GOOGLE_GEMINI_KEY;
    if (!apiKey) return res.status(500).json({ error: "Server misconfigured: missing API key" });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      systemInstruction: `
You are an AI code reviewer. Respond in exactly 4 sections: 
1. Errors Found (bulleted)
2. Recommended Fixes (bulleted)
3. Impact of Fixes (bulleted)
4. Corrected Full Code (fenced code block in given language)
Do NOT add anything else.
`,
    });

    const prompt = `LANGUAGE: ${language || "javascript"}

CODE:
\`\`\`${language || "javascript"}
${code}
\`\`\`
`;

    const result = await model.generateContent(prompt);
    const text = result.response?.text?.() ?? result.response?.text ?? String(result);

    // Return plain text (markdown)
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send(text);
  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: "AI service error" });
  }
}
