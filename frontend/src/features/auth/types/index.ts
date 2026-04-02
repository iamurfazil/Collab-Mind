export interface User {
  id: string;
  email: string;
  displayName: string;
  bio: string;
  skills: string[];
  avatar?: string;
  role: 'owner' | 'builder';
  isVerified: boolean;
  membership: 'free' | 'premium';
  joinDate: string;
  problemsPosted: number;
  activeProjects: number;
  completedProjects: number;
  trustScore: number;
}
