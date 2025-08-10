// Local training service without external API costs
interface TrainingContext {
  currentPage?: string;
  userMessage: string;
  context: string;
}

export class LocalTrainingService {
  private responses: { [key: string]: string } = {
    // Voice commands help
    "voice": "🎙️ **Maya's Voice Magic Guide**: Click the microphone and speak naturally! Try saying 'Maya, create epic music' or 'Generate cinematic video'. I process commands locally without any API costs!",
    "commands": "✨ Voice commands work offline! Say things like 'Create orchestral music', 'Generate space battle video', or 'Make magical VFX'. Everything processes on your device.",
    
    // Content creation help
    "create": "🎬 **Local Content Creation**: All content generation happens without external APIs! Describe what you want and Maya's local intelligence will create specifications, templates, and guides.",
    "audio": "🎵 **Zero-Cost Audio**: Audio generation uses browser-native speech synthesis and local music templates. No external API calls means no costs!",
    "video": "📹 **Local Video Magic**: Video specifications are generated using local templates and patterns. Create cinematic stories without any API expenses.",
    "vfx": "⚡ **Free VFX Generation**: Visual effects use CSS3 and WebGL for real-time rendering. All effects are calculated locally in your browser.",
    
    // Marketplace help
    "marketplace": "💫 **Jadoo Marketplace**: Share your locally-created content! Since generation is free, you can create unlimited content to sell or share.",
    "sell": "💰 **Free Creation, Profit Selling**: Create content at zero cost using local AI, then sell your creations in the marketplace!",
    
    // Gallery help
    "gallery": "🖼️ **Local Gallery Management**: Your content is stored locally first, then optionally synced. Organize your zero-cost creations efficiently!",
    
    // General help
    "help": "🌟 **Welcome to Cost-Free Magic AI!** Everything runs locally - no API costs for voice commands, content generation, or AI assistance. Create unlimited content!",
    "cost": "💵 **Zero API Costs**: We use local processing, browser APIs, and template-based generation. No expensive external AI calls!",
    "local": "🏠 **Local Processing Power**: All AI features run on your device using efficient algorithms and browser capabilities. Fast and free!",
    "maya": "🪄 **Maya's Local Wisdom**: I'm powered by local intelligence patterns, not expensive cloud APIs. Unlimited creativity at zero cost!"
  };

  private tips: { [key: string]: string[] } = {
    '/': [
      "🆓 **Zero Cost Creation**: All AI features run locally - unlimited use without API charges!",
      "🎙️ **Free Voice Magic**: Voice commands process in your browser using native speech APIs",
      "💾 **Local First**: Content is generated and stored locally before optional cloud sync"
    ],
    '/create': [
      "⚡ **Instant Local Generation**: No waiting for API responses - everything processes immediately",
      "🎨 **Template-Based Magic**: Use our extensive local templates for professional results",
      "🔄 **Unlimited Iterations**: Refine your content endlessly without cost concerns"
    ],
    '/marketplace': [
      "💰 **Pure Profit**: Since creation is free, every sale is pure profit!",
      "🚀 **Scale Without Limits**: Create thousands of items without worrying about generation costs",
      "⭐ **Quality Over Quantity**: Focus on polish since raw generation costs nothing"
    ],
    '/gallery': [
      "📱 **Offline Access**: Your content works without internet connection",
      "🔄 **Smart Sync**: Only upload when you're ready, keeping costs minimal",
      "🏷️ **Local Tags**: Organize using browser-based tagging system"
    ]
  };

  private getContextKey(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('voice') || message.includes('command')) return 'voice';
    if (message.includes('audio') || message.includes('music') || message.includes('sound')) return 'audio';
    if (message.includes('video') || message.includes('cinematic')) return 'video';
    if (message.includes('vfx') || message.includes('effect')) return 'vfx';
    if (message.includes('create') || message.includes('generate')) return 'create';
    if (message.includes('marketplace') || message.includes('sell')) return 'marketplace';
    if (message.includes('gallery') || message.includes('organize')) return 'gallery';
    if (message.includes('cost') || message.includes('price') || message.includes('free')) return 'cost';
    if (message.includes('local') || message.includes('offline')) return 'local';
    if (message.includes('maya') || message.includes('help')) return 'maya';
    
    return 'help';
  }

  async generateResponse(context: TrainingContext): Promise<{ message: string; type: string }> {
    try {
      const contextKey = this.getContextKey(context.userMessage);
      const baseResponse = this.responses[contextKey] || this.responses['help'];
      
      // Add page-specific context
      let pageContext = '';
      if (context.currentPage === '/create') {
        pageContext = ' Focus on our local content creation tools that work without API costs.';
      } else if (context.currentPage === '/marketplace') {
        pageContext = ' Remember: since content creation is free, every sale is pure profit!';
      } else if (context.currentPage === '/gallery') {
        pageContext = ' Your gallery stores everything locally first for instant access.';
      }

      const message = baseResponse + pageContext;
      
      // Determine response type
      let responseType = 'tutorial';
      if (message.includes('tip') || message.includes('💡')) {
        responseType = 'tip';
      } else if (message.includes('try') || message.includes('suggestion')) {
        responseType = 'suggestion';
      } else if (message.includes('maya') || message.includes('🪄')) {
        responseType = 'magic';
      }

      return {
        message,
        type: responseType
      };
    } catch (error) {
      console.error('Local training service error:', error);
      
      return {
        message: "🌟 **Maya's Local Magic**: I'm here to help you master the cost-free Magic AI platform! All our features run locally without expensive API calls. What would you like to learn?",
        type: 'tutorial'
      };
    }
  }

  generateQuickTips(currentPage?: string): string[] {
    return this.tips[currentPage || '/'] || this.tips['/'];
  }

  // Additional method for cost analysis
  getCostAnalysis(): { component: string; cost: string; alternative: string }[] {
    return [
      {
        component: "Text Generation (DeepSeek R1)",
        cost: "~$0.001 per request",
        alternative: "Local templates and patterns - $0"
      },
      {
        component: "Voice Synthesis (Kokoro TTS)",
        cost: "~$0.0001 per character",
        alternative: "Browser Speech Synthesis API - $0"
      },
      {
        component: "Voice Command Processing",
        cost: "~$0.0005 per command",
        alternative: "Local pattern matching - $0"
      },
      {
        component: "Database Storage",
        cost: "~$0.01 per GB/month",
        alternative: "Browser localStorage/IndexedDB - $0"
      },
      {
        component: "Content Generation",
        cost: "~$0.01 per generation",
        alternative: "Template-based local generation - $0"
      }
    ];
  }
}

export const localTrainingService = new LocalTrainingService();