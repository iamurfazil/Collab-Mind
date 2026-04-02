import type { StateCreator } from 'zustand';
import type { User } from '../features/auth/types';

export interface UISlice {
  darkMode: boolean;
  toggleTheme: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  profileToView: User | null;
  setProfileToView: (user: User | null) => void;
  notifications: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  darkMode: false,
  toggleTheme: () => set((state) => ({ darkMode: !state.darkMode })),
  activeSection: 'overview',
  setActiveSection: (section) => set({ activeSection: section }),
  showProfileModal: false,
  setShowProfileModal: (show) => set({ showProfileModal: show }),
  profileToView: null,
  setProfileToView: (user) => set({ profileToView: user, showProfileModal: !!user }),
  notifications: [],
  addNotification: (message, type) => {
    const id = generateId();
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }]
    }));
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      }));
    }, 5000);
  }
});
