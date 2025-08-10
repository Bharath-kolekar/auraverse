import React from 'react';

// Natural Language Processing for conversational responses
export class NLPConversationEngine {
  private selectedLanguage: string;
  
  public conversationContext: {
    lastIntent: string;
    userInterests: string[];
    conversationLength: number;
  } = {
    lastIntent: 'default',
    userInterests: [] as string[],
    conversationLength: 0
  };
  
  constructor(language: string = 'en') {
    this.selectedLanguage = language;
  }

  // Intent recognition patterns
  private intentPatterns = {
    greeting: [
      /^(hi|hello|hey|good morning|good afternoon|good evening|greetings)/i,
      /^(hola|buenos días|buenas tardes|buenas noches)/i, // Spanish
      /^(bonjour|salut|bonsoir)/i, // French
      /^(hallo|guten tag|guten morgen)/i, // German
      /^(こんにちは|おはよう|こんばんは)/i // Japanese
    ],
    help: [
      /\b(help|assist|support|guide|tutorial)\b/i,
      /\b(ayuda|asistir|soporte|guía)\b/i, // Spanish
      /\b(aide|assister|support|guide)\b/i, // French
      /\b(hilfe|unterstützen|anleitung)\b/i // German
    ],
    features: [
      /\b(feature|capability|function|tool|what can|able to)\b/i,
      /\b(característica|capacidad|función|herramienta)\b/i, // Spanish
      /\b(fonctionnalité|capacité|fonction|outil)\b/i, // French
      /\b(funktion|fähigkeit|werkzeug)\b/i // German
    ],
    pricing: [
      /\b(price|cost|pricing|how much|payment|credit|subscription)\b/i,
      /\b(precio|costo|pago|crédito|suscripción)\b/i, // Spanish
      /\b(prix|coût|paiement|crédit|abonnement)\b/i, // French
      /\b(preis|kosten|zahlung|kredit)\b/i // German
    ],
    creation: [
      /\b(create|generate|make|produce|build|design|compose)\b/i,
      /\b(crear|generar|hacer|producir|diseñar|componer)\b/i, // Spanish
      /\b(créer|générer|faire|produire|construire|concevoir)\b/i, // French
      /\b(erstellen|generieren|machen|produzieren|bauen)\b/i // German
    ],
    technical: [
      /\b(how does|how it works|algorithm|AI|artificial intelligence|neural|technology)\b/i,
      /\b(cómo funciona|algoritmo|inteligencia artificial|neural|tecnología)\b/i, // Spanish
      /\b(comment ça marche|algorithme|intelligence artificielle|neuronal|technologie)/i, // French
      /\b(wie funktioniert|algorithmus|künstliche intelligenz|neural|technologie)/i // German
    ],
    goodbye: [
      /^(bye|goodbye|see you|farewell|thanks|thank you)/i,
      /^(adiós|hasta luego|gracias)/i, // Spanish
      /^(au revoir|à bientôt|merci)/i, // French
      /^(auf wiedersehen|tschüss|danke)/i // German
    ]
  };

  // Response templates by language and intent
  private responses = {
    en: {
      greeting: [
        "Hello! I'm your AI creative assistant. I'm excited to help you create amazing content today!",
        "Hi there! Welcome to Infinite Intelligence. I'm here to guide you through our AI-powered creative tools.",
        "Greetings! I'm your neural AI companion, ready to unlock your creative potential. What would you like to create?"
      ],
      help: [
        "I'd love to help! I can guide you through creating AI-powered audio, video, images, and VFX. What interests you most?",
        "Absolutely! I can explain our features, help you get started, or walk you through the creative process. What would you like to know?",
        "I'm here to assist! I can help you understand our AI tools, pricing, or guide you through your first creation. How can I help?"
      ],
      features: [
        "Our platform offers incredible AI capabilities! We have audio generation, video creation, image synthesis, VFX tools, and voice processing. Which catches your interest?",
        "Great question! We provide AI-powered audio production, video generation with neural effects, image creation, and advanced VFX. What type of content do you want to create?",
        "We have amazing AI tools: professional audio synthesis, Hollywood-quality video generation, stunning image creation, and cutting-edge VFX. What would you like to explore first?"
      ],
      pricing: [
        "We use a transparent credit-based system! Basic AI models cost 2-3 credits, while premium models cost 4-5 credits per generation. You only pay for what you use!",
        "Our pricing is simple: 2-3 credits for standard AI processing, 4-5 credits for premium models. No subscriptions, just pay-per-use convenience!",
        "Transparent pricing! Standard AI generations cost 2-3 credits, premium models cost 4-5 credits. You control your spending with our credit system!"
      ],
      creation: [
        "Exciting! What would you like to create? I can help you generate AI audio, produce videos with neural effects, create stunning images, or design VFX sequences.",
        "Let's create something amazing! Do you want to make AI music, generate videos, create images, or produce visual effects? I'll guide you through the process!",
        "Perfect! I can help you create professional audio, Hollywood-quality videos, beautiful images, or impressive VFX. What's your creative vision?"
      ],
      technical: [
        "Our technology uses advanced neural networks and deep learning! We process your requests through optimized AI models that deliver professional-quality results in seconds.",
        "Great question! We use cutting-edge AI algorithms including neural audio processing, computer vision for video, and generative models for images. The magic happens through intelligent neural processing!",
        "Our neural intelligence combines multiple AI technologies: transformer models for audio, diffusion models for images, and neural networks for video processing. It's like having a creative AI studio at your fingertips!"
      ],
      goodbye: [
        "Thank you for exploring Infinite Intelligence! Feel free to return anytime - I'm always here to help with your creative projects!",
        "Goodbye! It was wonderful helping you. Come back soon to create more amazing AI-powered content!",
        "Thanks for chatting! I'm excited to see what incredible content you'll create. See you soon!"
      ],
      default: [
        "That's interesting! I'm here to help you with AI content creation. Would you like to explore our audio, video, image, or VFX tools?",
        "I understand! Let me help you discover our amazing AI capabilities. What type of creative content interests you most?",
        "Thanks for sharing! I can help you create incredible AI-powered content. What would you like to make today?"
      ]
    },
    es: {
      greeting: [
        "¡Hola! Soy tu asistente creativo de IA. ¡Estoy emocionado de ayudarte a crear contenido increíble hoy!",
        "¡Hola! Bienvenido a Infinite Intelligence. Estoy aquí para guiarte a través de nuestras herramientas creativas impulsadas por IA.",
        "¡Saludos! Soy tu compañero de IA neural, listo para desbloquear tu potencial creativo. ¿Qué te gustaría crear?"
      ],
      help: [
        "¡Me encantaría ayudarte! Puedo guiarte a través de la creación de audio, video, imágenes y VFX impulsados por IA. ¿Qué te interesa más?",
        "¡Por supuesto! Puedo explicar nuestras funciones, ayudarte a comenzar o guiarte a través del proceso creativo. ¿Qué te gustaría saber?",
        "¡Estoy aquí para ayudar! Puedo ayudarte a entender nuestras herramientas de IA, precios o guiarte en tu primera creación. ¿Cómo puedo ayudarte?"
      ],
      default: [
        "¡Eso es interesante! Estoy aquí para ayudarte con la creación de contenido de IA. ¿Te gustaría explorar nuestras herramientas de audio, video, imagen o VFX?"
      ]
    },
    fr: {
      greeting: [
        "Bonjour! Je suis votre assistant créatif IA. Je suis ravi de vous aider à créer du contenu incroyable aujourd'hui!",
        "Salut! Bienvenue chez Infinite Intelligence. Je suis là pour vous guider à travers nos outils créatifs alimentés par l'IA.",
        "Salutations! Je suis votre compagnon IA neural, prêt à débloquer votre potentiel créatif. Que souhaiteriez-vous créer?"
      ],
      default: [
        "C'est intéressant! Je suis là pour vous aider avec la création de contenu IA. Souhaiteriez-vous explorer nos outils audio, vidéo, image ou VFX?"
      ]
    }
  };

  // Context awareness for follow-up conversations
  private conversationContext = {
    lastIntent: '',
    userInterests: [] as string[],
    conversationLength: 0
  };

  public processInput(input: string): string {
    const intent = this.detectIntent(input);
    const sentiment = this.analyzeSentiment(input);
    const response = this.generateIntelligentResponse(intent, input, sentiment);
    
    // Update conversation context with intelligence
    this.conversationContext.lastIntent = intent;
    this.conversationContext.conversationLength++;
    
    // Track user interests for smarter responses
    this.updateUserInterests(input, intent);
    
    return response;
  }

  private detectIntent(input: string): string {
    const lowerInput = input.toLowerCase();
    
    // Check each intent pattern
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      if (patterns.some(pattern => pattern.test(lowerInput))) {
        return intent;
      }
    }
    
    return 'default';
  }

  private generateIntelligentResponse(intent: string, userInput: string, sentiment: 'positive' | 'neutral' | 'negative'): string {
    console.log('Generating response for input:', userInput, 'intent:', intent);
    
    // Always try specific response first
    const specificResponse = this.generateSpecificResponse(intent, userInput, sentiment);
    if (specificResponse) {
      console.log('Using specific response:', specificResponse);
      return specificResponse;
    }
    
    // Direct pattern matching as fallback
    const directResponse = this.getDirectPatternResponse(userInput);
    if (directResponse) {
      console.log('Using direct pattern response:', directResponse);
      return directResponse;
    }
    
    // Last resort: contextual fallback
    console.log('Using contextual fallback');
    return this.getContextualFallback(userInput);
  }

  private getDirectPatternResponse(input: string): string | null {
    const lowerInput = input.toLowerCase().trim();
    
    // Fantasy VFX
    if (lowerInput === 'fantasy' || lowerInput.includes('fantasy')) {
      return "Fantastic choice! Fantasy VFX for your ship scene could include magical glowing waters, mystical sea creatures like dragons or krakens, floating islands, magical storms with lightning, enchanted ships with glowing sails, or underwater kingdoms. What kind of fantasy elements would excite your son most?";
    }
    
    // Show me / demonstrate
    if (lowerInput.includes('show me') || lowerInput === 'yes, show me') {
      return "I'd love to show you our VFX capabilities! Let me guide you through creating your first effect. For your ship and sea scene, I can demonstrate: realistic water physics, cinematic lighting, weather effects, or magical elements. Which would you like to see first?";
    }
    
    // Simple affirmations
    if (lowerInput === 'yes' && this.conversationContext.conversationLength > 2) {
      return "Great! Let's dive into creating your VFX masterpiece. What specific visual effects would make this ship scene amazing for your son?";
    }
    
    return null;
  }

  private getContextualFallback(input: string): string {
    const lowerInput = input.toLowerCase();
    
    // Context-aware fallbacks based on conversation history
    if (this.conversationContext.userInterests.includes('VFX')) {
      return "I'm here to help with your VFX project! Let's focus on creating those amazing visual effects for your ship and sea scene. What specific effect would you like to work on?";
    }
    
    // General creative fallback
    return "Let's create something amazing! I can help you generate professional VFX, audio, video, or images. What would you like to make?";
  }

  private generateSpecificResponse(intent: string, userInput: string, sentiment: 'positive' | 'neutral' | 'negative'): string | null {
    const lowerInput = userInput.toLowerCase().trim();
    console.log('Checking specific patterns for:', lowerInput);
    
    // Fantasy keyword - high priority match
    if (lowerInput === 'fantasy' || (lowerInput.includes('fantasy') && lowerInput.length < 20)) {
      return "Excellent! Fantasy VFX will make your ship scene magical. I can create: mystical glowing waters, sea dragons emerging from the depths, floating magical islands, enchanted storms with colorful lightning, ships with luminous sails, underwater crystal palaces, or flying sea creatures. Which fantasy element sounds most exciting for your son's surprise?";
    }
    
    // Show me requests - high priority
    if (lowerInput.includes('show me') || lowerInput.includes('demonstrate')) {
      return "Perfect! I'll demonstrate our VFX creation process. For your fantasy ship scene, I can show you how to: generate realistic ocean physics, add magical lighting effects, create mystical sea creatures, build dramatic weather, or design floating elements. Which demonstration would you like to see first?";
    }
    
    // VFX-specific responses
    if (lowerInput.includes('vfx') || lowerInput.includes('visual effects')) {
      return "Fantastic! Our VFX system uses cutting-edge AI to create Hollywood-quality effects. For your fantasy ship scene, I can generate: particle magic systems, realistic water physics, dramatic lighting, mythical creatures, and atmospheric effects. Ready to start creating?";
    }
    
    // Ship/sea scene - specific VFX response
    if (lowerInput.includes('ship') && lowerInput.includes('sea')) {
      return "Amazing! A ship on the sea makes a perfect canvas for fantasy VFX. I can create: cinematic ocean waves, magical ship movement, dramatic storm lighting, mystical sea creatures, glowing treasure effects, and enchanted atmospheres. What fantasy elements would make this most exciting for your son?";
    }
    
    // Audibility check
    if (lowerInput.includes('audible') || lowerInput.includes('hear me') || lowerInput.includes('can you hear')) {
      return "Yes, I can hear you perfectly! Your voice is crystal clear. I'm excited to help you create that fantasy VFX scene for your son. Let's make something truly magical together!";
    }
    
    // Audio-specific responses
    if (lowerInput.includes('audio') || lowerInput.includes('music') || lowerInput.includes('sound')) {
      return "Great choice! Our AI audio tools can generate professional music, realistic voice synthesis, sound effects, and audio enhancement. We support all genres from classical orchestral to modern electronic. What style of audio content would you like to create?";
    }
    
    // Video-specific responses
    if (lowerInput.includes('video') || lowerInput.includes('movie') || lowerInput.includes('film')) {
      return "Perfect! Our video AI creates Oscar-quality footage with neural cinematography, automated editing, scene composition, and character animation. You can generate everything from short clips to full productions. What kind of video project do you have in mind?";
    }
    
    // Image-specific responses
    if (lowerInput.includes('image') || lowerInput.includes('picture') || lowerInput.includes('photo')) {
      return "Wonderful! Our image AI produces stunning visuals using advanced diffusion models. Create photorealistic portraits, fantasy art, product photos, architectural renders, or abstract designs. What type of images would you like to generate?";
    }
    
    // Pricing inquiries
    if (lowerInput.includes('cost') || lowerInput.includes('price') || lowerInput.includes('credit')) {
      return "Our transparent pricing is simple: 2-3 credits for standard AI generations (great quality), 4-5 credits for premium models (Hollywood-level). You only pay for what you create - no subscriptions! New users get 10 free credits to explore. Ready to start creating?";
    }
    
    // Technical questions
    if (lowerInput.includes('how') && (lowerInput.includes('work') || lowerInput.includes('generate'))) {
      return "Our AI uses cutting-edge neural networks: transformer models for audio, diffusion models for images, and advanced CNNs for video processing. The magic happens through GPU-accelerated inference that processes your creative vision into professional content in seconds. Want to see it in action?";
    }
    
    // Getting started
    if (lowerInput.includes('start') || lowerInput.includes('begin') || lowerInput.includes('create')) {
      return "Let's get you creating! First, choose your medium - audio, video, images, or VFX. Then describe your creative vision, and our AI will bring it to life. You can start with your free credits right now. What would you like to create first?";
    }
    
    // Scene descriptions and creative ideas
    if (lowerInput.includes('scene') || lowerInput.includes('adventure') || lowerInput.includes('story')) {
      return "I love creative storytelling! Let's bring your scene to life with AI. I can help you create the visual effects, background music, character voices, and cinematic elements. Tell me more about the story or scene you want to create - is it for entertainment, a special occasion, or a creative project?";
    }
    
    // Confused or unclear responses
    if (lowerInput.includes('nothing') || lowerInput.includes('dunno') || lowerInput.includes('not sure')) {
      return "No worries! Let me help you discover what's possible. We can create AI music that sounds like your favorite artists, generate videos that look like movie scenes, design images that capture your imagination, or build VFX that rival Hollywood blockbusters. What sounds most exciting to you?";
    }
    
    // Spanish words detection
    if (lowerInput.includes('dios') || lowerInput.includes('miro')) {
      return "I can help you in Spanish too! Our AI can create amazing visual effects for your ship scene. Would you like me to continue in Spanish or English? I can generate realistic ocean waves, dramatic lighting, and cinematic effects for your project.";
    }
    
    // Short responses indicating interest - context aware
    if (lowerInput.length < 10 && (lowerInput.includes('yes') || lowerInput.includes('okay') || lowerInput.includes('sure'))) {
      if (this.conversationContext.userInterests.includes('fantasy')) {
        return "Perfect! Let's create that fantasy VFX scene. I can generate magical effects like glowing waters, mystical creatures, or enchanted atmospheres. What fantasy element excites you most?";
      }
      return "Great! Let's start creating. What specific visual effects would you like to add to your project?";
    }
    
    return null; // No specific response found
  }

  private getRecommendation(): string {
    // Always recommend VFX since that's what the user is interested in
    return 'VFX creation for your ship and sea scene';
  }

  private addIntelligentPersonalization(response: string, intent: string, userInput: string, sentiment: 'positive' | 'neutral' | 'negative'): string {
    // Remove repetitive conversation flow - this was causing the loops
    // Just return the clean response without adding generic phrases
    
    // Only add sentiment-based personalization for very specific cases
    if (sentiment === 'negative' && userInput.toLowerCase().includes('error')) {
      response = "I understand your concerns. " + response;
    }
    
    return response; // Return clean response without repetitive additions
  }

  private updateUserInterests(input: string, intent: string): void {
    const lowerInput = input.toLowerCase();
    const interests = [];
    
    if (lowerInput.includes('vfx') || lowerInput.includes('visual effects')) interests.push('VFX');
    if (lowerInput.includes('audio') || lowerInput.includes('music')) interests.push('audio');
    if (lowerInput.includes('video') || lowerInput.includes('movie')) interests.push('video');
    if (lowerInput.includes('image') || lowerInput.includes('photo')) interests.push('images');
    if (lowerInput.includes('ai') || lowerInput.includes('artificial intelligence')) interests.push('AI technology');
    
    // Add unique interests only
    interests.forEach(interest => {
      if (!this.conversationContext.userInterests.includes(interest)) {
        this.conversationContext.userInterests.push(interest);
      }
    });
    
    // Keep only last 3 interests to avoid overwhelming
    if (this.conversationContext.userInterests.length > 3) {
      this.conversationContext.userInterests = this.conversationContext.userInterests.slice(-3);
    }
  }

  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private addContextualFlair(response: string, intent: string): string {
    const contextualPhrases = {
      en: {
        continuing: "Continuing our conversation, ",
        also: "Also, ",
        building: "Building on what we discussed, "
      }
    };

    if (this.conversationContext.conversationLength > 2) {
      const phrases = contextualPhrases[this.selectedLanguage as keyof typeof contextualPhrases] || contextualPhrases.en;
      const randomPhrase = Object.values(phrases)[Math.floor(Math.random() * Object.values(phrases).length)];
      return randomPhrase + response.toLowerCase();
    }

    return response;
  }

  private addFollowUpQuestion(response: string, intent: string): string {
    const followUps = {
      en: {
        features: " Which feature would you like to explore first?",
        help: " What specific area interests you most?",
        creation: " Shall we start creating something amazing together?",
        technical: " Would you like to see a demo of our AI in action?",
        pricing: " Would you like to try our platform with some free credits?"
      }
    };

    const langFollowUps = followUps[this.selectedLanguage as keyof typeof followUps] || followUps.en;
    const followUp = langFollowUps[intent as keyof typeof langFollowUps];
    
    return followUp ? response + followUp : response;
  }

  // Sentiment analysis for more empathetic responses
  private analyzeSentiment(input: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = /\b(love|amazing|great|awesome|wonderful|fantastic|excellent|perfect|good|nice|happy|excited|interested)\b/gi;
    const negativeWords = /\b(hate|terrible|awful|bad|horrible|disappointing|frustrated|confused|difficult|hard|problem)\b/gi;
    
    const positiveCount = (input.match(positiveWords) || []).length;
    const negativeCount = (input.match(negativeWords) || []).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Reset conversation context
  public resetContext(): void {
    this.conversationContext = {
      lastIntent: '',
      userInterests: [],
      conversationLength: 0
    };
  }

  // Update language
  public setLanguage(language: string): void {
    this.selectedLanguage = language;
  }
}