import type { StateCreator } from 'zustand';
import type { User } from '../types';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../../../lib/firebase';

export interface AuthSlice {
  user: User | null;
  authToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, displayName: string, role: 'owner' | 'builder') => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
  deleteAccount: () => void;
}

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

export const createAuthSlice: StateCreator<AuthSlice & any, [], [], AuthSlice> = (set, get) => ({
  user: null,
  authToken: null,
  isAuthenticated: false,
  login: async (email, password) => {
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    const token = await syncAuthenticatedUser(credentials.user);

    const existingRole = get().user?.role;
    const user = mapFirebaseUserToAppUser(credentials.user, existingRole || 'builder');
    console.log('USER:', user);
    console.log('TOKEN:', token);
    setStoredToken(token);
    set({ user, authToken: token, isAuthenticated: true });
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
    set({ user, authToken: token, isAuthenticated: true });
    return true;
  },
  logout: () => {
    void signOut(auth);
    setStoredToken(null);
    set({ user: null, authToken: null, isAuthenticated: false, activeSection: 'overview' });
  },
  register: async (email, password, displayName, role) => {
    const credentials = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName.trim()) {
      await updateProfile(credentials.user, { displayName: displayName.trim() });
    }

    const token = await syncAuthenticatedUser(auth.currentUser || credentials.user);

    const user = mapFirebaseUserToAppUser(auth.currentUser || credentials.user, role);
    console.log('USER:', user);
    console.log('TOKEN:', token);
    setStoredToken(token);
    set({ user, authToken: token, isAuthenticated: true });
    return true;
  },
  resetPassword: async email => {
    await sendPasswordResetEmail(auth, email);
    return true;
  },
  updateUser: (updates) => set((state: any) => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),
  deleteAccount: () => {
    setStoredToken(null);
    set({ user: null, authToken: null, isAuthenticated: false });
  }
});
