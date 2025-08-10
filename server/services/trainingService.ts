import { HfInference } from '@huggingface/inference';

// Using DeepSeek R1 for training assistance (open source)
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || 'hf_default');
const DEEPSEEK_MODEL = "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B";

interface TrainingContext {
  currentPage?: string;
  userMessage: string;
  context: string;
}

export class TrainingService {
  private getSystemPrompt(currentPage?: string): string {
    const basePrompt = `You are an AI training assistant for "Infinite Intelligence", a voice-interactive content creation platform. Your role is to help users learn how to create Oscar-quality audio, video, VFX, and images using AI-powered tools.

Platform Features:
- Voice command controls for hands-free creation
- AI-powered audio generation (music, sound effects, voiceovers)
- AI video generation with cinematic quality
- VFX and CGI creation tools
- Content marketplace for buying/selling creations
- Multi-device recording from phones and computers
- Gallery for managing created content

Communication Style:
- Be friendly, encouraging, and patient
- Use simple, everyday language (avoid technical jargon)
- Provide step-by-step guidance
- Offer practical tips and best practices
- Encourage experimentation and creativity

Current Context: User is on the ${currentPage || 'main'} page.`;

    const pageSpecificPrompts = {
      '/': 'Focus on platform overview and getting started guidance.',
      '/create': 'Focus on content creation workflows, tools usage, and creative tips.',
      '/marketplace': 'Focus on buying/selling content, pricing strategies, and marketplace features.',
      '/gallery': 'Focus on content management, organization, and sharing features.'
    };

    const pagePrompt = pageSpecificPrompts[currentPage as keyof typeof pageSpecificPrompts] || '';
    
    return `${basePrompt}\n\n${pagePrompt}`;
  }

  async generateResponse(context: TrainingContext): Promise<{ message: string; type: string }> {
    try {
      const systemPrompt = this.getSystemPrompt(context.currentPage);
      
      const response = await hf.textGeneration({
        model: DEEPSEEK_MODEL,
        inputs: `System: ${systemPrompt}\nUser: ${context.userMessage}\nAssistant: <think>\nThe user is asking about "${context.userMessage}" on the ${context.currentPage || 'main'} page. I need to provide helpful, encouraging guidance about the Magic AI platform. Let me consider:\n\n1. What specific aspect they need help with\n2. How to explain it in simple terms\n3. Practical steps they can take\n4. Maya and Jadoo features that might help\n</think>\n\n🪄 **Maya's Training Guidance**\n\nHello! I'm here to help you master the Magic AI platform. `,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false
        }
      });

      const assistantMessage = response.generated_text || "I'm Maya, your AI training assistant! What would you like to learn about the Magic AI platform?";
      
      // Determine response type based on content
      let responseType = 'tutorial';
      if (assistantMessage.toLowerCase().includes('tip:') || assistantMessage.toLowerCase().includes('pro tip')) {
        responseType = 'tip';
      } else if (assistantMessage.toLowerCase().includes('suggestion:') || assistantMessage.toLowerCase().includes('try')) {
        responseType = 'suggestion';
      } else if (assistantMessage.toLowerCase().includes('maya') || assistantMessage.toLowerCase().includes('jadoo')) {
        responseType = 'magic';
      }

      return {
        message: assistantMessage,
        type: responseType
      };
    } catch (error) {
      console.error('Training service error:', error);
      
      // Fallback responses based on context with Maya's personality
      const fallbackResponses = {
        'voice-commands': "🎙️ **Maya's Voice Magic Guide**: Click the microphone and speak naturally! Try saying 'Maya, generate epic orchestral music' or 'Create a cinematic space battle scene'. I understand natural language and will bring your creative visions to life with Jadoo power!",
        'create-audio': "🎵 **Maya's Audio Creation**: Visit the Create page and describe your audio vision! Say things like 'epic battle music with orchestral elements' or 'peaceful nature sounds for meditation'. My neural synthesis will compose Oscar-quality audio for you!",
        'create-video': "🎬 **Maya's Cinematic Magic**: For stunning videos, be descriptive! Try 'A dramatic sunset over mystical mountains with floating particles' or 'Epic space battle with energy beams and explosions'. The more detail you provide, the more magical the results!",
        'marketplace': "💫 **Jadoo Marketplace Guide**: Share your magical creations or discover others' work! Set fair prices, write compelling descriptions, and use eye-catching thumbnails. Premium content gets special Maya enchantments and better visibility!",
        'general': "✨ **Welcome to Maya's Neural Kingdom!** I'm here to help you master Magic AI! You can create incredible content with voice commands, explore our neural tools, sell your creations in the Jadoo marketplace, and much more. What magical journey shall we begin?"
      };

      const contextKey = context.context as keyof typeof fallbackResponses;
      const fallbackMessage = fallbackResponses[contextKey] || fallbackResponses.general;
      
      return {
        message: fallbackMessage,
        type: 'tutorial'
      };
    }
  }

  generateQuickTips(currentPage?: string): string[] {
    const tips = {
      '/': [
        "🪄 Maya's Voice Magic: Start with voice commands - say 'Maya, create epic music' for instant magic!",
        "💫 Jadoo Marketplace: Browse the marketplace first for inspiration and trending magical content",
        "🎭 Neural Gallery: Your creations are automatically saved with Maya's protective enchantments"
      ],
      '/create': [
        "⚡ Specific Spells Work Better: Detailed descriptions give Maya more power to create amazing results",
        "🎙️ Voice Command Speed: Try saying 'Generate cinematic orchestral battle music' instead of typing",
        "🌟 Experiment with Magic: Mix styles like 'epic + ethereal + electronic' for unique Jadoo combinations"
      ],
      '/marketplace': [
        "🏆 Oscar-Quality Sells: Polish your work with Maya's enhancement tools before uploading",
        "📝 Magical Descriptions: Use mystical keywords like 'epic', 'cinematic', 'neural' to attract buyers",
        "📈 Trending Jadoo: Check what's popular to understand market demands and magical preferences"
      ],
      '/gallery': [
        "🏷️ Maya's Organization: Use magical tags like #epic, #cinematic, #neural for easy searching",
        "💾 Neural Backup Magic: Maya automatically protects your creations, but manual backups add extra safety",
        "🌐 Share Your Spells: Showcase your best work to build a following in Maya's neural kingdom"
      ]
    };

    return tips[currentPage as keyof typeof tips] || tips['/'];
  }
}