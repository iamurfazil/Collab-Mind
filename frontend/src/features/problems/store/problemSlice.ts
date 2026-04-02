import type { StateCreator } from 'zustand';
import type { Problem } from '../types';
import { mockProblems } from '../../../lib/mockData';

export interface ProblemSlice {
  ideas: Problem[]; // keeping 'ideas' as key to not break current UI logic too much, but typing as Problem[]
  addIdea: (idea: Omit<Problem, 'id' | 'createdAt' | 'collaborators'>) => void;
  updateIdea: (id: string, updates: Partial<Problem>) => void;
  deleteIdea: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const createProblemSlice: StateCreator<ProblemSlice, [], [], ProblemSlice> = (set) => ({
  ideas: mockProblems,
  addIdea: (idea) => set((state) => ({
    ideas: [...state.ideas, { ...idea, id: generateId(), createdAt: new Date().toISOString(), collaborators: [] }]
  })),
  updateIdea: (id, updates) => set((state) => ({
    ideas: state.ideas.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  deleteIdea: (id) => set((state) => ({
    ideas: state.ideas.filter(p => p.id !== id)
  })),
});
