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
  timestamp: timestamp("timestamp").defaultNow().notNull(),
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
