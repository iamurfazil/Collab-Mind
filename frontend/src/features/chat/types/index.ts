export interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  timestamp: string;
}
