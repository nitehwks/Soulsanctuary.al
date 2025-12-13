import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username"),
  password: text("password"),
  name: text("name"),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("anonymous"),
  title: text("title"),
  mode: text("mode").notNull().default("chat"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  originalContent: text("original_content"),
  wasObfuscated: boolean("was_obfuscated").default(false),
  sentiment: text("sentiment"),
  sentimentScore: integer("sentiment_score"),
  keyPhrases: text("key_phrases").array(),
  hasAttachment: boolean("has_attachment").default(false),
  attachmentType: text("attachment_type"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").references(() => messages.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().default("anonymous"),
  type: text("type").notNull(),
  fileName: text("file_name"),
  mimeType: text("mime_type"),
  fileSize: integer("file_size"),
  content: text("content"),
  extractedText: text("extracted_text"),
  analysisResult: text("analysis_result"),
  keyInsights: text("key_insights").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userContext = pgTable("user_context", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("anonymous"),
  category: text("category").notNull(),
  value: text("value").notNull(),
  confidence: integer("confidence").default(85),
  sentiment: text("sentiment"),
  sourceContext: text("source_context"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  storeContactInfo: boolean("store_contact_info").default(true),
  privacyLevel: text("privacy_level").default("balanced"),
  therapistModeEnabled: boolean("therapist_mode_enabled").default(false),
  autoCoachingEnabled: boolean("auto_coaching_enabled").default(true),
  faithSupportEnabled: boolean("faith_support_enabled").default(true),
  faithOfferDeclines: integer("faith_offer_declines").default(0),
  lastFaithDeclineAt: timestamp("last_faith_decline_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const moodObservations = pgTable("mood_observations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("anonymous"),
  topic: text("topic").notNull(),
  mood: text("mood").notNull(),
  attitude: text("attitude"),
  intensity: integer("intensity").default(5),
  observation: text("observation"),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wellnessAssessments = pgTable("wellness_assessments", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("anonymous"),
  overallMood: text("overall_mood").notNull(),
  stressLevel: integer("stress_level").default(5),
  patterns: text("patterns").array(),
  concerns: text("concerns").array(),
  positives: text("positives").array(),
  advice: text("advice"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  chainHash: text("chain_hash").notNull(),
  previousHash: text("previous_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dataRetentionPolicies = pgTable("data_retention_policies", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  resourceType: text("resource_type").notNull(),
  retentionDays: integer("retention_days").default(365),
  autoDelete: boolean("auto_delete").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const privacyConsents = pgTable("privacy_consents", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  consentType: text("consent_type").notNull(),
  granted: boolean("granted").default(false),
  grantedAt: timestamp("granted_at"),
  revokedAt: timestamp("revoked_at"),
  version: text("version").default("1.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dataExportRequests = pgTable("data_export_requests", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  status: text("status").default("pending"),
  format: text("format").default("json"),
  includeMessages: boolean("include_messages").default(true),
  includeContext: boolean("include_context").default(true),
  includeMoodData: boolean("include_mood_data").default(true),
  downloadUrl: text("download_url"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const dataDeletionRequests = pgTable("data_deletion_requests", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  status: text("status").default("pending"),
  deleteMessages: boolean("delete_messages").default(true),
  deleteContext: boolean("delete_context").default(true),
  deleteMoodData: boolean("delete_mood_data").default(true),
  deleteAccount: boolean("delete_account").default(false),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const userGoals = pgTable("user_goals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  status: text("status").default("active"),
  priority: integer("priority").default(5),
  targetDate: timestamp("target_date"),
  progressNotes: text("progress_notes").array(),
  motivators: text("motivators").array(),
  obstacles: text("obstacles").array(),
  strategies: text("strategies").array(),
  milestones: jsonb("milestones"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const personalityInsights = pgTable("personality_insights", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  traitCategory: text("trait_category").notNull(),
  trait: text("trait").notNull(),
  strength: integer("strength").default(50),
  evidence: text("evidence").array(),
  implications: text("implications"),
  coachingApproach: text("coaching_approach"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const motivationPatterns = pgTable("motivation_patterns", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  patternType: text("pattern_type").notNull(),
  description: text("description").notNull(),
  triggers: text("triggers").array(),
  responses: text("responses").array(),
  effectiveStrategies: text("effective_strategies").array(),
  ineffectiveStrategies: text("ineffective_strategies").array(),
  confidence: integer("confidence").default(50),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const coachingSessions = pgTable("coaching_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  focus: text("focus").notNull(),
  insights: text("insights").array(),
  actionItems: text("action_items").array(),
  breakthroughs: text("breakthroughs").array(),
  resistanceNoted: text("resistance_noted"),
  nextSteps: text("next_steps"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProbingState = pgTable("user_probing_state", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  lastAskedAt: timestamp("last_asked_at"),
  currentDepth: integer("current_depth").default(0),
  questionsAsked: text("questions_asked").array().default([]),
  topicsExplored: text("topics_explored").array().default([]),
  totalQuestionsAnswered: integer("total_questions_answered").default(0),
  engagementLevel: text("engagement_level").default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const relationships = pgTable("relationships", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  nickname: text("nickname"),
  notes: text("notes"),
  sentiment: text("sentiment"),
  importance: integer("importance").default(5),
  lastMentioned: timestamp("last_mentioned"),
  mentionCount: integer("mention_count").default(1),
  confidence: integer("confidence").default(70),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const lifeEvents = pgTable("life_events", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  eventType: text("event_type").notNull(),
  description: text("description").notNull(),
  eventDate: timestamp("event_date"),
  emotionalImpact: text("emotional_impact"),
  impactScore: integer("impact_score").default(5),
  isOngoing: boolean("is_ongoing").default(false),
  relatedPeople: text("related_people").array(),
  confidence: integer("confidence").default(70),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const emotionalSnapshots = pgTable("emotional_snapshots", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "set null" }),
  primaryEmotion: text("primary_emotion").notNull(),
  secondaryEmotions: text("secondary_emotions").array(),
  intensity: integer("intensity").default(5),
  energyLevel: text("energy_level"),
  triggers: text("triggers").array(),
  copingObserved: text("coping_observed"),
  aiAssessment: text("ai_assessment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dispositionTrends = pgTable("disposition_trends", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  dominantMood: text("dominant_mood").notNull(),
  averageEnergy: integer("average_energy").default(5),
  optimismScore: integer("optimism_score").default(50),
  stressIndicators: text("stress_indicators").array(),
  growthAreas: text("growth_areas").array(),
  patterns: text("patterns").array(),
  recommendations: text("recommendations").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const psychologicalProfile = pgTable("psychological_profile", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  communicationStyle: text("communication_style"),
  attachmentStyle: text("attachment_style"),
  cognitivePatterns: text("cognitive_patterns").array(),
  emotionalRegulation: text("emotional_regulation"),
  copingMechanisms: text("coping_mechanisms").array(),
  strengthsIdentified: text("strengths_identified").array(),
  growthEdges: text("growth_edges").array(),
  valuesPriorities: text("values_priorities").array(),
  spiritualOrientation: text("spiritual_orientation"),
  supportNeeds: text("support_needs").array(),
  triggerPatterns: text("trigger_patterns").array(),
  resilienceFactors: text("resilience_factors").array(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goalProgress = pgTable("goal_progress", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull().references(() => userGoals.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  progressPercent: integer("progress_percent").default(0),
  update: text("update").notNull(),
  blockers: text("blockers").array(),
  wins: text("wins").array(),
  nextActions: text("next_actions").array(),
  moodDuringUpdate: text("mood_during_update"),
  aiEncouragement: text("ai_encouragement"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const learningQueue = pgTable("learning_queue", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  factType: text("fact_type").notNull(),
  proposedValue: text("proposed_value").notNull(),
  sourceMessage: text("source_message"),
  confidence: integer("confidence").default(50),
  status: text("status").default("pending"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  confirmEmail: z.string().email("Please confirm your email address"),
}).refine((data) => data.email === data.confirmEmail, {
  message: "Email addresses must match",
  path: ["confirmEmail"],
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().nullable().optional(),
  mode: z.enum(["chat", "therapist"]).optional().default("chat"),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  createdAt: true,
});

export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;

export const insertUserContextSchema = createInsertSchema(userContext).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type CreateUserInput = z.infer<typeof createUserSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type UserContext = typeof userContext.$inferSelect;
export type InsertUserContext = z.infer<typeof insertUserContextSchema>;

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMoodObservationSchema = createInsertSchema(moodObservations).omit({
  id: true,
  createdAt: true,
});

export const insertWellnessAssessmentSchema = createInsertSchema(wellnessAssessments).omit({
  id: true,
  createdAt: true,
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

export type MoodObservation = typeof moodObservations.$inferSelect;
export type InsertMoodObservation = z.infer<typeof insertMoodObservationSchema>;

export type WellnessAssessment = typeof wellnessAssessments.$inferSelect;
export type InsertWellnessAssessment = z.infer<typeof insertWellnessAssessmentSchema>;

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertDataRetentionPolicySchema = createInsertSchema(dataRetentionPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPrivacyConsentSchema = createInsertSchema(privacyConsents).omit({
  id: true,
  createdAt: true,
});

export const insertDataExportRequestSchema = createInsertSchema(dataExportRequests).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertDataDeletionRequestSchema = createInsertSchema(dataDeletionRequests).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type DataRetentionPolicy = typeof dataRetentionPolicies.$inferSelect;
export type InsertDataRetentionPolicy = z.infer<typeof insertDataRetentionPolicySchema>;

export type PrivacyConsent = typeof privacyConsents.$inferSelect;
export type InsertPrivacyConsent = z.infer<typeof insertPrivacyConsentSchema>;

export type DataExportRequest = typeof dataExportRequests.$inferSelect;
export type InsertDataExportRequest = z.infer<typeof insertDataExportRequestSchema>;

export type DataDeletionRequest = typeof dataDeletionRequests.$inferSelect;
export type InsertDataDeletionRequest = z.infer<typeof insertDataDeletionRequestSchema>;

export const insertUserGoalSchema = createInsertSchema(userGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const insertPersonalityInsightSchema = createInsertSchema(personalityInsights).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMotivationPatternSchema = createInsertSchema(motivationPatterns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCoachingSessionSchema = createInsertSchema(coachingSessions).omit({
  id: true,
  createdAt: true,
});

export type UserGoal = typeof userGoals.$inferSelect;
export type InsertUserGoal = z.infer<typeof insertUserGoalSchema>;

export type PersonalityInsight = typeof personalityInsights.$inferSelect;
export type InsertPersonalityInsight = z.infer<typeof insertPersonalityInsightSchema>;

export type MotivationPattern = typeof motivationPatterns.$inferSelect;
export type InsertMotivationPattern = z.infer<typeof insertMotivationPatternSchema>;

export type CoachingSession = typeof coachingSessions.$inferSelect;
export type InsertCoachingSession = z.infer<typeof insertCoachingSessionSchema>;

export const insertUserProbingStateSchema = createInsertSchema(userProbingState).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserProbingState = typeof userProbingState.$inferSelect;
export type InsertUserProbingState = z.infer<typeof insertUserProbingStateSchema>;

// Voice Messages - Phase 1 Voice Interfaces
export const voiceMessages = pgTable("voice_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "cascade" }),
  messageId: integer("message_id").references(() => messages.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  audioBlobUrl: text("audio_blob_url"),
  audioData: text("audio_data"),
  transcript: text("transcript"),
  duration: integer("duration"),
  sentimentScore: integer("sentiment_score"),
  isProcessed: boolean("is_processed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVoiceMessageSchema = createInsertSchema(voiceMessages).omit({
  id: true,
  createdAt: true,
});

export type VoiceMessage = typeof voiceMessages.$inferSelect;
export type InsertVoiceMessage = z.infer<typeof insertVoiceMessageSchema>;

// Groups - Phase 2 Group Features
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  groupHash: text("group_hash").unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").default("general"),
  memberCount: integer("member_count").default(0),
  messageCount: integer("message_count").default(0),
  isActive: boolean("is_active").default(true),
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }),
  anonUserHash: text("anon_user_hash").notNull(),
  displayName: text("display_name"),
  role: text("role").default("member"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
});

export const groupMessages = pgTable("group_messages", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }),
  anonUserHash: text("anon_user_hash").notNull(),
  message: text("message").notNull(),
  moderated: boolean("moderated").default(false),
  moderationReason: text("moderation_reason"),
  replyToId: integer("reply_to_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertGroupMessageSchema = createInsertSchema(groupMessages).omit({
  id: true,
  createdAt: true,
});

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;

export type GroupMessage = typeof groupMessages.$inferSelect;
export type InsertGroupMessage = z.infer<typeof insertGroupMessageSchema>;

// Clinician Sessions - Phase 3 Professional Tools
export const clinicianSessions = pgTable("clinician_sessions", {
  id: serial("id").primaryKey(),
  clinicianId: text("clinician_id").notNull(),
  anonPatientHash: text("anon_patient_hash").notNull(),
  sessionType: text("session_type").default("ad_hoc"),
  status: text("status").default("scheduled"),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  sessionNotes: text("session_notes"),
  interventions: jsonb("interventions"),
  outcomes: jsonb("outcomes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertClinicianSessionSchema = createInsertSchema(clinicianSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ClinicianSession = typeof clinicianSessions.$inferSelect;
export type InsertClinicianSession = z.infer<typeof insertClinicianSessionSchema>;

// Analytics Events - Phase 3 Analytics
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  eventCategory: text("event_category").notNull(),
  anonUserHash: text("anon_user_hash"),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  timestamp: true,
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;

// Feature Flags - Phase 4 Infrastructure
export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  enabled: boolean("enabled").default(false),
  rolloutPercentage: integer("rollout_percentage").default(0),
  userSegments: text("user_segments").array(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;

// Premium Therapy Modules
export const therapyModules = pgTable("therapy_modules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  category: text("category").notNull(), // 'dbt', 'cbt', 'mindfulness', 'spiritual', 'grounding'
  icon: text("icon").default("brain"),
  color: text("color").default("blue"),
  isPremium: boolean("is_premium").default(true),
  price: integer("price").default(0), // In cents, 0 = free
  features: text("features").array(),
  scientificBasis: text("scientific_basis"),
  researchLinks: text("research_links").array(),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Individual Exercises within Modules
export const therapyExercises = pgTable("therapy_exercises", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => therapyModules.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull(),
  instructions: text("instructions").notNull(),
  duration: integer("duration").default(10), // Minutes
  difficulty: text("difficulty").default("beginner"), // 'beginner', 'intermediate', 'advanced'
  exerciseType: text("exercise_type").notNull(), // 'breathing', 'journaling', 'meditation', 'worksheet', 'audio'
  content: jsonb("content"), // Flexible content structure
  audioUrl: text("audio_url"),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Subscriptions to Premium Modules
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  moduleId: integer("module_id").notNull().references(() => therapyModules.id),
  status: text("status").default("active"), // 'active', 'expired', 'cancelled'
  startedAt: timestamp("started_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  paymentId: text("payment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Progress on Exercises
export const userExerciseProgress = pgTable("user_exercise_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  exerciseId: integer("exercise_id").notNull().references(() => therapyExercises.id, { onDelete: "cascade" }),
  status: text("status").default("not_started"), // 'not_started', 'in_progress', 'completed'
  completedCount: integer("completed_count").default(0),
  lastCompletedAt: timestamp("last_completed_at"),
  notes: text("notes"),
  rating: integer("rating"), // 1-5 effectiveness rating
  journalEntry: text("journal_entry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Coping Strategies Library
export const copingStrategies = pgTable("coping_strategies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'grounding', 'breathing', 'mindfulness', 'physical', 'social', 'cognitive'
  description: text("description").notNull(),
  steps: text("steps").array(),
  duration: text("duration"), // '2-5 minutes', '10-15 minutes', etc.
  effectiveness: text("effectiveness").array(), // What it helps with
  scientificBasis: text("scientific_basis"),
  isPremium: boolean("is_premium").default(false),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Favorite Strategies
export const userFavoriteStrategies = pgTable("user_favorite_strategies", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  strategyId: integer("strategy_id").notNull().references(() => copingStrategies.id, { onDelete: "cascade" }),
  timesUsed: integer("times_used").default(0),
  lastUsedAt: timestamp("last_used_at"),
  personalNotes: text("personal_notes"),
  effectivenessRating: integer("effectiveness_rating"), // 1-5
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas for new tables
export const insertTherapyModuleSchema = createInsertSchema(therapyModules).omit({
  id: true,
  createdAt: true,
});

export const insertTherapyExerciseSchema = createInsertSchema(therapyExercises).omit({
  id: true,
  createdAt: true,
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertUserExerciseProgressSchema = createInsertSchema(userExerciseProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCopingStrategySchema = createInsertSchema(copingStrategies).omit({
  id: true,
  createdAt: true,
});

export const insertUserFavoriteStrategySchema = createInsertSchema(userFavoriteStrategies).omit({
  id: true,
  createdAt: true,
});

// Types for new tables
export type TherapyModule = typeof therapyModules.$inferSelect;
export type InsertTherapyModule = z.infer<typeof insertTherapyModuleSchema>;

export type TherapyExercise = typeof therapyExercises.$inferSelect;
export type InsertTherapyExercise = z.infer<typeof insertTherapyExerciseSchema>;

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;

export type UserExerciseProgress = typeof userExerciseProgress.$inferSelect;
export type InsertUserExerciseProgress = z.infer<typeof insertUserExerciseProgressSchema>;

export type CopingStrategy = typeof copingStrategies.$inferSelect;
export type InsertCopingStrategy = z.infer<typeof insertCopingStrategySchema>;

export type UserFavoriteStrategy = typeof userFavoriteStrategies.$inferSelect;
export type InsertUserFavoriteStrategy = z.infer<typeof insertUserFavoriteStrategySchema>;

// Comprehensive User Profile - Cumulative psychological profile
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  
  // Core Identity
  displayName: text("display_name"),
  communicationStyle: text("communication_style"), // 'direct', 'reflective', 'analytical', 'expressive'
  primaryMotivators: text("primary_motivators").array(),
  coreValues: text("core_values").array(),
  
  // Personality Dimensions (0-100 scale)
  opennessScore: integer("openness_score").default(50),
  conscientiousnessScore: integer("conscientiousness_score").default(50),
  extraversionScore: integer("extraversion_score").default(50),
  agreeablenessScore: integer("agreeableness_score").default(50),
  neuroticismScore: integer("neuroticism_score").default(50),
  
  // Psychodynamic Patterns
  attachmentStyle: text("attachment_style"), // 'secure', 'anxious', 'avoidant', 'disorganized'
  defenseMechanisms: text("defense_mechanisms").array(),
  coreBeliefs: text("core_beliefs").array(),
  cognitiveDistortions: text("cognitive_distortions").array(),
  
  // Strengths & Growth Areas
  identifiedStrengths: text("identified_strengths").array(),
  growthAreas: text("growth_areas").array(),
  copingPatterns: text("coping_patterns").array(),
  stressTriggers: text("stress_triggers").array(),
  
  // Relationship Dynamics
  relationshipPatterns: text("relationship_patterns").array(),
  communicationNeeds: text("communication_needs").array(),
  
  // Life Context
  lifeStage: text("life_stage"),
  currentChallenges: text("current_challenges").array(),
  supportSystems: text("support_systems").array(),
  
  // Aggregate Metrics
  totalMessagesAnalyzed: integer("total_messages_analyzed").default(0),
  lastInsightUpdate: timestamp("last_insight_update"),
  profileConfidence: integer("profile_confidence").default(0), // 0-100 based on data quantity
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Message-Level Psychological Insights - Immutable ledger
export const messageInsights = pgTable("message_insights", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  messageId: integer("message_id").references(() => messages.id, { onDelete: "cascade" }),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "cascade" }),
  
  // Emotional Analysis
  primaryEmotion: text("primary_emotion"),
  secondaryEmotions: text("secondary_emotions").array(),
  emotionalIntensity: integer("emotional_intensity"), // 1-10
  
  // Psychological Signals
  needsExpressed: text("needs_expressed").array(), // 'validation', 'guidance', 'support', 'autonomy'
  defenseMechanismsObserved: text("defense_mechanisms_observed").array(),
  cognitivePatterns: text("cognitive_patterns").array(),
  attachmentSignals: text("attachment_signals").array(),
  
  // Content Analysis
  topicsDiscussed: text("topics_discussed").array(),
  valuesRevealed: text("values_revealed").array(),
  goalsImplied: text("goals_implied").array(),
  concernsRaised: text("concerns_raised").array(),
  
  // Risk Assessment
  riskFlags: text("risk_flags").array(),
  wellnessIndicators: text("wellness_indicators").array(),
  
  // Relationship Mentions
  relationshipsMentioned: jsonb("relationships_mentioned"), // [{name, relation, sentiment}]
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Coaching Plans - Personalized development plans
export const coachingPlans = pgTable("coaching_plans", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  
  // Plan Overview
  title: text("title").notNull(),
  focus: text("focus").notNull(), // 'personal_growth', 'career', 'relationships', 'wellness', 'habits'
  status: text("status").default("active"), // 'active', 'completed', 'paused'
  priority: integer("priority").default(5), // 1-10
  
  // Psychoanalytic Foundation
  underlyingPatterns: text("underlying_patterns").array(),
  rootCauses: text("root_causes").array(),
  unconsciousDrivers: text("unconscious_drivers").array(),
  
  // Goals & Outcomes
  shortTermGoals: text("short_term_goals").array(),
  longTermGoals: text("long_term_goals").array(),
  successIndicators: text("success_indicators").array(),
  
  // Intervention Strategy
  therapeuticApproaches: text("therapeutic_approaches").array(), // 'CBT', 'DBT', 'ACT', 'psychodynamic'
  recommendedExercises: text("recommended_exercises").array(),
  weeklyActions: text("weekly_actions").array(),
  
  // Progress Tracking
  currentPhase: text("current_phase").default("discovery"), // 'discovery', 'action', 'integration', 'maintenance'
  progressPercentage: integer("progress_percentage").default(0),
  lastReviewedAt: timestamp("last_reviewed_at"),
  
  // Evidence & Insights
  evidenceNotes: text("evidence_notes").array(),
  breakhroughs: text("breakthroughs").array(),
  setbacks: text("setbacks").array(),
  
  startedAt: timestamp("started_at").defaultNow().notNull(),
  targetCompletionDate: timestamp("target_completion_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Coaching Plan Steps - Actionable items within a plan
export const coachingPlanSteps = pgTable("coaching_plan_steps", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => coachingPlans.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  
  title: text("title").notNull(),
  description: text("description"),
  actionType: text("action_type").notNull(), // 'reflection', 'exercise', 'habit', 'conversation', 'skill_practice'
  
  // Scheduling
  frequency: text("frequency"), // 'daily', 'weekly', 'as_needed'
  dueDate: timestamp("due_date"),
  reminderEnabled: boolean("reminder_enabled").default(false),
  
  // Progress
  status: text("status").default("pending"), // 'pending', 'in_progress', 'completed', 'skipped'
  completedAt: timestamp("completed_at"),
  reflectionNotes: text("reflection_notes"),
  effectivenessRating: integer("effectiveness_rating"), // 1-5
  
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Progress Reflections - User's journey documentation
export const progressReflections = pgTable("progress_reflections", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  planId: integer("plan_id").references(() => coachingPlans.id, { onDelete: "set null" }),
  
  reflectionType: text("reflection_type").notNull(), // 'weekly', 'milestone', 'breakthrough', 'setback'
  content: text("content").notNull(),
  
  // What was learned
  insights: text("insights").array(),
  patternsNoticed: text("patterns_noticed").array(),
  emotionsExperienced: text("emotions_experienced").array(),
  
  // Forward looking
  nextFocus: text("next_focus"),
  adjustmentsNeeded: text("adjustments_needed").array(),
  
  moodRating: integer("mood_rating"), // 1-10
  progressRating: integer("progress_rating"), // 1-10
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageInsightSchema = createInsertSchema(messageInsights).omit({
  id: true,
  createdAt: true,
});

export const insertCoachingPlanSchema = createInsertSchema(coachingPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  startedAt: true,
  completedAt: true,
});

export const insertCoachingPlanStepSchema = createInsertSchema(coachingPlanSteps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const insertProgressReflectionSchema = createInsertSchema(progressReflections).omit({
  id: true,
  createdAt: true,
});

// Types
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type MessageInsight = typeof messageInsights.$inferSelect;
export type InsertMessageInsight = z.infer<typeof insertMessageInsightSchema>;

export type CoachingPlan = typeof coachingPlans.$inferSelect;
export type InsertCoachingPlan = z.infer<typeof insertCoachingPlanSchema>;

export type CoachingPlanStep = typeof coachingPlanSteps.$inferSelect;
export type InsertCoachingPlanStep = z.infer<typeof insertCoachingPlanStepSchema>;

export type ProgressReflection = typeof progressReflections.$inferSelect;
export type InsertProgressReflection = z.infer<typeof insertProgressReflectionSchema>;
