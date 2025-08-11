// Infinite Intelligence Pricing Model
// Advanced commitment-based pricing with Neural Credits, Flash Pricing, Volume Tiers, and more

export interface IntelligenceCommitment {
  id: string;
  userId: string;
  creditsPerMonth: number;
  term: '1-year' | '3-year';
  paymentOption: 'all-upfront' | 'partial-upfront' | 'no-upfront';
  discount: number;
  startDate: Date;
  endDate: Date;
  totalCredits: number;
  remainingCredits: number;
  monthlyCost: number;
  totalSavings: number;
}

export interface FlashPricing {
  currentPrice: number;
  flashDiscount: number;
  availability: number;
  volatilityRisk: 'stable' | 'moderate' | 'volatile';
  maxDuration: number; // minutes
  recommendedTasks: string[];
}

export interface VolumeTier {
  minCredits: number;
  maxCredits: number;
  pricePerCredit: number;
  discount: number;
  tierName: string;
}

export interface IntelligenceGrant {
  type: 'perpetual' | 'starter-year' | 'discovery';
  creditsPerMonth: number;
  capabilities: string[];
  expiryDate?: Date;
  remaining: number;
}

export interface CostEstimate {
  estimatedCost: number;
  breakdown: {
    compute: number;
    storage: number;
    dataTransfer: number;
    apiCalls: number;
  };
  potentialSavings: {
    withReserved: number;
    withSpot: number;
    withVolume: number;
  };
  recommendations: string[];
}

export interface BudgetAlert {
  id: string;
  userId: string;
  threshold: number;
  type: 'credits' | 'cost';
  frequency: 'daily' | 'weekly' | 'monthly';
  actions: ('email' | 'sms' | 'stop-usage')[];
  currentUsage: number;
  percentUsed: number;
}

export class IntelligencePricingEngine {
  // Neural Volume Tiers - Progressive discounts for increased usage
  private volumeTiers: VolumeTier[] = [
    { minCredits: 0, maxCredits: 50, pricePerCredit: 1.00, discount: 0, tierName: 'Starter' },
    { minCredits: 51, maxCredits: 500, pricePerCredit: 0.85, discount: 15, tierName: 'Growth' },
    { minCredits: 501, maxCredits: 5000, pricePerCredit: 0.70, discount: 30, tierName: 'Professional' },
    { minCredits: 5001, maxCredits: 50000, pricePerCredit: 0.55, discount: 45, tierName: 'Corporate' },
    { minCredits: 50001, maxCredits: Infinity, pricePerCredit: 0.40, discount: 60, tierName: 'Quantum' }
  ];

  // Intelligence Commitment Plans - Long-term savings
  private commitmentDiscounts = {
    '1-year': {
      'all-upfront': 0.40,    // 40% off
      'partial-upfront': 0.35, // 35% off  
      'no-upfront': 0.30      // 30% off
    },
    '3-year': {
      'all-upfront': 0.72,    // 72% off for maximum commitment
      'partial-upfront': 0.65, // 65% off with flexibility
      'no-upfront': 0.54      // 54% off with monthly payments
    }
  };

  // Flash pricing dynamics - Opportunistic discounts
  private flashPricingFactors = {
    baseDiscount: 0.70, // 70% off standard price
    maxDiscount: 0.90,  // Up to 90% off during low demand
    minAvailability: 0.1,
    maxAvailability: 1.0
  };

  // Intelligence Grant configuration - Free credits program
  private grantConfig = {
    perpetual: {
      creditsPerMonth: 25,
      capabilities: ['text_generation_basic', 'image_analysis_basic']
    },
    starterYear: {
      creditsPerMonth: 100,
      capabilities: ['all_basic', 'limited_advanced']
    },
    discovery: {
      superIntelligence: { credits: 50, duration: 7 }, // 7 days
      quantumProcessing: { credits: 25, duration: 3 }  // 3 days
    }
  };

  // Data transfer pricing (per GB)
  private dataTransferPricing = {
    first10TB: 0.09,
    next40TB: 0.085,
    next100TB: 0.07,
    over150TB: 0.05
  };

  private intelligenceCommitments: Map<string, IntelligenceCommitment[]> = new Map();
  private userBudgets: Map<string, BudgetAlert[]> = new Map();
  private flashAvailability: number = 0.5;
  private currentFlashPrice: number = 0.3;

  constructor() {
    this.initializeFlashPricing();
    this.initializeIntelligenceGrants();
  }

  private initializeFlashPricing() {
    // Dynamic flash pricing based on system load
    setInterval(() => {
      this.flashAvailability = 0.1 + Math.random() * 0.9;
      const discountRange = this.flashPricingFactors.maxDiscount - this.flashPricingFactors.baseDiscount;
      const variableDiscount = this.flashPricingFactors.baseDiscount + (1 - this.flashAvailability) * discountRange;
      this.currentFlashPrice = 1 - variableDiscount;
      
      console.log(`⚡ Flash pricing update: ${(variableDiscount * 100).toFixed(0)}% off, Capacity: ${(this.flashAvailability * 100).toFixed(0)}%`);
    }, 30000); // Update every 30 seconds
  }

  private initializeIntelligenceGrants() {
    console.log('🎁 Intelligence Grants initialized with starter benefits');
  }

  // Purchase Intelligence Commitment for long-term savings
  purchaseIntelligenceCommitment(
    userId: string,
    creditsPerMonth: number,
    term: '1-year' | '3-year',
    paymentOption: 'all-upfront' | 'partial-upfront' | 'no-upfront'
  ): IntelligenceCommitment {
    const discount = this.commitmentDiscounts[term][paymentOption];
    const months = term === '1-year' ? 12 : 36;
    const totalCredits = creditsPerMonth * months;
    const standardCost = totalCredits * 1.0; // Base price per credit
    const discountedCost = standardCost * (1 - discount);
    
    let upfrontCost = 0;
    let monthlyCost = 0;
    
    switch (paymentOption) {
      case 'all-upfront':
        upfrontCost = discountedCost;
        monthlyCost = 0;
        break;
      case 'partial-upfront':
        upfrontCost = discountedCost * 0.5;
        monthlyCost = (discountedCost * 0.5) / months;
        break;
      case 'no-upfront':
        upfrontCost = 0;
        monthlyCost = discountedCost / months;
        break;
    }

    const commitment: IntelligenceCommitment = {
      id: `ri-${Date.now()}`,
      userId,
      creditsPerMonth,
      term,
      paymentOption,
      discount,
      startDate: new Date(),
      endDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000),
      totalCredits,
      remainingCredits: totalCredits,
      monthlyCost,
      totalSavings: standardCost - discountedCost
    };

    if (!this.intelligenceCommitments.has(userId)) {
      this.intelligenceCommitments.set(userId, []);
    }
    this.intelligenceCommitments.get(userId)!.push(commitment);

    console.log(`💳 Intelligence Commitment purchased: ${term} term, ${paymentOption}, saving $${commitment.totalSavings.toFixed(2)}`);
    return commitment;
  }

  // Get flash pricing for opportunistic discounts
  getFlashPricing(): FlashPricing {
    const flashDiscount = 1 - this.currentFlashPrice;
    const volatilityRisk = 
      this.flashAvailability > 0.7 ? 'stable' :
      this.flashAvailability > 0.3 ? 'moderate' : 'volatile';

    return {
      currentPrice: this.currentFlashPrice,
      flashDiscount,
      availability: this.flashAvailability,
      volatilityRisk,
      maxDuration: Math.floor(this.flashAvailability * 120), // Max 2 hours
      recommendedTasks: [
        'Batch processing',
        'Development/testing',
        'Fault-tolerant workloads',
        'Data analysis',
        'Background jobs'
      ]
    };
  }

  // Calculate volume-based pricing (like AWS tiered pricing)
  calculateVolumePrice(credits: number): {
    totalCost: number;
    effectiveRate: number;
    appliedTiers: VolumeTier[];
    totalDiscount: number;
  } {
    let totalCost = 0;
    let remainingCredits = credits;
    const appliedTiers: VolumeTier[] = [];

    for (const tier of this.volumeTiers) {
      if (remainingCredits <= 0) break;
      
      const creditsInTier = Math.min(
        remainingCredits,
        tier.maxCredits - tier.minCredits
      );
      
      if (creditsInTier > 0) {
        totalCost += creditsInTier * tier.pricePerCredit;
        appliedTiers.push(tier);
        remainingCredits -= creditsInTier;
      }
    }

    const standardCost = credits * 1.0;
    const totalDiscount = ((standardCost - totalCost) / standardCost) * 100;
    const effectiveRate = totalCost / credits;

    return {
      totalCost,
      effectiveRate,
      appliedTiers,
      totalDiscount
    };
  }

  // Get Intelligence Grant benefits
  getIntelligenceGrants(userId: string, accountAge: number): IntelligenceGrant[] {
    const benefits: IntelligenceGrant[] = [];

    // Perpetual grant
    benefits.push({
      type: 'perpetual',
      creditsPerMonth: this.grantConfig.perpetual.creditsPerMonth,
      capabilities: this.grantConfig.perpetual.capabilities,
      remaining: this.grantConfig.perpetual.creditsPerMonth
    });

    // Starter year grant (for new users)
    if (accountAge < 365) {
      const remainingMonths = Math.ceil((365 - accountAge) / 30);
      benefits.push({
        type: 'starter-year',
        creditsPerMonth: this.grantConfig.starterYear.creditsPerMonth,
        capabilities: this.grantConfig.starterYear.capabilities,
        expiryDate: new Date(Date.now() + remainingMonths * 30 * 24 * 60 * 60 * 1000),
        remaining: this.grantConfig.starterYear.creditsPerMonth
      });
    }

    // Discovery grants
    Object.entries(this.grantConfig.discovery).forEach(([service, config]: [string, any]) => {
      benefits.push({
        type: 'discovery',
        creditsPerMonth: config.credits,
        capabilities: [service],
        expiryDate: new Date(Date.now() + config.duration * 24 * 60 * 60 * 1000),
        remaining: config.credits
      });
    });

    return benefits;
  }

  // Calculate data transfer costs
  calculateDataTransferCost(gbTransferred: number): {
    cost: number;
    breakdown: { tier: string; gb: number; cost: number }[];
  } {
    const breakdown: { tier: string; gb: number; cost: number }[] = [];
    let totalCost = 0;
    let remaining = gbTransferred;

    const tiers = [
      { limit: 10000, price: this.dataTransferPricing.first10TB, name: 'First 10TB' },
      { limit: 40000, price: this.dataTransferPricing.next40TB, name: 'Next 40TB' },
      { limit: 100000, price: this.dataTransferPricing.next100TB, name: 'Next 100TB' },
      { limit: Infinity, price: this.dataTransferPricing.over150TB, name: 'Over 150TB' }
    ];

    let cumulative = 0;
    for (const tier of tiers) {
      if (remaining <= 0) break;
      
      const gbInTier = Math.min(remaining, tier.limit - cumulative);
      const tierCost = gbInTier * tier.price;
      
      breakdown.push({
        tier: tier.name,
        gb: gbInTier,
        cost: tierCost
      });
      
      totalCost += tierCost;
      remaining -= gbInTier;
      cumulative += gbInTier;
    }

    return { cost: totalCost, breakdown };
  }

  // Intelligence Cost Calculator
  estimateCost(
    userId: string,
    estimatedCredits: number,
    estimatedDataGB: number,
    considerReserved: boolean = true,
    considerSpot: boolean = true
  ): CostEstimate {
    // Standard on-demand cost
    const volumePrice = this.calculateVolumePrice(estimatedCredits);
    const dataTransferCost = this.calculateDataTransferCost(estimatedDataGB);
    const standardCost = volumePrice.totalCost + dataTransferCost.cost;

    // Calculate potential savings
    let withReserved = standardCost;
    let withSpot = standardCost;

    if (considerReserved) {
      // Assume 1-year partial upfront for estimation
      const commitmentDiscount = this.commitmentDiscounts['1-year']['partial-upfront'];
      withReserved = standardCost * (1 - commitmentDiscount);
    }

    if (considerSpot) {
      const flashPricing = this.getFlashPricing();
      withSpot = standardCost * this.currentFlashPrice;
    }

    const recommendations: string[] = [];
    
    if (estimatedCredits > 500) {
      recommendations.push('Consider Intelligence Commitments for predictable workloads');
    }
    
    if (withSpot < standardCost * 0.5) {
      recommendations.push('Use Flash pricing for fault-tolerant batch jobs');
    }
    
    if (estimatedCredits > 5000) {
      recommendations.push('Contact sales for enterprise volume discounts');
    }
    
    if (estimatedDataGB > 1000) {
      recommendations.push('Optimize data transfer with compression and caching');
    }

    return {
      estimatedCost: standardCost,
      breakdown: {
        compute: volumePrice.totalCost,
        storage: 0, // Can be extended
        dataTransfer: dataTransferCost.cost,
        apiCalls: 0 // Can be extended
      },
      potentialSavings: {
        withReserved: standardCost - withReserved,
        withSpot: standardCost - withSpot,
        withVolume: volumePrice.totalDiscount
      },
      recommendations
    };
  }

  // Set budget alert
  setBudgetAlert(
    userId: string,
    threshold: number,
    type: 'credits' | 'cost',
    frequency: 'daily' | 'weekly' | 'monthly',
    actions: ('email' | 'sms' | 'stop-usage')[]
  ): BudgetAlert {
    const alert: BudgetAlert = {
      id: `budget-${Date.now()}`,
      userId,
      threshold,
      type,
      frequency,
      actions,
      currentUsage: 0,
      percentUsed: 0
    };

    if (!this.userBudgets.has(userId)) {
      this.userBudgets.set(userId, []);
    }
    this.userBudgets.get(userId)!.push(alert);

    console.log(`📊 Budget alert set: ${threshold} ${type}, ${frequency} checks`);
    return alert;
  }

  // Check budget alerts
  checkBudgetAlerts(userId: string, currentUsage: number, type: 'credits' | 'cost'): BudgetAlert[] {
    const alerts = this.userBudgets.get(userId) || [];
    const triggeredAlerts: BudgetAlert[] = [];

    for (const alert of alerts) {
      if (alert.type === type) {
        alert.currentUsage = currentUsage;
        alert.percentUsed = (currentUsage / alert.threshold) * 100;
        
        if (alert.percentUsed >= 100) {
          triggeredAlerts.push(alert);
          this.triggerBudgetActions(alert);
        } else if (alert.percentUsed >= 80) {
          console.log(`⚠️ Budget warning: ${alert.percentUsed.toFixed(0)}% of threshold used`);
        }
      }
    }

    return triggeredAlerts;
  }

  private triggerBudgetActions(alert: BudgetAlert) {
    for (const action of alert.actions) {
      switch (action) {
        case 'email':
          console.log(`📧 Sending budget alert email to user ${alert.userId}`);
          break;
        case 'sms':
          console.log(`📱 Sending budget alert SMS to user ${alert.userId}`);
          break;
        case 'stop-usage':
          console.log(`🛑 Stopping usage for user ${alert.userId} - budget exceeded`);
          break;
      }
    }
  }

  // Get user's Intelligence Commitments
  getUserIntelligenceCommitments(userId: string): IntelligenceCommitment[] {
    const commitments = this.intelligenceCommitments.get(userId) || [];
    return commitments.filter((c: IntelligenceCommitment) => c.endDate > new Date());
  }

  // Calculate effective price considering all discounts
  getEffectivePrice(
    userId: string,
    credits: number,
    useSpot: boolean = false
  ): {
    basePrice: number;
    effectivePrice: number;
    discounts: {
      volume: number;
      reserved: number;
      spot: number;
      freeTier: number;
      total: number;
    };
    pricePerCredit: number;
  } {
    const volumePrice = this.calculateVolumePrice(credits);
    let effectivePrice = volumePrice.totalCost;
    
    const discounts = {
      volume: volumePrice.totalDiscount,
      reserved: 0,
      spot: 0,
      freeTier: 0,
      total: 0
    };

    // Check for Intelligence Commitments
    const userCommitments = this.getUserIntelligenceCommitments(userId);
    if (userCommitments.length > 0) {
      const bestCommitment = userCommitments.reduce((best, c) => 
        c.discount > best.discount ? c : best
      );
      discounts.reserved = bestCommitment.discount * 100;
      effectivePrice *= (1 - bestCommitment.discount);
    }

    // Apply flash pricing if requested
    if (useSpot) {
      const flashPricing = this.getFlashPricing();
      discounts.spot = flashPricing.flashDiscount * 100;
      effectivePrice *= this.currentFlashPrice;
    }

    // Check grant eligibility
    const accountAge = 30; // Days (would be calculated from user registration)
    const intelligenceGrants = this.getIntelligenceGrants(userId, accountAge);
    const totalFreeCredits = intelligenceGrants.reduce((sum, grant) => 
      sum + grant.creditsPerMonth, 0
    );
    
    if (totalFreeCredits > 0) {
      const freeValue = Math.min(credits, totalFreeCredits) * 1.0;
      discounts.freeTier = (freeValue / volumePrice.totalCost) * 100;
      effectivePrice = Math.max(0, effectivePrice - freeValue);
    }

    discounts.total = discounts.volume + discounts.reserved + discounts.spot + discounts.freeTier;
    const pricePerCredit = effectivePrice / credits;

    return {
      basePrice: credits * 1.0, // Standard price
      effectivePrice,
      discounts,
      pricePerCredit
    };
  }
}

// Export singleton instance
export const intelligencePricingEngine = new IntelligencePricingEngine();