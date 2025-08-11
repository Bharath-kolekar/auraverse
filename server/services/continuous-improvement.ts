import { EventEmitter } from 'events';

interface UserFeedback {
  contentId: string;
  userId: string;
  rating?: number;
  liked?: boolean;
  timeSpent?: number;
  regenerated?: boolean;
  shared?: boolean;
  downloaded?: boolean;
  timestamp: Date;
}

interface ABTestVariant {
  id: string;
  parameters: any;
  successCount: number;
  attemptCount: number;
  avgRating: number;
  avgTimeSpent: number;
}

interface OptimizationMetrics {
  promptTemplates: Map<string, PromptTemplate>;
  modelParameters: Map<string, ModelParameters>;
  abTests: Map<string, ABTest>;
  userPreferences: Map<string, UserPreference>;
}

interface PromptTemplate {
  template: string;
  successRate: number;
  avgRating: number;
  usageCount: number;
  lastOptimized: Date;
  variants: PromptVariant[];
}

interface PromptVariant {
  text: string;
  score: number;
  attempts: number;
}

interface ModelParameters {
  model: string;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  maxTokens: number;
  successRate: number;
  avgProcessingTime: number;
  lastTuned: Date;
}

interface ABTest {
  id: string;
  name: string;
  variants: ABTestVariant[];
  status: 'active' | 'completed' | 'paused';
  startDate: Date;
  endDate?: Date;
  winningVariant?: string;
  confidence: number;
}

interface UserPreference {
  userId: string;
  preferredStyle: string[];
  preferredModels: string[];
  avgRating: number;
  contentHistory: ContentHistory[];
}

interface ContentHistory {
  contentId: string;
  type: string;
  rating?: number;
  parameters: any;
  timestamp: Date;
}

class ContinuousImprovementService extends EventEmitter {
  private static instance: ContinuousImprovementService;
  private metrics: OptimizationMetrics;
  private feedbackBuffer: UserFeedback[] = [];
  private optimizationInterval: NodeJS.Timeout | null = null;
  private abTestSampleRate = 0.2; // 20% of requests participate in A/B tests

  private constructor() {
    super();
    this.metrics = {
      promptTemplates: new Map(),
      modelParameters: new Map(),
      abTests: new Map(),
      userPreferences: new Map()
    };
    
    this.startOptimizationCycle();
    this.initializeDefaultParameters();
  }

  static getInstance(): ContinuousImprovementService {
    if (!ContinuousImprovementService.instance) {
      ContinuousImprovementService.instance = new ContinuousImprovementService();
    }
    return ContinuousImprovementService.instance;
  }

  private initializeDefaultParameters(): void {
    // Initialize default model parameters for different content types
    const defaultParams: Record<string, ModelParameters> = {
      'image_creative': {
        model: 'dall-e-3',
        temperature: 0.9,
        topP: 0.95,
        frequencyPenalty: 0.5,
        presencePenalty: 0.5,
        maxTokens: 1000,
        successRate: 0.8,
        avgProcessingTime: 3000,
        lastTuned: new Date()
      },
      'image_technical': {
        model: 'dall-e-3',
        temperature: 0.3,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0,
        maxTokens: 800,
        successRate: 0.85,
        avgProcessingTime: 2500,
        lastTuned: new Date()
      },
      'text_creative': {
        model: 'gpt-4o',
        temperature: 0.8,
        topP: 0.9,
        frequencyPenalty: 0.7,
        presencePenalty: 0.6,
        maxTokens: 2000,
        successRate: 0.82,
        avgProcessingTime: 1500,
        lastTuned: new Date()
      },
      'text_technical': {
        model: 'gpt-4o',
        temperature: 0.2,
        topP: 0.85,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
        maxTokens: 1500,
        successRate: 0.88,
        avgProcessingTime: 1200,
        lastTuned: new Date()
      }
    };

    Object.entries(defaultParams).forEach(([key, params]) => {
      this.metrics.modelParameters.set(key, params);
    });
  }

  private startOptimizationCycle(): void {
    // Run optimization every 5 minutes
    this.optimizationInterval = setInterval(() => {
      this.runOptimizationCycle();
    }, 5 * 60 * 1000);
  }

  // Live feedback integration
  async recordFeedback(feedback: UserFeedback): Promise<void> {
    this.feedbackBuffer.push(feedback);
    
    // Update user preferences
    const userPref = this.metrics.userPreferences.get(feedback.userId) || {
      userId: feedback.userId,
      preferredStyle: [],
      preferredModels: [],
      avgRating: 0,
      contentHistory: []
    };
    
    if (feedback.rating) {
      const oldAvg = userPref.avgRating;
      const count = userPref.contentHistory.length;
      userPref.avgRating = (oldAvg * count + feedback.rating) / (count + 1);
    }
    
    userPref.contentHistory.push({
      contentId: feedback.contentId,
      type: 'unknown', // This should be passed in feedback
      rating: feedback.rating,
      parameters: {},
      timestamp: feedback.timestamp
    });
    
    // Keep only last 100 interactions
    if (userPref.contentHistory.length > 100) {
      userPref.contentHistory = userPref.contentHistory.slice(-100);
    }
    
    this.metrics.userPreferences.set(feedback.userId, userPref);
    
    // Process feedback buffer if it's large enough
    if (this.feedbackBuffer.length >= 10) {
      await this.processFeedbackBatch();
    }
  }

  private async processFeedbackBatch(): Promise<void> {
    const batch = this.feedbackBuffer.splice(0, this.feedbackBuffer.length);
    
    for (const feedback of batch) {
      // Update A/B test results if applicable
      this.updateABTestResults(feedback);
      
      // Update prompt template success rates
      this.updatePromptTemplateMetrics(feedback);
      
      // Trigger immediate optimization for poorly performing content
      if (feedback.rating && feedback.rating < 3) {
        this.triggerImmediateOptimization(feedback);
      }
    }
  }

  // A/B testing for generation parameters
  async getABTestVariant(contentType: string, userId: string): Promise<any> {
    // Check if user should participate in A/B test
    if (Math.random() > this.abTestSampleRate) {
      return null; // Use default parameters
    }
    
    // Find active A/B test for content type
    const activeTest = Array.from(this.metrics.abTests.values())
      .find(test => test.status === 'active' && test.name.includes(contentType));
    
    if (!activeTest) {
      // Create new A/B test if needed
      return this.createABTest(contentType);
    }
    
    // Select variant (could use more sophisticated allocation)
    const variant = this.selectTestVariant(activeTest, userId);
    variant.attemptCount++;
    
    return {
      testId: activeTest.id,
      variantId: variant.id,
      parameters: variant.parameters
    };
  }

  private createABTest(contentType: string): any {
    const testId = `ab_${contentType}_${Date.now()}`;
    const baseParams = this.metrics.modelParameters.get(`${contentType}_creative`) || 
                      this.metrics.modelParameters.get('text_creative')!;
    
    const test: ABTest = {
      id: testId,
      name: `Optimization for ${contentType}`,
      variants: [
        {
          id: 'control',
          parameters: { ...baseParams },
          successCount: 0,
          attemptCount: 0,
          avgRating: 0,
          avgTimeSpent: 0
        },
        {
          id: 'variant_a',
          parameters: {
            ...baseParams,
            temperature: baseParams.temperature * 1.2,
            topP: Math.min(1, baseParams.topP * 1.1)
          },
          successCount: 0,
          attemptCount: 0,
          avgRating: 0,
          avgTimeSpent: 0
        },
        {
          id: 'variant_b',
          parameters: {
            ...baseParams,
            temperature: baseParams.temperature * 0.8,
            frequencyPenalty: baseParams.frequencyPenalty * 1.3
          },
          successCount: 0,
          attemptCount: 0,
          avgRating: 0,
          avgTimeSpent: 0
        }
      ],
      status: 'active',
      startDate: new Date(),
      confidence: 0
    };
    
    this.metrics.abTests.set(testId, test);
    return {
      testId,
      variantId: 'control',
      parameters: test.variants[0].parameters
    };
  }

  private selectTestVariant(test: ABTest, userId: string): ABTestVariant {
    // Use epsilon-greedy strategy
    const epsilon = 0.1;
    
    if (Math.random() < epsilon) {
      // Explore: random selection
      const index = Math.floor(Math.random() * test.variants.length);
      return test.variants[index];
    } else {
      // Exploit: select best performing
      return test.variants.reduce((best, current) => {
        const currentScore = current.attemptCount > 0 
          ? current.successCount / current.attemptCount 
          : 0;
        const bestScore = best.attemptCount > 0 
          ? best.successCount / best.attemptCount 
          : 0;
        return currentScore > bestScore ? current : best;
      });
    }
  }

  private updateABTestResults(feedback: UserFeedback): void {
    // Update A/B test results based on feedback
    this.metrics.abTests.forEach(test => {
      if (test.status === 'active') {
        // Find variant that generated this content
        // This would need content metadata to track which variant was used
        // For now, we'll update based on success criteria
        if (feedback.rating && feedback.rating >= 4) {
          // Consider it a success
          // Would need to track which variant was used for this content
        }
      }
    });
  }

  // Automatic prompt optimization
  async optimizePrompt(basePrompt: string, contentType: string): Promise<string> {
    const templateKey = `${contentType}_${this.hashPrompt(basePrompt)}`;
    let template = this.metrics.promptTemplates.get(templateKey);
    
    if (!template) {
      template = {
        template: basePrompt,
        successRate: 0.5,
        avgRating: 3,
        usageCount: 0,
        lastOptimized: new Date(),
        variants: [
          { text: basePrompt, score: 0.5, attempts: 0 }
        ]
      };
      this.metrics.promptTemplates.set(templateKey, template);
    }
    
    // Check if optimization is needed
    const hoursSinceOptimization = (Date.now() - template.lastOptimized.getTime()) / (1000 * 60 * 60);
    if (hoursSinceOptimization > 24 && template.successRate < 0.7) {
      template = await this.generatePromptVariants(template, contentType);
      template.lastOptimized = new Date();
    }
    
    // Select best performing variant
    const bestVariant = template.variants.reduce((best, current) => {
      const currentScore = current.attempts > 0 ? current.score / current.attempts : 0;
      const bestScore = best.attempts > 0 ? best.score / best.attempts : 0;
      return currentScore > bestScore ? current : best;
    });
    
    bestVariant.attempts++;
    template.usageCount++;
    
    return this.enhancePrompt(bestVariant.text, contentType);
  }

  private async generatePromptVariants(template: PromptTemplate, contentType: string): Promise<PromptTemplate> {
    const newVariants: PromptVariant[] = [];
    
    // Generate variations based on successful patterns
    const enhancements = [
      'Be more specific and detailed',
      'Focus on quality and professionalism',
      'Emphasize creativity and uniqueness',
      'Include technical accuracy',
      'Add emotional depth'
    ];
    
    enhancements.forEach(enhancement => {
      newVariants.push({
        text: `${template.template}. ${enhancement}`,
        score: 0.5,
        attempts: 0
      });
    });
    
    // Keep best performing existing variants
    const topVariants = template.variants
      .sort((a, b) => (b.score / Math.max(b.attempts, 1)) - (a.score / Math.max(a.attempts, 1)))
      .slice(0, 3);
    
    template.variants = [...topVariants, ...newVariants].slice(0, 5);
    return template;
  }

  private enhancePrompt(prompt: string, contentType: string): string {
    // Apply learned optimizations
    const enhancements: Record<string, string[]> = {
      'image': [
        'high quality, professional',
        'detailed and realistic',
        'visually stunning'
      ],
      'video': [
        'cinematic quality',
        'smooth transitions',
        'engaging narrative'
      ],
      'audio': [
        'crystal clear sound',
        'professional mixing',
        'immersive experience'
      ],
      'text': [
        'well-structured',
        'engaging and informative',
        'professional tone'
      ]
    };
    
    const typeEnhancements = enhancements[contentType] || enhancements['text'];
    const selectedEnhancement = typeEnhancements[Math.floor(Math.random() * typeEnhancements.length)];
    
    return `${prompt}, ${selectedEnhancement}`;
  }

  // Dynamic model parameter tuning
  async getTunedParameters(contentType: string, baseParams: any): Promise<any> {
    const key = `${contentType}_${baseParams.style || 'default'}`;
    const storedParams = this.metrics.modelParameters.get(key);
    
    if (!storedParams) {
      return baseParams;
    }
    
    // Apply dynamic tuning based on recent performance
    const tuned = { ...baseParams };
    
    if (storedParams.successRate < 0.7) {
      // Adjust parameters to improve success rate
      tuned.temperature = this.adjustParameter(
        storedParams.temperature,
        storedParams.successRate,
        0.1, 1.0
      );
      tuned.topP = this.adjustParameter(
        storedParams.topP,
        storedParams.successRate,
        0.5, 1.0
      );
    }
    
    if (storedParams.avgProcessingTime > 5000) {
      // Reduce complexity for faster processing
      tuned.maxTokens = Math.max(500, storedParams.maxTokens * 0.9);
    }
    
    return tuned;
  }

  private adjustParameter(current: number, successRate: number, min: number, max: number): number {
    // Gradient-based adjustment
    const learningRate = 0.1;
    const targetSuccess = 0.85;
    const error = targetSuccess - successRate;
    
    let adjusted = current + (error * learningRate);
    adjusted = Math.max(min, Math.min(max, adjusted));
    
    return Number(adjusted.toFixed(3));
  }

  private async runOptimizationCycle(): Promise<void> {
    console.log('Running continuous improvement optimization cycle...');
    
    // Analyze A/B test results
    this.analyzeABTests();
    
    // Update model parameters based on performance
    this.updateModelParameters();
    
    // Clean up old data
    this.cleanupOldData();
    
    // Emit optimization event
    this.emit('optimization-complete', {
      timestamp: new Date(),
      metrics: this.getOptimizationMetrics()
    });
  }

  private analyzeABTests(): void {
    this.metrics.abTests.forEach(test => {
      if (test.status === 'active') {
        // Check if we have enough data for statistical significance
        const totalAttempts = test.variants.reduce((sum, v) => sum + v.attemptCount, 0);
        
        if (totalAttempts > 100) {
          // Calculate confidence using simple proportion test
          const scores = test.variants.map(v => 
            v.attemptCount > 0 ? v.successCount / v.attemptCount : 0
          );
          
          const maxScore = Math.max(...scores);
          const winner = test.variants.find(v => 
            v.attemptCount > 0 && (v.successCount / v.attemptCount) === maxScore
          );
          
          if (winner && maxScore > 0.6) {
            test.status = 'completed';
            test.winningVariant = winner.id;
            test.confidence = Math.min(0.95, totalAttempts / 200);
            test.endDate = new Date();
            
            // Apply winning parameters
            this.applyWinningParameters(test, winner);
          }
        }
      }
    });
  }

  private applyWinningParameters(test: ABTest, winner: ABTestVariant): void {
    // Update model parameters with winning variant
    const contentType = test.name.split(' ').pop() || 'default';
    this.metrics.modelParameters.set(
      `${contentType}_optimized`,
      {
        ...winner.parameters,
        successRate: winner.successCount / Math.max(winner.attemptCount, 1),
        avgProcessingTime: winner.parameters.avgProcessingTime || 2000,
        lastTuned: new Date()
      }
    );
  }

  private updateModelParameters(): void {
    this.metrics.modelParameters.forEach((params, key) => {
      // Decay old success rates slightly to encourage exploration
      params.successRate = params.successRate * 0.98;
      
      // Mark for re-tuning if performance drops
      if (params.successRate < 0.6) {
        const daysSinceTuning = (Date.now() - params.lastTuned.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceTuning > 7) {
          // Schedule for re-tuning
          this.createABTest(key.split('_')[0]);
        }
      }
    });
  }

  private updatePromptTemplateMetrics(feedback: UserFeedback): void {
    // This would need content metadata to know which prompt was used
    // For now, we'll update general metrics
    this.metrics.promptTemplates.forEach(template => {
      if (feedback.rating) {
        const weight = 0.1; // Learning rate
        template.avgRating = template.avgRating * (1 - weight) + feedback.rating * weight;
        
        if (feedback.rating >= 4) {
          template.successRate = template.successRate * (1 - weight) + 1 * weight;
        } else {
          template.successRate = template.successRate * (1 - weight) + 0 * weight;
        }
      }
    });
  }

  private triggerImmediateOptimization(feedback: UserFeedback): void {
    console.log(`Triggering immediate optimization for poor feedback: ${feedback.contentId}`);
    // Could trigger immediate parameter adjustment or prompt regeneration
    // This is where you'd implement rapid response to poor performance
  }

  private cleanupOldData(): void {
    // Remove completed A/B tests older than 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    this.metrics.abTests.forEach((test, key) => {
      if (test.status === 'completed' && test.endDate) {
        if (test.endDate.getTime() < thirtyDaysAgo) {
          this.metrics.abTests.delete(key);
        }
      }
    });
    
    // Clean up old user preferences
    this.metrics.userPreferences.forEach((pref, key) => {
      const lastInteraction = pref.contentHistory[pref.contentHistory.length - 1];
      if (lastInteraction && lastInteraction.timestamp.getTime() < thirtyDaysAgo) {
        this.metrics.userPreferences.delete(key);
      }
    });
  }

  private hashPrompt(prompt: string): string {
    // Simple hash for prompt identification
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  getOptimizationMetrics(): any {
    return {
      activeABTests: Array.from(this.metrics.abTests.values())
        .filter(t => t.status === 'active').length,
      completedABTests: Array.from(this.metrics.abTests.values())
        .filter(t => t.status === 'completed').length,
      promptTemplates: this.metrics.promptTemplates.size,
      modelConfigurations: this.metrics.modelParameters.size,
      trackedUsers: this.metrics.userPreferences.size,
      avgSuccessRate: Array.from(this.metrics.modelParameters.values())
        .reduce((sum, p) => sum + p.successRate, 0) / Math.max(this.metrics.modelParameters.size, 1)
    };
  }

  stop(): void {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
    }
  }
}

export const continuousImprovement = ContinuousImprovementService.getInstance();