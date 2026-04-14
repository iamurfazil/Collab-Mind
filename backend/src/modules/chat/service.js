const { generateNexusAIReply } = require('../../services/vertexAIService');

function getStatus() {
  return {
    module: 'chat',
    status: 'ready',
    notes: 'Real-time messaging, moderation, and AI chat hooks belong here.',
  };
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => item && typeof item.content === 'string' && item.content.trim())
    .slice(-10)
    .map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: item.content.trim(),
    }));
}

function buildContextSummary(context) {
  if (!context || typeof context !== 'object') {
    return '';
  }

  const summary = [];

  if (context.projectTitle) {
    summary.push(`Project: ${context.projectTitle}`);
  }

  if (context.skills && Array.isArray(context.skills) && context.skills.length > 0) {
    summary.push(`Skills: ${context.skills.slice(0, 8).join(', ')}`);
  }

  if (context.goal) {
    summary.push(`Goal: ${context.goal}`);
  }

  return summary.join(' | ');
}

async function generateNexusReply({ role, message, history, context, userId }) {
  const safeRole = role === 'owner' ? 'owner' : 'builder';
  const contextSummary = buildContextSummary(context);
  const cleanedHistory = normalizeHistory(history);

  return generateNexusAIReply({
    role: safeRole,
    message,
    history: cleanedHistory,
    contextSummary,
    userId,
  });
}

module.exports = { getStatus, generateNexusReply };
