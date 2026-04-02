import type { StateCreator } from 'zustand';
import type { ChatMessage } from '../types';
import { mockChats } from '../../../lib/mockData';

export interface ChatSlice {
  chats: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const createChatSlice: StateCreator<ChatSlice, [], [], ChatSlice> = (set) => ({
  chats: mockChats,
  addMessage: (message) => set((state) => ({
    chats: [...state.chats, { ...message, id: generateId(), timestamp: new Date().toISOString() }]
  }))
});
