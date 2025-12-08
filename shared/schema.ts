import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("anonymous"),
  title: text("title"),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().nullable().optional(),
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
