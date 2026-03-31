export interface Feedback {
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

export interface Certificate {
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
