import type { StateCreator } from 'zustand';
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
  addFeedback: (feedback: any) => void;
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
  addFeedback: (feedback) => set((state) => ({
    feedbackList: [...state.feedbackList, { ...feedback, id: generateId(), status: 'pending', formattedDate: 'Just now' }]
  })),
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
