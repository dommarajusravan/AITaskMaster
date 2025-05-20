import { Conversation, Message } from './types';

// Helper function to make API requests
async function makeRequest<T>(method: string, url: string, data?: unknown): Promise<T> {
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status}: ${text || res.statusText}`);
    }

    return await res.json() as T;
  } catch (error) {
    console.error(`API request failed (${method} ${url}):`, error);
    throw error;
  }
}

// API function to get conversations
export async function getConversations(): Promise<Conversation[]> {
  try {
    const response = await makeRequest<Conversation[]>('GET', '/api/conversations');
    return response;
  } catch (error) {
    console.error('Failed to get conversations:', error);
    return [];
  }
}

// API function to create a new conversation
export async function createConversation(title: string): Promise<Conversation> {
  return await makeRequest<Conversation>('POST', '/api/conversations', { title });
}

// API function to get messages for a conversation
export async function getMessages(conversationId: number): Promise<Message[]> {
  try {
    const response = await makeRequest<Message[]>('GET', `/api/conversations/${conversationId}/messages`);
    return response;
  } catch (error) {
    console.error(`Failed to get messages for conversation ${conversationId}:`, error);
    return [];
  }
}

// API function to send a message
export async function sendMessage(conversationId: number, content: string): Promise<Message> {
  return await makeRequest<Message>('POST', `/api/conversations/${conversationId}/messages`, { content });
}