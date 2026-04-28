import type { StateCreator } from 'zustand';
import { submitFeedback } from '../services/api';
type User = any;

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
  feedbackList: any[];
  addFeedback: (feedback: any) => Promise<void>;
  certificates: any[];
  addCertificate: (cert: any) => void;
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
  feedbackList: [
    {
      id: '1',
      userName: 'Arjun Mehta',
      message: 'Collab Mind helped me find a brilliant team for my sustainable energy project. The validation process is a game changer!',
      status: 'approved',
      formattedDate: '2 days ago'
    },
    {
      id: '2',
      userName: 'Sara Khan',
      message: 'As a builder, I love how easy it is to find real problems to solve. The skill matching is incredibly accurate.',
      status: 'approved',
      formattedDate: '1 week ago'
    },
    {
      id: '3',
      userName: 'Vikram Singh',
      message: 'The best platform for student innovation. Period.',
      status: 'approved',
      formattedDate: '3 days ago'
    }
  ],
  addFeedback: async (feedback) => {
    try {
      const result = await submitFeedback(feedback);
      if (result.success) {
        set((state) => ({
          feedbackList: [...state.feedbackList, result.data]
        }));
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  },
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
  },
  certificates: [],
  addCertificate: (cert: any) => set((state) => ({ certificates: [...state.certificates, cert] }))
});
