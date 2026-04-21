import type { Problem } from '../features/problems/types';
import type { CollaborationRequest } from '../features/projects/types';
import type { ChatMessage } from '../features/chat/types';
import type { Feedback, Certificate } from '../features/user/types';


  

export const mockProblems: Problem[] = [
  {
    id: 'idea1',
    userId: 'user1',
    userName: 'Alex Chen',
    title: 'AI-Powered Study Companion',
    description: 'A smart study assistant that helps students organize their learning materials, track progress, and get personalized recommendations.',
    expectations: 'Looking for developers skilled in React, Python, and machine learning integration.',
    status: 'open',
    dueDate: '2024-06-01',
    createdAt: '2024-01-20',
    collaborators: [],
    isPublished: true,
    cmvcReport: {
      idea_summary: 'AI-driven analysis of "AI-Powered Study Companion"',
      problem_validation: "Strong market indicator found in recent search trends. The problem space shows a 24% YoY growth in developer queries.",
      market_analysis: { demand_score: 8.5 },
      competition: { similarity_score: 0.62, similar_examples: ["Startup Alpha", "Beta Solutions"] },
      feasibility: { technical: 7.5, operational: 6.0, economic: 8.0 },
      value_density: 8.2,
      risk: { level: "low", risk_score: 3.5 },
      final_score: 8.1,
      label: "High Potential"
    }
  },
  {
    id: 'idea2',
    userId: 'user1',
    userName: 'Alex Chen',
    title: 'Sustainable Living Tracker',
    description: 'Mobile app to track carbon footprint and suggest eco-friendly alternatives in daily life.',
    expectations: 'Need mobile developers with experience in React Native and sustainability APIs.',
    status: 'in_review',
    createdAt: '2024-02-10',
    collaborators: ['user2'],
    isPublished: true
  },
  {
    id: 'idea3',
    userId: 'user2',
    userName: 'Sarah Johnson',
    title: 'Community Skill Exchange',
    description: 'Platform connecting people to share and learn skills from each other through collaborative projects.',
    expectations: 'Looking for designers and frontend developers to create an engaging user experience.',
    status: 'open',
    createdAt: '2024-02-15',
    collaborators: [],
    isPublished: true
  }
];

export const mockRequests: CollaborationRequest[] = [
  {
    id: 'req1',
    problemId: 'idea1',
    problemTitle: 'AI-Powered Study Companion',
    requesterId: 'user2',
    requesterName: 'Sarah Johnson',
    ownerId: 'user1',
    answer: 'I have 3 years of experience with React and Python. I have built similar educational platforms before.',
    status: 'pending',
    createdAt: '2024-02-18'
  }
];

export const mockChats: ChatMessage[] = [
  {
    id: 'chat1',
    projectId: 'idea2',
    senderId: 'user1',
    senderName: 'Alex Chen',
    content: 'Hi Sarah! Thanks for joining the project. Let me share the initial specs.',
    timestamp: '2024-02-10T10:00:00'
  },
  {
    id: 'chat2',
    projectId: 'idea2',
    senderId: 'user2',
    senderName: 'Sarah Johnson',
    content: 'Thanks for having me! I have reviewed the requirements. Should we start with the data models?',
    timestamp: '2024-02-10T10:15:00'
  }
];

export const mockFeedback: Feedback[] = [
  {
    id: 'fb1',
    userName: 'Michael Brown',
    email: 'michael@example.com',
    category: 'testimonial',
    message: 'Collab Mind changed how I approach problem-solving. Found amazing collaborators for my startup idea!',
    contactPermission: true,
    status: 'approved',
    timestamp: '2024-01-15',
    formattedDate: 'January 15, 2024'
  },
  {
    id: 'fb2',
    userName: 'Emily Davis',
    email: 'emily@example.com',
    category: 'testimonial',
    message: 'As a student builder, this platform gave me real-world project experience. Highly recommended!',
    contactPermission: true,
    status: 'approved',
    timestamp: '2024-02-01',
    formattedDate: 'February 1, 2024'
  },
  {
    id: 'fb3',
    userName: 'James Wilson',
    email: 'james@example.com',
    category: 'testimonial',
    message: 'The matching system is impressive. Got connected with exactly the right team for my project.',
    contactPermission: false,
    status: 'approved',
    timestamp: '2024-02-10',
    formattedDate: 'February 10, 2024'
  }
];

export const mockCertificates: Certificate[] = [
  {
    id: 'cert1',
    userId: 'user1',
    projectId: 'proj1',
    projectTitle: 'EcoTrack Dashboard',
    earnedAt: '2024-01-20',
    type: 'completion',
    completionScore: 5,
    excellenceScore: 4,
    innovationScore: 5
  },
  {
    id: 'cert2',
    userId: 'user1',
    projectId: 'proj2',
    projectTitle: 'HealthHub App',
    earnedAt: '2024-02-05',
    type: 'excellence',
    completionScore: 5,
    excellenceScore: 5,
    innovationScore: 4
  }
];
