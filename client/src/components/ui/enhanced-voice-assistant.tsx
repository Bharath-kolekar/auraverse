// Enhanced Voice Assistant with Global Development Rules
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Languages, Settings, Sparkles } from 'lucide-react';

// Global speech recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  results: any;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

export interface VoiceAssistantConfig {
  language: string;
  accent?: string;
  voiceSpeed: number;
  voicePitch: number;
  autoActivation: boolean;
  multiLanguageSupport: boolean;
  accentAware: boolean;
}

export interface VoiceContext {
  currentPage: string;
  userLanguage: string;
  userAccent?: string;
  deviceCapabilities: {
    speechRecognition: boolean;
    speechSynthesis: boolean;
    microphone: boolean;
  };
}

export default function EnhancedVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [currentMessage, setCurrentMessage] = useState('');
  const [config, setConfig] = useState<VoiceAssistantConfig>({
    language: 'en',
    voiceSpeed: 1.0,
    voicePitch: 1.0,
    autoActivation: true,
    multiLanguageSupport: true,
    accentAware: true
  });
  const [voiceContext, setVoiceContext] = useState<VoiceContext>({
    currentPage: window.location.pathname,
    userLanguage: navigator.language.split('-')[0] || 'en',
    userAccent: navigator.language.split('-')[1]?.toLowerCase(),
    deviceCapabilities: {
      speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      speechSynthesis: 'speechSynthesis' in window,
      microphone: true // Will be determined by permissions
    }
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const assistantRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    detectUserPreferences();
    setupAccessibilityFeatures();
    initializeVoiceServices();
    
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    // Auto-activate based on user preferences and page context
    if (config.autoActivation && shouldActivateOnPage(voiceContext.currentPage)) {
      activateContextualAssistance();
    }
  }, [voiceContext.currentPage, config.autoActivation]);

  const initializeVoiceServices = async (): Promise<void> => {
    try {
      // Initialize Speech Recognition
      if (voiceContext.deviceCapabilities.speechRecognition) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = config.language;

        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onresult = handleSpeechResult;
        recognitionRef.current.onerror = handleSpeechError;
      }

      // Initialize Speech Synthesis
      if (voiceContext.deviceCapabilities.speechSynthesis) {
        synthesisRef.current = window.speechSynthesis;
      }

      // Request microphone permissions
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (error) {
          console.log('Microphone access denied:', error);
          setVoiceContext(prev => ({
            ...prev,
            deviceCapabilities: { ...prev.deviceCapabilities, microphone: false }
          }));
        }
      }

    } catch (error) {
      console.error('Voice services initialization failed:', error);
    }
  };

  const detectUserPreferences = (): void => {
    // Detect user language and accent preferences
    const userLang = navigator.language.split('-')[0];
    const userRegion = navigator.language.split('-')[1];
    
    setConfig(prev => ({
      ...prev,
      language: userLang,
      accent: userRegion?.toLowerCase()
    }));

    setVoiceContext(prev => ({
      ...prev,
      userLanguage: userLang,
      userAccent: userRegion?.toLowerCase()
    }));
  };

  const setupAccessibilityFeatures = (): void => {
    // Enhanced accessibility support
    if (assistantRef.current) {
      assistantRef.current.setAttribute('aria-label', 'Voice Assistant');
      assistantRef.current.setAttribute('role', 'application');
      assistantRef.current.setAttribute('tabindex', '0');
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
  };

  const handleKeyboardShortcuts = (event: KeyboardEvent): void => {
    // Voice assistant keyboard shortcuts
    if (event.ctrlKey && event.shiftKey) {
      switch (event.key) {
        case 'V': // Ctrl+Shift+V: Toggle voice assistant
          event.preventDefault();
          toggleListening();
          break;
        case 'S': // Ctrl+Shift+S: Stop speaking
          event.preventDefault();
          stopSpeaking();
          break;
        case 'L': // Ctrl+Shift+L: Change language
          event.preventDefault();
          cycleLanguages();
          break;
      }
    }
  };

  const handleSpeechResult = (event: any): void => {
    const transcript = Array.from(event.results)
      .map((result: any) => result[0].transcript)
      .join('');

    if (event.results[event.results.length - 1].isFinal) {
      processVoiceCommand(transcript);
    }
  };

  const handleSpeechError = (event: any): void => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
    
    // Provide fallback guidance
    speak(getErrorMessage(event.error, config.language));
  };

  const processVoiceCommand = async (command: string): Promise<void> => {
    const lowerCommand = command.toLowerCase();
    
    // Multi-language command recognition
    const commands = getLocalizedCommands(config.language);
    
    if (commands.help.some((cmd: string) => lowerCommand.includes(cmd))) {
      await provideContextualHelp();
    } else if (commands.navigate.some((cmd: string) => lowerCommand.includes(cmd))) {
      await handleNavigationCommand(lowerCommand);
    } else if (commands.create.some((cmd: string) => lowerCommand.includes(cmd))) {
      await handleCreationCommand(lowerCommand);
    } else if (commands.settings.some((cmd: string) => lowerCommand.includes(cmd))) {
      await handleSettingsCommand(lowerCommand);
    } else {
      // Use AI agent for complex commands
      await processComplexCommand(command);
    }
  };

  const provideContextualHelp = async (): Promise<void> => {
    const helpMessage = getContextualHelp(voiceContext.currentPage, config.language);
    await speak(helpMessage);
  };

  const handleNavigationCommand = async (command: string): Promise<void> => {
    const pages = {
      'home': '/',
      'create': '/create',
      'video': '/video-production',
      'gallery': '/gallery',
      'marketplace': '/marketplace',
      'intelligence': '/intelligence'
    };

    for (const [page, path] of Object.entries(pages)) {
      if (command.includes(page)) {
        await speak(getNavigationMessage(page, config.language));
        window.location.href = path;
        return;
      }
    }

    await speak(getNavigationErrorMessage(config.language));
  };

  const handleCreationCommand = async (command: string): Promise<void> => {
    const creationTypes = ['video', 'audio', 'image', 'music'];
    
    for (const type of creationTypes) {
      if (command.includes(type)) {
        await speak(getCreationMessage(type, config.language));
        // Trigger creation workflow
        window.location.href = `/create?type=${type}`;
        return;
      }
    }

    await speak(getCreationHelpMessage(config.language));
  };

  const handleSettingsCommand = async (command: string): Promise<void> => {
    if (command.includes('language') || command.includes('idioma') || command.includes('langue')) {
      cycleLanguages();
    } else if (command.includes('speed') || command.includes('velocidad') || command.includes('vitesse')) {
      adjustSpeed(command);
    } else if (command.includes('voice') || command.includes('voz') || command.includes('voix')) {
      await speak(getVoiceSettingsMessage(config.language));
    }
  };

  const processComplexCommand = async (command: string): Promise<void> => {
    try {
      const response = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          command,
          context: voiceContext,
          config
        })
      });

      const result = await response.json();
      
      if (result.success) {
        await speak(result.response);
        
        // Execute any actions returned by the AI
        if (result.actions) {
          await executeActions(result.actions);
        }
      } else {
        await speak(getProcessingErrorMessage(config.language));
      }
    } catch (error) {
      console.error('Complex command processing failed:', error);
      await speak(getProcessingErrorMessage(config.language));
    }
  };

  const speak = async (text: string): Promise<void> => {
    if (!synthesisRef.current || !voiceContext.deviceCapabilities.speechSynthesis) {
      return;
    }

    // Stop any current speech
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getVoiceLanguage(config.language, config.accent);
    utterance.rate = config.voiceSpeed;
    utterance.pitch = config.voicePitch;

    // Select appropriate voice based on language and accent
    const voices = synthesisRef.current.getVoices();
    const selectedVoice = selectBestVoice(voices, config.language, config.accent);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setCurrentMessage(text);
    synthesisRef.current.speak(utterance);
  };

  const selectBestVoice = (
    voices: SpeechSynthesisVoice[],
    language: string,
    accent?: string
  ): SpeechSynthesisVoice | null => {
    // First, try to find voice with exact language and accent match
    if (accent) {
      const exactMatch = voices.find(voice => 
        voice.lang.toLowerCase().includes(`${language}-${accent}`)
      );
      if (exactMatch) return exactMatch;
    }

    // Fallback to language match
    const languageMatch = voices.find(voice => 
      voice.lang.toLowerCase().startsWith(language)
    );
    if (languageMatch) return languageMatch;

    // Default fallback
    return voices.find(voice => voice.default) || voices[0] || null;
  };

  const toggleListening = (): void => {
    if (!recognitionRef.current || !voiceContext.deviceCapabilities.speechRecognition) {
      speak(getVoiceUnavailableMessage(config.language));
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const stopSpeaking = (): void => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
      setCurrentMessage('');
    }
  };

  const cycleLanguages = (): void => {
    const supportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja'];
    const currentIndex = supportedLanguages.indexOf(config.language);
    const nextIndex = (currentIndex + 1) % supportedLanguages.length;
    const nextLanguage = supportedLanguages[nextIndex];

    setConfig(prev => ({ ...prev, language: nextLanguage }));
    
    if (recognitionRef.current) {
      recognitionRef.current.lang = nextLanguage;
    }

    speak(getLanguageChangedMessage(nextLanguage));
  };

  const adjustSpeed = (command: string): void => {
    let newSpeed = config.voiceSpeed;
    
    if (command.includes('faster') || command.includes('rápido') || command.includes('rapide')) {
      newSpeed = Math.min(2.0, config.voiceSpeed + 0.2);
    } else if (command.includes('slower') || command.includes('lento') || command.includes('lent')) {
      newSpeed = Math.max(0.5, config.voiceSpeed - 0.2);
    }

    setConfig(prev => ({ ...prev, voiceSpeed: newSpeed }));
    speak(getSpeedChangedMessage(config.language));
  };

  const shouldActivateOnPage = (page: string): boolean => {
    const activationPages = ['/create', '/video-production', '/intelligence'];
    return activationPages.includes(page);
  };

  const activateContextualAssistance = async (): Promise<void> => {
    const welcomeMessage = getWelcomeMessage(voiceContext.currentPage, config.language);
    await speak(welcomeMessage);
  };

  const executeActions = async (actions: any[]): Promise<void> => {
    for (const action of actions) {
      switch (action.type) {
        case 'navigate':
          window.location.href = action.path;
          break;
        case 'fill_form':
          // Fill form fields
          break;
        case 'click_button':
          const button = document.querySelector(action.selector);
          if (button) (button as HTMLElement).click();
          break;
      }
    }
  };

  const cleanup = (): void => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    document.removeEventListener('keydown', handleKeyboardShortcuts);
  };

  // Helper functions for localized messages
  const getLocalizedCommands = (language: string) => {
    const commands: Record<string, any> = {
      'en': {
        help: ['help', 'assist', 'guide'],
        navigate: ['go to', 'navigate', 'open'],
        create: ['create', 'make', 'generate'],
        settings: ['settings', 'preferences', 'config']
      },
      'es': {
        help: ['ayuda', 'asistir', 'guía'],
        navigate: ['ir a', 'navegar', 'abrir'],
        create: ['crear', 'hacer', 'generar'],
        settings: ['configuración', 'preferencias', 'ajustes']
      },
      'fr': {
        help: ['aide', 'assister', 'guide'],
        navigate: ['aller à', 'naviguer', 'ouvrir'],
        create: ['créer', 'faire', 'générer'],
        settings: ['paramètres', 'préférences', 'config']
      }
    };
    
    return commands[language] || commands['en'];
  };

  const getContextualHelp = (page: string, language: string): string => {
    const help: Record<string, Record<string, string>> = {
      'en': {
        '/create': 'You can create AI-powered content here. Try saying "create video" or "generate audio".',
        '/video-production': 'This is the video production studio. Describe your video idea to get started.',
        '/gallery': 'Browse your created content here. Say "show my videos" or "open project".',
        'default': 'I can help you navigate and create content. Try saying "help" or "create something".'
      },
      'es': {
        '/create': 'Puedes crear contenido con IA aquí. Prueba diciendo "crear video" o "generar audio".',
        '/video-production': 'Este es el estudio de producción de video. Describe tu idea de video para comenzar.',
        '/gallery': 'Explora tu contenido creado aquí. Di "mostrar mis videos" o "abrir proyecto".',
        'default': 'Puedo ayudarte a navegar y crear contenido. Prueba diciendo "ayuda" o "crear algo".'
      }
    };
    
    return help[language]?.[page] || help[language]?.['default'] || help['en']['default'];
  };

  const getErrorMessage = (error: string, language: string): string => {
    const messages: Record<string, string> = {
      'en': 'Voice recognition encountered an issue. Please try again.',
      'es': 'El reconocimiento de voz encontró un problema. Inténtalo de nuevo.',
      'fr': 'La reconnaissance vocale a rencontré un problème. Veuillez réessayer.'
    };
    return messages[language] || messages['en'];
  };

  const getVoiceLanguage = (language: string, accent?: string): string => {
    return accent ? `${language}-${accent.toUpperCase()}` : language;
  };

  const getNavigationMessage = (page: string, language: string): string => {
    const messages: Record<string, Record<string, string>> = {
      'en': {
        'home': 'Navigating to home page',
        'create': 'Opening creation studio',
        'video': 'Opening video production',
        'gallery': 'Opening gallery',
        'marketplace': 'Opening marketplace',
        'intelligence': 'Opening intelligence center'
      },
      'es': {
        'home': 'Navegando a la página principal',
        'create': 'Abriendo estudio de creación',
        'video': 'Abriendo producción de video',
        'gallery': 'Abriendo galería',
        'marketplace': 'Abriendo mercado',
        'intelligence': 'Abriendo centro de inteligencia'
      }
    };
    
    return messages[language]?.[page] || messages['en'][page] || 'Navigating...';
  };

  const getNavigationErrorMessage = (language: string): string => {
    const messages: Record<string, string> = {
      'en': 'I didn\'t understand that navigation command. Try saying "go to create" or "open gallery".',
      'es': 'No entendí ese comando de navegación. Prueba diciendo "ir a crear" o "abrir galería".',
      'fr': 'Je n\'ai pas compris cette commande de navigation. Essayez de dire "aller à créer" ou "ouvrir galerie".'
    };
    return messages[language] || messages['en'];
  };

  const getCreationMessage = (type: string, language: string): string => {
    const messages: Record<string, Record<string, string>> = {
      'en': {
        'video': 'Opening video creation. Describe what you want to create.',
        'audio': 'Opening audio generation. What kind of audio do you need?',
        'image': 'Opening image creation. Describe the image you want.',
        'music': 'Opening music generation. What style of music?'
      },
      'es': {
        'video': 'Abriendo creación de video. Describe lo que quieres crear.',
        'audio': 'Abriendo generación de audio. ¿Qué tipo de audio necesitas?',
        'image': 'Abriendo creación de imagen. Describe la imagen que quieres.',
        'music': 'Abriendo generación de música. ¿Qué estilo de música?'
      }
    };
    
    return messages[language]?.[type] || messages['en'][type] || 'Opening creation tools...';
  };

  const getCreationHelpMessage = (language: string): string => {
    const messages: Record<string, string> = {
      'en': 'I can help you create videos, audio, images, or music. What would you like to create?',
      'es': 'Puedo ayudarte a crear videos, audio, imágenes o música. ¿Qué te gustaría crear?',
      'fr': 'Je peux vous aider à créer des vidéos, de l\'audio, des images ou de la musique. Que souhaitez-vous créer?'
    };
    return messages[language] || messages['en'];
  };

  const getVoiceSettingsMessage = (language: string): string => {
    const messages: Record<string, string> = {
      'en': 'Voice settings: You can change language, speed, or voice. Try saying "change language" or "speak faster".',
      'es': 'Configuración de voz: Puedes cambiar idioma, velocidad o voz. Prueba diciendo "cambiar idioma" o "hablar más rápido".',
      'fr': 'Paramètres vocaux: Vous pouvez changer la langue, la vitesse ou la voix. Essayez de dire "changer de langue" ou "parler plus vite".'
    };
    return messages[language] || messages['en'];
  };

  const getProcessingErrorMessage = (language: string): string => {
    const messages: Record<string, string> = {
      'en': 'I couldn\'t process that command. Please try again or say "help" for assistance.',
      'es': 'No pude procesar ese comando. Inténtalo de nuevo o di "ayuda" para asistencia.',
      'fr': 'Je n\'ai pas pu traiter cette commande. Veuillez réessayer ou dire "aide" pour obtenir de l\'aide.'
    };
    return messages[language] || messages['en'];
  };

  const getVoiceUnavailableMessage = (language: string): string => {
    const messages: Record<string, string> = {
      'en': 'Voice recognition is not available on this device or browser.',
      'es': 'El reconocimiento de voz no está disponible en este dispositivo o navegador.',
      'fr': 'La reconnaissance vocale n\'est pas disponible sur cet appareil ou navigateur.'
    };
    return messages[language] || messages['en'];
  };

  const getLanguageChangedMessage = (language: string): string => {
    const messages: Record<string, string> = {
      'en': 'Language changed to English',
      'es': 'Idioma cambiado a Español',
      'fr': 'Langue changée en Français',
      'de': 'Sprache geändert zu Deutsch',
      'it': 'Lingua cambiata in Italiano',
      'pt': 'Idioma alterado para Português',
      'zh': '语言已更改为中文',
      'ja': '言語が日本語に変更されました'
    };
    return messages[language] || `Language changed to ${language}`;
  };

  const getSpeedChangedMessage = (language: string): string => {
    const messages: Record<string, string> = {
      'en': 'Voice speed adjusted',
      'es': 'Velocidad de voz ajustada',
      'fr': 'Vitesse de la voix ajustée'
    };
    return messages[language] || messages['en'];
  };

  const getWelcomeMessage = (page: string, language: string): string => {
    const messages: Record<string, Record<string, string>> = {
      'en': {
        '/create': 'Welcome to the creation studio! I can help you create amazing content with AI. What would you like to create?',
        '/video-production': 'Welcome to video production! Describe your video idea and I\'ll help you create it.',
        '/intelligence': 'Welcome to the intelligence center! I can help you analyze and enhance your content.',
        'default': 'Hello! I\'m your AI assistant. I can help you navigate and create content. Just ask!'
      },
      'es': {
        '/create': '¡Bienvenido al estudio de creación! Puedo ayudarte a crear contenido increíble con IA. ¿Qué te gustaría crear?',
        '/video-production': '¡Bienvenido a la producción de video! Describe tu idea de video y te ayudaré a crearlo.',
        '/intelligence': '¡Bienvenido al centro de inteligencia! Puedo ayudarte a analizar y mejorar tu contenido.',
        'default': '¡Hola! Soy tu asistente de IA. Puedo ayudarte a navegar y crear contenido. ¡Solo pregunta!'
      }
    };
    
    return messages[language]?.[page] || messages[language]?.['default'] || messages['en']['default'];
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={assistantRef}
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4 shadow-2xl border border-white/20 backdrop-blur-lg">
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                className="w-3 h-3 bg-green-400 rounded-full"
                animate={isListening ? { scale: [1, 1.5, 1] } : {}}
                transition={{ repeat: isListening ? Infinity : 0, duration: 1 }}
              />
              <span className="text-white font-medium text-sm">Voice Assistant</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleListening}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  title={isListening ? 'Stop listening' : 'Start listening'}
                >
                  {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
                </button>
                <button
                  onClick={stopSpeaking}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  title={isSpeaking ? 'Stop speaking' : 'Voice controls'}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                </button>
                <button
                  onClick={cycleLanguages}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  title="Change language"
                >
                  <Languages className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            
            {currentMessage && (
              <motion.div
                className="bg-white/10 rounded-lg p-3 mb-3 text-white text-sm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p>{currentMessage}</p>
                </div>
              </motion.div>
            )}
            
            <div className="text-xs text-white/70 text-center">
              {config.language.toUpperCase()} • {config.accent ? config.accent.toUpperCase() : 'Default'}
              {isListening && <span className="ml-2 animate-pulse">● Listening</span>}
              {isSpeaking && <span className="ml-2 animate-pulse">🔊 Speaking</span>}
            </div>
            
            <div className="text-xs text-white/50 text-center mt-1">
              Ctrl+Shift+V to toggle • Multi-language supported
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}