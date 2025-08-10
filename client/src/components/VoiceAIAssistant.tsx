import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, X, Languages, Settings } from 'lucide-react';
import NeuralSkull from './NeuralSkull';
import { NLPConversationEngine } from './NLPConversationEngine';

interface VoiceAIAssistantProps {
  onToggle?: (isOpen: boolean) => void;
}

const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
];

const proactiveMessages = [
  { 
    trigger: 'idle_5s',
    message: 'Need help getting started? I can guide you through creating your first AI-powered content.',
    languages: {
      es: '¿Necesitas ayuda para empezar? Puedo guiarte para crear tu primer contenido con IA.',
      fr: 'Besoin d\'aide pour commencer? Je peux vous guider pour créer votre premier contenu IA.',
      de: 'Brauchen Sie Hilfe beim Einstieg? Ich kann Sie bei der Erstellung Ihres ersten KI-Inhalts unterstützen.',
      zh: '需要帮助开始吗？我可以指导您创建第一个AI内容。',
      ja: 'スタートのお手伝いが必要ですか？初めてのAIコンテンツ作成をガイドできます。'
    }
  },
  {
    trigger: 'scroll_features',
    message: 'I see you\'re exploring our features! Would you like me to explain how our neural processing works?',
    languages: {
      es: '¡Veo que estás explorando nuestras funciones! ¿Te gustaría que te explique cómo funciona nuestro procesamiento neural?',
      fr: 'Je vois que vous explorez nos fonctionnalités! Voulez-vous que j\'explique comment fonctionne notre traitement neural?',
      de: 'Ich sehe, Sie erkunden unsere Funktionen! Soll ich erklären, wie unsere neurale Verarbeitung funktioniert?',
      zh: '我看到您正在浏览我们的功能！您想让我解释神经处理是如何工作的吗？',
      ja: '機能をご覧いただいているようですね！ニューラル処理の仕組みを説明しましょうか？'
    }
  },
  {
    trigger: 'hover_cta',
    message: 'Ready to create something amazing? I can walk you through the signup process and help you choose the right plan.',
    languages: {
      es: '¿Listo para crear algo increíble? Puedo guiarte a través del proceso de registro y ayudarte a elegir el plan adecuado.',
      fr: 'Prêt à créer quelque chose d\'incroyable? Je peux vous accompagner dans le processus d\'inscription.',
      de: 'Bereit, etwas Großartiges zu schaffen? Ich kann Sie durch die Anmeldung führen.',
      zh: '准备创造令人惊叹的内容了吗？我可以引导您完成注册过程。',
      ja: '素晴らしいものを作る準備はできていますか？サインアップをサポートできます。'
    }
  }
];

export default function VoiceAIAssistant({ onToggle }: VoiceAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLanguages, setShowLanguages] = useState(false);
  const [recognition, setRecognition] = useState<any | null>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const [proactiveTriggered, setProactiveTriggered] = useState<Set<string>>(new Set());
  const [nlpEngine] = useState(() => new NLPConversationEngine(selectedLanguage));
  const [conversationHistory, setConversationHistory] = useState<Array<{type: 'user' | 'ai', message: string}>>([]);
  
  useEffect(() => {
    const initializeSpeech = () => {
      console.log('Initializing speech services...');
      
      // Initialize Speech Recognition
      if (typeof window !== 'undefined') {
        if ('webkitSpeechRecognition' in window) {
          try {
            const speechRecognition = new (window as any).webkitSpeechRecognition();
            speechRecognition.continuous = false; // Changed to false for better control
            speechRecognition.interimResults = true;
            speechRecognition.lang = selectedLanguage === 'zh' ? 'zh-CN' : selectedLanguage;
            speechRecognition.maxAlternatives = 1;
            setRecognition(speechRecognition);
            console.log('Speech recognition initialized');
          } catch (error) {
            console.error('Failed to initialize speech recognition:', error);
          }
        } else {
          console.warn('webkitSpeechRecognition not supported');
        }
        
        // Initialize Speech Synthesis
        if ('speechSynthesis' in window) {
          const synth = window.speechSynthesis;
          setSynthesis(synth);
          
          // Load voices
          const loadVoices = () => {
            const voices = synth.getVoices();
            console.log('Available voices:', voices.length);
          };
          
          if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = loadVoices;
          }
          loadVoices();
          
          console.log('Speech synthesis initialized');
        } else {
          console.warn('speechSynthesis not supported');
        }
      }
    };

    // Initialize immediately if document is ready, otherwise wait
    if (typeof window !== 'undefined' && document.readyState === 'complete') {
      initializeSpeech();
    } else if (typeof window !== 'undefined') {
      window.addEventListener('load', initializeSpeech);
      return () => window.removeEventListener('load', initializeSpeech);
    }
  }, [selectedLanguage]);

  // Proactive messaging system
  useEffect(() => {
    const triggers = {
      idle_5s: () => {
        setTimeout(() => {
          if (!proactiveTriggered.has('idle_5s')) {
            showProactiveMessage('idle_5s');
          }
        }, 5000);
      },
      scroll_features: () => {
        const handleScroll = () => {
          const featuresSection = document.querySelector('[data-section="features"]');
          if (featuresSection && !proactiveTriggered.has('scroll_features')) {
            const rect = featuresSection.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2) {
              showProactiveMessage('scroll_features');
            }
          }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
      },
      hover_cta: () => {
        const ctaButtons = document.querySelectorAll('.btn-primary');
        const handleHover = () => {
          if (!proactiveTriggered.has('hover_cta')) {
            setTimeout(() => showProactiveMessage('hover_cta'), 1000);
          }
        };
        ctaButtons.forEach(btn => btn.addEventListener('mouseenter', handleHover));
        return () => ctaButtons.forEach(btn => btn.removeEventListener('mouseenter', handleHover));
      }
    };

    const cleanups = Object.values(triggers).map(trigger => trigger());
    
    return () => {
      cleanups.forEach(cleanup => cleanup && cleanup());
    };
  }, [proactiveTriggered]);

  const showProactiveMessage = (trigger: string) => {
    const messageData = proactiveMessages.find(msg => msg.trigger === trigger);
    if (messageData) {
      const message = (messageData.languages as any)[selectedLanguage] || messageData.message;
      setCurrentMessage(message);
      setIsOpen(true);
      speakMessage(message);
      setProactiveTriggered(prev => new Set(Array.from(prev).concat([trigger])));
    }
  };

  const speakMessage = (message: string) => {
    console.log('Attempting to speak:', message);
    if (!message || message.trim() === '') {
      console.error('No message to speak');
      return;
    }
    
    if (synthesis) {
      try {
        synthesis.cancel(); // Cancel any ongoing speech
        
        const utterance = new SpeechSynthesisUtterance(message.trim());
        utterance.lang = selectedLanguage === 'zh' ? 'zh-CN' : selectedLanguage === 'ja' ? 'ja-JP' : selectedLanguage;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1;
        
        utterance.onstart = () => {
          console.log('Speech started successfully');
          setIsSpeaking(true);
        };
        
        utterance.onend = () => {
          console.log('Speech ended');
          setIsSpeaking(false);
          // Auto-start listening after speech ends if assistant is open
          if (isOpen && recognition) {
            setTimeout(() => {
              console.log('Auto-starting listening after speech');
              startListening();
            }, 500);
          }
        };
        
        utterance.onerror = (error) => {
          console.error('Speech synthesis error:', error);
          setIsSpeaking(false);
        };
        
        // Try to find a suitable voice
        const voices = synthesis.getVoices();
        console.log('Found voices:', voices.length);
        
        if (voices.length > 0) {
          const preferredVoice = voices.find(voice => 
            voice.lang.startsWith(selectedLanguage) || 
            voice.lang.startsWith('en')
          );
          if (preferredVoice) {
            utterance.voice = preferredVoice;
            console.log('Using voice:', preferredVoice.name);
          }
        }
        
        console.log('Starting speech synthesis...');
        synthesis.speak(utterance);
      } catch (error) {
        console.error('Error in speech synthesis:', error);
        setIsSpeaking(false);
      }
    } else {
      console.error('Speech synthesis not available');
    }
  };

  const startListening = () => {
    console.log('Attempting to start listening');
    
    if (!recognition) {
      console.error('Speech recognition not available');
      return;
    }
    
    if (isListening) {
      console.log('Already listening, stopping first');
      recognition.stop();
      return;
    }
    
    try {
      // Stop any ongoing speech first
      if (synthesis && isSpeaking) {
        synthesis.cancel();
        setIsSpeaking(false);
      }
      
      setIsListening(true);
      
      recognition.onstart = () => {
        console.log('Speech recognition started successfully');
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        console.log('Speech recognition result received');
        const results = event.results;
        const lastResult = results[results.length - 1];
        const transcript = lastResult[0].transcript;
        
        console.log('Transcript:', transcript, 'isFinal:', lastResult.isFinal);
        
        if (lastResult.isFinal && transcript.trim()) {
          console.log('Processing final transcript:', transcript);
          setIsListening(false);
          handleVoiceCommand(transcript.trim());
        }
      };
      
      recognition.onerror = (error: any) => {
        console.error('Speech recognition error:', error.error, error.message);
        setIsListening(false);
        
        // Show user-friendly error message
        const errorMessages: Record<string, string> = {
          'no-speech': 'No speech detected. Please try speaking again.',
          'audio-capture': 'Microphone not accessible. Please check permissions.',
          'not-allowed': 'Microphone permission denied. Please allow microphone access.',
          'network': 'Network error. Please check your connection.',
          'aborted': 'Speech recognition was interrupted.',
        };
        
        const userMessage = errorMessages[error.error] || 'Speech recognition error. Please try again.';
        setCurrentMessage(userMessage);
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };
      
      // Configure recognition settings
      recognition.lang = selectedLanguage === 'zh' ? 'zh-CN' : selectedLanguage === 'ja' ? 'ja-JP' : selectedLanguage;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      
      console.log('Starting recognition with language:', recognition.lang);
      recognition.start();
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
      setCurrentMessage('Unable to start voice recognition. Please try the text input instead.');
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const stopSpeaking = () => {
    if (synthesis) {
      synthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleVoiceCommand = (command: string) => {
    console.log('Processing voice command:', command);
    
    if (!command || command.trim() === '') {
      console.log('Empty command received');
      return;
    }
    
    try {
      // Add user message to conversation history
      setConversationHistory(prev => [...prev, { type: 'user', message: command }]);
      
      // Use NLP engine for natural conversation
      nlpEngine.setLanguage(selectedLanguage);
      const response = nlpEngine.processInput(command);
      
      console.log('Generated response:', response);
      
      // Add AI response to conversation history
      setConversationHistory(prev => [...prev, { type: 'ai', message: response }]);
      
      // Update UI and speak response
      setCurrentMessage(response);
      
      // Small delay before speaking to ensure UI updates
      setTimeout(() => {
        speakMessage(response);
      }, 100);
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      const fallbackResponse = 'I apologize, I had trouble processing that. Could you please try again?';
      setCurrentMessage(fallbackResponse);
      speakMessage(fallbackResponse);
    }
  };

  const toggleAssistant = () => {
    console.log('Toggling assistant, current state:', isOpen);
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
    
    if (newState) {
      const welcomeMessage = selectedLanguage === 'en' 
        ? 'Hello! I am your AI assistant. How can I help you create amazing content today?'
        : selectedLanguage === 'es'
        ? '¡Hola! Soy tu asistente de IA. ¿Cómo puedo ayudarte a crear contenido increíble hoy?'
        : selectedLanguage === 'fr'
        ? 'Bonjour! Je suis votre assistant IA. Comment puis-je vous aider à créer du contenu incroyable aujourd\'hui?'
        : 'Hello! I am your AI assistant. How can I help you create amazing content today?';
      
      console.log('Setting welcome message:', welcomeMessage);
      setCurrentMessage(welcomeMessage);
      
      // Add a small delay to ensure the panel is visible before speaking
      setTimeout(() => {
        speakMessage(welcomeMessage);
      }, 100);
    } else {
      stopSpeaking();
      stopListening();
    }
  };

  return (
    <>
      {/* Floating Assistant Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 200 }}
      >
        <motion.button
          onClick={toggleAssistant}
          data-ai-assistant="true"
          className="relative w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={isListening ? { 
            boxShadow: ["0 0 20px rgba(138, 43, 226, 0.5)", "0 0 40px rgba(138, 43, 226, 0.8)", "0 0 20px rgba(138, 43, 226, 0.5)"]
          } : {}}
          transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
        >
          <NeuralSkull size={32} isActive={isOpen || isListening} showMagic={isSpeaking} />
          
          {/* Status indicators */}
          {isListening && (
            <motion.div
              className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
          
          {isSpeaking && (
            <motion.div
              className="absolute -bottom-2 -left-2 w-4 h-4 bg-green-500 rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
          )}
        </motion.button>
      </motion.div>

      {/* Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 w-80 max-h-96 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-40 overflow-hidden"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <NeuralSkull size={20} isActive={true} showMagic={isSpeaking} />
                <h3 className="f500-button font-semibold text-white">AI Assistant</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setShowLanguages(!showLanguages)}
                  className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Languages className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  onClick={toggleAssistant}
                  className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Language Selector */}
            <AnimatePresence>
              {showLanguages && (
                <motion.div
                  className="p-4 border-b border-white/10 bg-white/5"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {supportedLanguages.map((lang) => (
                      <motion.button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          setShowLanguages(false);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                          selectedLanguage === lang.code 
                            ? 'bg-purple-600 text-white' 
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>{lang.flag}</span>
                        <span className="f500-caption">{lang.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Area */}
            <div className="p-4 min-h-32 max-h-48 overflow-y-auto">
              {/* Conversation History */}
              {conversationHistory.length > 0 && (
                <div className="mb-4 space-y-2 max-h-32 overflow-y-auto">
                  {conversationHistory.slice(-4).map((msg, index) => (
                    <div key={index} className={`text-xs ${msg.type === 'user' ? 'text-cyan-300' : 'text-white/60'}`}>
                      <span className="font-medium">{msg.type === 'user' ? 'You: ' : 'AI: '}</span>
                      {msg.message}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Current Message */}
              <div className="f500-caption text-white/80 leading-relaxed">
                {currentMessage || 'Hello! I am your AI assistant. Click the microphone to start speaking, or I can help you with features, pricing, or getting started.'}
              </div>
              
              {/* Status Indicators */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {isListening && (
                    <div className="flex items-center gap-1 text-red-400">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                      Listening...
                    </div>
                  )}
                  {isSpeaking && (
                    <div className="flex items-center gap-1 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Speaking...
                    </div>
                  )}
                </div>
                
                {/* Debug Info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-white/40">
                    Speech: {synthesis ? '✓' : '✗'} | Recognition: {recognition ? '✓' : '✗'}
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between p-4 bg-white/5 border-t border-white/10">
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={isListening ? stopListening : startListening}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium f500-caption transition-all ${
                    isListening 
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                      : isSpeaking
                      ? 'bg-yellow-600 text-white cursor-not-allowed opacity-50'
                      : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/30'
                  }`}
                  whileHover={{ scale: isListening || isSpeaking ? 1 : 1.05 }}
                  whileTap={{ scale: isListening || isSpeaking ? 1 : 0.95 }}
                  disabled={!recognition || isSpeaking}
                  title={
                    isSpeaking ? 'Wait for speech to finish' :
                    isListening ? 'Stop Listening' : 
                    'Start Voice Input'
                  }
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isListening ? 'Listening...' : isSpeaking ? 'Wait...' : 'Speak'}
                </motion.button>
                
                <motion.button
                  onClick={isSpeaking ? stopSpeaking : () => speakMessage(currentMessage || 'Hello! I am your AI assistant ready to help.')}
                  className={`p-2 rounded-lg transition-colors ${
                    isSpeaking 
                      ? 'bg-red-600 text-white' 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!synthesis}
                  title={isSpeaking ? 'Stop Speaking' : 'Speak Message'}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </motion.button>
              </div>

              <div className="flex items-center gap-2">
                {/* Test Speech Button */}
                <motion.button
                  onClick={() => speakMessage('Testing speech synthesis. Hello world!')}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Test
                </motion.button>
                
                <div className="flex items-center gap-1 text-white/40 f500-caption">
                  <MessageCircle className="w-3 h-3" />
                  Voice AI
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}