import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { aiServices } from "./services/aiServices";
import { TrainingService } from "./services/trainingService";
import { insertContentSchema, insertProjectSchema, insertVoiceCommandSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Content routes
  app.post('/api/content', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contentData = insertContentSchema.parse({ ...req.body, userId });
      const newContent = await storage.createContent(contentData);
      res.json(newContent);
    } catch (error) {
      console.error("Error creating content:", error);
      res.status(500).json({ message: "Failed to create content" });
    }
  });

  app.get('/api/content/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userContent = await storage.getContentByUser(userId);
      res.json(userContent);
    } catch (error) {
      console.error("Error fetching user content:", error);
      res.status(500).json({ message: "Failed to fetch user content" });
    }
  });

  app.get('/api/content/marketplace', async (req, res) => {
    try {
      const type = req.query.type as string;
      const marketplaceContent = await storage.getMarketplaceContent(type);
      res.json(marketplaceContent);
    } catch (error) {
      console.error("Error fetching marketplace content:", error);
      res.status(500).json({ message: "Failed to fetch marketplace content" });
    }
  });

  app.get('/api/content/:id', async (req, res) => {
    try {
      const content = await storage.getContent(req.params.id);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // Project routes
  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({ ...req.body, userId });
      const newProject = await storage.createProject(projectData);
      res.json(newProject);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userProjects = await storage.getProjectsByUser(userId);
      res.json(userProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.patch('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const userId = req.user.claims.sub;
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updatedProject = await storage.updateProject(req.params.id, req.body);
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // AI Content Generation routes
  app.post('/api/ai/generate-audio', isAuthenticated, async (req: any, res) => {
    try {
      const { text, voice, type } = req.body;
      const audioResult = await aiServices.generateAudio(text, voice, type);
      res.json(audioResult);
    } catch (error) {
      console.error("Error generating audio:", error);
      res.status(500).json({ message: "Failed to generate audio" });
    }
  });

  app.post('/api/ai/generate-video', isAuthenticated, async (req: any, res) => {
    try {
      const { prompt, style, duration } = req.body;
      const videoResult = await aiServices.generateVideo(prompt, style, duration);
      res.json(videoResult);
    } catch (error) {
      console.error("Error generating video:", error);
      res.status(500).json({ message: "Failed to generate video" });
    }
  });

  app.post('/api/ai/generate-vfx', isAuthenticated, async (req: any, res) => {
    try {
      const { type, parameters } = req.body;
      const vfxResult = await aiServices.generateVFX(type, parameters);
      res.json(vfxResult);
    } catch (error) {
      console.error("Error generating VFX:", error);
      res.status(500).json({ message: "Failed to generate VFX" });
    }
  });

  // Voice command routes
  app.post('/api/voice/command', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const commandData = insertVoiceCommandSchema.parse({ ...req.body, userId });
      const savedCommand = await storage.saveVoiceCommand(commandData);
      
      // Process the voice command
      const result = await aiServices.processVoiceCommand(req.body.command);
      
      res.json({ command: savedCommand, result });
    } catch (error) {
      console.error("Error processing voice command:", error);
      res.status(500).json({ message: "Failed to process voice command" });
    }
  });

  // Training assistant routes
  app.post('/api/training/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message, currentPage, context } = req.body;
      
      const trainingService = new TrainingService();
      const response = await trainingService.generateResponse({
        userMessage: message,
        currentPage,
        context
      });

      // Save the conversation for learning
      await storage.saveTrainingConversation({
        userId,
        sessionId: req.sessionID || 'anonymous',
        userMessage: message,
        assistantResponse: response.message,
        context,
        currentPage
      });

      res.json(response);
    } catch (error) {
      console.error("Error in training chat:", error);
      res.status(500).json({ message: "Failed to process training request" });
    }
  });

  app.get('/api/training/tips', isAuthenticated, async (req: any, res) => {
    try {
      const { page } = req.query;
      const trainingService = new TrainingService();
      const tips = trainingService.generateQuickTips(page);
      res.json({ tips });
    } catch (error) {
      console.error("Error getting training tips:", error);
      res.status(500).json({ message: "Failed to get training tips" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'project_update') {
          // Broadcast project updates to all clients
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'project_status',
                projectId: data.projectId,
                status: data.status,
                progress: data.progress
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
