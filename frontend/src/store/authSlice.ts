import type { StateCreator } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  getIdToken,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

import { API_BASE_URL } from '../config';

async function syncUserWithBackend(
  firebaseUser: import('firebase/auth').User,
  extraData?: Record<string, unknown>
) {
  const token = await getIdToken(firebaseUser, true);
  localStorage.setItem('authToken', token);

  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      ...extraData,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || 'Failed to sync user with backend');
  }

  const payload = await res.json();
  return { user: payload.data, token };
}

export interface AuthSlice {
  user: any;
  authToken: string | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;

  initializeAuth: () => Promise<void>;
  setAuth: (user: any, token: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (
    email: string,
    password: string,
    displayName: string,
    role?: string
  ) => Promise<boolean>;
  updateUser: (data: Record<string, unknown>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  user: null,
  authToken: null,
  isAuthenticated: false,
  isAuthReady: false,

  initializeAuth: async () => {
    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe(); // only run once on init
        if (!firebaseUser) {
          localStorage.removeItem('authToken');
          set({ isAuthReady: true, isAuthenticated: false, user: null, authToken: null });
          resolve();
          return;
        }
        try {
          const { user, token } = await syncUserWithBackend(firebaseUser);
          set({ user, authToken: token, isAuthenticated: true, isAuthReady: true });
        } catch {
          localStorage.removeItem('authToken');
          set({ isAuthReady: true, isAuthenticated: false, user: null, authToken: null });
        }
        resolve();
      });
    });
  },

  setAuth: (user, token) => {
    localStorage.setItem('authToken', token);
    set({ user, authToken: token, isAuthenticated: true, isAuthReady: true });
  },

  login: async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const { user, token } = await syncUserWithBackend(cred.user);
    set({ user, authToken: token, isAuthenticated: true, isAuthReady: true });
    return true;
  },

  loginWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const { user, token } = await syncUserWithBackend(cred.user);
    set({ user, authToken: token, isAuthenticated: true, isAuthReady: true });
    return true;
  },

  register: async (email, password, displayName, role = 'builder') => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Set displayName in Firebase
    await updateProfile(cred.user, { displayName });
    const { user, token } = await syncUserWithBackend(cred.user, { displayName, role });
    set({ user, authToken: token, isAuthenticated: true, isAuthReady: true });
    return true;
  },

  updateUser: async (data) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error('Not authenticated');
    const token = await getIdToken(firebaseUser, true);
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).message || 'Failed to update user');
    }
    const payload = await res.json();
    set({ user: payload.data });
  },

  resetPassword: async (email) => {
    await sendPasswordResetEmail(auth, email);
  },

  logout: async () => {
    await signOut(auth);
    localStorage.removeItem('authToken');
    set({ user: null, authToken: null, isAuthenticated: false });
  },
});
