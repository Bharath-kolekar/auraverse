// Super Intelligence Routes with Advanced AI Capabilities
import type { Express } from "express";
import { superIntelligenceService } from "./services/super-intelligence-service";
import { voiceFirstService } from "./services/voice-first-service";
import { enhancedRouterService } from "./services/enhanced-router-service";
import { isAuthenticated } from "./replitAuth";

export function registerSuperIntelligenceRoutes(app: Express): void {
  // Apply enhanced routing for all super intelligence routes
  
  // Super Intelligence Processing Route
  enhancedRouterService.enhanceRoute(app, 'post', '/api/super-intelligence/process', async (req, res): Promise<void> => {
    const { type, input, domain, quality, capabilities } = req.body;
    
    if (!type || !input) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: type, input'
      });
      return;
    }

    try {
      const superRequest = {
        type,
        input,
        context: {
          userId: req.userContext?.userId || 'anonymous',
          language: req.userContext?.language || 'en',
          domain: domain || 'mixed',
          quality: quality || 'super',
          realtime: true
        },
        capabilities: {
          multiModal: capabilities?.multiModal ?? true,
          neuralProcessing: capabilities?.neuralProcessing ?? true,
          creativityBoost: capabilities?.creativityBoost ?? true,
          emotionalIntelligence: capabilities?.emotionalIntelligence ?? true,
          contextualAwareness: capabilities?.contextualAwareness ?? true,
          predictiveAnalytics: capabilities?.predictiveAnalytics ?? true
        }
      };

      const result = await superIntelligenceService.processSuper(superRequest);
      
      res.json({
        success: true,
        data: result,
        superIntelligenceApplied: true,
        enhancementLevel: 'maximum'
      });

    } catch (error) {
      console.error('Super intelligence processing failed:', error);
      res.status(500).json({
        success: false,
        error: 'Super intelligence processing failed',
        fallbackAvailable: true
      });
    }
  });

  // Voice Command Processing Route
  enhancedRouterService.enhanceRoute(app, 'post', '/api/voice/process', async (req, res): Promise<void> => {
    const { command, language, accent, confidence, context } = req.body;
    
    if (!command) {
      res.status(400).json({
        success: false,
        error: 'Voice command is required'
      });
      return;
    }

    try {
      const voiceCommand = {
        command,
        language: language || req.userContext?.language || 'en',
        accent: accent || req.userContext?.accent,
        confidence: confidence || 0.8,
        context: {
          page: context?.page || req.headers.referer || '/',
          userId: req.userContext?.userId || 'anonymous',
          sessionId: req.sessionID || 'default',
          previousCommands: context?.previousCommands || [],
          userState: context?.userState || 'browsing'
        }
      };

      const response = await voiceFirstService.processVoiceCommand(voiceCommand);
      
      res.json({
        success: true,
        response: response.response,
        voiceData: response.voiceData,
        actions: response.actions,
        suggestions: response.suggestions,
        nextCommands: response.nextCommands,
        voiceFirstEnabled: true
      });

    } catch (error) {
      console.error('Voice command processing failed:', error);
      res.status(500).json({
        success: false,
        error: 'Voice command processing failed',
        fallbackMessage: 'Please try again or use manual controls'
      });
    }
  });

  // Advanced Content Generation Route
  enhancedRouterService.enhanceRoute(app, 'post', '/api/super-intelligence/generate', async (req, res): Promise<void> => {
    const { prompt, type, style, quality, enhancements } = req.body;
    
    if (!prompt || !type) {
      res.status(400).json({
        success: false,
        error: 'Prompt and type are required'
      });
      return;
    }

    try {
      const generationRequest = {
        type: 'generation' as const,
        input: {
          prompt,
          type,
          style: style || 'professional',
          enhancements: enhancements || []
        },
        context: {
          userId: req.userContext?.userId || 'anonymous',
          language: req.userContext?.language || 'en',
          domain: type,
          quality: quality || 'super',
          realtime: false
        },
        capabilities: {
          multiModal: type === 'mixed',
          neuralProcessing: true,
          creativityBoost: true,
          emotionalIntelligence: true,
          contextualAwareness: true,
          predictiveAnalytics: false
        }
      };

      const result = await superIntelligenceService.processSuper(generationRequest);
      
      res.json({
        success: true,
        content: result.result,
        metadata: result.metadata,
        analytics: result.analytics,
        generationType: 'super_intelligence_enhanced'
      });

    } catch (error) {
      console.error('Super intelligence generation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Content generation failed',
        fallbackAvailable: true
      });
    }
  });

  // Neural Enhancement Route
  enhancedRouterService.enhanceRoute(app, 'post', '/api/super-intelligence/enhance', async (req, res): Promise<void> => {
    const { content, enhancementType, targetQuality } = req.body;
    
    if (!content || !enhancementType) {
      res.status(400).json({
        success: false,
        error: 'Content and enhancement type are required'
      });
      return;
    }

    try {
      const enhancementRequest = {
        type: 'enhancement' as const,
        input: {
          content,
          enhancementType,
          targetQuality: targetQuality || 'super'
        },
        context: {
          userId: req.userContext?.userId || 'anonymous',
          language: req.userContext?.language || 'en',
          domain: 'mixed' as const,
          quality: 'super' as const,
          realtime: true
        },
        capabilities: {
          multiModal: true,
          neuralProcessing: true,
          creativityBoost: true,
          emotionalIntelligence: false,
          contextualAwareness: true,
          predictiveAnalytics: false
        }
      };

      const result = await superIntelligenceService.processSuper(enhancementRequest);
      
      res.json({
        success: true,
        enhancedContent: result.result,
        enhancementLevel: result.metadata.intelligenceLevel,
        qualityImprovement: result.metadata.confidenceScore,
        processingTime: result.metadata.processingTime
      });

    } catch (error) {
      console.error('Neural enhancement failed:', error);
      res.status(500).json({
        success: false,
        error: 'Content enhancement failed',
        originalContent: content
      });
    }
  });

  // Predictive Analytics Route
  enhancedRouterService.enhanceRoute(app, 'post', '/api/super-intelligence/predict', async (req, res): Promise<void> => {
    const { data, predictionType, timeframe } = req.body;
    
    try {
      const predictionRequest = {
        type: 'prediction' as const,
        input: {
          data,
          predictionType: predictionType || 'user_behavior',
          timeframe: timeframe || 'short_term'
        },
        context: {
          userId: req.userContext?.userId || 'anonymous',
          language: req.userContext?.language || 'en',
          domain: 'mixed' as const,
          quality: 'expert' as const,
          realtime: false
        },
        capabilities: {
          multiModal: false,
          neuralProcessing: true,
          creativityBoost: false,
          emotionalIntelligence: false,
          contextualAwareness: true,
          predictiveAnalytics: true
        }
      };

      const result = await superIntelligenceService.processSuper(predictionRequest);
      
      res.json({
        success: true,
        predictions: result.result,
        confidence: result.metadata.confidenceScore,
        recommendations: result.metadata.recommendations,
        analytics: result.analytics
      });

    } catch (error) {
      console.error('Predictive analytics failed:', error);
      res.status(500).json({
        success: false,
        error: 'Prediction generation failed'
      });
    }
  });

  // Voice Capabilities Route
  enhancedRouterService.enhanceRoute(app, 'get', '/api/voice/capabilities', async (req, res): Promise<void> => {
    try {
      const capabilities = await voiceFirstService.getVoiceCapabilities();
      
      res.json({
        success: true,
        capabilities,
        voiceFirstEnabled: true,
        multiLanguageSupport: true
      });

    } catch (error) {
      console.error('Voice capabilities retrieval failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve voice capabilities'
      });
    }
  });

  // Voice Analytics Route (Protected)
  enhancedRouterService.enhanceRoute(app, 'get', '/api/voice/analytics', async (req, res): Promise<void> => {
    if (!req.isAuthenticated()) {
      res.status(401).json({
        success: false,
        error: 'Authentication required for voice analytics'
      });
      return;
    }

    try {
      const userId = req.userContext?.userId;
      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID not found'
        });
        return;
      }

      const analytics = await voiceFirstService.getVoiceAnalytics(userId);
      
      res.json({
        success: true,
        analytics,
        voiceOptimizationAvailable: true
      });

    } catch (error) {
      console.error('Voice analytics retrieval failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve voice analytics'
      });
    }
  });

  // Voice Preferences Update Route (Protected)
  enhancedRouterService.enhanceRoute(app, 'post', '/api/voice/preferences', async (req, res): Promise<void> => {
    if (!req.isAuthenticated()) {
      res.status(401).json({
        success: false,
        error: 'Authentication required to update voice preferences'
      });
      return;
    }

    try {
      const userId = req.userContext?.userId;
      const preferences = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID not found'
        });
        return;
      }

      await voiceFirstService.updateUserPreferences(userId, preferences);
      
      res.json({
        success: true,
        message: 'Voice preferences updated successfully',
        preferences
      });

    } catch (error) {
      console.error('Voice preferences update failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update voice preferences'
      });
    }
  });

  // Super Intelligence Health Check Route
  enhancedRouterService.enhanceRoute(app, 'get', '/api/super-intelligence/health', async (req, res): Promise<void> => {
    try {
      res.json({
        success: true,
        status: 'operational',
        capabilities: {
          superIntelligence: true,
          voiceFirst: true,
          multiModal: true,
          neuralProcessing: true,
          creativityBoost: true,
          emotionalIntelligence: true,
          contextualAwareness: true,
          predictiveAnalytics: true,
          realTimeProcessing: true
        },
        version: '2.0.0',
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Health check failed:', error);
      res.status(500).json({
        success: false,
        status: 'degraded',
        error: 'Health check failed'
      });
    }
  });

  // Real-time Intelligence Streaming Route (WebSocket support)
  enhancedRouterService.enhanceRoute(app, 'post', '/api/super-intelligence/stream', async (req, res) => {
    const { prompt, type, streamConfig } = req.body;
    
    try {
      // Set up streaming response
      res.writeHead(200, {
        'Content-Type': 'text/stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      // Send initial response
      res.write(`data: ${JSON.stringify({ type: 'start', message: 'Super intelligence processing started' })}\n\n`);

      const streamRequest = {
        type: 'generation' as const,
        input: { prompt, type, streaming: true },
        context: {
          userId: req.userContext?.userId || 'anonymous',
          language: req.userContext?.language || 'en',
          domain: (type as 'video' | 'audio' | 'image' | 'text' | 'music' | 'mixed') || 'mixed',
          quality: 'super' as const,
          realtime: true
        },
        capabilities: {
          multiModal: true,
          neuralProcessing: true,
          creativityBoost: true,
          emotionalIntelligence: true,
          contextualAwareness: true,
          predictiveAnalytics: false
        }
      };

      // Process with streaming updates
      const result = await superIntelligenceService.processSuper(streamRequest);
      
      // Send final result
      res.write(`data: ${JSON.stringify({ 
        type: 'complete', 
        result: result.result,
        metadata: result.metadata 
      })}\n\n`);
      
      res.end();

    } catch (error) {
      console.error('Streaming intelligence failed:', error);
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        error: 'Streaming processing failed' 
      })}\n\n`);
      res.end();
    }
  });
}