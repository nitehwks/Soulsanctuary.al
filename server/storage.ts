import { 
  type User, 
  type InsertUser,
  type UpsertUser,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type UserContext,
  type InsertUserContext,
  type UserPreferences,
  type InsertUserPreferences,
  type MoodObservation,
  type InsertMoodObservation,
  type WellnessAssessment,
  type InsertWellnessAssessment,
  type PrivacyConsent,
  type InsertPrivacyConsent,
  type DataExportRequest,
  type InsertDataExportRequest,
  type DataDeletionRequest,
  type InsertDataDeletionRequest,
  type AuditLog,
  type InsertAuditLog,
  users,
  conversations,
  messages,
  userContext,
  userPreferences,
  moodObservations,
  wellnessAssessments,
  privacyConsents,
  dataExportRequests,
  dataDeletionRequests,
  auditLogs
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "../db/index";
import { eq, and, desc, ilike, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  createUserWithNameEmail(name: string, email: string): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  upsertUserContextWithSentiment(userId: string, category: string, value: string, confidence: number, sentiment: string, sourceContext: string): Promise<UserContext>;
  
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences>;
  
  createMoodObservation(observation: InsertMoodObservation): Promise<MoodObservation>;
  getMoodObservationsByUser(userId: string): Promise<MoodObservation[]>;
  getMoodObservationsByTopic(userId: string, topic: string): Promise<MoodObservation[]>;
  getRecentMoodObservations(userId: string, limit?: number): Promise<MoodObservation[]>;
  
  createWellnessAssessment(assessment: InsertWellnessAssessment): Promise<WellnessAssessment>;
  getLatestWellnessAssessment(userId: string): Promise<WellnessAssessment | undefined>;
  getWellnessAssessmentHistory(userId: string, limit?: number): Promise<WellnessAssessment[]>;
  
  createPrivacyConsent(consent: InsertPrivacyConsent): Promise<PrivacyConsent>;
  getPrivacyConsents(userId: string): Promise<PrivacyConsent[]>;
  updatePrivacyConsent(userId: string, consentType: string, granted: boolean): Promise<PrivacyConsent | undefined>;
  
  createDataExportRequest(request: InsertDataExportRequest): Promise<DataExportRequest>;
  getDataExportRequests(userId: string): Promise<DataExportRequest[]>;
  updateDataExportRequest(id: number, updates: Partial<DataExportRequest>): Promise<DataExportRequest | undefined>;
  
  createDataDeletionRequest(request: InsertDataDeletionRequest): Promise<DataDeletionRequest>;
  getDataDeletionRequests(userId: string): Promise<DataDeletionRequest[]>;
  updateDataDeletionRequest(id: number, updates: Partial<DataDeletionRequest>): Promise<DataDeletionRequest | undefined>;
  
  deleteUserMessages(userId: string): Promise<number>;
  deleteUserContext(userId: string): Promise<number>;
  deleteUserMoodData(userId: string): Promise<number>;
  deleteAllUserData(userId: string): Promise<void>;
  
  getAuditLogs(userId: string, limit?: number): Promise<AuditLog[]>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createUserWithNameEmail(name: string, email: string): Promise<User> {
    const [user] = await db.insert(users).values({
      username: email,
      password: randomUUID(),
      name,
      email
    }).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
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

  async upsertUserContextWithSentiment(userId: string, category: string, value: string, confidence: number, sentiment: string, sourceContext: string): Promise<UserContext> {
    const existing = await db.select().from(userContext)
      .where(and(eq(userContext.userId, userId), eq(userContext.category, category)));
    
    if (existing.length > 0) {
      const [updated] = await db.update(userContext)
        .set({ value, confidence, sentiment, sourceContext, updatedAt: new Date() })
        .where(eq(userContext.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(userContext)
        .values({ userId, category, value, confidence, sentiment, sourceContext })
        .returning();
      return created;
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [prefs] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return prefs;
  }

  async upsertUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences> {
    const existing = await db.select().from(userPreferences)
      .where(eq(userPreferences.userId, prefs.userId));
    
    if (existing.length > 0) {
      const [updated] = await db.update(userPreferences)
        .set({ ...prefs, updatedAt: new Date() })
        .where(eq(userPreferences.userId, prefs.userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(userPreferences)
        .values(prefs)
        .returning();
      return created;
    }
  }

  async createMoodObservation(observation: InsertMoodObservation): Promise<MoodObservation> {
    const [created] = await db.insert(moodObservations).values(observation).returning();
    return created;
  }

  async getMoodObservationsByUser(userId: string): Promise<MoodObservation[]> {
    return await db.select().from(moodObservations)
      .where(eq(moodObservations.userId, userId))
      .orderBy(desc(moodObservations.createdAt));
  }

  async getMoodObservationsByTopic(userId: string, topic: string): Promise<MoodObservation[]> {
    return await db.select().from(moodObservations)
      .where(and(eq(moodObservations.userId, userId), ilike(moodObservations.topic, `%${topic}%`)))
      .orderBy(desc(moodObservations.createdAt));
  }

  async getRecentMoodObservations(userId: string, limit: number = 20): Promise<MoodObservation[]> {
    return await db.select().from(moodObservations)
      .where(eq(moodObservations.userId, userId))
      .orderBy(desc(moodObservations.createdAt))
      .limit(limit);
  }

  async createWellnessAssessment(assessment: InsertWellnessAssessment): Promise<WellnessAssessment> {
    const [created] = await db.insert(wellnessAssessments).values(assessment).returning();
    return created;
  }

  async getLatestWellnessAssessment(userId: string): Promise<WellnessAssessment | undefined> {
    const [assessment] = await db.select().from(wellnessAssessments)
      .where(eq(wellnessAssessments.userId, userId))
      .orderBy(desc(wellnessAssessments.createdAt))
      .limit(1);
    return assessment;
  }

  async getWellnessAssessmentHistory(userId: string, limit: number = 10): Promise<WellnessAssessment[]> {
    return await db.select().from(wellnessAssessments)
      .where(eq(wellnessAssessments.userId, userId))
      .orderBy(desc(wellnessAssessments.createdAt))
      .limit(limit);
  }

  async createPrivacyConsent(consent: InsertPrivacyConsent): Promise<PrivacyConsent> {
    const [created] = await db.insert(privacyConsents).values(consent).returning();
    return created;
  }

  async getPrivacyConsents(userId: string): Promise<PrivacyConsent[]> {
    return await db.select().from(privacyConsents)
      .where(eq(privacyConsents.userId, userId))
      .orderBy(desc(privacyConsents.createdAt));
  }

  async updatePrivacyConsent(userId: string, consentType: string, granted: boolean): Promise<PrivacyConsent | undefined> {
    const existing = await db.select().from(privacyConsents)
      .where(and(eq(privacyConsents.userId, userId), eq(privacyConsents.consentType, consentType)))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db.update(privacyConsents)
        .set({ 
          granted, 
          grantedAt: granted ? new Date() : null,
          revokedAt: granted ? null : new Date()
        })
        .where(eq(privacyConsents.id, existing[0].id))
        .returning();
      return updated;
    } else {
      return this.createPrivacyConsent({
        userId,
        consentType,
        granted,
        grantedAt: granted ? new Date() : null
      });
    }
  }

  async createDataExportRequest(request: InsertDataExportRequest): Promise<DataExportRequest> {
    const [created] = await db.insert(dataExportRequests).values(request).returning();
    return created;
  }

  async getDataExportRequests(userId: string): Promise<DataExportRequest[]> {
    return await db.select().from(dataExportRequests)
      .where(eq(dataExportRequests.userId, userId))
      .orderBy(desc(dataExportRequests.createdAt));
  }

  async updateDataExportRequest(id: number, updates: Partial<DataExportRequest>): Promise<DataExportRequest | undefined> {
    const [updated] = await db.update(dataExportRequests)
      .set(updates)
      .where(eq(dataExportRequests.id, id))
      .returning();
    return updated;
  }

  async createDataDeletionRequest(request: InsertDataDeletionRequest): Promise<DataDeletionRequest> {
    const [created] = await db.insert(dataDeletionRequests).values(request).returning();
    return created;
  }

  async getDataDeletionRequests(userId: string): Promise<DataDeletionRequest[]> {
    return await db.select().from(dataDeletionRequests)
      .where(eq(dataDeletionRequests.userId, userId))
      .orderBy(desc(dataDeletionRequests.createdAt));
  }

  async updateDataDeletionRequest(id: number, updates: Partial<DataDeletionRequest>): Promise<DataDeletionRequest | undefined> {
    const [updated] = await db.update(dataDeletionRequests)
      .set(updates)
      .where(eq(dataDeletionRequests.id, id))
      .returning();
    return updated;
  }

  async deleteUserMessages(userId: string): Promise<number> {
    const userConversations = await this.getConversationsByUser(userId);
    const conversationIds = userConversations.map(c => c.id);
    
    if (conversationIds.length === 0) return 0;
    
    const deleted = await db.delete(messages)
      .where(sql`${messages.conversationId} IN (${sql.join(conversationIds, sql`, `)})`)
      .returning();
    
    await db.delete(conversations).where(eq(conversations.userId, userId));
    
    return deleted.length;
  }

  async deleteUserContext(userId: string): Promise<number> {
    const deleted = await db.delete(userContext)
      .where(eq(userContext.userId, userId))
      .returning();
    return deleted.length;
  }

  async deleteUserMoodData(userId: string): Promise<number> {
    const moodDeleted = await db.delete(moodObservations)
      .where(eq(moodObservations.userId, userId))
      .returning();
    
    await db.delete(wellnessAssessments)
      .where(eq(wellnessAssessments.userId, userId));
    
    return moodDeleted.length;
  }

  async deleteAllUserData(userId: string): Promise<void> {
    await this.deleteUserMessages(userId);
    await this.deleteUserContext(userId);
    await this.deleteUserMoodData(userId);
    await db.delete(userPreferences).where(eq(userPreferences.userId, userId));
    await db.delete(privacyConsents).where(eq(privacyConsents.userId, userId));
  }

  async getAuditLogs(userId: string, limit: number = 100): Promise<AuditLog[]> {
    return await db.select().from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
