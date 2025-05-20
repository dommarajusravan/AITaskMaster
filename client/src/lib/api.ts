import { apiRequest } from './queryClient';
import { Conversation, Message } from './types';

// API function to get conversations
export async function getConversations(): Promise<Conversation[]> {
  return await apiRequest('GET', '/api/conversations');
}

// API function to create a new conversation
export async function createConversation(title: string): Promise<Conversation> {
  return await apiRequest('POST', '/api/conversations', { title });
}

// API function to get messages for a conversation
export async function getMessages(conversationId: number): Promise<Message[]> {
  return await apiRequest('GET', `/api/conversations/${conversationId}/messages`);
}

// API function to send a message
export async function sendMessage(conversationId: number, content: string): Promise<Message> {
  return await apiRequest('POST', `/api/conversations/${conversationId}/messages`, { content });
}