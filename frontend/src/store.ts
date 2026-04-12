import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './lib/firebase';

interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  bio: string;
  skills: string[];
  avatar?: string;
  role: 'owner' | 'builder';
  profession?: 'student' | 'freelancer' | 'professional';
  collegeName?: string;
  stream?: string;
  courseYear?: string;
  semester?: string;
  orgName?: string;
  city?: string;
  state?: string;
  isVerified: boolean;
  membership: 'free' | 'premium';
  joinDate: string;
  problemsPosted: number;
  activeProjects: number;
  completedProjects: number;
  trustScore: number;
}

// --- NEW INTERFACE FOR AI REPORT ---
export interface CMVCReport {
  idea_summary: string;
  problem_validation: string;
  market_analysis: { demand_score: number };
  competition: { similarity_score: number; similar_examples: string[] };
  feasibility: { technical: number; operational: number; economic: number };
  value_density: number;
  risk: { level: string; risk_score: number };
  ai_analysis?: {
    problem?: string;
    industry?: string;
    target_users?: string;
    complexity?: string;
  };
  final_score: number;
  label: string;
}

interface Idea {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  expectations: string;
  status: 'open' | 'in_review' | 'pending_review' | 'completed';
  progress?: number;
  projectStatus?: string;
  dueDate?: string;
  createdAt: string;
  collaborators: string[];
  isPublished: boolean;
  cmvcReport?: CMVCReport; // Added report storage
}

interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  timestamp: string;
}

interface CollaborationRequest {
  id: string;
  ideaId: string;
  ideaTitle: string;
  requesterId: string;
  requesterName: string;
  ownerId: string; 
  answer: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Feedback {
  id: string;
  userName: string;
  email: string;
  category: string;
  message: string;
  contactPermission: boolean;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  formattedDate: string;
}

interface Certificate {
  id: string;
  userId: string;
  projectId: string;
  projectTitle: string;
  earnedAt: string;
  type: 'completion' | 'excellence' | 'innovation';
  completionScore: number;
  excellenceScore: number;
  innovationScore: number;
}

interface AppState {
  darkMode: boolean;
  toggleTheme: () => void;
  
  user: User | null;
  authToken: string | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  initializeAuth: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, displayName: string, role: 'owner' | 'builder') => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
  deleteAccount: () => void;
  
  ideas: Idea[];
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'collaborators'>) => void;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  
  requests: CollaborationRequest[];
  addRequest: (request: Omit<CollaborationRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateRequest: (id: string, updates: Partial<CollaborationRequest>) => void;
  
  chats: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  
  feedbackList: Feedback[];
  addFeedback: (feedback: Omit<Feedback, 'id' | 'timestamp' | 'status' | 'formattedDate'>) => void;
  
  certificates: Certificate[];

  addCertificate: (certificate: Omit<Certificate, 'id'>) => void;
  
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

const BACKEND_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://collabmind-backend-995242116294.asia-south1.run.app';
const FIREBASE_TOKEN_KEY = 'firebaseIdToken';

function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(FIREBASE_TOKEN_KEY, token);
    localStorage.setItem('authToken', token);
    return;
  }

  localStorage.removeItem(FIREBASE_TOKEN_KEY);
  localStorage.removeItem('authToken');
}

function mapFirebaseUserToAppUser(firebaseUser: FirebaseUser, role: 'owner' | 'builder' = 'builder'): User {
  return {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || firebaseUser.email || 'User',
    bio: '',
    skills: [],
    role,
    isVerified: firebaseUser.emailVerified,
    membership: 'free',
    joinDate: new Date().toISOString().split('T')[0],
    problemsPosted: 0,
    activeProjects: 0,
    completedProjects: 0,
    trustScore: 50,
  };
}

async function syncAuthenticatedUser(firebaseUser: FirebaseUser): Promise<string> {
  const token = await firebaseUser.getIdToken();

  try {
    const response = await fetch(new URL('/api/auth/me', BACKEND_BASE_URL).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Auth sync endpoint /api/auth/me not found. Continuing with Firebase-only auth.');
        return token;
      }

      let message = 'Failed to save user profile';
      try {
        const payload = await response.json();
        if (payload?.message) {
          message = payload.message;
        }
      } catch {
        // keep default message
      }

      throw new Error(message);
    }
  } catch (error) {
    if (error instanceof TypeError) {
      console.warn('Auth profile sync unreachable. Continuing with Firebase-only auth.');
      return token;
    }

    throw error;
  }

  return token;
}

const mockIdeas: Idea[] = [
  {
    id: 'idea1',
    userId: 'user1',
    userName: 'Alex Chen',
    title: 'AI-Powered Study Companion',
    description: 'A smart study assistant that helps students organize their learning materials, track progress, and get personalized recommendations.',
    expectations: 'Looking for developers skilled in React, Python, and machine learning integration.',
    status: 'open',
    dueDate: '2024-06-01',
    createdAt: '2024-01-20',
    collaborators: [],
    isPublished: true,
    cmvcReport: {
      idea_summary: 'AI-driven analysis of "AI-Powered Study Companion"',
      problem_validation: "Strong market indicator found in recent search trends. The problem space shows a 24% YoY growth in developer queries.",
      market_analysis: { demand_score: 8.5 },
      competition: { similarity_score: 0.62, similar_examples: ["Startup Alpha", "Beta Solutions"] },
      feasibility: { technical: 7.5, operational: 6.0, economic: 8.0 },
      value_density: 8.2,
      risk: { level: "low", risk_score: 3.5 },
      final_score: 8.1,
      label: "High Potential"
    }
  },
  {
    id: 'idea2',
    userId: 'user1',
    userName: 'Alex Chen',
    title: 'Sustainable Living Tracker',
    description: 'Mobile app to track carbon footprint and suggest eco-friendly alternatives in daily life.',
    expectations: 'Need mobile developers with experience in React Native and sustainability APIs.',
    status: 'in_review',
    createdAt: '2024-02-10',
    collaborators: ['user2'],
    isPublished: true
  },
  {
    id: 'idea3',
    userId: 'user2',
    userName: 'Sarah Johnson',
    title: 'Community Skill Exchange',
    description: 'Platform connecting people to share and learn skills from each other through collaborative projects.',
    expectations: 'Looking for designers and frontend developers to create an engaging user experience.',
    status: 'open',
    createdAt: '2024-02-15',
    collaborators: [],
    isPublished: true
  }
];

const mockRequests: CollaborationRequest[] = [
  {
    id: 'req1',
    ideaId: 'idea1',
    ideaTitle: 'AI-Powered Study Companion',
    requesterId: 'user2',
    requesterName: 'Sarah Johnson',
    ownerId: 'user1',
    answer: 'I have 3 years of experience with React and Python. I have built similar educational platforms before.',
    status: 'pending',
    createdAt: '2024-02-18'
  }
];

const mockChats: ChatMessage[] = [
  {
    id: 'chat1',
    projectId: 'idea2',
    senderId: 'user1',
    senderName: 'Alex Chen',
    content: 'Hi Sarah! Thanks for joining the project. Let me share the initial specs.',
    timestamp: '2024-02-10T10:00:00'
  },
  {
    id: 'chat2',
    projectId: 'idea2',
    senderId: 'user2',
    senderName: 'Sarah Johnson',
    content: 'Thanks for having me! I have reviewed the requirements. Should we start with the data models?',
    timestamp: '2024-02-10T10:15:00'
  }
];

const mockFeedback: Feedback[] = [
  {
    id: 'fb1',
    userName: 'Michael Brown',
    email: 'michael@example.com',
    category: 'testimonial',
    message: 'Collab Mind changed how I approach problem-solving. Found amazing collaborators for my startup idea!',
    contactPermission: true,
    status: 'approved',
    timestamp: '2024-01-15',
    formattedDate: 'January 15, 2024'
  },
  {
    id: 'fb2',
    userName: 'Emily Davis',
    email: 'emily@example.com',
    category: 'testimonial',
    message: 'As a student builder, this platform gave me real-world project experience. Highly recommended!',
    contactPermission: true,
    status: 'approved',
    timestamp: '2024-02-01',
    formattedDate: 'February 1, 2024'
  },
  {
    id: 'fb3',
    userName: 'James Wilson',
    email: 'james@example.com',
    category: 'testimonial',
    message: 'The matching system is impressive. Got connected with exactly the right team for my project.',
    contactPermission: false,
    status: 'approved',
    timestamp: '2024-02-10',
    formattedDate: 'February 10, 2024'
  }
];

const mockCertificates: Certificate[] = [
  {
    id: 'cert1',
    userId: 'user1',
    projectId: 'proj1',
    projectTitle: 'EcoTrack Dashboard',
    earnedAt: '2024-01-20',
    type: 'completion',
    completionScore: 5,
    excellenceScore: 4,
    innovationScore: 5
  },
  {
    id: 'cert2',
    userId: 'user1',
    projectId: 'proj2',
    projectTitle: 'HealthHub App',
    earnedAt: '2024-02-05',
    type: 'excellence',
    completionScore: 5,
    excellenceScore: 5,
    innovationScore: 4
  }
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      authToken: null,
      isAuthenticated: false,
      isAuthReady: false,

      initializeAuth: () => {
        if (get().isAuthReady) {
          return;
        }

        onIdTokenChanged(auth, async firebaseUser => {
          if (!firebaseUser) {
            setStoredToken(null);
            set({ user: null, authToken: null, isAuthenticated: false, isAuthReady: true });
            return;
          }

          try {
            const token = await syncAuthenticatedUser(firebaseUser);
            const existingRole = get().user?.role;
            const user = mapFirebaseUserToAppUser(firebaseUser, existingRole || 'builder');

            setStoredToken(token);
            set({ user, authToken: token, isAuthenticated: true, isAuthReady: true });
          } catch {
            setStoredToken(null);
            set({ user: null, authToken: null, isAuthenticated: false, isAuthReady: true });
          }
        });
      },
      
      login: async (email: string, password: string) => {
        const credentials = await signInWithEmailAndPassword(auth, email, password);
        const token = await syncAuthenticatedUser(credentials.user);

        const existingRole = get().user?.role;
        const user = mapFirebaseUserToAppUser(credentials.user, existingRole || 'builder');
        console.log('USER:', user);
        console.log('TOKEN:', token);

        setStoredToken(token);
        set({ user, authToken: token, isAuthenticated: true, isAuthReady: true });
        return true;
      },
      
      loginWithGoogle: async () => {
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        const token = await syncAuthenticatedUser(result.user);

        const existingRole = get().user?.role;
        const user = mapFirebaseUserToAppUser(result.user, existingRole || 'builder');
        console.log('USER:', user);
        console.log('TOKEN:', token);

        setStoredToken(token);
        set({ user, authToken: token, isAuthenticated: true, isAuthReady: true });
        return true;
      },
      
      logout: () => {
        void signOut(auth);
        setStoredToken(null);
        set({ user: null, authToken: null, isAuthenticated: false, isAuthReady: true, activeSection: 'overview' });
      },
      
      register: async (email: string, password: string, displayName: string, role: 'owner' | 'builder') => {
        const credentials = await createUserWithEmailAndPassword(auth, email, password);

        if (displayName.trim()) {
          await updateProfile(credentials.user, { displayName: displayName.trim() });
        }

        const currentUser = auth.currentUser || credentials.user;
        const token = await syncAuthenticatedUser(currentUser);

        const user = mapFirebaseUserToAppUser(currentUser, role);
        console.log('USER:', user);
        console.log('TOKEN:', token);
        setStoredToken(token);
        set({ user, authToken: token, isAuthenticated: true, isAuthReady: true });
        return true;
      },
      
      resetPassword: async (email: string) => {
        await sendPasswordResetEmail(auth, email);
        return true;
      },
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      deleteAccount: () => {
        setStoredToken(null);
        set({ user: null, authToken: null, isAuthenticated: false, isAuthReady: true });
      },
      
      ideas: mockIdeas,
      addIdea: (idea) => set((state) => ({
        ideas: [...state.ideas, { ...idea, id: generateId(), createdAt: new Date().toISOString(), collaborators: [] }]
      })),
      updateIdea: (id, updates) => set((state) => ({
        ideas: state.ideas.map(idea => idea.id === id ? { ...idea, ...updates } : idea)
      })),
      deleteIdea: (id) => set((state) => ({
        ideas: state.ideas.filter(idea => idea.id !== id)
      })),
      
      requests: mockRequests,
      addRequest: (request) => set((state) => ({
        requests: [...state.requests, { ...request, id: generateId(), createdAt: new Date().toISOString(), status: 'pending' as const }]
      })),
      updateRequest: (id, updates) => set((state) => ({
        requests: state.requests.map(req => req.id === id ? { ...req, ...updates } : req)
      })),
      
      chats: mockChats,
      addMessage: (message) => set((state) => ({
        chats: [...state.chats, { ...message, id: generateId(), timestamp: new Date().toISOString() }]
      })),
      
      feedbackList: mockFeedback,
      addFeedback: (feedback) => set((state) => ({
        feedbackList: [...state.feedbackList, { 
          ...feedback, 
          id: generateId(), 
          timestamp: new Date().toISOString(),
          formattedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          status: 'pending' as const
        }]
      })),
      
      certificates: mockCertificates,

      addCertificate: (certificate) =>
  set((state) => ({
    certificates: [
      ...state.certificates,
      { ...certificate, id: generateId() }
    ]
  })),
      
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
            notifications: state.notifications.filter(n => n.id !== id)
          }));
        }, 5000);
      }
    }),
    {
      name: 'collab-mind-storage',
      partialize: (state) => ({ 
        user: state.user,
        authToken: state.authToken,
        isAuthenticated: state.isAuthenticated,
        isAuthReady: state.isAuthReady,
        ideas: state.ideas,
        requests: state.requests,
        chats: state.chats,
        feedbackList: state.feedbackList,
        certificates: state.certificates
      })
    }
  )
);