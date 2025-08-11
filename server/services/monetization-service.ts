// Monetization Service - Pay-per-Intelligence System
// Comprehensive profit-making logic with 99.8% margins

// Monetization imports - using in-memory storage for now
// Database imports commented out until needed

interface PricingTier {
  id: string;
  name: string;
  creditsRequired: number;
  costPerCredit: number;
  features: string[];
  profitMargin: number;
}

interface UsageMetrics {
  userId: string;
  capability: string;
  creditsUsed: number;
  revenue: number;
  cost: number;
  profit: number;
  timestamp: Date;
}

interface PaymentMethod {
  id: string;
  name: string;
  available: boolean;
  countries: string[];
  processingFee: number;
}

class MonetizationService {
  private readonly basePricingTiers: Map<string, PricingTier> = new Map([
    ['basic', {
      id: 'basic',
      name: 'Basic Intelligence',
      creditsRequired: 0,
      costPerCredit: 0,
      features: ['Template-based generation', 'Local processing'],
      profitMargin: 100 // 100% profit (free tier, no cost)
    }],
    ['advanced', {
      id: 'advanced',
      name: 'Advanced Intelligence',
      creditsRequired: 3,
      costPerCredit: 0.50, // Base price, adjusted dynamically
      features: ['GPT-4o powered', 'GPU acceleration', 'High quality'],
      profitMargin: 98.5 // 98.5% profit margin
    }],
    ['super', {
      id: 'super',
      name: 'Super Intelligence',
      creditsRequired: 5,
      costPerCredit: 0.80, // Base price, adjusted dynamically
      features: ['Neural processing', 'WebGPU optimization', 'Real-time'],
      profitMargin: 99.2 // 99.2% profit margin
    }],
    ['quantum', {
      id: 'quantum',
      name: 'Quantum Intelligence',
      creditsRequired: 10,
      costPerCredit: 1.00, // Base price, adjusted dynamically
      features: ['Quantum-inspired', 'Multi-modal', 'Unlimited quality'],
      profitMargin: 99.8 // 99.8% profit margin
    }]
  ]);

  // Dynamic pricing factors
  private serverLoad: number = 0.5; // 0-1 scale
  private demandMultiplier: number = 1.0; // Market demand factor
  private peakHours: Set<number> = new Set([9, 10, 11, 14, 15, 16, 17, 18, 19, 20]);
  private loyaltyLevels: Map<string, number> = new Map(); // User loyalty tiers
  private regionalPricing: Map<string, number> = new Map([
    ['US', 1.0],
    ['EU', 0.95],
    ['IN', 0.40], // 60% discount for India
    ['BR', 0.50], // 50% discount for Brazil
    ['CN', 0.45], // 55% discount for China
    ['NG', 0.35], // 65% discount for Nigeria
    ['ID', 0.40], // 60% discount for Indonesia
    ['PH', 0.45], // 55% discount for Philippines
    ['VN', 0.40], // 60% discount for Vietnam
    ['EG', 0.35], // 65% discount for Egypt
    ['default', 0.80] // 20% discount for other regions
  ]);

  private readonly paymentMethods: PaymentMethod[] = [
    {
      id: 'paypal',
      name: 'PayPal',
      available: true,
      countries: ['worldwide'],
      processingFee: 0.029 // 2.9% + $0.30
    },
    {
      id: 'razorpay',
      name: 'Razorpay',
      available: true,
      countries: ['IN', 'MY', 'SG'],
      processingFee: 0.02 // 2% for Indian cards
    },
    {
      id: 'upi',
      name: 'UPI (Unified Payments Interface)',
      available: true,
      countries: ['IN'],
      processingFee: 0.0 // No fee for UPI
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      available: true,
      countries: ['worldwide'],
      processingFee: 0.01 // 1% network fee
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      available: true,
      countries: ['worldwide'],
      processingFee: 0.005 // 0.5% for wire transfers
    }
  ];

  private usageMetrics: UsageMetrics[] = [];
  private userCredits: Map<string, number> = new Map();
  private revenueTracker: number = 0;
  private profitTracker: number = 0;

  constructor() {
    console.log('💰 Monetization Service initialized with dynamic pricing optimization');
    this.startDynamicPricingEngine();
    this.initializeLoyaltyProgram();
  }

  // Start dynamic pricing engine
  private startDynamicPricingEngine() {
    setInterval(() => {
      // Simulate server load changes
      this.serverLoad = 0.3 + Math.random() * 0.5;
      
      // Update demand based on time of day
      const hour = new Date().getHours();
      this.demandMultiplier = this.peakHours.has(hour) ? 1.2 : 0.9;
      
      console.log(`📊 Dynamic pricing update: Load ${(this.serverLoad * 100).toFixed(0)}%, Demand ${this.demandMultiplier}x`);
    }, 60000); // Update every minute
  }

  // Initialize loyalty program
  private initializeLoyaltyProgram() {
    // Loyalty tiers: 0-100 uses = Bronze, 101-500 = Silver, 501-1000 = Gold, 1000+ = Platinum
    console.log('🎁 Loyalty program initialized with progressive bonuses');
  }

  // Get user loyalty level and bonus
  private getUserLoyaltyBonus(userId: string): { level: string; bonus: number } {
    const uses = this.usageMetrics.filter(m => m.userId === userId).length;
    
    if (uses >= 1000) return { level: 'Platinum', bonus: 0.25 }; // 25% bonus
    if (uses >= 501) return { level: 'Gold', bonus: 0.15 }; // 15% bonus
    if (uses >= 101) return { level: 'Silver', bonus: 0.10 }; // 10% bonus
    if (uses >= 10) return { level: 'Bronze', bonus: 0.05 }; // 5% bonus
    return { level: 'New', bonus: 0 };
  }

  // Get dynamic pricing based on current conditions
  private getDynamicPricing(basePrice: number, region: string = 'default'): number {
    // Apply server load pricing (higher load = higher price)
    let price = basePrice * (1 + this.serverLoad * 0.3);
    
    // Apply demand multiplier
    price *= this.demandMultiplier;
    
    // Apply regional pricing
    const regionalMultiplier = this.regionalPricing.get(region) || this.regionalPricing.get('default')!;
    price *= regionalMultiplier;
    
    // Round to 2 decimal places
    return Math.round(price * 100) / 100;
  }

  // Get available payment methods for a country
  getPaymentMethods(country: string = 'IN'): PaymentMethod[] {
    return this.paymentMethods.filter(method => 
      method.available && 
      (method.countries.includes('worldwide') || method.countries.includes(country))
    );
  }

  // Calculate pricing for a capability with dynamic adjustments
  calculatePricing(capability: string, tier: string, region: string = 'default'): {
    creditsRequired: number;
    totalCost: number;
    actualCost: number;
    profit: number;
    profitMargin: number;
  } {
    const pricing = this.basePricingTiers.get(tier);
    if (!pricing) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    const dynamicCostPerCredit = this.getDynamicPricing(pricing.costPerCredit, region);
    const totalCost = pricing.creditsRequired * dynamicCostPerCredit;
    const actualCost = totalCost * (1 - pricing.profitMargin / 100);
    const profit = totalCost - actualCost;

    return {
      creditsRequired: pricing.creditsRequired,
      totalCost,
      actualCost,
      profit,
      profitMargin: pricing.profitMargin
    };
  }

  // Check if user has sufficient credits
  async checkCredits(userId: string, creditsRequired: number): Promise<boolean> {
    const userCredits = this.getUserCredits(userId);
    return userCredits >= creditsRequired;
  }

  // Deduct credits from user account
  async deductCredits(userId: string, credits: number, capability: string): Promise<void> {
    const currentCredits = this.getUserCredits(userId);
    if (currentCredits < credits) {
      throw new Error('Insufficient credits');
    }

    this.userCredits.set(userId, currentCredits - credits);
    
    // Track usage for analytics
    const tier = this.getTierByCredits(credits);
    const pricing = this.calculatePricing(capability, tier);
    
    const metric: UsageMetrics = {
      userId,
      capability,
      creditsUsed: credits,
      revenue: pricing.totalCost,
      cost: pricing.actualCost,
      profit: pricing.profit,
      timestamp: new Date()
    };
    
    this.usageMetrics.push(metric);
    this.revenueTracker += pricing.totalCost;
    this.profitTracker += pricing.profit;

    console.log(`💸 Credits deducted: ${credits} for ${capability}. Profit: $${pricing.profit.toFixed(2)}`);
  }

  // Add credits to user account
  async addCredits(userId: string, credits: number, paymentMethod: string): Promise<void> {
    const currentCredits = this.getUserCredits(userId);
    this.userCredits.set(userId, currentCredits + credits);
    
    console.log(`💳 Credits added: ${credits} via ${paymentMethod} for user ${userId}`);
  }

  // Get user's current credit balance
  getUserCredits(userId: string): number {
    return this.userCredits.get(userId) || 100; // Start with 100 free credits
  }

  // Get tier by credits required
  private getTierByCredits(credits: number): string {
    const entries = Array.from(this.basePricingTiers.entries());
    for (const [tierId, tier] of entries) {
      if (tier.creditsRequired === credits) {
        return tierId;
      }
    }
    return 'basic';
  }

  // Get pricing tiers with dynamic adjustments
  getPricingTiers(region: string = 'default'): PricingTier[] {
    const tiers = Array.from(this.basePricingTiers.values());
    
    // Apply dynamic pricing to each tier
    return tiers.map(tier => ({
      ...tier,
      costPerCredit: this.getDynamicPricing(tier.costPerCredit, region),
      currentLoad: this.serverLoad,
      demandLevel: this.demandMultiplier > 1 ? 'High' : 'Normal',
      regionalDiscount: this.regionalPricing.get(region) || 1.0
    }));
  }

  // Get server optimization metrics
  getOptimizationMetrics(): {
    serverLoad: number;
    demandMultiplier: number;
    isPeakHour: boolean;
    recommendedTier: string;
    pricingTrend: string;
  } {
    const hour = new Date().getHours();
    const isPeakHour = this.peakHours.has(hour);
    
    return {
      serverLoad: this.serverLoad,
      demandMultiplier: this.demandMultiplier,
      isPeakHour,
      recommendedTier: this.serverLoad > 0.7 ? 'basic' : 'super',
      pricingTrend: this.demandMultiplier > 1 ? 'increasing' : 'decreasing'
    };
  }

  // Calculate credit packages with dynamic bulk discounts
  getCreditPackages(userId: string = 'anonymous', region: string = 'default'): Array<{
    credits: number;
    price: number;
    originalPrice: number;
    bonus: number;
    loyaltyBonus: number;
    savings: number;
    discountPercentage: number;
    popular?: boolean;
    bestValue?: boolean;
  }> {
    const loyalty = this.getUserLoyaltyBonus(userId);
    const basePrice = this.getDynamicPricing(0.10, region); // Base price per credit
    
    const packages = [
      {
        credits: 100,
        baseMultiplier: 1.0, // No bulk discount
        bonus: 0,
        popular: false
      },
      {
        credits: 500,
        baseMultiplier: 0.85, // 15% bulk discount
        bonus: 50,
        popular: true
      },
      {
        credits: 1000,
        baseMultiplier: 0.75, // 25% bulk discount
        bonus: 150,
        popular: false
      },
      {
        credits: 2500,
        baseMultiplier: 0.65, // 35% bulk discount
        bonus: 500,
        popular: false
      },
      {
        credits: 5000,
        baseMultiplier: 0.55, // 45% bulk discount
        bonus: 1500,
        popular: false,
        bestValue: true
      },
      {
        credits: 10000,
        baseMultiplier: 0.45, // 55% bulk discount
        bonus: 4000,
        popular: false,
        bestValue: true
      }
    ];
    
    return packages.map(pkg => {
      const originalPrice = pkg.credits * basePrice;
      const discountedPrice = originalPrice * pkg.baseMultiplier;
      const loyaltyBonusCredits = Math.floor(pkg.credits * loyalty.bonus);
      const totalCredits = pkg.credits + pkg.bonus + loyaltyBonusCredits;
      const savings = originalPrice - discountedPrice;
      const discountPercentage = Math.round((1 - pkg.baseMultiplier) * 100);
      
      return {
        credits: pkg.credits,
        price: Math.round(discountedPrice * 100) / 100,
        originalPrice: Math.round(originalPrice * 100) / 100,
        bonus: pkg.bonus,
        loyaltyBonus: loyaltyBonusCredits,
        savings: Math.round(savings * 100) / 100,
        discountPercentage,
        popular: pkg.popular,
        bestValue: pkg.bestValue,
        totalCredits,
        pricePerCredit: Math.round((discountedPrice / totalCredits) * 1000) / 1000,
        loyaltyLevel: loyalty.level
      };
    });
  }

  // Get revenue analytics
  getAnalytics(userId?: string): {
    totalRevenue: number;
    totalProfit: number;
    profitMargin: number;
    totalTransactions: number;
    averageTransactionValue: number;
    topCapabilities: Array<{ capability: string; usage: number; revenue: number }>;
    revenueByTier: Map<string, number>;
  } {
    const filteredMetrics = userId 
      ? this.usageMetrics.filter(m => m.userId === userId)
      : this.usageMetrics;

    const totalRevenue = filteredMetrics.reduce((sum, m) => sum + m.revenue, 0);
    const totalProfit = filteredMetrics.reduce((sum, m) => sum + m.profit, 0);
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Calculate top capabilities
    const capabilityStats = new Map<string, { usage: number; revenue: number }>();
    filteredMetrics.forEach(m => {
      const current = capabilityStats.get(m.capability) || { usage: 0, revenue: 0 };
      capabilityStats.set(m.capability, {
        usage: current.usage + 1,
        revenue: current.revenue + m.revenue
      });
    });

    const topCapabilities = Array.from(capabilityStats.entries())
      .map(([capability, stats]) => ({ capability, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Revenue by tier
    const revenueByTier = new Map<string, number>();
    filteredMetrics.forEach(m => {
      const tier = this.getTierByCredits(m.creditsUsed);
      revenueByTier.set(tier, (revenueByTier.get(tier) || 0) + m.revenue);
    });

    return {
      totalRevenue,
      totalProfit,
      profitMargin,
      totalTransactions: filteredMetrics.length,
      averageTransactionValue: filteredMetrics.length > 0 
        ? totalRevenue / filteredMetrics.length 
        : 0,
      topCapabilities,
      revenueByTier
    };
  }

  // Process payment webhook (for PayPal, Razorpay, etc.)
  async processPaymentWebhook(
    paymentId: string,
    userId: string,
    amount: number,
    paymentMethod: string,
    status: string
  ): Promise<void> {
    if (status !== 'completed' && status !== 'captured') {
      console.log(`⚠️ Payment ${paymentId} not completed: ${status}`);
      return;
    }

    // Calculate credits based on amount
    const creditPackage = this.getCreditPackages().find(pkg => 
      Math.abs(pkg.price - amount) < 0.01
    );

    if (!creditPackage) {
      console.error(`Invalid payment amount: ${amount}`);
      return;
    }

    const totalCredits = creditPackage.credits + creditPackage.bonus;
    await this.addCredits(userId, totalCredits, paymentMethod);

    console.log(`✅ Payment processed: ${paymentId} - ${totalCredits} credits added`);
  }

  // Security check for capability access
  async validateAccess(
    userId: string,
    capability: string,
    tier: string,
    ipAddress?: string
  ): Promise<{ 
    allowed: boolean; 
    reason?: string;
    creditsRequired?: number;
  }> {
    // Check rate limiting (prevent abuse)
    const recentUsage = this.usageMetrics.filter(m => 
      m.userId === userId &&
      m.timestamp > new Date(Date.now() - 60000) // Last minute
    ).length;

    if (recentUsage > 10) {
      return { 
        allowed: false, 
        reason: 'Rate limit exceeded. Please wait before making more requests.' 
      };
    }

    // Check credits
    const pricing = this.basePricingTiers.get(tier);
    if (!pricing) {
      return { allowed: false, reason: 'Invalid tier' };
    }

    const hasCredits = await this.checkCredits(userId, pricing.creditsRequired);
    if (!hasCredits && pricing.creditsRequired > 0) {
      return { 
        allowed: false, 
        reason: 'Insufficient credits',
        creditsRequired: pricing.creditsRequired
      };
    }

    return { 
      allowed: true,
      creditsRequired: pricing.creditsRequired
    };
  }
}

// Export singleton instance
export const monetizationService = new MonetizationService();