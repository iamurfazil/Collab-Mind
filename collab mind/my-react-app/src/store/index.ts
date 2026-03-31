import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AuthSlice } from '../features/auth/store/authSlice';
import { createAuthSlice } from '../features/auth/store/authSlice';
import type { ProblemSlice } from '../features/problems/store/problemSlice';
import { createProblemSlice } from '../features/problems/store/problemSlice';
import type { ProjectSlice } from '../features/projects/store/projectSlice';
import { createProjectSlice } from '../features/projects/store/projectSlice';
import type { ChatSlice } from '../features/chat/store/chatSlice';
import { createChatSlice } from '../features/chat/store/chatSlice';
import type { UserSlice } from '../features/user/store/userSlice';
import { createUserSlice } from '../features/user/store/userSlice';
import type { UISlice } from './uiSlice';
import { createUISlice } from './uiSlice';

export type AppState = AuthSlice & ProblemSlice & ProjectSlice & ChatSlice & UserSlice & UISlice;

export const useStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createProblemSlice(...a),
      ...createProjectSlice(...a),
      ...createChatSlice(...a),
      ...createUserSlice(...a),
      ...createUISlice(...a),
    }),
    {
      name: 'collab-mind-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        ideas: state.ideas,
        requests: state.requests,
        chats: state.chats,
        feedbackList: state.feedbackList,
        certificates: state.certificates
      })
    }
  )
);
