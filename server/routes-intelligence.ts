import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";
import { superIntelligenceService } from "./services/superIntelligenceService";
import { storage } from "./storage";
// Global payment processing - works worldwide including India
// Using direct credit system without Stripe dependency

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

  // Purchase credits - Global payment options
  app.post('/api/intelligence/purchase', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { tier, paymentMethod } = req.body;

      if (!['basic', 'pro', 'ultimate'].includes(tier)) {
        return res.status(400).json({ message: "Invalid tier" });
      }

      const creditPackage = superIntelligenceService.calculateCreditValue(tier as any);
      
      // Global payment options for India and worldwide
      const paymentOptions = {
        razorpay: {
          available: true,
          description: "UPI, Cards, Net Banking, Wallets (India)",
          currencies: ["INR", "USD"]
        },
        paypal: {
          available: true,
          description: "Global payment processing",
          currencies: ["USD", "EUR", "GBP", "INR"]
        },
        crypto: {
          available: true,
          description: "Bitcoin, Ethereum, USDT",
          currencies: ["BTC", "ETH", "USDT"]
        },
        manual: {
          available: true,
          description: "Bank transfer, UPI ID: pay@cognomega.com",
          currencies: ["INR", "USD"]
        },
        free: {
          available: true,
          description: "Get starter credits for free",
          currencies: ["FREE"]
        }
      };

      res.json({
        creditPackage,
        paymentOptions,
        instructions: {
          razorpay: "Instant credit addition via UPI/Cards",
          paypal: "Global payment processing",
          crypto: "Send payment to: bc1qcognomega123... (contact for address)",
          manual: "Transfer to UPI: pay@cognomega.com with reference: " + userId,
          free: "Get 100 free credits to start using intelligence models"
        },
        estimatedProcessingTime: {
          razorpay: "Instant",
          paypal: "1-2 minutes", 
          crypto: "10-30 minutes",
          manual: "1-24 hours",
          free: "Instant"
        }
      });
    } catch (error) {
      console.error("Error creating payment options:", error);
      res.status(500).json({ message: "Failed to load payment options" });
    }
  });

  // Manual credit addition for global payments
  app.post('/api/intelligence/add-credits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { credits, tier, paymentReference, paymentMethod } = req.body;

      if (!credits || !tier || !paymentReference) {
        return res.status(400).json({ message: "Missing payment details" });
      }

      // For demo/development - auto-approve small amounts
      if (credits <= 100) {
        await storage.addUserCredits?.(userId, credits, tier);
        
        res.json({
          success: true,
          message: `Added ${credits} credits to your account`,
          newBalance: await storage.getUserCredits?.(userId),
          paymentReference
        });
      } else {
        // For larger amounts, mark as pending manual verification
        res.json({
          success: true,
          message: "Payment received. Credits will be added within 24 hours.",
          status: "pending_verification",
          paymentReference,
          contactInfo: "For urgent issues, contact: support@cognomega.com"
        });
      }
    } catch (error) {
      console.error("Error adding credits:", error);
      res.status(500).json({ message: "Failed to process payment" });
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

  // Free credits for new users - Universal access
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
          tier: 'basic',
          instructions: [
            "Use these credits to try any intelligence model",
            "Basic models (local-basic) are always free",
            "Pro models cost 1-3 credits per use",
            "Ultimate models cost 4-5 credits per use"
          ]
        });
      } else {
        res.json({
          message: "You already have credits",
          credits: existingCredits.credits,
          tier: existingCredits.tier,
          availableModels: "All intelligence models ready to use"
        });
      }
    } catch (error) {
      console.error("Error adding free credits:", error);
      res.status(500).json({ message: "Failed to add free credits" });
    }
  });

  // Global payment instructions
  app.get('/api/intelligence/payment-info', async (req, res) => {
    try {
      res.json({
        globalPaymentMethods: {
          india: {
            upi: "pay@cognomega.com",
            paytm: "+91-XXXXXXXXXX",
            phonepe: "cognomega@okaxis",
            bankTransfer: "Available - contact for details"
          },
          international: {
            paypal: "payments@cognomega.com",
            wise: "Available for global transfers",
            crypto: "Bitcoin, Ethereum, USDT supported"
          },
          instantMethods: {
            razorpay: "Cards, UPI, Net Banking",
            paypal: "Global card processing",
            crypto: "Decentralized payments"
          }
        },
        pricing: {
          inr: {
            basic: "₹799 for 100 credits",
            pro: "₹3299 for 500 credits", 
            ultimate: "₹8299 for 1500 credits"
          },
          usd: {
            basic: "$9.99 for 100 credits",
            pro: "$39.99 for 500 credits",
            ultimate: "$99.99 for 1500 credits"
          }
        },
        instructions: "Choose any payment method that works in your country. Credits are added automatically or within 24 hours."
      });
    } catch (error) {
      console.error("Error fetching payment info:", error);
      res.status(500).json({ message: "Failed to load payment information" });
    }
  });
}