
import type { StateCreator } from 'zustand';
import type { Feedback, Certificate } from '../types';
import { mockFeedback, mockCertificates } from '../../../lib/mockData';

export interface UserSlice {
  feedbackList: Feedback[];
  addFeedback: (feedback: Omit<Feedback, 'id' | 'timestamp' | 'status' | 'formattedDate'>) => void;
  certificates: Certificate[];
  addCertificate: (certificate: Omit<Certificate, 'id'>) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = (set) => ({
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
  addCertificate: (certificate) => set((state) => ({
    certificates: [...state.certificates, { ...certificate, id: generateId() }]
  }))
});
