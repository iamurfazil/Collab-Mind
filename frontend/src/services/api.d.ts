export function analyzeIdea(data: unknown, token?: string): Promise<any>;
export function askNexusAI(data: unknown, token?: string): Promise<any>;
export function getAdminDashboard(token?: string): Promise<any>;
export function updateAdminUserRole(userId: string, role: string, token?: string): Promise<any>;
export function generateProjectIdeas(message: string, history: any[], token?: string): Promise<any>;
