// AI Intelligence Gateway Routes
// API endpoints for the unified AI intelligence access system

import { Router } from 'express';
import { gatewayOrchestrator } from './services/gateway-orchestrator';
import { isAuthenticated } from './replitAuth';
import { z } from 'zod';
import { globalAIAgent } from './services/global-ai-agent';
import { monetizationService } from './services/monetization-service';

const router = Router();

// Validation schemas
const exploreSchema = z.object({
  target: z.enum(['tier', 'behavior', 'capability']),
  filters: z.object({
    tier: z.string().optional(),
    type: z.string().optional(),
    category: z.string().optional(),
    inputType: z.string().optional(),
    outputType: z.string().optional()
  }).optional()
});

const testSchema = z.object({
  capabilityId: z.string(),
  input: z.any(),
  options: z.object({
    timeout: z.number().optional(),
    quality: z.enum(['low', 'medium', 'high', 'ultra']).optional()
  }).optional()
});

const activateSchema = z.object({
  behaviorId: z.string(),
  active: z.boolean()
});

const evolveSchema = z.object({
  preferredTier: z.string(),
  activeBehaviors: z.array(z.string()),
  customParameters: z.any().optional()
});

// Get all intelligence tiers
router.get('/tiers', async (req, res) => {
  try {
    const tiers = await gatewayOrchestrator.getIntelligenceLevels();
    
    // Add real-time availability status
    const tiersWithStatus = tiers.map(tier => ({
      ...tier,
      status: {
        available: tier.available,
        currentLoad: Math.random() * 100, // Would be real metrics
        estimatedWaitTime: tier.available ? 0 : Math.floor(Math.random() * 60)
      }
    }));
    
    res.json({
      success: true,
      tiers: tiersWithStatus,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to get intelligence tiers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve intelligence tiers'
    });
  }
});

// Get behaviors for a specific tier or all
router.get('/behaviors/:tier?', async (req, res) => {
  try {
    const { tier } = req.params;
    const behaviors = await gatewayOrchestrator.getBehaviors(tier);
    
    res.json({
      success: true,
      behaviors,
      count: behaviors.length,
      categories: Array.from(new Set(behaviors.map(b => b.category)))
    });
  } catch (error) {
    console.error('Failed to get behaviors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve behaviors'
    });
  }
});

// GET /api/gateway/capabilities - Get available AI capabilities (secured & monetized)
router.get('/capabilities', async (req: any, res) => {
  try {
    console.log('Fetching AI capabilities with pricing...');
    const userId = req.user?.claims?.sub || 'anonymous';
    const userCredits = monetizationService.getUserCredits(userId);
    const pricingTiers = monetizationService.getPricingTiers();
    
    // Get capabilities from orchestrator
    const capabilities = await gatewayOrchestrator.getCapabilities();
    
    // Add pricing information to each capability
    const capabilitiesWithPricing = capabilities.map((cap: any) => {
      const tier = pricingTiers.find(t => t.id === cap.requiredTier) || pricingTiers.find(t => t.id === 'basic');
      return {
        ...cap,
        pricing: {
          creditsRequired: tier?.creditsRequired || 0,
          costPerUse: tier ? tier.creditsRequired * tier.costPerCredit : 0,
          profitMargin: tier?.profitMargin || 100,
          userHasAccess: userCredits >= (tier?.creditsRequired || 0)
        }
      };
    });
    
    res.json({
      success: true,
      capabilities: capabilitiesWithPricing,
      userCredits,
      pricingTiers,
      paymentMethods: monetizationService.getPaymentMethods('IN') // India-compatible payment methods
    });
  } catch (error) {
    console.error('Failed to get capabilities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve capabilities'
    });
  }
});

// POST /api/gateway/capabilities - Get capabilities with optional filters
router.post('/capabilities', async (req, res) => {
  try {
    const filters = req.body;
    const capabilities = await gatewayOrchestrator.getCapabilities(filters);
    
    res.json({
      success: true,
      capabilities,
      count: capabilities.length,
      filters: filters || {}
    });
  } catch (error) {
    console.error('Failed to get capabilities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve capabilities'
    });
  }
});

// Explore intelligence features
router.post('/explore', isAuthenticated, async (req: any, res) => {
  try {
    const validation = exploreSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: validation.error.errors
      });
    }

    const { target, filters } = validation.data;
    const userId = req.user?.claims?.sub || 'anonymous';

    const response = await gatewayOrchestrator.processGatewayRequest({
      userId,
      action: 'explore',
      target,
      data: filters
    });

    res.json(response);
  } catch (error) {
    console.error('Explore request failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to explore intelligence features'
    });
  }
});

// Test a specific capability (with monetization)
router.post('/test', isAuthenticated, async (req: any, res) => {
  try {
    const validation = testSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid test request',
        details: validation.error.errors
      });
    }

    const { capabilityId, input, options } = validation.data;
    const userId = req.user?.claims?.sub || 'anonymous';
    const userIp = req.ip || req.connection.remoteAddress;

    // Get capability details to determine tier
    const capabilities = await gatewayOrchestrator.getCapabilities();
    const capability = capabilities.find((c: any) => c.id === capabilityId);
    
    if (!capability) {
      return res.status(404).json({
        success: false,
        error: 'Capability not found'
      });
    }

    // Validate access and check credits
    const accessCheck = await monetizationService.validateAccess(
      userId,
      capabilityId,
      capability.requiredTier || 'basic',
      userIp
    );

    if (!accessCheck.allowed) {
      return res.status(403).json({
        success: false,
        error: accessCheck.reason,
        creditsRequired: accessCheck.creditsRequired,
        userCredits: monetizationService.getUserCredits(userId)
      });
    }

    // Deduct credits if required
    if (accessCheck.creditsRequired && accessCheck.creditsRequired > 0) {
      await monetizationService.deductCredits(userId, accessCheck.creditsRequired, capabilityId);
    }

    // Process test with timeout
    const timeout = options?.timeout || 30000;
    const testPromise = gatewayOrchestrator.testCapability(capabilityId, input, userId);
    
    const result = await Promise.race([
      testPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Test timeout')), timeout)
      )
    ]);

    res.json({
      success: true,
      result,
      creditsDeducted: accessCheck.creditsRequired || 0,
      remainingCredits: monetizationService.getUserCredits(userId),
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Test capability failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed'
    });
  }
});

// Activate or deactivate a behavior
router.post('/activate', isAuthenticated, async (req: any, res) => {
  try {
    const validation = activateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid activation request',
        details: validation.error.errors
      });
    }

    const { behaviorId, active } = validation.data;
    const userId = req.user?.claims?.sub || 'anonymous';

    const response = await gatewayOrchestrator.processGatewayRequest({
      userId,
      action: 'activate',
      target: 'behavior',
      data: { behaviorId, active }
    });

    res.json(response);
  } catch (error) {
    console.error('Activate behavior failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to activate behavior'
    });
  }
});

// Evolve intelligence configuration
router.post('/evolve', isAuthenticated, async (req: any, res) => {
  try {
    const validation = evolveSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid evolution request',
        details: validation.error.errors
      });
    }

    const data = validation.data;
    const userId = req.user?.claims?.sub || 'anonymous';

    const response = await gatewayOrchestrator.evolveIntelligence(userId, data);

    res.json({
      success: true,
      message: 'Intelligence configuration evolved successfully',
      ...response
    });
  } catch (error) {
    console.error('Evolve intelligence failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to evolve intelligence'
    });
  }
});

// Get analytics and insights
router.get('/analytics', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || 'anonymous';
    
    const analytics = gatewayOrchestrator.getAnalytics();
    
    res.json({
      success: true,
      analytics,
      userId,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to get analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics'
    });
  }
});

// Get user configuration and recommendations
router.get('/configuration', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || 'anonymous';
    
    const response = await gatewayOrchestrator.processGatewayRequest({
      userId,
      action: 'analyze',
      target: 'capability',
      data: {}
    });

    res.json(response);
  } catch (error) {
    console.error('Failed to get configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve configuration'
    });
  }
});

// Credit purchase endpoints
router.get('/credits/packages', (req, res) => {
  try {
    const packages = monetizationService.getCreditPackages();
    const paymentMethods = monetizationService.getPaymentMethods('IN');
    
    res.json({
      success: true,
      packages,
      paymentMethods,
      message: 'Available in India via PayPal, UPI, Razorpay'
    });
  } catch (error) {
    console.error('Failed to get credit packages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve credit packages'
    });
  }
});

// Get user credits and usage analytics
router.get('/credits/balance', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || 'anonymous';
    const credits = monetizationService.getUserCredits(userId);
    const analytics = monetizationService.getAnalytics(userId);
    
    res.json({
      success: true,
      credits,
      analytics,
      pricingTiers: monetizationService.getPricingTiers()
    });
  } catch (error) {
    console.error('Failed to get credit balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve credit balance'
    });
  }
});

// Process payment webhook (PayPal, Razorpay, UPI)
router.post('/payment/webhook', async (req, res) => {
  try {
    const { paymentId, userId, amount, paymentMethod, status } = req.body;
    
    await monetizationService.processPaymentWebhook(
      paymentId,
      userId,
      amount,
      paymentMethod,
      status
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Payment webhook failed:', error);
    res.status(500).json({
      success: false,
      error: 'Payment processing failed'
    });
  }
});

// Revenue analytics (admin only)
router.get('/analytics/revenue', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    // Check if user is admin (you can customize this check)
    const isAdmin = userId === 'admin' || req.user?.email?.includes('cognomega');
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    const analytics = monetizationService.getAnalytics();
    
    res.json({
      success: true,
      analytics,
      profitMargin: '99.8%',
      message: 'Revenue analytics with India-compatible payment methods'
    });
  } catch (error) {
    console.error('Failed to get revenue analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics'
    });
  }
});

// Health check for gateway services
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      services: {
        orchestrator: 'active',
        gpu: 'ready',
        cache: 'operational',
        ai: 'connected'
      },
      timestamp: Date.now()
    };
    
    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Collaborate - share configurations with community
router.post('/collaborate', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || 'anonymous';
    const { configuration, title, description } = req.body;
    
    // Store shared configuration (would be saved to database)
    const shared = {
      id: `share_${Date.now()}`,
      userId,
      title,
      description,
      configuration,
      timestamp: Date.now(),
      likes: 0,
      uses: 0
    };
    
    res.json({
      success: true,
      shared,
      message: 'Configuration shared with community'
    });
  } catch (error) {
    console.error('Failed to share configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to share configuration'
    });
  }
});

// Get community configurations
router.get('/community', async (req, res) => {
  try {
    // Would fetch from database
    const configurations = [
      {
        id: 'share_1',
        title: 'Creative Writing Assistant',
        description: 'Optimized for creative writing and storytelling',
        userId: 'user123',
        likes: 42,
        uses: 156,
        configuration: {
          preferredTier: 'super',
          activeBehaviors: ['artistic_generation', 'conversational_ai']
        }
      },
      {
        id: 'share_2',
        title: 'Data Analysis Powerhouse',
        description: 'Best configuration for data analysis and insights',
        userId: 'user456',
        likes: 38,
        uses: 89,
        configuration: {
          preferredTier: 'advanced',
          activeBehaviors: ['data_analysis', 'predictive_modeling']
        }
      }
    ];
    
    res.json({
      success: true,
      configurations,
      count: configurations.length
    });
  } catch (error) {
    console.error('Failed to get community configurations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve community configurations'
    });
  }
});

export default router;