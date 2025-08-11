// AWS-Style Pricing Routes
// Implements Reserved Instances, Spot Pricing, Cost Calculator, and more

import express from 'express';
import { monetizationService } from './services/monetization-service';
import { isAuthenticated } from './replitAuth';

const router = express.Router();

// Get AWS-style pricing overview
router.get('/pricing-models', (req: any, res) => {
  try {
    const region = req.query.region || 'IN';
    const userId = req.user?.claims?.sub || 'anonymous';
    
    // Get all pricing options
    const spotPricing = monetizationService.getSpotPricing();
    const freeTier = monetizationService.getFreeTierBenefits(userId);
    const volumeExample = monetizationService.calculateWithVolumeDiscounts(1000, region);
    const reservedInstances = monetizationService.getUserReservedInstances(userId);
    
    res.json({
      success: true,
      models: {
        onDemand: {
          name: 'Pay-as-You-Go',
          description: 'No commitment, pay only for what you use',
          pricePerCredit: 1.0,
          flexibility: 'Maximum',
          savings: '0%'
        },
        reserved: {
          name: 'Reserved Credits',
          description: 'Commit to 1 or 3 years for significant savings',
          options: {
            '1-year': {
              'all-upfront': { discount: '40%', payment: 'One-time' },
              'partial-upfront': { discount: '35%', payment: 'Half upfront, half monthly' },
              'no-upfront': { discount: '30%', payment: 'Monthly' }
            },
            '3-year': {
              'all-upfront': { discount: '72%', payment: 'One-time' },
              'partial-upfront': { discount: '65%', payment: 'Half upfront, half monthly' },
              'no-upfront': { discount: '54%', payment: 'Monthly' }
            }
          },
          userInstances: reservedInstances
        },
        spot: {
          name: 'Spot Pricing',
          description: 'Use unused capacity at deep discounts',
          currentDiscount: `${(spotPricing.spotDiscount * 100).toFixed(0)}%`,
          availability: `${(spotPricing.availability * 100).toFixed(0)}%`,
          terminationRisk: spotPricing.terminationRisk,
          recommendedFor: spotPricing.recommendedWorkloads,
          maxDuration: `${spotPricing.maxDuration} minutes`
        },
        volume: {
          name: 'Volume Discounts',
          description: 'Automatic discounts as usage increases',
          tiers: [
            { range: '0-50 credits', discount: '0%' },
            { range: '51-500 credits', discount: '15%' },
            { range: '501-5000 credits', discount: '30%' },
            { range: '5001-50000 credits', discount: '45%' },
            { range: '50000+ credits', discount: '60%' }
          ],
          example: volumeExample
        },
        freeTier: {
          name: 'Free Tier',
          description: 'Free credits for new users and always-free services',
          benefits: freeTier
        }
      },
      message: 'AWS-inspired pricing models for maximum flexibility and savings'
    });
  } catch (error) {
    console.error('Failed to get pricing models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve pricing models'
    });
  }
});

// Purchase Reserved Instance
router.post('/reserved/purchase', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { creditsPerMonth, term, paymentOption } = req.body;
    
    if (!creditsPerMonth || !term || !paymentOption) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: creditsPerMonth, term, paymentOption'
      });
    }
    
    const reservedInstance = monetizationService.purchaseReservedCredits(
      userId,
      creditsPerMonth,
      term,
      paymentOption
    );
    
    res.json({
      success: true,
      reservedInstance,
      message: `Reserved Instance purchased: ${term} commitment with ${paymentOption} payment`
    });
  } catch (error) {
    console.error('Failed to purchase Reserved Instance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to purchase Reserved Instance'
    });
  }
});

// Get user's Reserved Instances
router.get('/reserved/list', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const instances = monetizationService.getUserReservedInstances(userId);
    
    res.json({
      success: true,
      reservedInstances: instances,
      totalSavings: instances.reduce((sum, ri) => sum + ri.totalSavings, 0)
    });
  } catch (error) {
    console.error('Failed to get Reserved Instances:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve Reserved Instances'
    });
  }
});

// Get current Spot pricing
router.get('/spot/pricing', (req, res) => {
  try {
    const spotPricing = monetizationService.getSpotPricing();
    
    res.json({
      success: true,
      spot: {
        ...spotPricing,
        currentPrice: `$${spotPricing.currentPrice.toFixed(3)}/credit`,
        discount: `${(spotPricing.spotDiscount * 100).toFixed(0)}% off`,
        status: spotPricing.availability > 0.5 ? 'Available' : 'Limited',
        recommendation: spotPricing.terminationRisk === 'low' 
          ? 'Great time to use Spot!' 
          : 'Consider On-Demand for critical workloads'
      }
    });
  } catch (error) {
    console.error('Failed to get Spot pricing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve Spot pricing'
    });
  }
});

// Cost Calculator
router.post('/calculate', (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || 'anonymous';
    const { 
      estimatedCredits, 
      estimatedDataGB = 0,
      considerReserved = true,
      considerSpot = true,
      region = 'IN'
    } = req.body;
    
    if (!estimatedCredits) {
      return res.status(400).json({
        success: false,
        error: 'estimatedCredits is required'
      });
    }
    
    const estimate = monetizationService.estimateCost(
      userId,
      estimatedCredits,
      estimatedDataGB,
      { considerReserved, considerSpot, region }
    );
    
    // Calculate comparison
    const standardCost = estimatedCredits * 1.0;
    const percentSavings = ((standardCost - estimate.estimatedCost) / standardCost * 100).toFixed(1);
    
    res.json({
      success: true,
      estimate: {
        ...estimate,
        standardCost,
        percentSavings: `${percentSavings}%`,
        region,
        currency: region === 'IN' ? 'INR' : 'USD',
        recommendation: estimate.estimatedCost < standardCost * 0.5 
          ? 'Excellent cost optimization!' 
          : 'Consider Reserved Instances for more savings'
      }
    });
  } catch (error) {
    console.error('Cost calculation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate cost'
    });
  }
});

// Set budget alert
router.post('/budget/set', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { threshold, type = 'credits', frequency = 'monthly', actions = ['email'] } = req.body;
    
    if (!threshold) {
      return res.status(400).json({
        success: false,
        error: 'threshold is required'
      });
    }
    
    const alert = monetizationService.setBudgetAlert(
      userId,
      threshold,
      type,
      frequency,
      actions
    );
    
    res.json({
      success: true,
      budgetAlert: alert,
      message: `Budget alert set: ${threshold} ${type} with ${frequency} monitoring`
    });
  } catch (error) {
    console.error('Failed to set budget alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set budget alert'
    });
  }
});

// Get Free Tier benefits
router.get('/free-tier', (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || 'anonymous';
    const benefits = monetizationService.getFreeTierBenefits(userId);
    
    const totalFreeCredits = benefits.reduce((sum: number, benefit: any) => 
      sum + benefit.creditsPerMonth, 0
    );
    
    res.json({
      success: true,
      freeTier: {
        benefits,
        totalFreeCredits,
        message: totalFreeCredits > 0 
          ? `You have ${totalFreeCredits} free credits available!`
          : 'Sign up to get free tier benefits'
      }
    });
  } catch (error) {
    console.error('Failed to get free tier benefits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve free tier benefits'
    });
  }
});

// Get volume pricing breakdown
router.get('/volume-pricing/:credits', (req, res) => {
  try {
    const credits = parseInt(req.params.credits);
    const region = req.query.region as string || 'IN';
    
    if (isNaN(credits) || credits <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credits amount'
      });
    }
    
    const volumePricing = monetizationService.calculateWithVolumeDiscounts(credits, region);
    
    res.json({
      success: true,
      volumePricing: {
        ...volumePricing,
        percentSaved: ((volumePricing.savings / volumePricing.standardCost) * 100).toFixed(1) + '%',
        region,
        message: volumePricing.savings > 0 
          ? `Volume discount saves you $${volumePricing.savings.toFixed(2)}!`
          : 'Purchase more credits to unlock volume discounts'
      }
    });
  } catch (error) {
    console.error('Failed to calculate volume pricing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate volume pricing'
    });
  }
});

// Get effective price with all discounts
router.post('/effective-price', (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || 'anonymous';
    const { credits, useSpot = false, region = 'IN' } = req.body;
    
    if (!credits) {
      return res.status(400).json({
        success: false,
        error: 'credits is required'
      });
    }
    
    const pricing = monetizationService.getEffectivePrice(userId, credits, useSpot, region);
    
    res.json({
      success: true,
      pricing: {
        ...pricing,
        totalSavings: `$${(pricing.basePrice - pricing.effectivePrice).toFixed(2)}`,
        savingsPercentage: `${((pricing.basePrice - pricing.effectivePrice) / pricing.basePrice * 100).toFixed(1)}%`,
        recommendation: pricing.discounts.total > 50 
          ? 'Excellent optimization!' 
          : 'Consider Reserved Instances or Spot pricing for more savings'
      }
    });
  } catch (error) {
    console.error('Failed to calculate effective price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate effective price'
    });
  }
});

// Data transfer cost calculator
router.get('/data-transfer/:gb', (req, res) => {
  try {
    const gb = parseFloat(req.params.gb);
    
    if (isNaN(gb) || gb < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data amount'
      });
    }
    
    const cost = monetizationService.calculateDataTransferCost(gb);
    
    res.json({
      success: true,
      dataTransfer: {
        ...cost,
        gbTransferred: gb,
        averagePricePerGB: gb > 0 ? (cost.cost / gb).toFixed(4) : 0,
        message: gb > 10000 
          ? 'Consider data compression and CDN for cost optimization'
          : 'Data transfer costs are optimized for your usage level'
      }
    });
  } catch (error) {
    console.error('Failed to calculate data transfer cost:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate data transfer cost'
    });
  }
});

export default router;