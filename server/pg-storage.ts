import { db } from './db';
import { eq } from 'drizzle-orm';
import { 
  users, User, InsertUser,
  conversations, Conversation, InsertConversation,
  messages, Message, InsertMessage
} from "@shared/schema";
import { IStorage } from './storage';

export class PgStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.googleId, googleId));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }

  // Conversation operations
  async getConversations(userId: number): Promise<Conversation[]> {
    return await db.select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(conversations.updatedAt);
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const result = await db.select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return result[0];
  }

  async createConversation(conversationData: InsertConversation): Promise<Conversation> {
    const result = await db.insert(conversations)
      .values(conversationData)
      .returning();
    return result[0];
  }

  // Message operations
  async getMessages(conversationId: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const result = await db.insert(messages)
      .values(messageData)
      .returning();

    // Update conversation updatedAt timestamp
    await db.update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, messageData.conversationId));
    
    return result[0];
  }
}