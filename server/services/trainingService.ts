import OpenAI from "openai";

// Only initialize OpenAI if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

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
      if (!openai) {
        throw new Error('OpenAI API key not configured');
      }

      const systemPrompt = this.getSystemPrompt(context.currentPage);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: context.userMessage }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const assistantMessage = response.choices[0].message.content || "I'm here to help! What would you like to learn about the platform?";
      
      // Determine response type based on content
      let responseType = 'tutorial';
      if (assistantMessage.toLowerCase().includes('tip:') || assistantMessage.toLowerCase().includes('pro tip')) {
        responseType = 'tip';
      } else if (assistantMessage.toLowerCase().includes('suggestion:') || assistantMessage.toLowerCase().includes('try')) {
        responseType = 'suggestion';
      }

      return {
        message: assistantMessage,
        type: responseType
      };
    } catch (error) {
      console.error('Training service error:', error);
      
      // Fallback responses based on context
      const fallbackResponses = {
        'voice-commands': "To use voice commands, click the microphone icon and say commands like 'Generate epic music' or 'Create a space battle scene'. The AI will understand and start creating your content!",
        'create-audio': "Creating audio is simple! Go to the Create page, select Audio, describe what you want (like 'upbeat electronic music for a workout'), and let our AI compose it for you.",
        'create-video': "For AI videos, describe your scene in detail. Try: 'A cinematic sunset over mountains with dramatic music'. The more specific you are, the better the results!",
        'marketplace': "The marketplace lets you buy premium content or sell your creations. Set fair prices, use good descriptions, and showcase your best work to attract buyers.",
        'general': "I'm here to help you master this platform! You can create amazing content using voice commands, explore our AI tools, and even sell your creations. What interests you most?"
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
        "Start with voice commands - they're the fastest way to create content",
        "Browse the marketplace for inspiration before creating your own content",
        "Your gallery automatically saves all your creations"
      ],
      '/create': [
        "Be specific in your descriptions for better AI results",
        "Try different voice commands to speed up your workflow",
        "Experiment with various styles and genres"
      ],
      '/marketplace': [
        "Quality content sells better - take time to polish your work",
        "Good descriptions and thumbnails increase your sales",
        "Check trending content for market insights"
      ],
      '/gallery': [
        "Use tags to organize your content effectively",
        "Regular backups keep your creations safe",
        "Share your best work to build a following"
      ]
    };

    return tips[currentPage as keyof typeof tips] || tips['/'];
  }
}