import type { StateCreator } from 'zustand';
import { API_BASE_URL } from '../config';

export interface CollaborationSlice {
  requests: any[];
  fetchRequests: (token: string) => Promise<void>;
  updateRequestStatus: (id: string, status: string, token: string) => Promise<void>;
}

export const createCollaborationSlice: StateCreator<CollaborationSlice, [], [], CollaborationSlice> = (set) => ({
  requests: [],
  fetchRequests: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/api/collaboration/requests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const payload = await res.json();
      set({ requests: Array.isArray(payload.data) ? payload.data : [] });
    }
  },
  updateRequestStatus: async (id, status, token) => {
    const res = await fetch(`${API_BASE_URL}/api/collaboration/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    // Optimistic update
    if (res.ok) {
      set((state) => ({
        requests: state.requests.map(r => r.id === id ? { ...r, status } : r)
      }));
    }
  }
});
