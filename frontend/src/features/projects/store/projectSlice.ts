import type { StateCreator } from 'zustand';
import type { CollaborationRequest } from '../types';
import { mockRequests } from '../../../lib/mockData';

export interface ProjectSlice {
  requests: CollaborationRequest[];
  addRequest: (request: Omit<CollaborationRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateRequest: (id: string, updates: Partial<CollaborationRequest>) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const createProjectSlice: StateCreator<ProjectSlice, [], [], ProjectSlice> = (set) => ({
  requests: mockRequests,
  addRequest: (request) => set((state) => ({
    requests: [...state.requests, { ...request, id: generateId(), createdAt: new Date().toISOString(), status: 'pending' as const }]
  })),
  updateRequest: (id, updates) => set((state) => ({
    requests: state.requests.map(req => req.id === id ? { ...req, ...updates } : req)
  })),
});
