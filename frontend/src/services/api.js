const CLOUD_API_BASE_URL = 'https://collabmind-backend-995242116294.asia-south1.run.app';
const LOCAL_API_BASE_URL = 'http://localhost:5000';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || CLOUD_API_BASE_URL;

function normalizeBaseUrl(baseUrl) {
  return (baseUrl || '').trim().replace(/\/+$/, '');
}

function getApiBaseCandidates() {
  const candidates = new Set();

  if (API_BASE_URL) {
    candidates.add(normalizeBaseUrl(API_BASE_URL));
  }

  // In local Vite development, prioritize local backend if it's available.
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    candidates.add(LOCAL_API_BASE_URL);
  }

  candidates.add(CLOUD_API_BASE_URL);

  return Array.from(candidates).filter(Boolean);
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function requestWithFallback(path, options) {
  const candidates = getApiBaseCandidates();
  let lastHttpError = null;
  let lastNetworkError = null;

  for (const baseUrl of candidates) {
    try {
      const response = await fetch(new URL(path, baseUrl).toString(), options);
      const payload = await parseJsonSafe(response);

      if (!response.ok) {
        const errorMessage = payload?.message || `Request failed with status ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;

        // If one backend deployment doesn't have this route, try the next candidate.
        if (response.status === 404) {
          lastHttpError = error;
          continue;
        }

        throw error;
      }

      return payload;
    } catch (error) {
      if (error instanceof TypeError) {
        lastNetworkError = error;
        continue;
      }

      throw error;
    }
  }

  if (lastNetworkError) {
    throw new Error('Unable to reach backend. Please check VITE_API_BASE_URL and backend status.');
  }

  if (lastHttpError) {
    throw lastHttpError;
  }

  throw new Error('Unable to complete request.');
}

function resolveAuthToken(explicitToken) {
  if (explicitToken) {
    return explicitToken;
  }

  return localStorage.getItem('firebaseIdToken') || localStorage.getItem('authToken') || '';
}

export async function analyzeIdea(data, token) {
  const authToken = resolveAuthToken(token);

  if (!authToken) {
    throw new Error('Missing auth token. Please sign in again.');
  }

  return requestWithFallback('/api/cmvc/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(data),
  });
}

export async function askNexusAI(data, token) {
  const authToken = resolveAuthToken(token);

  if (!authToken) {
    throw new Error('Missing auth token. Please sign in again.');
  }

  return requestWithFallback('/api/chat/nexus', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(data),
  });
}
