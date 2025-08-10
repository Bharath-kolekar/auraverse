import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  level: integer("level").default(1).notNull(),
  experience: integer("experience").default(0).notNull(),
  totalPoints: integer("total_points").default(0).notNull(),
  streak: integer("streak").default(0).notNull(),
  lastActiveDate: timestamp("last_active_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content table for storing user-generated content
export const content = pgTable("content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // 'audio', 'video', 'vfx', 'image'
  fileUrl: varchar("file_url"),
  thumbnailUrl: varchar("thumbnail_url"),
  metadata: jsonb("metadata"), // Additional content metadata
  price: decimal("price", { precision: 10, scale: 2 }),
  isForSale: boolean("is_for_sale").default(false),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table for content creation projects
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  status: varchar("status").notNull().default('draft'), // 'draft', 'processing', 'completed', 'failed'
  progress: integer("progress").default(0),
  settings: jsonb("settings"), // Project configuration
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Voice commands table for storing and learning from user voice patterns
export const voiceCommands = pgTable("voice_commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  command: text("command").notNull(),
  action: varchar("action").notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Training conversations table for AI assistant interactions
export const trainingConversations = pgTable("training_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: varchar("session_id").notNull(),
  userMessage: text("user_message").notNull(),
  assistantResponse: text("assistant_response").notNull(),
  context: varchar("context"), // 'user_training', 'voice_help', 'marketplace_guide'
  currentPage: varchar("current_page"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof content.$inferSelect;

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export const insertVoiceCommandSchema = createInsertSchema(voiceCommands).omit({
  id: true,
  createdAt: true,
});
export type InsertVoiceCommand = z.infer<typeof insertVoiceCommandSchema>;
export type VoiceCommand = typeof voiceCommands.$inferSelect;

export const insertTrainingConversationSchema = createInsertSchema(trainingConversations).omit({
  id: true,
  createdAt: true,
});
export type InsertTrainingConversation = z.infer<typeof insertTrainingConversationSchema>;
export type TrainingConversation = typeof trainingConversations.$inferSelect;

// Intelligence credits table for pay-per-use model
export const intelligenceCredits = pgTable("intelligence_credits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  credits: integer("credits").notNull().default(0),
  tier: varchar("tier").notNull().default('basic'), // 'basic', 'pro', 'ultimate'
  purchasedAt: timestamp("purchased_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Intelligence usage tracking table
export const intelligenceUsage = pgTable("intelligence_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  creditId: varchar("credit_id").references(() => intelligenceCredits.id),
  modelType: varchar("model_type").notNull(), // 'deepseek-r1', 'stable-diffusion', etc.
  creditsUsed: integer("credits_used").notNull(),
  prompt: text("prompt").notNull(),
  result: jsonb("result"),
  tier: varchar("tier").notNull(), // 'basic', 'pro', 'ultimate'
  usedAt: timestamp("used_at").defaultNow(),
});

export const insertIntelligenceCreditsSchema = createInsertSchema(intelligenceCredits).omit({
  id: true,
  purchasedAt: true,
});
export type InsertIntelligenceCredits = z.infer<typeof insertIntelligenceCreditsSchema>;
export type IntelligenceCredits = typeof intelligenceCredits.$inferSelect;

export const insertIntelligenceUsageSchema = createInsertSchema(intelligenceUsage).omit({
  id: true,
  usedAt: true,
});
export type InsertIntelligenceUsage = z.infer<typeof insertIntelligenceUsageSchema>;
export type IntelligenceUsage = typeof intelligenceUsage.$inferSelect;

// Achievements table
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").unique().notNull(), // Unique identifier like 'first_content', 'voice_master'
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // 'content', 'social', 'exploration', 'mastery'
  icon: varchar("icon").notNull(), // Icon name from lucide-react
  rarity: varchar("rarity").notNull(), // 'common', 'rare', 'epic', 'legendary'
  points: integer("points").default(10).notNull(),
  requirement: jsonb("requirement").notNull(), // JSON with conditions to unlock
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

// User achievements junction table
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  progress: integer("progress").default(0).notNull(), // For progressive achievements
  maxProgress: integer("max_progress").default(1).notNull(),
  claimed: boolean("claimed").default(false).notNull(), // If rewards have been claimed
}, (table) => [
  index("idx_user_achievements_user").on(table.userId),
  index("idx_user_achievements_achievement").on(table.achievementId),
]);

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

// User activity tracking
export const userActivities = pgTable("user_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'content_created', 'voice_command', 'login', etc.
  metadata: jsonb("metadata"), // Additional data about the activity
  points: integer("points").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_user_activities_user").on(table.userId),
  index("idx_user_activities_type").on(table.type),
]);

export type UserActivity = typeof userActivities.$inferSelect;
export type InsertUserActivity = typeof userActivities.$inferInsert;

// Leaderboard view
export const leaderboard = pgTable("leaderboard", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  period: varchar("period").notNull(), // 'daily', 'weekly', 'monthly', 'all-time'
  points: integer("points").default(0).notNull(),
  rank: integer("rank"),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_leaderboard_period").on(table.period),
  index("idx_leaderboard_points").on(table.points),
]);

export type LeaderboardEntry = typeof leaderboard.$inferSelect;
export type InsertLeaderboardEntry = typeof leaderboard.$inferInsert;
