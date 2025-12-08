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
import { eq, and, desc, ilike, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string): Promise<Conversation[]>;
  updateConversationTitle(id: number, title: string): Promise<Conversation | undefined>;
  
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  getAllMessagesByUser(userId: string): Promise<Message[]>;
  searchMessages(userId: string, query: string): Promise<Message[]>;
  
  createUserContext(context: InsertUserContext): Promise<UserContext>;
  getUserContextByUser(userId: string): Promise<UserContext[]>;
  updateUserContext(id: number, value: string, confidence: number): Promise<UserContext | undefined>;
  upsertUserContext(userId: string, category: string, value: string, confidence: number): Promise<UserContext>;
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

  async updateConversationTitle(id: number, title: string): Promise<Conversation | undefined> {
    const [updated] = await db.update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return updated;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    
    await db.update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, message.conversationId));
    
    return created;
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.timestamp);
  }

  async getAllMessagesByUser(userId: string): Promise<Message[]> {
    const userConversations = await this.getConversationsByUser(userId);
    const conversationIds = userConversations.map(c => c.id);
    
    if (conversationIds.length === 0) return [];
    
    return await db.select().from(messages)
      .where(sql`${messages.conversationId} IN (${sql.join(conversationIds, sql`, `)})`)
      .orderBy(desc(messages.timestamp));
  }

  async searchMessages(userId: string, query: string): Promise<Message[]> {
    const userConversations = await this.getConversationsByUser(userId);
    const conversationIds = userConversations.map(c => c.id);
    
    if (conversationIds.length === 0) return [];
    
    return await db.select().from(messages)
      .where(
        and(
          sql`${messages.conversationId} IN (${sql.join(conversationIds, sql`, `)})`,
          ilike(messages.content, `%${query}%`)
        )
      )
      .orderBy(desc(messages.timestamp))
      .limit(20);
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

  async upsertUserContext(userId: string, category: string, value: string, confidence: number): Promise<UserContext> {
    const existing = await db.select().from(userContext)
      .where(and(eq(userContext.userId, userId), eq(userContext.category, category)));
    
    if (existing.length > 0) {
      const [updated] = await db.update(userContext)
        .set({ value, confidence, updatedAt: new Date() })
        .where(eq(userContext.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(userContext)
        .values({ userId, category, value, confidence })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
