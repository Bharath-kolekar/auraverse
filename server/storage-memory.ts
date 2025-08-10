import {
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
import { IStorage } from "./storage";

// In-memory storage implementation to avoid database costs
export class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private content: Map<string, Content> = new Map();
  private projects: Map<string, Project> = new Map();
  private voiceCommands: Map<string, VoiceCommand> = new Map();
  private trainingConversations: Map<string, TrainingConversation> = new Map();

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id || this.generateId(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Content operations
  async createContent(contentData: InsertContent): Promise<Content> {
    const newContent: Content = {
      id: this.generateId(),
      userId: contentData.userId,
      title: contentData.title,
      description: contentData.description || null,
      type: contentData.type,
      fileUrl: contentData.fileUrl || null,
      thumbnailUrl: contentData.thumbnailUrl || null,
      metadata: contentData.metadata || null,
      price: contentData.price || null,
      isForSale: contentData.isForSale || false,
      tags: contentData.tags || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.content.set(newContent.id, newContent);
    return newContent;
  }

  async getContent(id: string): Promise<Content | undefined> {
    return this.content.get(id);
  }

  async getContentByUser(userId: string): Promise<Content[]> {
    return Array.from(this.content.values()).filter(c => c.userId === userId);
  }

  async getMarketplaceContent(type?: string): Promise<Content[]> {
    const allContent = Array.from(this.content.values()).filter(c => c.isForSale);
    return type ? allContent.filter(c => c.type === type) : allContent;
  }

  async updateContent(id: string, updates: Partial<InsertContent>): Promise<Content> {
    const existing = this.content.get(id);
    if (!existing) {
      throw new Error("Content not found");
    }
    const updated: Content = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.content.set(id, updated);
    return updated;
  }

  async deleteContent(id: string): Promise<void> {
    this.content.delete(id);
  }

  // Project operations
  async createProject(projectData: InsertProject): Promise<Project> {
    const newProject: Project = {
      id: this.generateId(),
      userId: projectData.userId,
      name: projectData.name,
      description: projectData.description || null,
      status: projectData.status || 'draft',
      progress: projectData.progress || 0,
      settings: projectData.settings || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(newProject.id, newProject);
    return newProject;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.userId === userId);
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const existing = this.projects.get(id);
    if (!existing) {
      throw new Error("Project not found");
    }
    const updated: Project = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    this.projects.delete(id);
  }

  // Voice command operations
  async saveVoiceCommand(commandData: InsertVoiceCommand): Promise<VoiceCommand> {
    const newCommand: VoiceCommand = {
      id: this.generateId(),
      userId: commandData.userId,
      command: commandData.command,
      action: commandData.action,
      confidence: commandData.confidence || null,
      createdAt: new Date(),
    };
    this.voiceCommands.set(newCommand.id, newCommand);
    return newCommand;
  }

  async getVoiceCommandsByUser(userId: string): Promise<VoiceCommand[]> {
    return Array.from(this.voiceCommands.values()).filter(c => c.userId === userId);
  }

  // Training conversation operations
  async saveTrainingConversation(conversationData: InsertTrainingConversation): Promise<TrainingConversation> {
    const newConversation: TrainingConversation = {
      id: this.generateId(),
      userId: conversationData.userId,
      sessionId: conversationData.sessionId,
      userMessage: conversationData.userMessage,
      assistantResponse: conversationData.assistantResponse,
      context: conversationData.context || null,
      currentPage: conversationData.currentPage || null,
      createdAt: new Date(),
    };
    this.trainingConversations.set(newConversation.id, newConversation);
    return newConversation;
  }

  async getTrainingConversationsByUser(userId: string): Promise<TrainingConversation[]> {
    return Array.from(this.trainingConversations.values()).filter(c => c.userId === userId);
  }

  // Utility method to generate IDs
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Data persistence methods (optional - for saving/loading state)
  exportData() {
    return {
      users: Array.from(this.users.entries()),
      content: Array.from(this.content.entries()),
      projects: Array.from(this.projects.entries()),
      voiceCommands: Array.from(this.voiceCommands.entries()),
      trainingConversations: Array.from(this.trainingConversations.entries()),
    };
  }

  importData(data: any) {
    if (data.users) this.users = new Map(data.users);
    if (data.content) this.content = new Map(data.content);
    if (data.projects) this.projects = new Map(data.projects);
    if (data.voiceCommands) this.voiceCommands = new Map(data.voiceCommands);
    if (data.trainingConversations) this.trainingConversations = new Map(data.trainingConversations);
  }
}