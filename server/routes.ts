import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { hybridAiService as aiService, type ContentGenerationRequest } from "./services/hybrid-ai-service";
import { localAiServices } from "./services/localAiServices";
import { localTrainingService } from "./services/localTrainingService";
import { achievementService } from "./services/achievement-service";

// Using local services to eliminate API costs
// To switch back to external APIs: import { aiServices } and { TrainingService }
import { insertContentSchema, insertProjectSchema, insertVoiceCommandSchema } from "@shared/schema";
import { registerIntelligenceRoutes } from "./routes-intelligence";
import { registerVideoRoutes } from "./routes-video";
import { registerSuperIntelligenceRoutes } from "./routes-super-intelligence";
import advancedAiRoutes from "./routes-advanced-ai";
import { oscarStandardsService } from "./services/oscar-standards-service";
import { productionIntelligenceService } from "./services/production-intelligence-service";
import { enhancedRouterService } from "./services/enhanced-router-service";
import { globalAIAgent } from "./services/global-ai-agent";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply Global Development Rules enhancements
  enhancedRouterService.applyGlobalEnhancements(app);
  
  // Initialize achievements
  await achievementService.initializeAchievements();
  
  // Auth middleware
  await setupAuth(app);
  
  // Enterprise Monitoring & Health Endpoints (Fortune 20 Standards)
  const { healthCheckEndpoint, metricsEndpoint, analyticsEndpoint } = await import('./middleware/enterprise-monitoring');
  const { getErrorMetrics } = await import('./middleware/enterprise-error-handler');
  
  app.get('/api/health', healthCheckEndpoint);
  app.get('/api/metrics', metricsEndpoint);
  app.get('/api/analytics', analyticsEndpoint);
  app.get('/api/error-metrics', getErrorMetrics);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Ensure user exists in database
      const upsertedUser = await storage.upsertUser({
        id: userId,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url
      });
      
      res.json(upsertedUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Production AI Content Generation Routes
  app.post('/api/ai/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const request: ContentGenerationRequest = {
        ...req.body,
        userId
      };
      
      let result;
      switch (request.type) {
        case 'image':
          result = await aiService.generateImage(request);
          break;
        case 'video':
          result = await aiService.generateVideo(request);
          break;
        case 'audio':
          result = await aiService.generateAudio(request);
          break;
        case 'voice':
          result = await aiService.generateVoice(request);
          break;
        case 'vfx':
          result = await aiService.generateVFX(request);
          break;
        default:
          return res.status(400).json({ message: "Invalid content type" });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ message: "Failed to generate content", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get('/api/ai/status/:jobId', isAuthenticated, async (req: any, res) => {
    try {
      const { jobId } = req.params;
      const status = aiService.getJobStatus(jobId);
      
      if (!status) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(status);
    } catch (error) {
      console.error("Error fetching job status:", error);
      res.status(500).json({ message: "Failed to fetch job status" });
    }
  });

  app.get('/api/ai/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobs = aiService.getAllJobs(userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
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

  // Local AI Content Generation routes (zero cost)
  app.post('/api/ai/generate-audio', isAuthenticated, async (req: any, res) => {
    try {
      const { text, voice, type } = req.body;
      const audioResult = await localAiServices.generateAudio(text, voice, type);
      res.json(audioResult);
    } catch (error) {
      console.error("Error generating audio locally:", error);
      res.status(500).json({ message: "Failed to generate audio locally" });
    }
  });

  app.post('/api/ai/generate-video', isAuthenticated, async (req: any, res) => {
    try {
      const { prompt, style, duration } = req.body;
      const videoResult = await localAiServices.generateVideo(prompt, style, duration);
      res.json(videoResult);
    } catch (error) {
      console.error("Error generating video locally:", error);
      res.status(500).json({ message: "Failed to generate video locally" });
    }
  });

  app.post('/api/ai/generate-vfx', isAuthenticated, async (req: any, res) => {
    try {
      const { type, parameters } = req.body;
      const vfxResult = await localAiServices.generateVFX(type, parameters);
      res.json(vfxResult);
    } catch (error) {
      console.error("Error generating VFX locally:", error);
      res.status(500).json({ message: "Failed to generate VFX locally" });
    }
  });

  // Voice command routes
  app.post('/api/voice/command', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const commandData = insertVoiceCommandSchema.parse({ ...req.body, userId });
      const savedCommand = await storage.saveVoiceCommand(commandData);
      
      // Process the voice command locally
      const result = await localAiServices.processVoiceCommand(req.body.command);
      
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
      
      const response = await localTrainingService.generateResponse({
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
      const tips = localTrainingService.generateQuickTips(page as string);
      res.json({ tips });
    } catch (error) {
      console.error("Error getting training tips:", error);
      res.status(500).json({ message: "Failed to get training tips" });
    }
  });

  // Achievement Routes
  app.post('/api/achievements/track', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type, metadata, points = 0 } = req.body;
      
      // Ensure user exists in database before tracking activity
      try {
        await storage.upsertUser({
          id: userId,
          email: req.user.claims.email,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
          profileImageUrl: req.user.claims.profile_image_url
        });
        console.log(`User ${userId} ensured in database`);
      } catch (userError) {
        console.error('Error ensuring user exists:', userError);
        // Continue anyway as user might already exist
      }
      
      const unlockedAchievements = await achievementService.trackActivity(
        userId,
        type,
        metadata,
        points
      );
      
      res.json({ unlockedAchievements });
    } catch (error) {
      console.error('Error tracking achievement activity:', error);
      // Return success even if tracking fails to not break the UI
      res.json({ unlockedAchievements: [] });
    }
  });

  app.get('/api/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Ensure user exists in database
      await storage.upsertUser({
        id: userId,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url
      });
      
      const achievements = await achievementService.getAllAchievementsWithProgress(userId);
      res.json(achievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      res.status(500).json({ message: 'Failed to fetch achievements' });
    }
  });

  app.get('/api/achievements/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Ensure user exists in database
      await storage.upsertUser({
        id: userId,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url
      });
      
      const userAchievements = await achievementService.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      res.status(500).json({ message: 'Failed to fetch user achievements' });
    }
  });

  app.get('/api/achievements/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Ensure user exists in database
      await storage.upsertUser({
        id: userId,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url
      });
      const stats = await achievementService.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ message: 'Failed to fetch user stats' });
    }
  });

  app.get('/api/achievements/leaderboard', isAuthenticated, async (req: any, res) => {
    try {
      const { period = 'all-time', limit = 10 } = req.query;
      const leaderboard = await achievementService.getLeaderboard(
        period as string,
        parseInt(limit as string, 10)
      );
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ message: 'Failed to fetch leaderboard' });
    }
  });

  // Production Intelligence Routes
  app.post('/api/intelligence/process', isAuthenticated, async (req: any, res) => {
    try {
      const intelligenceRequest = req.body;
      const result = await productionIntelligenceService.processIntelligence(intelligenceRequest);
      res.json(result);
    } catch (error) {
      console.error('Intelligence processing error:', error);
      res.status(500).json({ error: 'Intelligence processing failed' });
    }
  });

  app.get('/api/intelligence/result/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const result = productionIntelligenceService.getResult(id);
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Result not found' });
      }
    } catch (error) {
      console.error('Result retrieval error:', error);
      res.status(500).json({ error: 'Result retrieval failed' });
    }
  });

  app.get('/api/intelligence/results', isAuthenticated, async (req, res) => {
    try {
      const results = productionIntelligenceService.getAllResults();
      res.json({ results });
    } catch (error) {
      console.error('Results retrieval error:', error);
      res.status(500).json({ error: 'Results retrieval failed' });
    }
  });

  // Register intelligence routes for pay-per-use model
  registerIntelligenceRoutes(app);

  // Register video processing routes
  registerVideoRoutes(app);

  // Register super intelligence routes with advanced AI capabilities
  registerSuperIntelligenceRoutes(app);
  
  // Register advanced AI orchestrator routes
  app.use('/api', advancedAiRoutes);

  // Oscar Standards API routes
  app.get('/api/oscar/standards/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const standards = oscarStandardsService.getStandardsForCategory(category);
      
      if (!standards) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json(standards);
    } catch (error) {
      console.error('Error fetching Oscar standards:', error);
      res.status(500).json({ error: 'Failed to fetch standards' });
    }
  });

  app.post('/api/oscar/validate', async (req, res) => {
    try {
      const { category, content } = req.body;
      const validation = oscarStandardsService.validateContentAgainstStandards(category, content);
      res.json(validation);
    } catch (error) {
      console.error('Error validating content:', error);
      res.status(500).json({ error: 'Failed to validate content' });
    }
  });

  app.get('/api/oscar/categories', async (req, res) => {
    try {
      const categories = oscarStandardsService.getAllCategories();
      res.json({ categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });
  
  // Import enhanced routes
  const { registerEnhancedIntelligenceRoutes } = await import("./routes-intelligence-enhanced");
  registerEnhancedIntelligenceRoutes(app);

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
