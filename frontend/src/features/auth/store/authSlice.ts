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
  register: (email: string, password: string, displayName: string, role: 'owner' | 'builder' | 'admin') => Promise<boolean>;
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

function buildUserFromBackend(firebaseUser: FirebaseUser, syncedUser?: SyncedUser | null): User {
  const role = syncedUser?.role || 'builder';

  return {
    ...mapFirebaseUserToAppUser(firebaseUser, role),
    email: syncedUser?.email || firebaseUser.email || '',
    displayName: syncedUser?.displayName || firebaseUser.displayName || firebaseUser.email || 'User',
    city: syncedUser?.city || '',
    state: syncedUser?.state || '',
  };
}

async function syncAuthenticatedUser(firebaseUser: FirebaseUser, extraPayload: Record<string, unknown> = {}): Promise<{ token: string; user: SyncedUser | null }> {
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
        ...extraPayload,
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Auth sync endpoint /api/auth/me not found. Continuing with Firebase-only auth.');
        return { token, user: null };
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

    const payload = await response.json().catch(() => null);
    return {
      token,
      user: payload?.data || null,
    };
  } catch (error) {
    if (error instanceof TypeError) {
      console.warn('Auth profile sync unreachable. Continuing with Firebase-only auth.');
      return { token, user: null };
    }

    throw error;
  }
}

export const createAuthSlice: StateCreator<AuthSlice & any, [], [], AuthSlice> = (set, get) => ({
  user: null,
  authToken: null,
  isAuthenticated: false,
  login: async (email, password) => {
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    const { token, user: syncedUser } = await syncAuthenticatedUser(credentials.user);

    const user = buildUserFromBackend(credentials.user, syncedUser);
    setStoredToken(token);
    set({ user, authToken: token, isAuthenticated: true });
    return true;
  },
  loginWithGoogle: async () => {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    const { token, user: syncedUser } = await syncAuthenticatedUser(result.user);

    const user = buildUserFromBackend(result.user, syncedUser);
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

    const currentUser = auth.currentUser || credentials.user;
    const { token, user: syncedUser } = await syncAuthenticatedUser(currentUser, { role });

    const user = buildUserFromBackend(currentUser, syncedUser || { uid: currentUser.uid, role });
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
