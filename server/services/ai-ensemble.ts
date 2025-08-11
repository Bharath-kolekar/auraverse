import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY_NEW || process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

interface ModelResult {
  model: string;
  technique: string;
  result: any;
  score: number;
  processingTime: number;
  confidence: number;
}

interface EnsembleResult {
  bestResult: any;
  allResults: ModelResult[];
  consensusScore: number;
  selectedModel: string;
  reasoning: string;
}

export class AIEnsembleService {
  private static instance: AIEnsembleService;
  private modelPerformanceHistory = new Map<string, number[]>();
  private contentTypePreferences = new Map<string, string>();
  
  static getInstance(): AIEnsembleService {
    if (!AIEnsembleService.instance) {
      AIEnsembleService.instance = new AIEnsembleService();
    }
    return AIEnsembleService.instance;
  }

  // Ensemble learning across different generation techniques
  async ensembleGeneration(request: any): Promise<EnsembleResult> {
    const startTime = Date.now();
    const results: ModelResult[] = [];
    
    // Run multiple generation techniques in parallel
    const techniques = [
      this.generateWithBasicModel(request),
      this.generateWithEnhancedModel(request),
      this.generateWithCreativeModel(request),
      this.generateWithTechnicalModel(request)
    ];
    
    const rawResults = await Promise.allSettled(techniques);
    
    // Process and score each result
    for (let i = 0; i < rawResults.length; i++) {
      if (rawResults[i].status === 'fulfilled') {
        const result = (rawResults[i] as any).value;
        results.push({
          model: result.model,
          technique: result.technique,
          result: result.data,
          score: await this.scoreResult(result.data, request),
          processingTime: Date.now() - startTime,
          confidence: result.confidence || 0.5
        });
      }
    }
    
    // Cross-validate between models
    const validatedResults = await this.crossValidate(results, request);
    
    // Rank and select best result
    const rankedResults = this.rankResults(validatedResults);
    const bestResult = rankedResults[0];
    
    // Calculate consensus score
    const consensusScore = this.calculateConsensus(rankedResults);
    
    // Update performance history
    this.updatePerformanceHistory(bestResult.model, bestResult.score);
    
    return {
      bestResult: bestResult.result,
      allResults: rankedResults,
      consensusScore,
      selectedModel: bestResult.model,
      reasoning: await this.explainSelection(bestResult, request)
    };
  }

  // Cross-validation between local and enhanced models
  private async crossValidate(results: ModelResult[], request: any): Promise<ModelResult[]> {
    const validatedResults: ModelResult[] = [];
    
    for (const result of results) {
      // Validate against other models
      let validationScore = result.score;
      let validationCount = 0;
      
      for (const otherResult of results) {
        if (result !== otherResult) {
          const similarity = await this.calculateSimilarity(result.result, otherResult.result);
          validationScore += similarity * otherResult.score;
          validationCount++;
        }
      }
      
      // Adjust score based on cross-validation
      if (validationCount > 0) {
        result.score = (result.score + validationScore / validationCount) / 2;
      }
      
      validatedResults.push(result);
    }
    
    return validatedResults;
  }

  // Automatic quality scoring and result ranking
  private async scoreResult(result: any, request: any): Promise<number> {
    let score = 0;
    const weights = {
      relevance: 0.3,
      quality: 0.25,
      creativity: 0.2,
      technical: 0.15,
      coherence: 0.1
    };
    
    // Score relevance to request
    score += weights.relevance * await this.scoreRelevance(result, request);
    
    // Score quality metrics
    score += weights.quality * await this.scoreQuality(result);
    
    // Score creativity
    score += weights.creativity * await this.scoreCreativity(result);
    
    // Score technical accuracy
    score += weights.technical * await this.scoreTechnical(result);
    
    // Score coherence
    score += weights.coherence * await this.scoreCoherence(result);
    
    return Math.min(1, Math.max(0, score));
  }

  // Intelligent model switching based on content type
  async selectOptimalModel(contentType: string, request: any): Promise<string> {
    // Check historical performance for this content type
    const historicalPreference = this.contentTypePreferences.get(contentType);
    if (historicalPreference) {
      const performance = this.modelPerformanceHistory.get(historicalPreference);
      if (performance && performance.length > 0) {
        const avgScore = performance.reduce((a, b) => a + b, 0) / performance.length;
        if (avgScore > 0.7) {
          return historicalPreference;
        }
      }
    }
    
    // Analyze request characteristics
    const characteristics = await this.analyzeRequestCharacteristics(request);
    
    // Select model based on characteristics
    if (characteristics.requiresCreativity > 0.7) {
      return 'creative-model';
    } else if (characteristics.requiresTechnicalAccuracy > 0.7) {
      return 'technical-model';
    } else if (characteristics.requiresSpeed > 0.7) {
      return 'basic-model';
    } else {
      return 'enhanced-model';
    }
  }

  // Generate with different model approaches
  private async generateWithBasicModel(request: any): Promise<any> {
    // Fast, simple generation
    return {
      model: 'basic',
      technique: 'template-based',
      data: await this.basicGeneration(request),
      confidence: 0.6
    };
  }

  private async generateWithEnhancedModel(request: any): Promise<any> {
    // Balanced quality and speed
    if (!openai) {
      return this.generateWithBasicModel(request);
    }
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ 
          role: "user", 
          content: `Generate ${request.type} content: ${request.prompt}` 
        }],
        max_tokens: 1000
      });
      
      return {
        model: 'enhanced',
        technique: 'gpt-4o-balanced',
        data: response.choices[0].message.content,
        confidence: 0.8
      };
    } catch (error) {
      return this.generateWithBasicModel(request);
    }
  }

  private async generateWithCreativeModel(request: any): Promise<any> {
    // Maximum creativity
    if (!openai) {
      return this.generateWithBasicModel(request);
    }
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ 
          role: "user", 
          content: `Create highly creative and innovative ${request.type} content: ${request.prompt}. Be bold, original, and push boundaries.` 
        }],
        temperature: 0.9,
        max_tokens: 1500
      });
      
      return {
        model: 'creative',
        technique: 'gpt-4o-creative',
        data: response.choices[0].message.content,
        confidence: 0.75
      };
    } catch (error) {
      return this.generateWithBasicModel(request);
    }
  }

  private async generateWithTechnicalModel(request: any): Promise<any> {
    // High accuracy, technical precision
    if (!openai) {
      return this.generateWithBasicModel(request);
    }
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ 
          role: "user", 
          content: `Generate technically accurate and precise ${request.type} content: ${request.prompt}. Focus on correctness and detail.` 
        }],
        temperature: 0.3,
        max_tokens: 2000
      });
      
      return {
        model: 'technical',
        technique: 'gpt-4o-technical',
        data: response.choices[0].message.content,
        confidence: 0.85
      };
    } catch (error) {
      return this.generateWithBasicModel(request);
    }
  }

  // Helper methods
  private async basicGeneration(request: any): Promise<any> {
    // Template-based fallback generation
    const templates = {
      image: "A stunning visual representation of: ",
      video: "A cinematic sequence featuring: ",
      audio: "An immersive soundscape with: ",
      text: "Content about: "
    };
    
    return `${templates[request.type] || templates.text}${request.prompt}`;
  }

  private rankResults(results: ModelResult[]): ModelResult[] {
    return results.sort((a, b) => b.score - a.score);
  }

  private calculateConsensus(results: ModelResult[]): number {
    if (results.length === 0) return 0;
    
    const scores = results.map(r => r.score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    
    // High consensus = low variance
    return Math.max(0, 1 - Math.sqrt(variance));
  }

  private async calculateSimilarity(result1: any, result2: any): Promise<number> {
    // Simple similarity calculation (can be enhanced with embeddings)
    if (typeof result1 === 'string' && typeof result2 === 'string') {
      const words1 = new Set(result1.toLowerCase().split(/\s+/));
      const words2 = new Set(result2.toLowerCase().split(/\s+/));
      const intersection = new Set([...words1].filter(x => words2.has(x)));
      const union = new Set([...words1, ...words2]);
      return intersection.size / union.size;
    }
    return 0.5;
  }

  private async scoreRelevance(result: any, request: any): Promise<number> {
    // Score how relevant the result is to the request
    if (typeof result === 'string' && request.prompt) {
      const keywords = request.prompt.toLowerCase().split(/\s+/);
      const resultLower = result.toLowerCase();
      let matches = 0;
      for (const keyword of keywords) {
        if (resultLower.includes(keyword)) matches++;
      }
      return matches / keywords.length;
    }
    return 0.5;
  }

  private async scoreQuality(result: any): Promise<number> {
    // Score overall quality
    if (typeof result === 'string') {
      // Basic quality metrics
      const hasDetail = result.length > 100 ? 0.3 : 0;
      const hasStructure = result.includes('\n') ? 0.2 : 0;
      const hasVariety = new Set(result.split(/\s+/)).size > 20 ? 0.3 : 0;
      const isComplete = result.endsWith('.') || result.endsWith('!') ? 0.2 : 0;
      return hasDetail + hasStructure + hasVariety + isComplete;
    }
    return 0.5;
  }

  private async scoreCreativity(result: any): Promise<number> {
    // Score creativity and originality
    if (typeof result === 'string') {
      const uniqueWords = new Set(result.toLowerCase().split(/\s+/));
      const creativityScore = Math.min(1, uniqueWords.size / 50);
      return creativityScore;
    }
    return 0.5;
  }

  private async scoreTechnical(result: any): Promise<number> {
    // Score technical accuracy
    if (typeof result === 'string') {
      // Check for technical indicators
      const hasTechnicalTerms = /\b(algorithm|process|system|framework|architecture)\b/i.test(result);
      const hasNumbers = /\d/.test(result);
      const hasStructure = result.includes(':') || result.includes('-');
      return (hasTechnicalTerms ? 0.4 : 0) + (hasNumbers ? 0.3 : 0) + (hasStructure ? 0.3 : 0);
    }
    return 0.5;
  }

  private async scoreCoherence(result: any): Promise<number> {
    // Score logical coherence
    if (typeof result === 'string') {
      const sentences = result.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length > 1) {
        // Basic coherence check
        return Math.min(1, sentences.length / 5);
      }
    }
    return 0.5;
  }

  private async analyzeRequestCharacteristics(request: any): Promise<any> {
    const characteristics = {
      requiresCreativity: 0,
      requiresTechnicalAccuracy: 0,
      requiresSpeed: 0,
      complexity: 0
    };
    
    if (request.prompt) {
      const prompt = request.prompt.toLowerCase();
      
      // Analyze for creativity requirements
      if (prompt.includes('creative') || prompt.includes('innovative') || prompt.includes('unique')) {
        characteristics.requiresCreativity = 0.8;
      }
      
      // Analyze for technical requirements
      if (prompt.includes('technical') || prompt.includes('accurate') || prompt.includes('precise')) {
        characteristics.requiresTechnicalAccuracy = 0.8;
      }
      
      // Analyze for speed requirements
      if (request.priority === 'speed' || prompt.includes('quick') || prompt.includes('fast')) {
        characteristics.requiresSpeed = 0.8;
      }
      
      // Analyze complexity
      characteristics.complexity = Math.min(1, prompt.split(' ').length / 50);
    }
    
    return characteristics;
  }

  private updatePerformanceHistory(model: string, score: number): void {
    const history = this.modelPerformanceHistory.get(model) || [];
    history.push(score);
    
    // Keep only last 100 scores
    if (history.length > 100) {
      history.shift();
    }
    
    this.modelPerformanceHistory.set(model, history);
  }

  private async explainSelection(result: ModelResult, request: any): Promise<string> {
    return `Selected ${result.model} model (${result.technique}) with confidence ${(result.confidence * 100).toFixed(1)}%. 
            Score: ${(result.score * 100).toFixed(1)}%. 
            Processing time: ${result.processingTime}ms. 
            This model was chosen for optimal balance of quality and relevance to your request.`;
  }
}

export const aiEnsemble = AIEnsembleService.getInstance();