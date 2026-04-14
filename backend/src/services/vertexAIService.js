const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");

dotenv.config();

let aiClient = null;

function getAIClient() {
  if (aiClient) {
    return aiClient;
  }

  aiClient = new GoogleGenAI({
    vertexai: true,
    project: process.env.GCP_PROJECT_ID,
    location: "us-central1"
  });

  return aiClient;
}

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

    const response = await getAIClient().models.generateContent({
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

function buildRoleSystemPrompt(role) {
  if (role === 'owner') {
    return `You are CollabMind Nexus, an AI assistant for Idea Posters (problem owners).
Help users refine ideas, define scope, break work into milestones, and evaluate builders.
Always be practical, concise, and actionable.
Return plain text with short sections and bullets when useful.`;
  }

  return `You are CollabMind Nexus, an AI assistant for Builders.
Help users discover fitting ideas, craft strong proposals, estimate effort, and ask the right clarifying questions.
Always be practical, concise, and actionable.
Return plain text with short sections and bullets when useful.`;
}

async function generateNexusAIReply({ role, message, history = [], contextSummary = '', userId = '' }) {
  try {
    const model = process.env.VERTEX_MODEL || 'publishers/google/models/gemini-1.5-flash';
    const systemPrompt = buildRoleSystemPrompt(role);

    const historyText = history
      .map((item) => `${item.role === 'assistant' ? 'Assistant' : 'User'}: ${item.content}`)
      .join('\n');

    const prompt = `
${systemPrompt}

Session context:
- Role: ${role}
- User ID: ${userId || 'unknown'}
- Additional context: ${contextSummary || 'none'}

Recent conversation:
${historyText || 'No previous messages.'}

User message:
${message}

Respond as CollabMind Nexus. End with one suggested next action.`;

    const response = await getAIClient().models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    return text.trim();
  } catch (error) {
    console.error('[NEXUS][GENAI ERROR]:', error.message);
    throw error;
  }
}

module.exports = { analyzeIdeaWithAI, generateNexusAIReply };
