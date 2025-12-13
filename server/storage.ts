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
  type VoiceMessage,
  type InsertVoiceMessage,
  type Group,
  type InsertGroup,
  type GroupMember,
  type InsertGroupMember,
  type GroupMessage,
  type InsertGroupMessage,
  type AnalyticsEvent,
  type InsertAnalyticsEvent,
  type ClinicianSession,
  type InsertClinicianSession,
  type FeatureFlag,
  type InsertFeatureFlag,
  type Relationship,
  type InsertRelationship,
  type LifeEvent,
  type InsertLifeEvent,
  type EmotionalSnapshot,
  type InsertEmotionalSnapshot,
  type DispositionTrend,
  type InsertDispositionTrend,
  type PsychologicalProfile,
  type InsertPsychologicalProfile,
  type GoalProgress,
  type InsertGoalProgress,
  type LearningQueueItem,
  type InsertLearningQueueItem,
  users,
  clinicianSessions,
  featureFlags,
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
  attachments,
  voiceMessages,
  groups,
  groupMembers,
  groupMessages,
  analyticsEvents,
  relationships,
  lifeEvents,
  emotionalSnapshots,
  dispositionTrends,
  psychologicalProfile,
  goalProgress,
  learningQueue
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "../db/index";
import { eq, and, desc, ilike, sql, gte, lt, count } from "drizzle-orm";

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
  getLastMessageTimeForUser(userId: string): Promise<Date | null>;
  
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
  
  // Voice Message methods
  createVoiceMessage(voiceMessage: InsertVoiceMessage): Promise<VoiceMessage>;
  getVoiceMessagesByConversation(conversationId: number): Promise<VoiceMessage[]>;
  getVoiceMessagesByUser(userId: string): Promise<VoiceMessage[]>;
  updateVoiceMessageTranscript(id: number, transcript: string): Promise<VoiceMessage | undefined>;
  
  // Group methods
  createGroup(group: InsertGroup): Promise<Group>;
  getGroup(id: number): Promise<Group | undefined>;
  getGroupByHash(groupHash: string): Promise<Group | undefined>;
  getGroups(category?: string): Promise<Group[]>;
  updateGroup(id: number, updates: Partial<Group>): Promise<Group | undefined>;
  incrementGroupMemberCount(id: number): Promise<Group | undefined>;
  incrementGroupMessageCount(id: number): Promise<Group | undefined>;
  
  // Group Member methods
  createGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  getGroupMember(groupId: number, anonUserHash: string): Promise<GroupMember | undefined>;
  getGroupMembers(groupId: number): Promise<GroupMember[]>;
  updateGroupMemberActivity(groupId: number, anonUserHash: string): Promise<GroupMember | undefined>;
  
  // Group Message methods
  createGroupMessage(message: InsertGroupMessage): Promise<GroupMessage>;
  getGroupMessages(groupId: number, limit?: number): Promise<GroupMessage[]>;
  moderateGroupMessage(id: number, reason: string): Promise<GroupMessage | undefined>;
  
  // Analytics methods
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getAnalyticsEvents(category?: string, limit?: number): Promise<AnalyticsEvent[]>;
  getAnalyticsSummary(): Promise<{
    totalUsers: number;
    totalConversations: number;
    totalMessages: number;
    activeUsersToday: number;
    avgMessagesPerConversation: number;
    topCategories: { category: string; count: number }[];
    recentActivity: { date: string; count: number }[];
  }>;
  
  // Clinician session methods
  createClinicianSession(session: InsertClinicianSession): Promise<ClinicianSession>;
  getClinicianSessions(clinicianId: string): Promise<ClinicianSession[]>;
  getClinicianSession(id: number): Promise<ClinicianSession | undefined>;
  updateClinicianSession(id: number, updates: Partial<InsertClinicianSession>): Promise<ClinicianSession | undefined>;
  getClinicianSessionStats(clinicianId: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    patientCount: number;
  }>;
  
  // Feature Flag methods
  createFeatureFlag(flag: InsertFeatureFlag): Promise<FeatureFlag>;
  getFeatureFlag(id: number): Promise<FeatureFlag | undefined>;
  getFeatureFlagByKey(key: string): Promise<FeatureFlag | undefined>;
  getAllFeatureFlags(): Promise<FeatureFlag[]>;
  updateFeatureFlag(id: number, updates: Partial<InsertFeatureFlag>): Promise<FeatureFlag | undefined>;
  deleteFeatureFlag(id: number): Promise<boolean>;
  isFeatureEnabled(key: string, userId?: string): Promise<boolean>;
  
  // Contextual Learning - Relationships
  createRelationship(rel: InsertRelationship): Promise<Relationship>;
  getRelationshipsByUser(userId: string): Promise<Relationship[]>;
  getRelationshipByName(userId: string, name: string): Promise<Relationship | undefined>;
  updateRelationship(id: number, updates: Partial<Relationship>): Promise<Relationship | undefined>;
  upsertRelationship(userId: string, name: string, relationship: string, updates?: Partial<InsertRelationship>): Promise<Relationship>;
  
  // Contextual Learning - Life Events
  createLifeEvent(event: InsertLifeEvent): Promise<LifeEvent>;
  getLifeEventsByUser(userId: string): Promise<LifeEvent[]>;
  getOngoingLifeEvents(userId: string): Promise<LifeEvent[]>;
  updateLifeEvent(id: number, updates: Partial<LifeEvent>): Promise<LifeEvent | undefined>;
  
  // Contextual Learning - Emotional Snapshots
  createEmotionalSnapshot(snapshot: InsertEmotionalSnapshot): Promise<EmotionalSnapshot>;
  getEmotionalSnapshotsByUser(userId: string, limit?: number): Promise<EmotionalSnapshot[]>;
  getEmotionalSnapshotsByConversation(conversationId: number): Promise<EmotionalSnapshot[]>;
  
  // Contextual Learning - Disposition Trends
  createDispositionTrend(trend: InsertDispositionTrend): Promise<DispositionTrend>;
  getDispositionTrendsByUser(userId: string, limit?: number): Promise<DispositionTrend[]>;
  getLatestDispositionTrend(userId: string): Promise<DispositionTrend | undefined>;
  
  // Contextual Learning - Psychological Profile
  getPsychologicalProfile(userId: string): Promise<PsychologicalProfile | undefined>;
  upsertPsychologicalProfile(profile: InsertPsychologicalProfile): Promise<PsychologicalProfile>;
  
  // Contextual Learning - Goal Progress
  createGoalProgress(progress: InsertGoalProgress): Promise<GoalProgress>;
  getGoalProgressByGoal(goalId: number): Promise<GoalProgress[]>;
  getGoalProgressByUser(userId: string, limit?: number): Promise<GoalProgress[]>;
  
  // Contextual Learning - Learning Queue
  createLearningQueueItem(item: InsertLearningQueueItem): Promise<LearningQueueItem>;
  getPendingLearningItems(userId: string): Promise<LearningQueueItem[]>;
  updateLearningQueueItem(id: number, updates: Partial<LearningQueueItem>): Promise<LearningQueueItem | undefined>;
  verifyLearningItem(id: number): Promise<LearningQueueItem | undefined>;
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

  async getLastMessageTimeForUser(userId: string): Promise<Date | null> {
    const userConversations = await this.getConversationsByUser(userId);
    const conversationIds = userConversations.map(c => c.id);
    
    if (conversationIds.length === 0) return null;
    
    const result = await db.select({ timestamp: messages.timestamp })
      .from(messages)
      .where(
        and(
          sql`${messages.conversationId} IN (${sql.join(conversationIds, sql`, `)})`,
          eq(messages.role, 'user')
        )
      )
      .orderBy(desc(messages.timestamp))
      .limit(1);
    
    return result[0]?.timestamp || null;
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

  // Voice Message methods
  async createVoiceMessage(voiceMessage: InsertVoiceMessage): Promise<VoiceMessage> {
    const [created] = await db.insert(voiceMessages).values(voiceMessage).returning();
    return created;
  }

  async getVoiceMessagesByConversation(conversationId: number): Promise<VoiceMessage[]> {
    return await db.select().from(voiceMessages)
      .where(eq(voiceMessages.conversationId, conversationId))
      .orderBy(desc(voiceMessages.createdAt));
  }

  async getVoiceMessagesByUser(userId: string): Promise<VoiceMessage[]> {
    return await db.select().from(voiceMessages)
      .where(eq(voiceMessages.userId, userId))
      .orderBy(desc(voiceMessages.createdAt));
  }

  async updateVoiceMessageTranscript(id: number, transcript: string): Promise<VoiceMessage | undefined> {
    const [updated] = await db.update(voiceMessages)
      .set({ transcript, isProcessed: true })
      .where(eq(voiceMessages.id, id))
      .returning();
    return updated;
  }

  // Group methods
  async createGroup(group: InsertGroup): Promise<Group> {
    const [created] = await db.insert(groups).values(group).returning();
    return created;
  }

  async getGroup(id: number): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group;
  }

  async getGroupByHash(groupHash: string): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.groupHash, groupHash));
    return group;
  }

  async getGroups(category?: string): Promise<Group[]> {
    if (category) {
      return await db.select().from(groups)
        .where(and(eq(groups.isActive, true), eq(groups.category, category)))
        .orderBy(desc(groups.memberCount));
    }
    return await db.select().from(groups)
      .where(eq(groups.isActive, true))
      .orderBy(desc(groups.memberCount));
  }

  async updateGroup(id: number, updates: Partial<Group>): Promise<Group | undefined> {
    const [updated] = await db.update(groups)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(groups.id, id))
      .returning();
    return updated;
  }

  async incrementGroupMemberCount(id: number): Promise<Group | undefined> {
    const [updated] = await db.update(groups)
      .set({ memberCount: sql`${groups.memberCount} + 1`, updatedAt: new Date() })
      .where(eq(groups.id, id))
      .returning();
    return updated;
  }

  async incrementGroupMessageCount(id: number): Promise<Group | undefined> {
    const [updated] = await db.update(groups)
      .set({ messageCount: sql`${groups.messageCount} + 1`, updatedAt: new Date() })
      .where(eq(groups.id, id))
      .returning();
    return updated;
  }

  // Group Member methods
  async createGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    const [created] = await db.insert(groupMembers).values(member).returning();
    return created;
  }

  async getGroupMember(groupId: number, anonUserHash: string): Promise<GroupMember | undefined> {
    const [member] = await db.select().from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.anonUserHash, anonUserHash)));
    return member;
  }

  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return await db.select().from(groupMembers)
      .where(eq(groupMembers.groupId, groupId))
      .orderBy(desc(groupMembers.lastActiveAt));
  }

  async updateGroupMemberActivity(groupId: number, anonUserHash: string): Promise<GroupMember | undefined> {
    const [updated] = await db.update(groupMembers)
      .set({ lastActiveAt: new Date() })
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.anonUserHash, anonUserHash)))
      .returning();
    return updated;
  }

  // Group Message methods
  async createGroupMessage(message: InsertGroupMessage): Promise<GroupMessage> {
    const [created] = await db.insert(groupMessages).values(message).returning();
    return created;
  }

  async getGroupMessages(groupId: number, limit: number = 50): Promise<GroupMessage[]> {
    return await db.select().from(groupMessages)
      .where(and(eq(groupMessages.groupId, groupId), eq(groupMessages.moderated, false)))
      .orderBy(desc(groupMessages.createdAt))
      .limit(limit);
  }

  async moderateGroupMessage(id: number, reason: string): Promise<GroupMessage | undefined> {
    const [updated] = await db.update(groupMessages)
      .set({ moderated: true, moderationReason: reason })
      .where(eq(groupMessages.id, id))
      .returning();
    return updated;
  }

  // Analytics methods
  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [created] = await db.insert(analyticsEvents).values(event).returning();
    return created;
  }

  async getAnalyticsEvents(category?: string, limit: number = 100): Promise<AnalyticsEvent[]> {
    if (category) {
      return await db.select().from(analyticsEvents)
        .where(eq(analyticsEvents.eventCategory, category))
        .orderBy(desc(analyticsEvents.timestamp))
        .limit(limit);
    }
    return await db.select().from(analyticsEvents)
      .orderBy(desc(analyticsEvents.timestamp))
      .limit(limit);
  }

  async getAnalyticsSummary(): Promise<{
    totalUsers: number;
    totalConversations: number;
    totalMessages: number;
    activeUsersToday: number;
    avgMessagesPerConversation: number;
    topCategories: { category: string; count: number }[];
    recentActivity: { date: string; count: number }[];
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [userCount] = await db.select({ count: count() }).from(users);
    const [convCount] = await db.select({ count: count() }).from(conversations);
    const [msgCount] = await db.select({ count: count() }).from(messages);
    
    const totalUsers = Number(userCount?.count ?? 0);
    const totalConversations = Number(convCount?.count ?? 0);
    const totalMessages = Number(msgCount?.count ?? 0);
    
    const activeToday = await db.select({ userId: conversations.userId })
      .from(conversations)
      .where(gte(conversations.updatedAt, today))
      .groupBy(conversations.userId);
    
    const avgMessages = totalConversations > 0 
      ? Math.round(totalMessages / totalConversations * 10) / 10 
      : 0;
    
    const categoryStats = await db.select({
      category: analyticsEvents.eventCategory,
      count: count()
    })
      .from(analyticsEvents)
      .groupBy(analyticsEvents.eventCategory)
      .orderBy(desc(count()))
      .limit(5);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const recentMessages = await db.select({
      timestamp: messages.timestamp
    })
      .from(messages)
      .where(and(
        gte(messages.timestamp, sevenDaysAgo),
        lt(messages.timestamp, tomorrow)
      ));
    
    const dayCountMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dayCountMap[date.toISOString().split('T')[0]] = 0;
    }
    
    for (const msg of recentMessages) {
      const dateKey = msg.timestamp.toISOString().split('T')[0];
      if (dayCountMap[dateKey] !== undefined) {
        dayCountMap[dateKey]++;
      }
    }
    
    const recentDays = Object.entries(dayCountMap).map(([date, cnt]) => ({
      date,
      count: cnt
    }));
    
    return {
      totalUsers,
      totalConversations,
      totalMessages,
      activeUsersToday: activeToday.length,
      avgMessagesPerConversation: avgMessages,
      topCategories: categoryStats.map(s => ({ category: s.category, count: Number(s.count) })),
      recentActivity: recentDays
    };
  }

  async createClinicianSession(session: InsertClinicianSession): Promise<ClinicianSession> {
    const [created] = await db.insert(clinicianSessions).values(session).returning();
    return created;
  }

  async getClinicianSessions(clinicianId: string): Promise<ClinicianSession[]> {
    return await db.select().from(clinicianSessions)
      .where(eq(clinicianSessions.clinicianId, clinicianId))
      .orderBy(desc(clinicianSessions.createdAt));
  }

  async getClinicianSession(id: number): Promise<ClinicianSession | undefined> {
    const [session] = await db.select().from(clinicianSessions)
      .where(eq(clinicianSessions.id, id));
    return session;
  }

  async updateClinicianSession(id: number, updates: Partial<InsertClinicianSession>): Promise<ClinicianSession | undefined> {
    const [updated] = await db.update(clinicianSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(clinicianSessions.id, id))
      .returning();
    return updated;
  }

  async getClinicianSessionStats(clinicianId: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    patientCount: number;
  }> {
    const sessions = await this.getClinicianSessions(clinicianId);
    
    const activeSessions = sessions.filter(s => s.status === 'in_progress' || s.status === 'scheduled').length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    
    const uniquePatients = new Set(sessions.map(s => s.anonPatientHash));
    
    return {
      totalSessions: sessions.length,
      activeSessions,
      completedSessions,
      patientCount: uniquePatients.size
    };
  }

  async createFeatureFlag(flag: InsertFeatureFlag): Promise<FeatureFlag> {
    const [created] = await db.insert(featureFlags).values(flag).returning();
    return created;
  }

  async getFeatureFlag(id: number): Promise<FeatureFlag | undefined> {
    const [flag] = await db.select().from(featureFlags).where(eq(featureFlags.id, id));
    return flag;
  }

  async getFeatureFlagByKey(key: string): Promise<FeatureFlag | undefined> {
    const [flag] = await db.select().from(featureFlags).where(eq(featureFlags.key, key));
    return flag;
  }

  async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    return await db.select().from(featureFlags).orderBy(desc(featureFlags.createdAt));
  }

  async updateFeatureFlag(id: number, updates: Partial<InsertFeatureFlag>): Promise<FeatureFlag | undefined> {
    const [updated] = await db.update(featureFlags)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(featureFlags.id, id))
      .returning();
    return updated;
  }

  async deleteFeatureFlag(id: number): Promise<boolean> {
    const result = await db.delete(featureFlags).where(eq(featureFlags.id, id));
    return true;
  }

  async isFeatureEnabled(key: string, userId?: string): Promise<boolean> {
    const flag = await this.getFeatureFlagByKey(key);
    if (!flag) return false;
    if (!flag.enabled) return false;
    
    if (flag.rolloutPercentage === 100) return true;
    if (flag.rolloutPercentage === 0) return false;
    
    if (userId && flag.rolloutPercentage && flag.rolloutPercentage > 0) {
      const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return (hash % 100) < flag.rolloutPercentage;
    }
    
    return flag.enabled;
  }

  // Contextual Learning - Relationships
  async createRelationship(rel: InsertRelationship): Promise<Relationship> {
    const [created] = await db.insert(relationships).values(rel).returning();
    return created;
  }

  async getRelationshipsByUser(userId: string): Promise<Relationship[]> {
    return await db.select().from(relationships)
      .where(eq(relationships.userId, userId))
      .orderBy(desc(relationships.importance));
  }

  async getRelationshipByName(userId: string, name: string): Promise<Relationship | undefined> {
    const [rel] = await db.select().from(relationships)
      .where(and(eq(relationships.userId, userId), ilike(relationships.name, name)));
    return rel;
  }

  async updateRelationship(id: number, updates: Partial<Relationship>): Promise<Relationship | undefined> {
    const [updated] = await db.update(relationships)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(relationships.id, id))
      .returning();
    return updated;
  }

  async upsertRelationship(userId: string, name: string, relationship: string, updates?: Partial<InsertRelationship>): Promise<Relationship> {
    const existing = await this.getRelationshipByName(userId, name);
    if (existing) {
      const mentionCount = (existing.mentionCount || 0) + 1;
      const [updated] = await db.update(relationships)
        .set({ 
          ...updates,
          mentionCount,
          lastMentioned: new Date(),
          updatedAt: new Date()
        })
        .where(eq(relationships.id, existing.id))
        .returning();
      return updated;
    }
    return this.createRelationship({ userId, name, relationship, ...updates });
  }

  // Contextual Learning - Life Events
  async createLifeEvent(event: InsertLifeEvent): Promise<LifeEvent> {
    const [created] = await db.insert(lifeEvents).values(event).returning();
    return created;
  }

  async getLifeEventsByUser(userId: string): Promise<LifeEvent[]> {
    return await db.select().from(lifeEvents)
      .where(eq(lifeEvents.userId, userId))
      .orderBy(desc(lifeEvents.createdAt));
  }

  async getOngoingLifeEvents(userId: string): Promise<LifeEvent[]> {
    return await db.select().from(lifeEvents)
      .where(and(eq(lifeEvents.userId, userId), eq(lifeEvents.isOngoing, true)));
  }

  async updateLifeEvent(id: number, updates: Partial<LifeEvent>): Promise<LifeEvent | undefined> {
    const [updated] = await db.update(lifeEvents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(lifeEvents.id, id))
      .returning();
    return updated;
  }

  // Contextual Learning - Emotional Snapshots
  async createEmotionalSnapshot(snapshot: InsertEmotionalSnapshot): Promise<EmotionalSnapshot> {
    const [created] = await db.insert(emotionalSnapshots).values(snapshot).returning();
    return created;
  }

  async getEmotionalSnapshotsByUser(userId: string, limit: number = 50): Promise<EmotionalSnapshot[]> {
    return await db.select().from(emotionalSnapshots)
      .where(eq(emotionalSnapshots.userId, userId))
      .orderBy(desc(emotionalSnapshots.createdAt))
      .limit(limit);
  }

  async getEmotionalSnapshotsByConversation(conversationId: number): Promise<EmotionalSnapshot[]> {
    return await db.select().from(emotionalSnapshots)
      .where(eq(emotionalSnapshots.conversationId, conversationId))
      .orderBy(desc(emotionalSnapshots.createdAt));
  }

  // Contextual Learning - Disposition Trends
  async createDispositionTrend(trend: InsertDispositionTrend): Promise<DispositionTrend> {
    const [created] = await db.insert(dispositionTrends).values(trend).returning();
    return created;
  }

  async getDispositionTrendsByUser(userId: string, limit: number = 10): Promise<DispositionTrend[]> {
    return await db.select().from(dispositionTrends)
      .where(eq(dispositionTrends.userId, userId))
      .orderBy(desc(dispositionTrends.periodEnd))
      .limit(limit);
  }

  async getLatestDispositionTrend(userId: string): Promise<DispositionTrend | undefined> {
    const [trend] = await db.select().from(dispositionTrends)
      .where(eq(dispositionTrends.userId, userId))
      .orderBy(desc(dispositionTrends.periodEnd))
      .limit(1);
    return trend;
  }

  // Contextual Learning - Psychological Profile
  async getPsychologicalProfile(userId: string): Promise<PsychologicalProfile | undefined> {
    const [profile] = await db.select().from(psychologicalProfile)
      .where(eq(psychologicalProfile.userId, userId));
    return profile;
  }

  async upsertPsychologicalProfile(profile: InsertPsychologicalProfile): Promise<PsychologicalProfile> {
    const [upserted] = await db.insert(psychologicalProfile)
      .values(profile)
      .onConflictDoUpdate({
        target: psychologicalProfile.userId,
        set: { ...profile, lastUpdated: new Date() }
      })
      .returning();
    return upserted;
  }

  // Contextual Learning - Goal Progress
  async createGoalProgress(progress: InsertGoalProgress): Promise<GoalProgress> {
    const [created] = await db.insert(goalProgress).values(progress).returning();
    return created;
  }

  async getGoalProgressByGoal(goalId: number): Promise<GoalProgress[]> {
    return await db.select().from(goalProgress)
      .where(eq(goalProgress.goalId, goalId))
      .orderBy(desc(goalProgress.createdAt));
  }

  async getGoalProgressByUser(userId: string, limit: number = 20): Promise<GoalProgress[]> {
    return await db.select().from(goalProgress)
      .where(eq(goalProgress.userId, userId))
      .orderBy(desc(goalProgress.createdAt))
      .limit(limit);
  }

  // Contextual Learning - Learning Queue
  async createLearningQueueItem(item: InsertLearningQueueItem): Promise<LearningQueueItem> {
    const [created] = await db.insert(learningQueue).values(item).returning();
    return created;
  }

  async getPendingLearningItems(userId: string): Promise<LearningQueueItem[]> {
    return await db.select().from(learningQueue)
      .where(and(eq(learningQueue.userId, userId), eq(learningQueue.status, 'pending')))
      .orderBy(desc(learningQueue.createdAt));
  }

  async updateLearningQueueItem(id: number, updates: Partial<LearningQueueItem>): Promise<LearningQueueItem | undefined> {
    const [updated] = await db.update(learningQueue)
      .set(updates)
      .where(eq(learningQueue.id, id))
      .returning();
    return updated;
  }

  async verifyLearningItem(id: number): Promise<LearningQueueItem | undefined> {
    const [updated] = await db.update(learningQueue)
      .set({ status: 'verified', verifiedAt: new Date() })
      .where(eq(learningQueue.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
