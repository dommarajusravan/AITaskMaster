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

export interface Message {
  id: number;
  conversationId: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: number;
  userId: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FeatureType = 'chat' | 'email' | 'documents' | 'calendar' | 'agents';

export interface Feature {
  id: FeatureType;
  name: string;
  icon: string;
  path: string;
}

export interface EmailSummary {
  subject: string;
  keyInfo: string;
  actionItems: string[];
  deadline?: string;
  sender?: string;
}

// New types for AI agents
export type AgentType = 'chat' | 'email' | 'creative' | 'research' | 'custom';

export interface Agent {
  id: number;
  userId: number;
  name: string;
  type: AgentType;
  description: string;
  systemPrompt: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentConfig {
  id: number;
  agentId: number;
  key: string;
  value: string;
}