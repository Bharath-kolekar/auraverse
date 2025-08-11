// AWS-Inspired Pricing Model Enhancement
// Implements Reserved Instances, Spot Pricing, Volume Discounts, Free Tier, and more

export interface ReservedInstance {
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

export interface SpotPricing {
  currentPrice: number;
  spotDiscount: number;
  availability: number;
  terminationRisk: 'low' | 'medium' | 'high';
  maxDuration: number; // minutes
  recommendedWorkloads: string[];
}

export interface VolumeTier {
  minCredits: number;
  maxCredits: number;
  pricePerCredit: number;
  discount: number;
  tierName: string;
}

export interface FreeTier {
  type: 'always-free' | '12-months' | 'trial';
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

export class AWSPricingModel {
  // Volume-based pricing tiers (like AWS S3)
  private volumeTiers: VolumeTier[] = [
    { minCredits: 0, maxCredits: 50, pricePerCredit: 1.00, discount: 0, tierName: 'Standard' },
    { minCredits: 51, maxCredits: 500, pricePerCredit: 0.85, discount: 15, tierName: 'Volume' },
    { minCredits: 501, maxCredits: 5000, pricePerCredit: 0.70, discount: 30, tierName: 'Business' },
    { minCredits: 5001, maxCredits: 50000, pricePerCredit: 0.55, discount: 45, tierName: 'Enterprise' },
    { minCredits: 50001, maxCredits: Infinity, pricePerCredit: 0.40, discount: 60, tierName: 'Mega' }
  ];

  // Reserved Instance configurations
  private reservedInstanceDiscounts = {
    '1-year': {
      'all-upfront': 0.40,    // 40% off
      'partial-upfront': 0.35, // 35% off
      'no-upfront': 0.30      // 30% off
    },
    '3-year': {
      'all-upfront': 0.72,    // 72% off (like AWS)
      'partial-upfront': 0.65, // 65% off
      'no-upfront': 0.54      // 54% off (like AWS Convertible RIs)
    }
  };

  // Spot pricing dynamics
  private spotPricingFactors = {
    baseDiscount: 0.70, // 70% off standard price
    maxDiscount: 0.90,  // Up to 90% off (like AWS)
    minAvailability: 0.1,
    maxAvailability: 1.0
  };

  // Free tier configuration
  private freeTierConfig = {
    alwaysFree: {
      creditsPerMonth: 25,
      capabilities: ['text_generation_basic', 'image_analysis_basic']
    },
    newUser12Months: {
      creditsPerMonth: 100,
      capabilities: ['all_basic', 'limited_advanced']
    },
    trials: {
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

  private reservedInstances: Map<string, ReservedInstance[]> = new Map();
  private userBudgets: Map<string, BudgetAlert[]> = new Map();
  private spotAvailability: number = 0.5;
  private currentSpotPrice: number = 0.3;

  constructor() {
    this.initializeSpotPricing();
    this.initializeFreeTier();
  }

  private initializeSpotPricing() {
    // Simulate spot price fluctuations
    setInterval(() => {
      this.spotAvailability = 0.1 + Math.random() * 0.9;
      const discountRange = this.spotPricingFactors.maxDiscount - this.spotPricingFactors.baseDiscount;
      const variableDiscount = this.spotPricingFactors.baseDiscount + (1 - this.spotAvailability) * discountRange;
      this.currentSpotPrice = 1 - variableDiscount;
      
      console.log(`🎯 Spot pricing update: ${(variableDiscount * 100).toFixed(0)}% off, Availability: ${(this.spotAvailability * 100).toFixed(0)}%`);
    }, 30000); // Update every 30 seconds
  }

  private initializeFreeTier() {
    console.log('🎁 Free tier initialized with AWS-style benefits');
  }

  // Purchase Reserved Instance (like AWS RIs)
  purchaseReservedInstance(
    userId: string,
    creditsPerMonth: number,
    term: '1-year' | '3-year',
    paymentOption: 'all-upfront' | 'partial-upfront' | 'no-upfront'
  ): ReservedInstance {
    const discount = this.reservedInstanceDiscounts[term][paymentOption];
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

    const ri: ReservedInstance = {
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

    if (!this.reservedInstances.has(userId)) {
      this.reservedInstances.set(userId, []);
    }
    this.reservedInstances.get(userId)!.push(ri);

    console.log(`💳 Reserved Instance purchased: ${term} term, ${paymentOption}, saving $${ri.totalSavings.toFixed(2)}`);
    return ri;
  }

  // Get spot pricing (like AWS Spot Instances)
  getSpotPricing(): SpotPricing {
    const spotDiscount = 1 - this.currentSpotPrice;
    const terminationRisk = 
      this.spotAvailability > 0.7 ? 'low' :
      this.spotAvailability > 0.3 ? 'medium' : 'high';

    return {
      currentPrice: this.currentSpotPrice,
      spotDiscount,
      availability: this.spotAvailability,
      terminationRisk,
      maxDuration: Math.floor(this.spotAvailability * 120), // Max 2 hours
      recommendedWorkloads: [
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

  // Get Free Tier benefits
  getFreeTierBenefits(userId: string, accountAge: number): FreeTier[] {
    const benefits: FreeTier[] = [];

    // Always Free tier
    benefits.push({
      type: 'always-free',
      creditsPerMonth: this.freeTierConfig.alwaysFree.creditsPerMonth,
      capabilities: this.freeTierConfig.alwaysFree.capabilities,
      remaining: this.freeTierConfig.alwaysFree.creditsPerMonth
    });

    // 12 Months Free (for new users)
    if (accountAge < 365) {
      const remainingMonths = Math.ceil((365 - accountAge) / 30);
      benefits.push({
        type: '12-months',
        creditsPerMonth: this.freeTierConfig.newUser12Months.creditsPerMonth,
        capabilities: this.freeTierConfig.newUser12Months.capabilities,
        expiryDate: new Date(Date.now() + remainingMonths * 30 * 24 * 60 * 60 * 1000),
        remaining: this.freeTierConfig.newUser12Months.creditsPerMonth
      });
    }

    // Trial offers
    Object.entries(this.freeTierConfig.trials).forEach(([service, config]) => {
      benefits.push({
        type: 'trial',
        creditsPerMonth: config.credits,
        capabilities: [service],
        expiryDate: new Date(Date.now() + config.duration * 24 * 60 * 60 * 1000),
        remaining: config.credits
      });
    });

    return benefits;
  }

  // Calculate data transfer costs (like AWS)
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

  // Cost Calculator (like AWS Pricing Calculator)
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
      const riDiscount = this.reservedInstanceDiscounts['1-year']['partial-upfront'];
      withReserved = standardCost * (1 - riDiscount);
    }

    if (considerSpot) {
      const spotPricing = this.getSpotPricing();
      withSpot = standardCost * this.currentSpotPrice;
    }

    const recommendations: string[] = [];
    
    if (estimatedCredits > 500) {
      recommendations.push('Consider Reserved Instances for predictable workloads');
    }
    
    if (withSpot < standardCost * 0.5) {
      recommendations.push('Use Spot pricing for fault-tolerant batch jobs');
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

  // Set budget alert (like AWS Budgets)
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

  // Get user's Reserved Instances
  getUserReservedInstances(userId: string): ReservedInstance[] {
    const instances = this.reservedInstances.get(userId) || [];
    return instances.filter(ri => ri.endDate > new Date());
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

    // Check for Reserved Instances
    const userRIs = this.getUserReservedInstances(userId);
    if (userRIs.length > 0) {
      const bestRI = userRIs.reduce((best, ri) => 
        ri.discount > best.discount ? ri : best
      );
      discounts.reserved = bestRI.discount * 100;
      effectivePrice *= (1 - bestRI.discount);
    }

    // Apply spot pricing if requested
    if (useSpot) {
      const spotPricing = this.getSpotPricing();
      discounts.spot = spotPricing.spotDiscount * 100;
      effectivePrice *= this.currentSpotPrice;
    }

    // Check free tier eligibility
    const accountAge = 30; // Days (would be calculated from user registration)
    const freeTierBenefits = this.getFreeTierBenefits(userId, accountAge);
    const totalFreeCredits = freeTierBenefits.reduce((sum, benefit) => 
      sum + benefit.creditsPerMonth, 0
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
export const awsPricingModel = new AWSPricingModel();