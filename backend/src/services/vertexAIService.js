const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");

dotenv.config();

let aiClient = null;
let usingVertexAI = false;

function isVertexConfigured() {
  return Boolean(process.env.GCP_PROJECT_ID);
}

function getConfiguredLocation() {
  return process.env.VERTEX_LOCATION || "us-central1";
}

function getModelForMode() {
  if (process.env.GEMINI_MODEL) {
    return process.env.GEMINI_MODEL;
  }

  if (process.env.VERTEX_MODEL) {
    return process.env.VERTEX_MODEL;
  }

  return usingVertexAI
    ? "publishers/google/models/gemini-1.5-flash"
    : "gemini-2.5-flash";
}

function getAIClient() {
  if (aiClient) {
    return aiClient;
  }

  const apiKey = process.env.GOOGLE_API_KEY;

  if (apiKey) {
    usingVertexAI = false;
    aiClient = new GoogleGenAI({ apiKey });
    return aiClient;
  }

  if (!isVertexConfigured()) {
    throw new Error("Missing GOOGLE_API_KEY or GCP_PROJECT_ID for Gemini client configuration");
  }

  usingVertexAI = true;
  aiClient = new GoogleGenAI({
    vertexai: true,
    project: process.env.GCP_PROJECT_ID,
    location: getConfiguredLocation(),
  });

  return aiClient;
}

async function analyzeIdeaWithAI(title, description) {
  try {
    getAIClient();
    const model = process.env.VERTEX_MODEL || "gemini-2.5-flash";

    const prompt = `
Return ONLY valid JSON. No text outside JSON.

{
  "problem": "...",
  "industry": "...",
  "target_users": "...",
  "complexity": "low|medium|high"
}

Title: ${title}
Description: ${description}
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

    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("AI RAW:", text);

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) throw new Error("Invalid AI response format");

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
Prioritize startup growth and early traction: finding first users, rapid validation, and low-cost acquisition.
When useful, include:
- 3 immediate next actions
- 2 user acquisition experiments
- 1 retention improvement
Return plain text with short sections and bullets.`;
  }

  return `You are CollabMind Nexus, an AI assistant for Builders.
Help users discover fitting ideas, craft strong proposals, estimate effort, and ask the right clarifying questions.
Always be practical, concise, and actionable.
Prioritize startup shipping speed and growth support: MVP-first development, onboarding flow, analytics, and retention loops.
When useful, include:
- 3 build priorities for this week
- 2 growth-oriented product improvements
- 1 technical risk to monitor
Return plain text with short sections and bullets.`;
}

async function generateNexusAIReply({ role, message, history = [], contextSummary = '', userId = '' }) {
  try {
    getAIClient();
    const model = getModelForMode();
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
