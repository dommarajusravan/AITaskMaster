// User types
export interface User {
  id: number;
  name: string;
  email: string;
  picture?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

// Message types
export interface Message {
  id: number;
  conversationId: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

// Conversation types
export interface Conversation {
  id: number;
  userId: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

// Feature types
export type FeatureType = 'chat' | 'email' | 'documents' | 'calendar';

export interface Feature {
  id: FeatureType;
  name: string;
  icon: string;
  path: string;
}

// Email summary types
export interface EmailSummary {
  subject: string;
  keyInfo: string;
  actionItems: string[];
  deadline?: string;
  sender?: string;
}
