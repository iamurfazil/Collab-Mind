const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000';

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

  const res = await fetch(new URL('/api/cmvc/analyze', API_BASE_URL).toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(data),
  });

  const payload = await res.json();

  if (!res.ok) {
    throw new Error(payload?.message || 'Failed to analyze idea');
  }

  return payload;
}
