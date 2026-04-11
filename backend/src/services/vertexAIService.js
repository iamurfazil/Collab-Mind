const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");

dotenv.config();

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GCP_PROJECT_ID,
  location: "us-central1"
});

async function analyzeIdeaWithAI(title, description) {
  try {
    console.log("VERTEX FUNCTION CALLED (GENAI)");

    const model =
      process.env.VERTEX_MODEL ||
      "publishers/google/models/gemini-1.5-flash";

    console.log("Using Vertex Model:", model);

    const prompt = `
    Analyze this startup idea and return JSON:

    Title: ${title}
    Description: ${description}

    Return ONLY JSON:
    {
      "problem": "",
      "industry": "",
      "target_users": "",
      "complexity": "low|medium|high"
    }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    console.log("FULL GEMINI RESPONSE:", JSON.stringify(response, null, 2));

    const text =
      response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    console.log("RAW GEMINI RESPONSE:", text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) throw new Error("No JSON found");

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error("[CMVC][GENAI ERROR]:", error.message);
    throw error;
  }
}

module.exports = { analyzeIdeaWithAI };
