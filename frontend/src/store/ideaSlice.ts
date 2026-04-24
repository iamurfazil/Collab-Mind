import type { StateCreator } from 'zustand';

export interface IdeaSlice {
  ideas: any[];
  fetchIdeas: (token: string) => Promise<void>;
  addIdea: (idea: any, token: string) => Promise<void>;
}

export const createIdeaSlice: StateCreator<IdeaSlice, [], [], IdeaSlice> = (set) => ({
  ideas: [],
  fetchIdeas: async (token: string) => {
    const res = await fetch('http://localhost:5000/api/ideas', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const payload = await res.json();
      set({ ideas: Array.isArray(payload.data) ? payload.data : [] });
    }
  },
  addIdea: async (idea, token) => {
    const res = await fetch('http://localhost:5000/api/ideas', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(idea)
    });
    if (res.ok) {
      const payload = await res.json();
      set((state) => ({ ideas: [...state.ideas, payload.data] }));
    }
  }
});
