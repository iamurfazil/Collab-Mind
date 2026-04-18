export interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  bio: string;
  skills: string[];
  avatar?: string;
  role: 'owner' | 'builder';
  profession?: 'student' | 'freelancer' | 'professional';
  collegeName?: string;
  stream?: string;
  courseYear?: string;
  semester?: string;
  orgName?: string;
  city?: string;
  state?: string;
  isVerified: boolean;
  membership: 'free' | 'premium';
  joinDate: string;
  problemsPosted: number;
  activeProjects: number;
  completedProjects: number;
  trustScore: number;
}
