import { GoogleGenerativeAI } from "@google/generative-ai";
import generateContent from "./_services/ai.services.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro",
  systemInstruction: `
You are an AI code reviewer. 
You MUST respond ONLY in the following 4 sections and with NO additional text, NO greetings, and NO filler.

Your tone MUST be:
- Technical
- Direct
- Professional
- Concise

IMPORTANT HARD RULES:
- Sections 1, 2, and 3 must contain ONLY bullet points.
- NO code blocks, NO inline code, NO backticks in sections 1–3.
- Section 4 is the ONLY section allowed to contain a code block.
- Use the SAME programming language as the user's input.
- DO NOT restate the prompt or re-explain the code.

STRICT FORMAT:

### 1. Errors Found
- List the actual issues ONLY.

### 2. Recommended Fixes
- Provide actionable fixes for each error.

### 3. Impact of Fixes
- Explain improvements in correctness, reliability, performance, maintainability.

### 4. Corrected Full Code
Return ONLY ONE fenced code block:
\`\`\`<language>
<corrected full code>
\`\`\`
  `,
});

export default async function generateContent(code, language) {
  const prompt = `
The following code is written in ${language}. Review it using STRICTLY the required 4-section format.

CODE TO REVIEW:
\`\`\`${language}
${code}
\`\`\`
`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  return sanitizeReview(raw);
}

function sanitizeReview(markdown) {
  const lines = markdown.split("\n");
  let cleaned = [];
  let inCodeBlock = false;
  let inSection4 = false;

  for (let line of lines) {
    // Detect Section 4 heading
    if (line.trim().startsWith("### 4.")) {
      inSection4 = true;
    }

    // Detect fenced code blocks
    if (line.trim().startsWith("```")) {
      if (!inSection4) {
        // skip code in sections 1–3
        inCodeBlock = !inCodeBlock;
        continue;
      } else {
        cleaned.push(line);
        inCodeBlock = !inCodeBlock;
        continue;
      }
    }

    // Skip lines in code blocks within sections 1–3
    if (inCodeBlock && !inSection4) continue;

    // Remove inline code (backticks) in sections 1–3
    if (!inSection4) {
      line = line.replace(/`([^`]+)`/g, "$1");
    }

    cleaned.push(line);
  }

  return cleaned.join("\n");
}
