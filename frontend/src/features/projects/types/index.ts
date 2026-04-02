export interface CollaborationRequest {
  id: string;
  problemId: string;
  problemTitle: string;
  requesterId: string;
  requesterName: string;
  ownerId: string; 
  answer: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
