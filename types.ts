
export interface FormData {
  purpose: string;
  targetAudience: string;
  contentEpisode: string;
  desiredFeeling: string;
  cta: string;
  authorName: string;
  tone: string;
  platform: string;
  numberOfStories?: number; // Added for Instagram Stories
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}