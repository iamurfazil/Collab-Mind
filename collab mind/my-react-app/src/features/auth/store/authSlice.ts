import type { StateCreator } from 'zustand';
import type { User } from '../types';
import { mockUsers } from '../../../lib/mockData';

export interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, displayName: string, role: 'owner' | 'builder') => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
  deleteAccount: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const createAuthSlice: StateCreator<AuthSlice & any, [], [], AuthSlice> = (set, get) => ({
  user: null,
  isAuthenticated: false,
  login: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser = mockUsers.find(u => u.email === email);
    if (mockUser) {
      set({ user: mockUser, isAuthenticated: true });
      return true;
    }
    const storedUser = get().user;
    if (storedUser && storedUser.email === email) {
      set({ user: storedUser, isAuthenticated: true });
      return true;
    }
    return false;
  },
  loginWithGoogle: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({ user: mockUsers[0], isAuthenticated: true });
    return true;
  },
  logout: () => {
    set({ user: null, isAuthenticated: false, activeSection: 'overview' });
  },
  register: async (email, password, displayName, role) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser: User = {
      id: generateId(),
      email,
      displayName,
      bio: '',
      skills: [],
      role,
      isVerified: false,
      membership: 'free',
      joinDate: new Date().toISOString().split('T')[0],
      problemsPosted: 0,
      activeProjects: 0,
      completedProjects: 0,
      trustScore: 50
    };
    set({ user: newUser, isAuthenticated: true });
    return true;
  },
  resetPassword: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  },
  updateUser: (updates) => set((state: any) => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),
  deleteAccount: () => {
    set({ user: null, isAuthenticated: false });
  }
});
