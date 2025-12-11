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
  type UserGoal,
  type InsertUserGoal,
  type PersonalityInsight,
  type InsertPersonalityInsight,
  type MotivationPattern,
  type InsertMotivationPattern,
  type CoachingSession,
  type InsertCoachingSession,
  type UserProbingState,
  type InsertUserProbingState,
  type UserProfile,
  type InsertUserProfile,
  type MessageInsight,
  type InsertMessageInsight,
  type CoachingPlan,
  type InsertCoachingPlan,
  type CoachingPlanStep,
  type InsertCoachingPlanStep,
  type ProgressReflection,
  type InsertProgressReflection,
  type Attachment,
  type InsertAttachment,
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
  auditLogs,
  userGoals,
  personalityInsights,
  motivationPatterns,
  coachingSessions,
  userProbingState,
  userProfiles,
  messageInsights,
  coachingPlans,
  coachingPlanSteps,
  progressReflections,
  attachments
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
  getConversationCount(userId: string): Promise<number>;
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
  
  createUserGoal(goal: InsertUserGoal): Promise<UserGoal>;
  getUserGoals(userId: string): Promise<UserGoal[]>;
  updateUserGoal(id: number, updates: Partial<UserGoal>): Promise<UserGoal | undefined>;
  
  createPersonalityInsight(insight: InsertPersonalityInsight): Promise<PersonalityInsight>;
  getPersonalityInsights(userId: string): Promise<PersonalityInsight[]>;
  getPersonalityInsight(userId: string, trait: string): Promise<PersonalityInsight | undefined>;
  updatePersonalityInsight(id: number, updates: Partial<PersonalityInsight>): Promise<PersonalityInsight | undefined>;
  
  createMotivationPattern(pattern: InsertMotivationPattern): Promise<MotivationPattern>;
  getMotivationPatterns(userId: string): Promise<MotivationPattern[]>;
  getMotivationPatternByType(userId: string, patternType: string): Promise<MotivationPattern | undefined>;
  updateMotivationPattern(id: number, updates: Partial<MotivationPattern>): Promise<MotivationPattern | undefined>;
  
  createCoachingSession(session: InsertCoachingSession): Promise<CoachingSession>;
  getCoachingSessions(userId: string, limit?: number): Promise<CoachingSession[]>;
  
  getUserProbingState(userId: string): Promise<UserProbingState | undefined>;
  upsertUserProbingState(state: InsertUserProbingState): Promise<UserProbingState>;
  updateUserProbingState(userId: string, updates: Partial<UserProbingState>): Promise<UserProbingState | undefined>;
  
  // User Profile methods
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  upsertUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined>;
  
  // Message Insights methods
  createMessageInsight(insight: InsertMessageInsight): Promise<MessageInsight>;
  getMessageInsights(userId: string, limit?: number): Promise<MessageInsight[]>;
  getMessageInsightsByConversation(conversationId: number): Promise<MessageInsight[]>;
  
  // Coaching Plan methods
  createCoachingPlan(plan: InsertCoachingPlan): Promise<CoachingPlan>;
  getCoachingPlans(userId: string): Promise<CoachingPlan[]>;
  getActiveCoachingPlan(userId: string): Promise<CoachingPlan | undefined>;
  updateCoachingPlan(id: number, updates: Partial<CoachingPlan>): Promise<CoachingPlan | undefined>;
  
  // Coaching Plan Steps methods
  createCoachingPlanStep(step: InsertCoachingPlanStep): Promise<CoachingPlanStep>;
  getCoachingPlanSteps(planId: number): Promise<CoachingPlanStep[]>;
  updateCoachingPlanStep(id: number, updates: Partial<CoachingPlanStep>): Promise<CoachingPlanStep | undefined>;
  
  // Progress Reflections methods
  createProgressReflection(reflection: InsertProgressReflection): Promise<ProgressReflection>;
  getProgressReflections(userId: string, limit?: number): Promise<ProgressReflection[]>;
  
  // Attachment methods
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  getAttachment(id: number): Promise<Attachment | undefined>;
  getAttachmentsByMessage(messageId: number): Promise<Attachment[]>;
  getAttachmentsByUser(userId: string): Promise<Attachment[]>;
  updateAttachmentAnalysis(id: number, analysisResult: string, keyInsights: string[]): Promise<Attachment | undefined>;
  linkAttachmentToMessage(attachmentId: number, messageId: number): Promise<Attachment | undefined>;
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

  async getConversationCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(conversations)
      .where(eq(conversations.userId, userId));
    return Number(result[0]?.count ?? 0);
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

  async createUserGoal(goal: InsertUserGoal): Promise<UserGoal> {
    const [created] = await db.insert(userGoals).values(goal).returning();
    return created;
  }

  async getUserGoals(userId: string): Promise<UserGoal[]> {
    return await db.select().from(userGoals)
      .where(eq(userGoals.userId, userId))
      .orderBy(desc(userGoals.createdAt));
  }

  async updateUserGoal(id: number, updates: Partial<UserGoal>): Promise<UserGoal | undefined> {
    const [updated] = await db.update(userGoals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userGoals.id, id))
      .returning();
    return updated;
  }

  async createPersonalityInsight(insight: InsertPersonalityInsight): Promise<PersonalityInsight> {
    const [created] = await db.insert(personalityInsights).values(insight).returning();
    return created;
  }

  async getPersonalityInsights(userId: string): Promise<PersonalityInsight[]> {
    return await db.select().from(personalityInsights)
      .where(eq(personalityInsights.userId, userId))
      .orderBy(desc(personalityInsights.strength));
  }

  async getPersonalityInsight(userId: string, trait: string): Promise<PersonalityInsight | undefined> {
    const [insight] = await db.select().from(personalityInsights)
      .where(and(eq(personalityInsights.userId, userId), eq(personalityInsights.trait, trait)));
    return insight;
  }

  async updatePersonalityInsight(id: number, updates: Partial<PersonalityInsight>): Promise<PersonalityInsight | undefined> {
    const [updated] = await db.update(personalityInsights)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(personalityInsights.id, id))
      .returning();
    return updated;
  }

  async createMotivationPattern(pattern: InsertMotivationPattern): Promise<MotivationPattern> {
    const [created] = await db.insert(motivationPatterns).values(pattern).returning();
    return created;
  }

  async getMotivationPatterns(userId: string): Promise<MotivationPattern[]> {
    return await db.select().from(motivationPatterns)
      .where(eq(motivationPatterns.userId, userId))
      .orderBy(desc(motivationPatterns.confidence));
  }

  async getMotivationPatternByType(userId: string, patternType: string): Promise<MotivationPattern | undefined> {
    const [pattern] = await db.select().from(motivationPatterns)
      .where(and(eq(motivationPatterns.userId, userId), eq(motivationPatterns.patternType, patternType)));
    return pattern;
  }

  async updateMotivationPattern(id: number, updates: Partial<MotivationPattern>): Promise<MotivationPattern | undefined> {
    const [updated] = await db.update(motivationPatterns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(motivationPatterns.id, id))
      .returning();
    return updated;
  }

  async createCoachingSession(session: InsertCoachingSession): Promise<CoachingSession> {
    const [created] = await db.insert(coachingSessions).values(session).returning();
    return created;
  }

  async getCoachingSessions(userId: string, limit: number = 10): Promise<CoachingSession[]> {
    return await db.select().from(coachingSessions)
      .where(eq(coachingSessions.userId, userId))
      .orderBy(desc(coachingSessions.createdAt))
      .limit(limit);
  }

  async getUserProbingState(userId: string): Promise<UserProbingState | undefined> {
    const [state] = await db.select().from(userProbingState)
      .where(eq(userProbingState.userId, userId));
    return state;
  }

  async upsertUserProbingState(state: InsertUserProbingState): Promise<UserProbingState> {
    const existing = await this.getUserProbingState(state.userId);
    if (existing) {
      const [updated] = await db.update(userProbingState)
        .set({ ...state, updatedAt: new Date() })
        .where(eq(userProbingState.userId, state.userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(userProbingState).values(state).returning();
    return created;
  }

  async updateUserProbingState(userId: string, updates: Partial<UserProbingState>): Promise<UserProbingState | undefined> {
    const [updated] = await db.update(userProbingState)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProbingState.userId, userId))
      .returning();
    return updated;
  }

  // User Profile methods
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile;
  }

  async upsertUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const existing = await this.getUserProfile(profile.userId);
    if (existing) {
      const [updated] = await db.update(userProfiles)
        .set({ ...profile, updatedAt: new Date() })
        .where(eq(userProfiles.userId, profile.userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(userProfiles).values(profile).returning();
    return created;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined> {
    const [updated] = await db.update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updated;
  }

  // Message Insights methods
  async createMessageInsight(insight: InsertMessageInsight): Promise<MessageInsight> {
    const [created] = await db.insert(messageInsights).values(insight).returning();
    return created;
  }

  async getMessageInsights(userId: string, limit: number = 100): Promise<MessageInsight[]> {
    return await db.select().from(messageInsights)
      .where(eq(messageInsights.userId, userId))
      .orderBy(desc(messageInsights.createdAt))
      .limit(limit);
  }

  async getMessageInsightsByConversation(conversationId: number): Promise<MessageInsight[]> {
    return await db.select().from(messageInsights)
      .where(eq(messageInsights.conversationId, conversationId))
      .orderBy(desc(messageInsights.createdAt));
  }

  // Coaching Plan methods
  async createCoachingPlan(plan: InsertCoachingPlan): Promise<CoachingPlan> {
    const [created] = await db.insert(coachingPlans).values(plan).returning();
    return created;
  }

  async getCoachingPlans(userId: string): Promise<CoachingPlan[]> {
    return await db.select().from(coachingPlans)
      .where(eq(coachingPlans.userId, userId))
      .orderBy(desc(coachingPlans.priority));
  }

  async getActiveCoachingPlan(userId: string): Promise<CoachingPlan | undefined> {
    const [plan] = await db.select().from(coachingPlans)
      .where(and(eq(coachingPlans.userId, userId), eq(coachingPlans.status, 'active')))
      .orderBy(desc(coachingPlans.priority))
      .limit(1);
    return plan;
  }

  async updateCoachingPlan(id: number, updates: Partial<CoachingPlan>): Promise<CoachingPlan | undefined> {
    const [updated] = await db.update(coachingPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(coachingPlans.id, id))
      .returning();
    return updated;
  }

  // Coaching Plan Steps methods
  async createCoachingPlanStep(step: InsertCoachingPlanStep): Promise<CoachingPlanStep> {
    const [created] = await db.insert(coachingPlanSteps).values(step).returning();
    return created;
  }

  async getCoachingPlanSteps(planId: number): Promise<CoachingPlanStep[]> {
    return await db.select().from(coachingPlanSteps)
      .where(eq(coachingPlanSteps.planId, planId))
      .orderBy(coachingPlanSteps.order);
  }

  async updateCoachingPlanStep(id: number, updates: Partial<CoachingPlanStep>): Promise<CoachingPlanStep | undefined> {
    const [updated] = await db.update(coachingPlanSteps)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(coachingPlanSteps.id, id))
      .returning();
    return updated;
  }

  // Progress Reflections methods
  async createProgressReflection(reflection: InsertProgressReflection): Promise<ProgressReflection> {
    const [created] = await db.insert(progressReflections).values(reflection).returning();
    return created;
  }

  async getProgressReflections(userId: string, limit: number = 20): Promise<ProgressReflection[]> {
    return await db.select().from(progressReflections)
      .where(eq(progressReflections.userId, userId))
      .orderBy(desc(progressReflections.createdAt))
      .limit(limit);
  }

  // Attachment methods
  async createAttachment(attachment: InsertAttachment): Promise<Attachment> {
    const [created] = await db.insert(attachments).values(attachment).returning();
    return created;
  }

  async getAttachment(id: number): Promise<Attachment | undefined> {
    const [attachment] = await db.select().from(attachments).where(eq(attachments.id, id));
    return attachment;
  }

  async getAttachmentsByMessage(messageId: number): Promise<Attachment[]> {
    return await db.select().from(attachments)
      .where(eq(attachments.messageId, messageId))
      .orderBy(desc(attachments.createdAt));
  }

  async getAttachmentsByUser(userId: string): Promise<Attachment[]> {
    return await db.select().from(attachments)
      .where(eq(attachments.userId, userId))
      .orderBy(desc(attachments.createdAt));
  }

  async updateAttachmentAnalysis(id: number, analysisResult: string, keyInsights: string[]): Promise<Attachment | undefined> {
    const [updated] = await db.update(attachments)
      .set({ analysisResult, keyInsights })
      .where(eq(attachments.id, id))
      .returning();
    return updated;
  }

  async linkAttachmentToMessage(attachmentId: number, messageId: number): Promise<Attachment | undefined> {
    const [updated] = await db.update(attachments)
      .set({ messageId })
      .where(eq(attachments.id, attachmentId))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
