import { auth } from '../lib/firebase.ts';
import { getIdToken } from 'firebase/auth';

import { API_BASE_URL, CLOUD_API_BASE_URL, LOCAL_API_BASE_URL } from '../config';

function normalizeBaseUrl(baseUrl) {
  return (baseUrl || '').trim().replace(/\/+$/, '');
}

async function getFreshToken() {
  if (!auth.currentUser) {
    return localStorage.getItem('firebaseIdToken') || localStorage.getItem('authToken') || '';
  }

  try {
    return await getIdToken(auth.currentUser, true);
  } catch (error) {
    console.warn('Failed to refresh token from Firebase:', error);
    return localStorage.getItem('firebaseIdToken') || localStorage.getItem('authToken') || '';
  }
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
  let authToken = token;
  
  if (!authToken) {
    authToken = await getFreshToken();
  }

  if (!authToken) {
    throw new Error('Missing auth token. Please sign in again.');
  }

  console.log('[API] analyzeIdea payload:', data);

  const payload = await requestWithFallback('/api/cmvc/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!payload?.success || !payload?.data) {
    throw new Error(payload?.message || 'Analysis failed');
  }

  return payload.data;
}

export async function askNexusAI(data, token) {
  let authToken = token;
  
  if (!authToken) {
    authToken = await getFreshToken();
  }

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

export async function getAdminDashboard(token) {
  let authToken = token;
  
  if (!authToken) {
    authToken = await getFreshToken();
  }

  if (!authToken) {
    throw new Error('Missing auth token. Please sign in again.');
  }

  return requestWithFallback('/api/admin/dashboard', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
}

export async function updateAdminUserRole(userId, role, token) {
  let authToken = token;
  
  if (!authToken) {
    authToken = await getFreshToken();
  }

  if (!authToken) {
    throw new Error('Missing auth token. Please sign in again.');
  }

  return requestWithFallback(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ role }),
  });
}

export async function requestPatent(ideaId, ideaTitle, token) {
  let authToken = token;
  
  if (!authToken) {
    authToken = await getFreshToken();
  }

  if (!authToken) {
    throw new Error('Missing auth token. Please sign in again.');
  }

  return requestWithFallback('/api/patent/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ ideaId, ideaTitle }),
  });
}

export async function createCollaborationRequest(data, token) {
  let authToken = token;
  
  if (!authToken) {
    authToken = await getFreshToken();
  }

  if (!authToken) {
    throw new Error('Missing auth token. Please sign in again.');
  }

  return requestWithFallback('/api/collaboration/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(data),
  });
}

export async function listCollaborationRequests(scope, token) {
  let authToken = token;
  
  if (!authToken) {
    authToken = await getFreshToken();
  }

  if (!authToken) {
    throw new Error('Missing auth token. Please sign in again.');
  }

  const params = new URLSearchParams();
  if (scope) {
    params.set('scope', scope);
  }

  const query = params.toString();
  const path = query ? `/api/collaboration?${query}` : '/api/collaboration';

  return requestWithFallback(path, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
}

export async function updateCollaborationRequest(requestId, status, token) {
  let authToken = token;
  
  if (!authToken) {
    authToken = await getFreshToken();
  }

  if (!authToken) {
    throw new Error('Missing auth token. Please sign in again.');
  }

  return requestWithFallback(`/api/collaboration/status/${requestId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ status }),
  });
}
export async function submitFeedback(data) {
  // Map userName to name for the backend
  const payload = {
    name: data.userName,
    email: data.email,
    message: data.message,
    category: data.category,
  };

  return requestWithFallback('/api/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}
