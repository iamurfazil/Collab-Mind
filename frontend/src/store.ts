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
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { createCollaborationRequest, updateCollaborationRequest, requestPatent as apiRequestPatent } from './services/api';

interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  bio: string;
  skills: string[];
  avatar?: string;
  role: 'owner' | 'builder' | 'admin';
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
  status: 'draft' | 'patent' | 'in_patent' | 'open' | 'in_review' | 'in_progress' | 'pending_review' | 'completed';
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
  requesterEmail?: string;
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
  register: (email: string, password: string, displayName: string, role: 'owner' | 'builder' | 'admin') => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
  deleteAccount: () => void;
  
  ideas: Idea[];
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt'> & { collaborators?: string[] }) => Promise<Idea | null>;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  replaceIdea: (idea: Idea) => void;
  requestPatent: (ideaId: string, summary: string) => Promise<void>;
  
  requests: CollaborationRequest[];
  addRequest: (request: { ideaId: string; answer: string }) => Promise<CollaborationRequest | null>;
  updateRequest: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  
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
  (import.meta.env.DEV
    ? 'http://localhost:5000'
    : 'https://collabmind-backend-995242116294.asia-south1.run.app');
const FIREBASE_TOKEN_KEY = 'firebaseIdToken';

let collaborationUnsubscribe: Unsubscribe | null = null;

function stopCollaborationListener() {
  if (collaborationUnsubscribe) {
    collaborationUnsubscribe();
    collaborationUnsubscribe = null;
  }
}

function normalizeRequestTimestamp(value: any): string {
  if (!value) {
    return new Date().toISOString();
  }
  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function startCollaborationListener(user: User | null, setState: (state: Partial<AppState>) => void) {
  stopCollaborationListener();

  if (!user) {
    setState({ requests: [] });
    return;
  }

  const field = user.role === 'owner' ? 'ownerId' : 'requesterId';
  const requestsQuery = query(
    collection(db, 'collaboration_requests'),
    where(field, '==', user.id),
    orderBy('createdAt', 'desc')
  );

  collaborationUnsubscribe = onSnapshot(requestsQuery, (snapshot) => {
    const requests = snapshot.docs.map((doc) => {
      const raw = doc.data();
      return {
        id: doc.id,
        ideaId: raw.ideaId || '',
        ideaTitle: raw.ideaTitle || '',
        requesterId: raw.requesterId || '',
        requesterName: raw.requesterName || 'Builder',
        requesterEmail: raw.requesterEmail || '',
        ownerId: raw.ownerId || raw.projectOwnerId || '',
        answer: raw.answer || '',
        status: raw.status || 'pending',
        createdAt: normalizeRequestTimestamp(raw.createdAt),
      } as CollaborationRequest;
    });

    setState({ requests });
  });
}

function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(FIREBASE_TOKEN_KEY, token);
    localStorage.setItem('authToken', token);
    return;
  }

  localStorage.removeItem(FIREBASE_TOKEN_KEY);
  localStorage.removeItem('authToken');
}

function mapFirebaseUserToAppUser(firebaseUser: FirebaseUser, role: 'owner' | 'builder' | 'admin' = 'builder'): User {
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

type SyncedUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  role?: 'owner' | 'builder' | 'admin';
  city?: string | null;
  state?: string | null;
};

function resolveRoleWithFallback(
  syncedRole?: 'owner' | 'builder' | 'admin',
  claimRole?: unknown,
): 'owner' | 'builder' | 'admin' {
  if (syncedRole === 'owner' || syncedRole === 'builder' || syncedRole === 'admin') {
    return syncedRole;
  }

  if (claimRole === 'owner' || claimRole === 'builder' || claimRole === 'admin') {
    return claimRole;
  }

  return 'builder';
}

function buildUserFromBackend(
  firebaseUser: FirebaseUser,
  syncedUser?: SyncedUser | null,
  claimRole?: unknown,
): User {
  const role = resolveRoleWithFallback(syncedUser?.role, claimRole);

  return {
    ...mapFirebaseUserToAppUser(firebaseUser, role),
    email: syncedUser?.email || firebaseUser.email || '',
    displayName: syncedUser?.displayName || firebaseUser.displayName || firebaseUser.email || 'User',
    city: syncedUser?.city || '',
    state: syncedUser?.state || '',
  };
}

async function syncAuthenticatedUser(
  firebaseUser: FirebaseUser,
  extraPayload: Record<string, unknown> = {},
): Promise<{ token: string; user: SyncedUser | null; claimRole?: unknown }> {
  const token = await firebaseUser.getIdToken(true);
  const tokenResult = await firebaseUser.getIdTokenResult();
  const claimRole = tokenResult?.claims?.role;

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
        ...extraPayload,
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Auth sync endpoint /api/auth/me not found. Continuing with Firebase-only auth.');
        return { token, user: null, claimRole };
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

    const payload = await parseJsonSafe(response);
    return { token, user: payload?.data || null, claimRole };
  } catch (error) {
    if (error instanceof TypeError) {
      console.warn('Auth profile sync unreachable. Continuing with Firebase-only auth.');
      return { token, user: null, claimRole };
    }

    throw error;
  }
}

async function parseJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchIdeasFromBackend(token: string): Promise<Idea[] | null> {
  try {
    const response = await fetch(new URL('/api/ideas', BACKEND_BASE_URL).toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Ideas endpoint /api/ideas not found. Keeping local ideas.');
        return null;
      }
      throw new Error(`Failed to fetch ideas (${response.status})`);
    }

    const payload = await parseJsonSafe(response);
    if (!payload?.success || !Array.isArray(payload.data)) {
      return null;
    }

    return payload.data as Idea[];
  } catch (error) {
    if (error instanceof TypeError) {
      console.warn('Ideas backend unreachable. Keeping local ideas.');
      return null;
    }
    console.warn('Failed to sync ideas:', error);
    return null;
  }
}

async function createIdeaInBackend(token: string, idea: Omit<Idea, 'id' | 'createdAt'> & { createdAt?: string }) {
  const response = await fetch(new URL('/api/ideas', BACKEND_BASE_URL).toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(idea),
  });

  const payload = await parseJsonSafe(response);
  if (!response.ok || !payload?.success || !payload?.data) {
    throw new Error(payload?.message || 'Failed to create idea');
  }

  return payload.data as Idea;
}

async function updateIdeaInBackend(token: string, id: string, updates: Partial<Idea>) {
  const response = await fetch(new URL(`/api/ideas/${id}`, BACKEND_BASE_URL).toString(), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  const payload = await parseJsonSafe(response);
  if (!response.ok || !payload?.success || !payload?.data) {
    throw new Error(payload?.message || 'Failed to update idea');
  }

  return payload.data as Idea;
}

async function deleteIdeaInBackend(token: string, id: string) {
  const response = await fetch(new URL(`/api/ideas/${id}`, BACKEND_BASE_URL).toString(), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await parseJsonSafe(response);
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || 'Failed to delete idea');
  }
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
            stopCollaborationListener();
            set({ user: null, authToken: null, isAuthenticated: false, isAuthReady: true, ideas: [], requests: [] });
            return;
          }

          try {
            const { token, user: syncedUser, claimRole } = await syncAuthenticatedUser(firebaseUser);
            const user = buildUserFromBackend(firebaseUser, syncedUser, claimRole);
            const syncedIdeas = await fetchIdeasFromBackend(token);

            setStoredToken(token);
            set({
              user,
              authToken: token,
              isAuthenticated: true,
              isAuthReady: true,
              ideas: syncedIdeas ?? get().ideas,
            });
            startCollaborationListener(user, (state) => set(state));
          } catch {
            setStoredToken(null);
            stopCollaborationListener();
            set({ user: null, authToken: null, isAuthenticated: false, isAuthReady: true, ideas: [], requests: [] });
          }
        });
      },
      
      login: async (email: string, password: string) => {
        const credentials = await signInWithEmailAndPassword(auth, email, password);
        const { token, user: syncedUser, claimRole } = await syncAuthenticatedUser(credentials.user);
        const user = buildUserFromBackend(credentials.user, syncedUser, claimRole);

        const syncedIdeas = await fetchIdeasFromBackend(token);
        setStoredToken(token);
        set({ user, authToken: token, isAuthenticated: true, isAuthReady: true, ideas: syncedIdeas ?? get().ideas });
        startCollaborationListener(user, (state) => set(state));
        return true;
      },
      
      loginWithGoogle: async () => {
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        const { token, user: syncedUser, claimRole } = await syncAuthenticatedUser(result.user);
        const user = buildUserFromBackend(result.user, syncedUser, claimRole);

        const syncedIdeas = await fetchIdeasFromBackend(token);
        setStoredToken(token);
        set({ user, authToken: token, isAuthenticated: true, isAuthReady: true, ideas: syncedIdeas ?? get().ideas });
        startCollaborationListener(user, (state) => set(state));
        return true;
      },
      
      logout: () => {
        void signOut(auth);
        setStoredToken(null);
        stopCollaborationListener();
        set({ user: null, authToken: null, isAuthenticated: false, isAuthReady: true, activeSection: 'overview', ideas: [], requests: [] });
      },
      
      register: async (email: string, password: string, displayName: string, role: 'owner' | 'builder' | 'admin') => {
        const credentials = await createUserWithEmailAndPassword(auth, email, password);

        if (displayName.trim()) {
          await updateProfile(credentials.user, { displayName: displayName.trim() });
        }

        const currentUser = auth.currentUser || credentials.user;
        const { token, user: syncedUser, claimRole } = await syncAuthenticatedUser(currentUser, { role });
        const user = buildUserFromBackend(currentUser, syncedUser || { uid: currentUser.uid, role }, claimRole);
        const syncedIdeas = await fetchIdeasFromBackend(token);
        setStoredToken(token);
        set({ user, authToken: token, isAuthenticated: true, isAuthReady: true, ideas: syncedIdeas ?? get().ideas });
        startCollaborationListener(user, (state) => set(state));
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
      addIdea: (idea) => {
        const tempId = generateId();
        const optimisticIdea: Idea = {
          ...idea,
          id: tempId,
          createdAt: new Date().toISOString(),
          collaborators: idea.collaborators || [],
        };

        set((state) => ({ ideas: [...state.ideas, optimisticIdea] }));

        const token = get().authToken || localStorage.getItem(FIREBASE_TOKEN_KEY) || '';
        if (!token) {
          return Promise.resolve(null);
        }

        return createIdeaInBackend(token, optimisticIdea)
          .then((savedIdea) => {
            set((state) => ({
              ideas: state.ideas.map((existingIdea) => existingIdea.id === tempId ? savedIdea : existingIdea),
            }));
            return savedIdea;
          })
          .catch((error) => {
            console.warn('Failed to persist idea:', error);
            return null;
          });
      },
      updateIdea: (id, updates) => {
        set((state) => ({
          ideas: state.ideas.map((idea) => idea.id === id ? { ...idea, ...updates } : idea),
        }));

        const token = get().authToken || localStorage.getItem(FIREBASE_TOKEN_KEY) || '';
        if (!token) return;

        void updateIdeaInBackend(token, id, updates)
          .then((savedIdea) => {
            set((state) => ({
              ideas: state.ideas.map((idea) => idea.id === id ? savedIdea : idea),
            }));
          })
          .catch((error) => {
            console.warn('Failed to persist idea update:', error);
          });
      },
      deleteIdea: (id) => {
        set((state) => ({
          ideas: state.ideas.filter((idea) => idea.id !== id),
        }));

        const token = get().authToken || localStorage.getItem(FIREBASE_TOKEN_KEY) || '';
        if (!token) return;

        void deleteIdeaInBackend(token, id).catch((error) => {
          console.warn('Failed to persist idea deletion:', error);
        });
      },

      replaceIdea: (idea) => {
        set((state) => ({
          ideas: state.ideas.map((existing) => (existing.id === idea.id ? { ...existing, ...idea } : existing)),
        }));
      },

      requestPatent: async (ideaId, summary) => {
        const token = get().authToken || localStorage.getItem(FIREBASE_TOKEN_KEY) || '';
        if (!token) {
          throw new Error('Missing auth token. Please sign in again.');
        }

        const payload = await apiRequestPatent(ideaId, summary, token);

        if (!payload?.success || !payload?.data) {
          throw new Error(payload?.message || 'Failed to request patent');
        }

        get().replaceIdea(payload.data as Idea);
      },
      
      requests: [],
      addRequest: async (request) => {
        const token = get().authToken || localStorage.getItem(FIREBASE_TOKEN_KEY) || '';
        if (!token) {
          throw new Error('Missing auth token. Please sign in again.');
        }

        const payload = await createCollaborationRequest({
          ideaId: request.ideaId,
          answer: request.answer,
        }, token);

        if (!payload?.success || !payload?.data) {
          throw new Error(payload?.message || 'Failed to send collaboration request');
        }

        return payload.data as CollaborationRequest;
      },
      updateRequest: async (id, status) => {
        const token = get().authToken || localStorage.getItem(FIREBASE_TOKEN_KEY) || '';
        if (!token) {
          throw new Error('Missing auth token. Please sign in again.');
        }

        const payload = await updateCollaborationRequest(id, status, token);
        if (payload?.data?.idea) {
          get().replaceIdea(payload.data.idea as Idea);
        }
      },
      
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