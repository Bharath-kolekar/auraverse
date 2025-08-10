import {
  users,
  content,
  projects,
  voiceCommands,
  trainingConversations,
  type User,
  type UpsertUser,
  type Content,
  type InsertContent,
  type Project,
  type InsertProject,
  type VoiceCommand,
  type InsertVoiceCommand,
  type TrainingConversation,
  type InsertTrainingConversation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Content operations
  createContent(content: InsertContent): Promise<Content>;
  getContent(id: string): Promise<Content | undefined>;
  getContentByUser(userId: string): Promise<Content[]>;
  getMarketplaceContent(type?: string): Promise<Content[]>;
  updateContent(id: string, updates: Partial<InsertContent>): Promise<Content>;
  deleteContent(id: string): Promise<void>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Voice command operations
  saveVoiceCommand(command: InsertVoiceCommand): Promise<VoiceCommand>;
  getVoiceCommandsByUser(userId: string): Promise<VoiceCommand[]>;
  
  // Training conversation operations
  saveTrainingConversation(conversation: InsertTrainingConversation): Promise<TrainingConversation>;
  getTrainingConversationsByUser(userId: string): Promise<TrainingConversation[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

  // Content operations
  async createContent(contentData: InsertContent): Promise<Content> {
    const [newContent] = await db
      .insert(content)
      .values(contentData)
      .returning();
    return newContent;
  }

  async getContent(id: string): Promise<Content | undefined> {
    const [foundContent] = await db
      .select()
      .from(content)
      .where(eq(content.id, id));
    return foundContent;
  }

  async getContentByUser(userId: string): Promise<Content[]> {
    return await db
      .select()
      .from(content)
      .where(eq(content.userId, userId))
      .orderBy(desc(content.createdAt));
  }

  async getMarketplaceContent(type?: string): Promise<Content[]> {
    const conditions = [eq(content.isForSale, true)];
    if (type) {
      conditions.push(eq(content.type, type));
    }
    
    return await db
      .select()
      .from(content)
      .where(and(...conditions))
      .orderBy(desc(content.createdAt));
  }

  async updateContent(id: string, updates: Partial<InsertContent>): Promise<Content> {
    const [updatedContent] = await db
      .update(content)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(content.id, id))
      .returning();
    return updatedContent;
  }

  async deleteContent(id: string): Promise<void> {
    await db.delete(content).where(eq(content.id, id));
  }

  // Project operations
  async createProject(projectData: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(projectData)
      .returning();
    return newProject;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project;
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Voice command operations
  async saveVoiceCommand(commandData: InsertVoiceCommand): Promise<VoiceCommand> {
    const [newCommand] = await db
      .insert(voiceCommands)
      .values(commandData)
      .returning();
    return newCommand;
  }

  async getVoiceCommandsByUser(userId: string): Promise<VoiceCommand[]> {
    return await db
      .select()
      .from(voiceCommands)
      .where(eq(voiceCommands.userId, userId))
      .orderBy(desc(voiceCommands.createdAt));
  }

  // Training conversation operations
  async saveTrainingConversation(conversationData: InsertTrainingConversation): Promise<TrainingConversation> {
    const [newConversation] = await db
      .insert(trainingConversations)
      .values(conversationData)
      .returning();
    return newConversation;
  }

  async getTrainingConversationsByUser(userId: string): Promise<TrainingConversation[]> {
    return await db
      .select()
      .from(trainingConversations)
      .where(eq(trainingConversations.userId, userId))
      .orderBy(desc(trainingConversations.createdAt));
  }
}

export const storage = new DatabaseStorage();
