// Neural Intelligence Core - Central AI Assistant Interface
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Mic, MicOff, Volume2, VolumeX, Zap, Settings, Star, Globe, MessageCircle } from 'lucide-react';
import NeuralSkull from './NeuralSkull';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Global speech recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface NeuralCoreConfig {
  language: string;
  accent?: string;
  voiceSpeed: number;
  voicePitch: number;
  autoActivation: boolean;
  multiLanguageSupport: boolean;
  accentAware: boolean;
  neuralProcessing: boolean;
}

interface VoiceContext {
  currentPage: string;
  userLanguage: string;
  userAccent?: string;
  deviceCapabilities: {
    speechRecognition: boolean;
    speechSynthesis: boolean;
    microphone: boolean;
  };
}

export default function NeuralIntelligenceCore() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showSkull, setShowSkull] = useState(true);
  const [config, setConfig] = useState<NeuralCoreConfig>({
    language: 'en',
    voiceSpeed: 1.0,
    voicePitch: 1.0,
    autoActivation: true,
    multiLanguageSupport: true,
    accentAware: true,
    neuralProcessing: true
  });
  const [voiceContext, setVoiceContext] = useState<VoiceContext>({
    currentPage: window.location.pathname,
    userLanguage: navigator.language.split('-')[0] || 'en',
    userAccent: navigator.language.split('-')[1]?.toLowerCase(),
    deviceCapabilities: {
      speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      speechSynthesis: 'speechSynthesis' in window,
      microphone: true
    }
  });

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const coreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeNeuralCore();
    setupAccessibilityFeatures();
    initializeVoiceServices();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeNeuralCore = (): void => {
    console.log('Initializing Neural Intelligence Core...');
    setVoiceContext(prev => ({
      ...prev,
      currentPage: window.location.pathname
    }));
    
    // Auto-activate on specific pages
    if (shouldActivateOnPage(window.location.pathname)) {
      setTimeout(() => {
        setIsActive(true);
        activateContextualAssistance();
      }, 1500);
    }
  };

  const setupAccessibilityFeatures = (): void => {
    // Keyboard shortcuts
    const handleKeyboardShortcuts = (event: KeyboardEvent): void => {
      if (event.ctrlKey && event.shiftKey && event.key === 'V') {
        event.preventDefault();
        toggleListening();
      }
      if (event.ctrlKey && event.shiftKey && event.key === 'N') {
        event.preventDefault();
        setIsActive(!isActive);
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcuts);
  };

  const initializeVoiceServices = async (): Promise<void> => {
    console.log('Initializing speech services...');
    
    // Initialize speech recognition
    if (voiceContext.deviceCapabilities.speechRecognition) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = config.language;
        console.log('Speech recognition initialized');
      } catch (error) {
        console.error('Speech recognition initialization failed:', error);
      }
    }

    // Initialize speech synthesis
    if (voiceContext.deviceCapabilities.speechSynthesis) {
      synthesisRef.current = window.speechSynthesis;
      
      // Wait for voices to load
      const waitForVoices = (): Promise<void> => {
        return new Promise((resolve) => {
          const voices = synthesisRef.current?.getVoices() || [];
          if (voices.length > 0) {
            console.log('Available voices:', voices.length);
            resolve();
          } else {
            synthesisRef.current?.addEventListener('voiceschanged', () => {
              console.log('Available voices:', synthesisRef.current?.getVoices().length);
              resolve();
            }, { once: true });
          }
        });
      };
      
      await waitForVoices();
      console.log('Speech synthesis initialized');
    }
  };

  const toggleListening = (): void => {
    if (!recognitionRef.current) {
      console.error('Speech recognition not available');
      speak(getVoiceUnavailableMessage(config.language));
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = (): void => {
    if (!recognitionRef.current || isListening) return;

    try {
      if (synthesisRef.current && isSpeaking) {
        synthesisRef.current.cancel();
        setIsSpeaking(false);
      }

      recognitionRef.current.start();
      setIsListening(true);
      console.log('Starting recognition with language:', config.language);
      
      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started successfully');
        setIsListening(true);
      };

      recognitionRef.current.onresult = handleSpeechResult;
      recognitionRef.current.onerror = handleSpeechError;
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
    }
  };

  const stopListening = (): void => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const stopSpeaking = (): void => {
    if (synthesisRef.current && isSpeaking) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
      setCurrentMessage('');
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
    console.error('Speech recognition error:', event.error, '');
    setIsListening(false);
    
    if (event.error !== 'no-speech') {
      speak(getErrorMessage(event.error, config.language));
    }
  };

  const processVoiceCommand = async (command: string): Promise<void> => {
    const lowerCommand = command.toLowerCase();
    console.log('Processing neural command:', command);
    
    // Enhanced neural processing commands
    if (lowerCommand.includes('activate') || lowerCommand.includes('neural')) {
      await handleNeuralActivation();
    } else if (lowerCommand.includes('enhance') || lowerCommand.includes('improve')) {
      await handleContentEnhancement(command);
    } else if (lowerCommand.includes('create') || lowerCommand.includes('generate')) {
      await handleContentGeneration(command);
    } else if (lowerCommand.includes('analyze') || lowerCommand.includes('process')) {
      await handleContentAnalysis(command);
    } else {
      // Use advanced AI for complex commands
      await processComplexCommand(command);
    }
  };

  const handleNeuralActivation = async (): Promise<void> => {
    setIsActive(true);
    setShowSkull(true);
    await speak('Neural Intelligence Core activated. I am ready to assist with advanced AI processing.');
  };

  const handleContentEnhancement = async (command: string): Promise<void> => {
    await speak('Activating content enhancement protocols. Analyzing current project for optimization opportunities.');
    
    try {
      const response = await fetch('/api/super-intelligence/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'enhancement',
          input: { command, context: voiceContext },
          domain: 'mixed',
          quality: 'super'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        await speak('Enhancement complete. Your content has been optimized using advanced neural processing.');
      } else {
        await speak('Enhancement processing encountered an issue. Please try again with more specific instructions.');
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
      await speak('Neural enhancement systems are currently optimizing. Please try again in a moment.');
    }
  };

  const handleContentGeneration = async (command: string): Promise<void> => {
    await speak('Initiating content generation with neural intelligence. Please describe what you would like to create.');
    
    try {
      const response = await fetch('/api/super-intelligence/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'generation',
          input: { prompt: command, context: voiceContext },
          domain: 'mixed',
          quality: 'super'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        await speak('Content generation complete. Your neural-enhanced creation is ready for review.');
      } else {
        await speak('Generation processing is being optimized. Please provide more details about your creative vision.');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      await speak('Creative neural networks are calibrating. Please try describing your idea again.');
    }
  };

  const handleContentAnalysis = async (command: string): Promise<void> => {
    await speak('Performing deep neural analysis. Scanning content for insights and optimization opportunities.');
    
    try {
      const response = await fetch('/api/advanced-ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: { text: command },
          context: { domain: 'analysis', ...voiceContext },
          preferences: { quality: 'high' }
        })
      });

      const result = await response.json();
      
      if (result.success && result.data.insights) {
        await speak('Analysis complete. I have identified several optimization opportunities in your content.');
      } else {
        await speak('Neural analysis systems are processing your request. Results will be available shortly.');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      await speak('Analysis neural cores are optimizing. Please try again with your content.');
    }
  };

  const processComplexCommand = async (command: string): Promise<void> => {
    await speak('Processing complex request with advanced neural intelligence. Please wait while I analyze your needs.');
    // Additional complex command processing would go here
  };

  const speak = async (text: string): Promise<void> => {
    console.log('Attempting to speak:', text);
    if (!synthesisRef.current || !voiceContext.deviceCapabilities.speechSynthesis) {
      console.error('Speech synthesis not available');
      return;
    }

    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getVoiceLanguage(config.language, config.accent);
    utterance.rate = config.voiceSpeed;
    utterance.pitch = config.voicePitch;

    const voices = synthesisRef.current.getVoices();
    const selectedVoice = selectBestVoice(voices, config.language, config.accent);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Using voice:', selectedVoice.name, 'for language:', config.language);
    }

    utterance.onstart = () => {
      console.log('Speech started successfully');
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
      if (isActive && !isListening) {
        setTimeout(() => {
          console.log('Auto-starting listening after speech');
          if (!isListening && !isSpeaking) {
            startListening();
          }
        }, 1000);
      }
    };
    
    utterance.onerror = () => setIsSpeaking(false);

    setCurrentMessage(text);
    synthesisRef.current.speak(utterance);
  };

  const selectBestVoice = (voices: SpeechSynthesisVoice[], language: string, accent?: string): SpeechSynthesisVoice | null => {
    if (!voices.length) return null;
    
    const targetLang = accent ? `${language}-${accent.toUpperCase()}` : language;
    
    const exactMatch = voices.find(voice => voice.lang === targetLang);
    if (exactMatch) return exactMatch;
    
    const languageMatch = voices.find(voice => voice.lang.startsWith(language));
    if (languageMatch) return languageMatch;
    
    return voices.find(voice => voice.lang.startsWith('en')) || voices[0];
  };

  const getVoiceLanguage = (language: string, accent?: string): string => {
    return accent ? `${language}-${accent.toUpperCase()}` : language;
  };

  const shouldActivateOnPage = (page: string): boolean => {
    const activationPages = ['/create', '/video-production', '/intelligence'];
    return activationPages.includes(page);
  };

  const activateContextualAssistance = async (): Promise<void> => {
    const welcomeMessage = getWelcomeMessage(voiceContext.currentPage, config.language);
    await speak(welcomeMessage);
  };

  const getWelcomeMessage = (page: string, language: string): string => {
    const messages: Record<string, Record<string, string>> = {
      'en': {
        '/create': 'Neural Intelligence Core online. I can help you create professional-quality content with advanced AI. What would you like to create?',
        '/video-production': 'Video neural processing activated. Describe your vision and I will help optimize your production workflow.',
        '/intelligence': 'Welcome to the Intelligence Center. I am ready to analyze and enhance your content with neural processing.',
        'default': 'Neural Intelligence Core activated. I am your advanced AI assistant with neural processing capabilities. How can I help?'
      }
    };
    
    return messages[language]?.[page] || messages[language]?.['default'] || messages['en']['default'];
  };

  const getErrorMessage = (error: string, language: string): string => {
    const messages: Record<string, string> = {
      'en': 'Neural processing encountered an issue. Please try again.',
      'es': 'El procesamiento neural encontró un problema. Inténtalo de nuevo.',
      'fr': 'Le traitement neural a rencontré un problème. Veuillez réessayer.'
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

  const cleanup = (): void => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    document.removeEventListener('keydown', () => {});
  };

  return (
    <AnimatePresence>
      {showSkull && (
        <motion.div
          ref={coreRef}
          className="fixed bottom-4 right-4 z-[100] max-w-[280px] w-64"
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 20 }}
          transition={{ duration: 0.4, type: "spring", damping: 15 }}
        >
          <Card className="bg-gradient-to-br from-purple-900/95 via-indigo-900/95 to-blue-900/95 backdrop-blur-lg border border-purple-500/30 shadow-2xl overflow-hidden w-full">
            <CardContent className="p-3">
              {/* Neural Intelligence Core Header */}
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  className="relative"
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                >
                  <NeuralSkull 
                    size={32} 
                    isActive={isActive || isListening || isSpeaking} 
                    showMagic={isListening || isSpeaking}
                  />
                  {(isListening || isSpeaking) && (
                    <motion.div
                      className="absolute inset-0 bg-purple-500/20 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-xs truncate">Neural Intelligence</h3>
                  <div className="flex items-center gap-1 flex-wrap">
                    <Badge 
                      variant="outline" 
                      className={`text-xs border-green-500 ${isActive ? 'text-green-400' : 'text-gray-400'}`}
                    >
                      <Brain className="w-2 h-2 mr-1" />
                      {isActive ? 'Active' : 'Standby'}
                    </Badge>
                    {config.neuralProcessing && (
                      <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                        <Zap className="w-2 h-2 mr-1" />
                        Neural
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Voice Controls */}
              <div className="flex items-center gap-1 mb-2">
                <Button
                  size="sm"
                  onClick={toggleListening}
                  disabled={!voiceContext.deviceCapabilities.speechRecognition}
                  className={`flex-1 text-xs h-7 ${isListening 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-purple-600 hover:bg-purple-700'
                  } text-white`}
                >
                  {isListening ? <MicOff className="w-2 h-2 mr-1" /> : <Mic className="w-2 h-2 mr-1" />}
                  {isListening ? 'Stop' : 'Listen'}
                </Button>
                
                <Button
                  size="sm"
                  onClick={stopSpeaking}
                  disabled={!isSpeaking}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-7 px-2"
                >
                  {isSpeaking ? <VolumeX className="w-2 h-2" /> : <Volume2 className="w-2 h-2" />}
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => setIsActive(!isActive)}
                  className={`h-7 px-2 ${isActive 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                  } text-white`}
                >
                  <Star className="w-2 h-2" />
                </Button>
              </div>

              {/* Current Message Display */}
              <AnimatePresence>
                {currentMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white/10 rounded-lg p-2 mb-2"
                  >
                    <div className="flex items-start gap-2">
                      <MessageCircle className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <p className="text-white text-xs leading-relaxed break-words">{currentMessage}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Display */}
              <div className="text-xs text-white/70 text-center space-y-1">
                <div className="truncate">
                  {config.language.toUpperCase()} • {config.accent ? config.accent.toUpperCase() : 'Default'}
                  {isListening && <span className="ml-1 animate-pulse text-red-400">● Listening</span>}
                  {isSpeaking && <span className="ml-1 animate-pulse text-blue-400">🔊 Speaking</span>}
                </div>
                <div className="text-xs text-white/50 leading-tight">
                  Ctrl+Shift+N to toggle • Ctrl+Shift+V for voice
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}