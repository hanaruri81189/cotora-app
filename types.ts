
export enum SNSType {
  AMEBLO = 'Ameblo',
  NOTE = 'note',
  X = 'X (Twitter)',
  INSTAGRAM = 'Instagram',
  FACEBOOK = 'Facebook',
  LINE = 'LINE',
  THREADS = 'Threads',
  INSTAGRAM_STORIES = 'Instagram Stories',
}

export enum Tone {
  CASUAL = 'カジュアル',
  FORMAL = 'フォーマル',
  ENTHUSIASTIC = '熱狂的',
  HUMOROUS = 'ユーモラス',
  PERSUASIVE = '説得力のある',
  INFORMATIVE = '情報を提供する',
  FRIENDLY = '親しみやすい',
}

export interface GenerationParams {
  author: string;
  episode: string;
  feelings: string;
  tone: Tone;
  snsType: SNSType;
  purpose?: string;
  targetAudience?: string;
  cta?: string;
  storyPages?: number; // Added for Instagram Stories page count
}

export interface GroundingChunkWeb {
  uri?: string;
  title?: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  // Other types of grounding chunks can be added here if needed
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  // Other grounding metadata fields can be added here
}

// Custom Candidate type for what's being used from the API response (groundingMetadata)
export interface Candidate {
  groundingMetadata?: GroundingMetadata;
  // Add other fields from the API's Candidate type if needed
}