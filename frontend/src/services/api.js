export async function analyzeIdea(data, token) {
  if (!token) {
    throw new Error('Missing auth token. Please sign in again.');
  }

  const res = await fetch('http://localhost:5000/api/cmvc/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const payload = await res.json();

  if (!res.ok) {
    throw new Error(payload?.message || 'Failed to analyze idea');
  }

  return payload;
}
