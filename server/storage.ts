import { 
  type User, 
  type InsertUser,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type UserContext,
  type InsertUserContext,
  users,
  conversations,
  messages,
  userContext
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "../db/index";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string): Promise<Conversation[]>;
  
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  
  createUserContext(context: InsertUserContext): Promise<UserContext>;
  getUserContextByUser(userId: string): Promise<UserContext[]>;
  updateUserContext(id: number, value: string, confidence: number): Promise<UserContext | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [created] = await db.insert(conversations).values(conversation).returning();
    return created;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.updatedAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.timestamp);
  }

  async createUserContext(context: InsertUserContext): Promise<UserContext> {
    const [created] = await db.insert(userContext).values(context).returning();
    return created;
  }

  async getUserContextByUser(userId: string): Promise<UserContext[]> {
    return await db.select().from(userContext).where(eq(userContext.userId, userId)).orderBy(desc(userContext.confidence));
  }

  async updateUserContext(id: number, value: string, confidence: number): Promise<UserContext | undefined> {
    const [updated] = await db.update(userContext)
      .set({ value, confidence, updatedAt: new Date() })
      .where(eq(userContext.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
