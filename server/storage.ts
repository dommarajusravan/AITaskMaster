import { 
  users, User, InsertUser,
  conversations, Conversation, InsertConversation,
  messages, Message, InsertMessage
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<void>;
  
  // Conversation operations
  getConversations(userId: number): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  
  // Message operations
  getMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private userIdCounter: number;
  private conversationIdCounter: number;
  private messageIdCounter: number;
  private userGoogleIdIndex: Map<string, number>;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.userIdCounter = 1;
    this.conversationIdCounter = 1;
    this.messageIdCounter = 1;
    this.userGoogleIdIndex = new Map();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const userId = this.userGoogleIdIndex.get(googleId);
    if (userId) {
      return this.users.get(userId);
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...userData, 
      id, 
      lastLogin: now
    };
    
    this.users.set(id, user);
    this.userGoogleIdIndex.set(userData.googleId, id);
    
    return user;
  }

  async updateUserLastLogin(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLogin = new Date();
      this.users.set(id, user);
    }
  }

  // Conversation operations
  async getConversations(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(conversationData: InsertConversation): Promise<Conversation> {
    const id = this.conversationIdCounter++;
    const now = new Date();
    const conversation: Conversation = {
      ...conversationData,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.conversations.set(id, conversation);
    return conversation;
  }

  // Message operations
  async getMessages(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = {
      ...messageData,
      id,
      createdAt: now
    };
    
    this.messages.set(id, message);
    
    // Update conversation updatedAt timestamp
    const conversation = this.conversations.get(messageData.conversationId);
    if (conversation) {
      conversation.updatedAt = now;
      this.conversations.set(conversation.id, conversation);
    }
    
    return message;
  }
}

// Choose which storage implementation to use
// We'll use the PostgreSQL implementation for production
const useDatabase = process.env.NODE_ENV === 'production' || process.env.USE_DATABASE === 'true';

import { PgStorage } from './pg-storage';
export const storage = useDatabase ? new PgStorage() : new MemStorage();
