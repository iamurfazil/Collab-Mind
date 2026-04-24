import type { StateCreator } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config';

export interface ChatSlice {
  chats: any[];
  socket: Socket | null;
  connectSocket: (token: string) => void;
  disconnectSocket: () => void;
  sendMessage: (projectId: string, content: string) => void;
  addMessage: (message: any) => void;
}

export const createChatSlice: StateCreator<ChatSlice, [], [], ChatSlice> = (set, get) => ({
  chats: [],
  socket: null,
  
  connectSocket: (token: string) => {
    if (get().socket) return;
    const socket = io(API_BASE_URL, {
      auth: { token }
    });

    socket.on('receiveMessage', (message: any) => {
      set((state) => ({ chats: [...state.chats, message] }));
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  sendMessage: (projectId: string, content: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('sendMessage', { projectId, content });
    }
  },

  addMessage: (message: any) => {
    set((state) => ({ chats: Array.isArray(state.chats) ? [...state.chats, message] : [message] }));
  }
});
