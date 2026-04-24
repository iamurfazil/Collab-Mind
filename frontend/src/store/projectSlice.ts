import type { StateCreator } from 'zustand';
import { API_BASE_URL } from '../config';

export interface ProjectSlice {
  projects: any[];
  fetchProjects: (token: string) => Promise<void>;
  createTask: (projectId: string, task: any, token: string) => Promise<void>;
  updateTask: (projectId: string, taskId: string, status: string, token: string) => Promise<void>;
}

export const createProjectSlice: StateCreator<ProjectSlice, [], [], ProjectSlice> = (set) => ({
  projects: [],
  fetchProjects: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/api/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const payload = await res.json();
      set({ projects: Array.isArray(payload.data) ? payload.data : [] });
    }
  },
  createTask: async (projectId: string, task: any, token: string) => {
    const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (res.ok) {
      const payload = await res.json();
      set((state) => ({
        projects: state.projects.map(p => 
          p.id === projectId ? { ...p, tasks: [...(p.tasks || []), payload.data] } : p
        )
      }));
    }
  },
  updateTask: async (projectId: string, taskId: string, status: string, token: string) => {
    const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      set((state) => ({
        projects: state.projects.map(p => 
          p.id === projectId ? {
            ...p, 
            tasks: (p.tasks || []).map((t: any) => t.id === taskId ? { ...t, status } : t)
          } : p
        )
      }));
    }
  }
});
