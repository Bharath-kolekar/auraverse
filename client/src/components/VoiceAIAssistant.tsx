import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, X, Languages, Settings } from 'lucide-react';
import NeuralSkull from './NeuralSkull';

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
  
  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const speechRecognition = new (window as any).webkitSpeechRecognition();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      speechRecognition.lang = selectedLanguage === 'zh' ? 'zh-CN' : selectedLanguage;
      setRecognition(speechRecognition);
    }
    
    // Initialize Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSynthesis(window.speechSynthesis);
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
    if (synthesis) {
      synthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = selectedLanguage === 'zh' ? 'zh-CN' : selectedLanguage;
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (event.results[event.results.length - 1].isFinal) {
          handleVoiceCommand(transcript);
        }
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
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
    const lowerCommand = command.toLowerCase();
    let response = '';
    
    // Basic command handling
    if (lowerCommand.includes('help') || lowerCommand.includes('assist')) {
      response = 'I can help you create AI-powered content, explain features, or guide you through the platform. What would you like to know?';
    } else if (lowerCommand.includes('feature') || lowerCommand.includes('capability')) {
      response = 'Our platform offers AI audio generation, video creation, image synthesis, and VFX tools. Which feature interests you most?';
    } else if (lowerCommand.includes('price') || lowerCommand.includes('cost')) {
      response = 'We use a credit-based system. Basic AI models cost 2-3 credits, premium models cost 4-5 credits per generation. Would you like more details?';
    } else if (lowerCommand.includes('start') || lowerCommand.includes('begin')) {
      response = 'Great! You can start by signing up and choosing your first AI creation tool. Should I guide you through the process?';
    } else {
      response = 'I understand you said: "' + command + '". How can I help you with your creative AI journey?';
    }
    
    // Translate response if needed
    if (selectedLanguage !== 'en') {
      // Basic translations - in a real app, you'd use a translation API
      const translations: Record<string, Record<string, string>> = {
        es: {
          'I can help you create': 'Puedo ayudarte a crear',
          'Our platform offers': 'Nuestra plataforma ofrece',
          'We use a credit-based system': 'Usamos un sistema basado en créditos',
          'Great! You can start': '¡Genial! Puedes empezar'
        },
        fr: {
          'I can help you create': 'Je peux vous aider à créer',
          'Our platform offers': 'Notre plateforme offre',
          'We use a credit-based system': 'Nous utilisons un système de crédits',
          'Great! You can start': 'Génial! Vous pouvez commencer'
        }
      };
      
      const langTranslations = translations[selectedLanguage as keyof typeof translations];
      if (langTranslations) {
        Object.entries(langTranslations).forEach(([en, translated]) => {
          response = response.replace(en, translated);
        });
      }
    }
    
    setCurrentMessage(response);
    speakMessage(response);
  };

  const toggleAssistant = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
    
    if (newState) {
      const welcomeMessage = selectedLanguage === 'en' 
        ? 'Hello! I\'m your AI assistant. How can I help you create amazing content today?'
        : selectedLanguage === 'es'
        ? '¡Hola! Soy tu asistente de IA. ¿Cómo puedo ayudarte a crear contenido increíble hoy?'
        : selectedLanguage === 'fr'
        ? 'Bonjour! Je suis votre assistant IA. Comment puis-je vous aider à créer du contenu incroyable aujourd\'hui?'
        : 'Hello! I\'m your AI assistant. How can I help you create amazing content today?';
      
      setCurrentMessage(welcomeMessage);
      speakMessage(welcomeMessage);
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
          className="relative w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={isListening ? { 
            boxShadow: ["0 0 20px rgba(138, 43, 226, 0.5)", "0 0 40px rgba(138, 43, 226, 0.8)", "0 0 20px rgba(138, 43, 226, 0.5)"]
          } : {}}
          transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
        >
          <NeuralSkull size={24} isActive={isOpen || isListening} showMagic={isSpeaking} />
          
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
              <div className="f500-caption text-white/80 leading-relaxed">
                {currentMessage || 'Hello! I\'m your AI assistant. How can I help you today?'}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between p-4 bg-white/5 border-t border-white/10">
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={isListening ? stopListening : startListening}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium f500-caption transition-colors ${
                    isListening 
                      ? 'bg-red-600 text-white' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!recognition}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isListening ? 'Stop' : 'Speak'}
                </motion.button>
                
                <motion.button
                  onClick={isSpeaking ? stopSpeaking : () => speakMessage(currentMessage)}
                  className={`p-2 rounded-lg transition-colors ${
                    isSpeaking 
                      ? 'bg-red-600 text-white' 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!synthesis}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </motion.button>
              </div>

              <div className="flex items-center gap-1 text-white/40 f500-caption">
                <MessageCircle className="w-3 h-3" />
                Voice AI
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}