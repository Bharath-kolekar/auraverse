import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";
import { superIntelligenceService } from "./services/superIntelligenceService";
import { storage } from "./storage";
import Stripe from "stripe";

// Initialize Stripe if keys are available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil",
  });
}

export function registerIntelligenceRoutes(app: Express): void {
  
  // Get available intelligence models and pricing
  app.get('/api/intelligence/models', async (req, res) => {
    try {
      const pricing = superIntelligenceService.getIntelligencePricing();
      res.json({
        models: pricing,
        tiers: {
          basic: { description: 'Local AI processing', cost: 'Free' },
          pro: { description: 'Advanced open-source models', cost: '1-3 credits per use' },
          ultimate: { description: 'Super intelligence features', cost: '4-5 credits per use' }
        }
      });
    } catch (error) {
      console.error("Error fetching intelligence models:", error);
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });

  // Generate content using intelligence models
  app.post('/api/intelligence/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { modelType, prompt, parameters } = req.body;

      if (!modelType || !prompt) {
        return res.status(400).json({ message: "Model type and prompt are required" });
      }

      const result = await superIntelligenceService.generateWithIntelligence(
        userId,
        modelType,
        prompt,
        parameters || {}
      );

      res.json(result);
    } catch (error) {
      console.error("Error generating with intelligence:", error);
      
      if (error instanceof Error) {
        if (error.message === 'Insufficient intelligence credits') {
          return res.status(402).json({ 
            message: "Insufficient credits", 
            code: "INSUFFICIENT_CREDITS",
            needsCredits: true 
          });
        }
        if (error.message === 'Unknown intelligence model') {
          return res.status(400).json({ message: "Invalid model type" });
        }
      }
      
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  // Get user's credit balance
  app.get('/api/intelligence/credits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user's current credits (this would come from your storage system)
      const credits = await storage.getUserCredits?.(userId) || { credits: 0, tier: 'basic' };
      
      res.json({
        credits: credits.credits || 0,
        tier: credits.tier || 'basic',
        pricing: superIntelligenceService.getIntelligencePricing()
      });
    } catch (error) {
      console.error("Error fetching user credits:", error);
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });

  // Purchase credits
  app.post('/api/intelligence/purchase', isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          message: "Payment processing unavailable", 
          useLocal: true,
          freeCredits: 100 // Offer free credits when Stripe unavailable
        });
      }

      const userId = req.user.claims.sub;
      const { tier } = req.body;

      if (!['basic', 'pro', 'ultimate'].includes(tier)) {
        return res.status(400).json({ message: "Invalid tier" });
      }

      const creditPackage = superIntelligenceService.calculateCreditValue(tier as any);
      
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(creditPackage.price * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          userId,
          tier,
          credits: creditPackage.credits.toString()
        }
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        amount: creditPackage.price,
        credits: creditPackage.credits,
        tier
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // Webhook for successful payments
  app.post('/api/intelligence/webhook', async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Stripe not configured" });
      }

      const sig = req.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !webhookSecret) {
        return res.status(400).json({ message: "Invalid webhook" });
      }

      const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, tier, credits } = paymentIntent.metadata;

        if (userId && tier && credits) {
          // Add credits to user account
          await storage.addUserCredits?.(userId, parseInt(credits), tier);
          console.log(`Added ${credits} credits to user ${userId}`);
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).json({ message: "Webhook failed" });
    }
  });

  // Get usage history
  app.get('/api/intelligence/usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit = 20, offset = 0 } = req.query;

      const usage = await storage.getUserIntelligenceUsage?.(userId, {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }) || [];

      res.json({
        usage,
        total: usage.length,
        summary: {
          totalCreditsUsed: usage.reduce((sum: number, u: any) => sum + u.creditsUsed, 0),
          mostUsedModel: usage.length > 0 ? usage[0].modelType : null
        }
      });
    } catch (error) {
      console.error("Error fetching usage history:", error);
      res.status(500).json({ message: "Failed to fetch usage" });
    }
  });

  // Free credits for new users or when Stripe unavailable
  app.post('/api/intelligence/free-credits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if user already received free credits
      const existingCredits = await storage.getUserCredits?.(userId);
      
      if (!existingCredits || existingCredits.credits === 0) {
        // Give new users 100 free credits
        await storage.addUserCredits?.(userId, 100, 'basic');
        
        res.json({
          message: "Welcome! You've received 100 free intelligence credits",
          credits: 100,
          tier: 'basic'
        });
      } else {
        res.json({
          message: "You already have credits",
          credits: existingCredits.credits,
          tier: existingCredits.tier
        });
      }
    } catch (error) {
      console.error("Error adding free credits:", error);
      res.status(500).json({ message: "Failed to add free credits" });
    }
  });
}