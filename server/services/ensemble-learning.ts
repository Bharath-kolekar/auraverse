import { superIntelligenceService } from './super-intelligence-service';
import { aiService } from './ai-service';

interface EnsembleResult {
  content: string;
  confidence: number;
  source: string;
  metadata?: any;
}

interface EnsembleOptions {
  type: 'text' | 'image' | 'audio' | 'video';
  prompt: string;
  models?: string[];
  crossValidate?: boolean;
  autoRank?: boolean;
}

export class EnsembleLearningService {
  private superIntelligence = superIntelligenceService;
  private aiService = aiService;
  
  constructor() {
    // Services are already singleton instances
  }

  async generateWithEnsemble(options: EnsembleOptions): Promise<{
    bestResult: string;
    confidence: number;
    ensemble: EnsembleResult[];
    reasoning: string;
  }> {
    console.log('🧠 Ensemble Learning: Starting multi-model generation');
    
    const results: EnsembleResult[] = [];
    
    // Generate from multiple approaches
    if (options.type === 'text') {
      // Local pattern-based generation
      const localResult = await this.generateLocalText(options.prompt);
      results.push({
        content: localResult,
        confidence: 0.6,
        source: 'local-pattern',
        metadata: { speed: 'instant', cost: 0 }
      });
      
      // Enhanced AI generation (if available)
      try {
        const enhancedResult = await this.aiService.generateContent({
          prompt: options.prompt,
          type: 'text',
          userId: 'system',
          quality: 'professional'
        });
        results.push({
          content: enhancedResult.content,
          confidence: 0.85,
          source: 'enhanced-ai',
          metadata: enhancedResult.metadata
        });
      } catch (error) {
        console.log('Enhanced AI unavailable, using fallback');
      }
      
      // Super Intelligence generation (if credits available)
      try {
        const superResult = await this.superIntelligence.processIntelligence({
          type: 'generation',
          input: { prompt: options.prompt },
          context: {
            domain: 'creative',
            quality: 'ultra',
            userId: 'system'
          },
          capabilities: {
            neuralProcessing: true,
            creativityBoost: true,
            emotionalIntelligence: true,
            contextualAwareness: true,
            predictiveAnalytics: true,
            multiModal: false
          }
        });
        
        if (superResult.success) {
          results.push({
            content: superResult.result?.content || superResult.result,
            confidence: superResult.metadata?.confidenceScore || 0.95,
            source: 'super-intelligence',
            metadata: superResult.metadata
          });
        }
      } catch (error) {
        console.log('Super Intelligence unavailable');
      }
    }
    
    // Cross-validate results
    if (options.crossValidate && results.length > 1) {
      results.forEach((result, index) => {
        const validation = this.crossValidate(result, results);
        result.confidence = (result.confidence + validation) / 2;
      });
    }
    
    // Auto-rank results
    if (options.autoRank) {
      results.sort((a, b) => {
        // Rank by confidence and quality metrics
        const scoreA = this.calculateScore(a);
        const scoreB = this.calculateScore(b);
        return scoreB - scoreA;
      });
    }
    
    // Select best result using ensemble voting
    const bestResult = this.selectBestResult(results);
    
    return {
      bestResult: bestResult.content,
      confidence: bestResult.confidence,
      ensemble: results,
      reasoning: this.generateReasoning(bestResult, results)
    };
  }
  
  private async generateLocalText(prompt: string): Promise<string> {
    // Pattern-based text generation with templates
    const templates = [
      `Creating innovative content based on: ${prompt}`,
      `Professional quality output for: ${prompt}`,
      `Advanced generation result: ${prompt}`
    ];
    
    // Simple pattern matching and expansion
    const keywords = prompt.toLowerCase().split(' ');
    let response = templates[Math.floor(Math.random() * templates.length)];
    
    if (keywords.includes('story')) {
      response = `Once upon a time, in a world shaped by ${prompt}, an extraordinary journey began...`;
    } else if (keywords.includes('code')) {
      response = `// Advanced implementation for: ${prompt}\nfunction generate() {\n  // Intelligent code generation\n  return "optimized solution";\n}`;
    } else if (keywords.includes('email')) {
      response = `Subject: Re: ${prompt}\n\nDear User,\n\nThank you for your inquiry regarding ${prompt}. I'm pleased to provide you with the following comprehensive response...\n\nBest regards,\nIntelligent Assistant`;
    }
    
    return response;
  }
  
  private crossValidate(result: EnsembleResult, allResults: EnsembleResult[]): number {
    let validationScore = 0;
    let comparisons = 0;
    
    allResults.forEach(other => {
      if (other !== result) {
        // Compare similarity and coherence
        const similarity = this.calculateSimilarity(result.content, other.content);
        validationScore += similarity;
        comparisons++;
      }
    });
    
    return comparisons > 0 ? validationScore / comparisons : result.confidence;
  }
  
  private calculateSimilarity(text1: string, text2: string): number {
    // Simple similarity calculation based on common words
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set(Array.from(words1).filter(x => words2.has(x)));
    const union = new Set([...Array.from(words1), ...Array.from(words2)]);
    
    return intersection.size / union.size;
  }
  
  private calculateScore(result: EnsembleResult): number {
    let score = result.confidence * 100;
    
    // Boost score based on source quality
    if (result.source === 'super-intelligence') score *= 1.5;
    if (result.source === 'enhanced-ai') score *= 1.2;
    
    // Consider metadata factors
    if (result.metadata?.quality === 'high') score *= 1.1;
    if (result.metadata?.cost === 0) score *= 0.9; // Slightly lower for free options
    
    return score;
  }
  
  private selectBestResult(results: EnsembleResult[]): EnsembleResult {
    if (results.length === 0) {
      return {
        content: 'No results generated',
        confidence: 0,
        source: 'none'
      };
    }
    
    // Weighted voting based on confidence and source
    let bestResult = results[0];
    let bestScore = 0;
    
    results.forEach(result => {
      const score = this.calculateScore(result);
      if (score > bestScore) {
        bestScore = score;
        bestResult = result;
      }
    });
    
    return bestResult;
  }
  
  private generateReasoning(best: EnsembleResult, all: EnsembleResult[]): string {
    const reasons = [];
    
    reasons.push(`Selected ${best.source} model with ${(best.confidence * 100).toFixed(1)}% confidence`);
    reasons.push(`Evaluated ${all.length} different approaches`);
    
    if (best.source === 'super-intelligence') {
      reasons.push('Super Intelligence provided highest quality output');
    } else if (best.source === 'enhanced-ai') {
      reasons.push('Enhanced AI offered best balance of quality and speed');
    } else {
      reasons.push('Local generation provided instant results');
    }
    
    return reasons.join('. ');
  }
  
  // Intelligent model switching based on content type
  async smartSwitch(prompt: string, context?: any): Promise<string> {
    const contentType = this.detectContentType(prompt);
    const complexity = this.assessComplexity(prompt);
    
    console.log(`🔄 Smart Switch: Detected ${contentType} with ${complexity} complexity`);
    
    // Route to appropriate model based on analysis
    if (complexity === 'simple' && contentType === 'text') {
      return this.generateLocalText(prompt);
    } else if (complexity === 'moderate') {
      const result = await this.aiService.generateContent({
        prompt,
        type: 'text',
        userId: 'system',
        quality: 'professional'
      });
      return result.content;
    } else {
      // Complex requests use ensemble
      const ensemble = await this.generateWithEnsemble({
        type: contentType as any,
        prompt,
        crossValidate: true,
        autoRank: true
      });
      return ensemble.bestResult;
    }
  }
  
  private detectContentType(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('image') || lower.includes('picture')) return 'image';
    if (lower.includes('audio') || lower.includes('sound')) return 'audio';
    if (lower.includes('video') || lower.includes('animation')) return 'video';
    return 'text';
  }
  
  private assessComplexity(prompt: string): 'simple' | 'moderate' | 'complex' {
    const wordCount = prompt.split(/\s+/).length;
    const hasSpecialRequirements = /professional|advanced|complex|detailed/.test(prompt.toLowerCase());
    
    if (wordCount < 10 && !hasSpecialRequirements) return 'simple';
    if (wordCount < 30) return 'moderate';
    return 'complex';
  }
}