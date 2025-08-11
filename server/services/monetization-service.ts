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
  private readonly pricingTiers: Map<string, PricingTier> = new Map([
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
      costPerCredit: 0.50, // $0.50 per credit ($1.50 per use)
      features: ['GPT-4o powered', 'GPU acceleration', 'High quality'],
      profitMargin: 98.5 // 98.5% profit margin
    }],
    ['super', {
      id: 'super',
      name: 'Super Intelligence',
      creditsRequired: 5,
      costPerCredit: 0.80, // $0.80 per credit ($4.00 per use)
      features: ['Neural processing', 'WebGPU optimization', 'Real-time'],
      profitMargin: 99.2 // 99.2% profit margin
    }],
    ['quantum', {
      id: 'quantum',
      name: 'Quantum Intelligence',
      creditsRequired: 10,
      costPerCredit: 1.00, // $1.00 per credit ($10.00 per use)
      features: ['Quantum-inspired', 'Multi-modal', 'Unlimited quality'],
      profitMargin: 99.8 // 99.8% profit margin
    }]
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
    console.log('💰 Monetization Service initialized with India-compatible payment methods');
  }

  // Get available payment methods for a country
  getPaymentMethods(country: string = 'IN'): PaymentMethod[] {
    return this.paymentMethods.filter(method => 
      method.available && 
      (method.countries.includes('worldwide') || method.countries.includes(country))
    );
  }

  // Calculate pricing for a capability
  calculatePricing(capability: string, tier: string): {
    creditsRequired: number;
    totalCost: number;
    actualCost: number;
    profit: number;
    profitMargin: number;
  } {
    const pricing = this.pricingTiers.get(tier);
    if (!pricing) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    const totalCost = pricing.creditsRequired * pricing.costPerCredit;
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
    const entries = Array.from(this.pricingTiers.entries());
    for (const [tierId, tier] of entries) {
      if (tier.creditsRequired === credits) {
        return tierId;
      }
    }
    return 'basic';
  }

  // Get pricing tiers for display
  getPricingTiers(): PricingTier[] {
    return Array.from(this.pricingTiers.values());
  }

  // Calculate credit packages for purchase
  getCreditPackages(): Array<{
    credits: number;
    price: number;
    bonus: number;
    savings: number;
    popular?: boolean;
  }> {
    return [
      {
        credits: 100,
        price: 9.99,
        bonus: 0,
        savings: 0
      },
      {
        credits: 500,
        price: 39.99,
        bonus: 50, // 10% bonus
        savings: 10,
        popular: true
      },
      {
        credits: 1000,
        price: 69.99,
        bonus: 150, // 15% bonus
        savings: 30
      },
      {
        credits: 5000,
        price: 299.99,
        bonus: 1000, // 20% bonus
        savings: 200
      }
    ];
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
    const pricing = this.pricingTiers.get(tier);
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