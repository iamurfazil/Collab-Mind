import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AuthSlice } from './store/authSlice';
import { createAuthSlice } from './store/authSlice';
import type { IdeaSlice } from './store/ideaSlice';
import { createIdeaSlice } from './store/ideaSlice';
import type { CollaborationSlice } from './store/collaborationSlice';
import { createCollaborationSlice } from './store/collaborationSlice';
import type { ProjectSlice } from './store/projectSlice';
import { createProjectSlice } from './store/projectSlice';
import type { ChatSlice } from './store/chatSlice';
import { createChatSlice } from './store/chatSlice';
import type { UISlice } from './store/uiSlice';
import { createUISlice } from './store/uiSlice';

export type AppState = AuthSlice & IdeaSlice & CollaborationSlice & ProjectSlice & ChatSlice & UISlice;

export const useStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createIdeaSlice(...a),
      ...createCollaborationSlice(...a),
      ...createProjectSlice(...a),
      ...createChatSlice(...a),
      ...createUISlice(...a)
    }),
    {
      name: 'collab-mind-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        authToken: state.authToken
      })
    }
  )
);
