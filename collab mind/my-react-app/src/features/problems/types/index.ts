export interface CMVCReport {
  idea_summary: string;
  problem_validation: string;
  market_analysis: { demand_score: number };
  competition: { similarity_score: number; similar_examples: string[] };
  feasibility: { technical: number; operational: number; economic: number };
  value_density: number;
  risk: { level: string; risk_score: number };
  final_score: number;
  label: string;
}

export interface Problem {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  expectations: string;
  status: 'open' | 'in_review' | 'pending_review' | 'completed';
  progress?: number;
  projectStatus?: string;
  dueDate?: string;
  createdAt: string;
  collaborators: string[];
  isPublished: boolean;
  cmvcReport?: CMVCReport;
}
