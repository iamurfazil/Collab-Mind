const { analyzeIdeaWithAI } = require('../../services/vertexAIService');

async function analyzeIdea(titleOrPayload, description) {
  const payload =
    titleOrPayload && typeof titleOrPayload === 'object'
      ? titleOrPayload
      : { title: titleOrPayload, description };
  const title = payload?.title || '';
  const details = payload?.description || '';

  console.log("CMVC: calling Vertex AI...");
  const aiAnalysis = await analyzeIdeaWithAI(title, details);
  console.log("AI RESULT:", aiAnalysis);

  // Basic keyword-based demand detection
  const keywords = details.toLowerCase();

  let demand_score = 5;

  if (keywords.includes("ai") || keywords.includes("automation")) {
    demand_score += 2;
  }

  if (keywords.includes("student") || keywords.includes("education")) {
    demand_score += 1;
  }

  if (keywords.includes("problem") || keywords.includes("difficulty")) {
    demand_score += 1;
  }

  if (demand_score > 10) demand_score = 10;

  // Feasibility logic
  let technical = 6;
  let operational = 6;
  let economic = 6;

  if (keywords.includes("hardware")) {
    technical -= 2;
  }

  if (keywords.includes("ai")) {
    technical -= 1;
  }

  // Risk logic
  let risk_score = 4;

  if (keywords.includes("medical") || keywords.includes("finance")) {
    risk_score += 2;
  }

  const risk_level = risk_score > 6 ? "high" : "medium";

  // Value Density
  const value_density = ((demand_score * 0.6) + (10 - risk_score) * 0.4).toFixed(1);

  // Final Score
  const final_score = (
    (demand_score * 0.3) +
    (((technical + operational + economic) / 3) * 0.3) +
    (value_density * 0.3) -
    (risk_score * 0.1)
  ).toFixed(1);

  let label = "Low Potential";

  if (final_score > 7) label = "High Potential";
  else if (final_score > 5) label = "Medium Potential";

  return {
    idea_summary: title,
    problem_validation: "basic-detected",
    market_analysis: {
      demand_score
    },
    competition: {
      similarity_score: 0
    },
    feasibility: {
      technical,
      operational,
      economic
    },
    value_density: Number(value_density),
    risk: {
      level: risk_level,
      risk_score: risk_score
    },
    ai_analysis: aiAnalysis,
    final_score: Number(final_score),
    label
  };
}

module.exports = {
  analyzeIdea
};