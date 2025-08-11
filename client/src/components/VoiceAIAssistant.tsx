import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, X, Languages, Settings } from 'lucide-react';
import NeuralSkull from './NeuralSkull';
import { NLPConversationEngine } from './NLPConversationEngine';
import { useVoiceActions } from '../hooks/useVoiceActions';

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

// Workflow states for iterative improvements
const WORKFLOW_STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  CREATING: 'creating',
  REVIEWING: 'reviewing',
  SAVING: 'saving',
  COMPLETE: 'complete'
};

export default function VoiceAIAssistant({ onToggle }: VoiceAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLanguages, setShowLanguages] = useState(false);
  const [recognition, setRecognition] = useState<any | null>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const [nlpEngine] = useState(() => new NLPConversationEngine(selectedLanguage));
  const { executeCommand, isProcessing } = useVoiceActions();
  const [conversationHistory, setConversationHistory] = useState<Array<{type: 'user' | 'ai', message: string, timestamp: Date, language?: string, speaker?: string}>>([]);
  const [detectedSpeakers, setDetectedSpeakers] = useState<Set<string>>(new Set());
  const [currentSpeaker, setCurrentSpeaker] = useState<string>('Speaker 1');
  const [autoLanguageDetection, setAutoLanguageDetection] = useState(true);
  const [workflowState, setWorkflowState] = useState(WORKFLOW_STATES.IDLE);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [lastInterimTranscript, setLastInterimTranscript] = useState('');
  
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

  // Context-aware page guidance
  useEffect(() => {
    if (!isOpen) return;
    
    const currentPath = window.location.pathname;
    
    // Provide proactive guidance based on current page
    const pageGuidance: Record<string, string> = {
      '/create': 'I see you\'re in the Create Studio. What type of content would you like to create? You can say "video", "audio", or "VFX".',
      '/gallery': 'Welcome to your Gallery. Would you like to view your recent creations or search for something specific?',
      '/marketplace': 'This is the Marketplace. You can browse content, purchase assets, or list your own creations for sale.',
      '/intelligence': 'You\'re in the Intelligence Gateway. Which AI model would you like to use for your project?'
    };
    
    const guidance = pageGuidance[currentPath];
    if (guidance && !hasSpokenWelcome) {
      setTimeout(() => {
        if (!isSpeaking && !isListening) {
          speakMessage(guidance);
          setHasSpokenWelcome(true);
        }
      }, 1500);
    }
  }, [isOpen, hasSpokenWelcome]);

  // Workflow management for iterative improvements
  const handleWorkflowStep = async (step: string, data?: any) => {
    console.log('Workflow step:', step, 'Current state:', workflowState);
    
    switch (step) {
      case 'CREATE':
        setWorkflowState(WORKFLOW_STATES.CREATING);
        speakMessage('Creating your content now. I\'ll let you know when it\'s ready for review.');
        // Execute creation logic
        setTimeout(() => {
          setWorkflowState(WORKFLOW_STATES.REVIEWING);
          speakMessage('Your content is ready. Would you like to review it or make any changes?');
        }, 3000);
        break;
        
      case 'REVIEW':
        setWorkflowState(WORKFLOW_STATES.REVIEWING);
        speakMessage('Please review the content. Let me know if you need any modifications.');
        break;
        
      case 'MODIFY':
        setWorkflowState(WORKFLOW_STATES.CREATING);
        speakMessage('Making the requested changes. One moment please.');
        setTimeout(() => {
          setWorkflowState(WORKFLOW_STATES.REVIEWING);
          speakMessage('Changes complete. How does it look now?');
        }, 2000);
        break;
        
      case 'SAVE':
        setWorkflowState(WORKFLOW_STATES.SAVING);
        speakMessage('Where would you like to save this file? You can specify a project name or folder.');
        break;
        
      case 'COMPLETE':
        setWorkflowState(WORKFLOW_STATES.COMPLETE);
        speakMessage('Great! Your content has been saved successfully. Would you like to create something else?');
        setCurrentProject(null);
        setTimeout(() => {
          setWorkflowState(WORKFLOW_STATES.IDLE);
        }, 5000);
        break;
        
      default:
        setWorkflowState(WORKFLOW_STATES.IDLE);
    }
  };

  const speakMessage = (message: string, targetLanguage?: string) => {
    const langToUse = targetLanguage || selectedLanguage;
    console.log('Attempting to speak:', message);
    if (!message || message.trim() === '') {
      console.error('No message to speak');
      return;
    }
    
    if (synthesis) {
      try {
        synthesis.cancel(); // Cancel any ongoing speech
        
        const utterance = new SpeechSynthesisUtterance(message.trim());
        utterance.lang = langToUse === 'zh' ? 'zh-CN' : langToUse === 'ja' ? 'ja-JP' : langToUse;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1;
        
        utterance.onstart = () => {
          console.log('Speech started successfully');
          setIsSpeaking(true);
        };
        
        utterance.onend = () => {
          console.log('Speech ended, will start listening again');
          setIsSpeaking(false);
          // Always restart listening after speaking completes if panel is open
          setTimeout(() => {
            console.log('Auto-starting listening after speech, isOpen:', isOpen);
            if (isOpen && recognition) {
              console.log('Starting to listen automatically...');
              startListening();
            }
          }, 800); // Short delay to let user prepare
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
            voice.lang.startsWith(langToUse) || 
            voice.lang.startsWith('en')
          );
          if (preferredVoice) {
            utterance.voice = preferredVoice;
            console.log('Using voice:', preferredVoice.name, 'for language:', langToUse);
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
        
        // Clear silence timer when user speaks
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }
        
        if (!lastResult.isFinal) {
          // User is still speaking - track interim results
          setIsUserSpeaking(true);
          setLastInterimTranscript(transcript);
          
          // Set a timer to detect when user stops speaking
          const timer = setTimeout(() => {
            setIsUserSpeaking(false);
            if (lastInterimTranscript && lastInterimTranscript.trim()) {
              // Process the last interim transcript as final
              console.log('Processing after silence:', lastInterimTranscript);
              setIsListening(false);
              
              const detectedLanguage = detectLanguage(lastInterimTranscript.trim());
              const speakerId = identifySpeaker(lastInterimTranscript.trim());
              
              handleVoiceCommand(lastInterimTranscript.trim(), detectedLanguage, speakerId);
              setLastInterimTranscript('');
            }
          }, 2000); // Wait 2 seconds of silence before processing
          
          setSilenceTimer(timer);
        } else if (transcript.trim()) {
          // Final transcript received
          setIsUserSpeaking(false);
          console.log('Processing final transcript:', transcript);
          setIsListening(false);
          
          // Detect language and speaker
          const detectedLanguage = detectLanguage(transcript.trim());
          const speakerId = identifySpeaker(transcript.trim());
          
          console.log('Detected language:', detectedLanguage, 'Speaker:', speakerId);
          
          handleVoiceCommand(transcript.trim(), detectedLanguage, speakerId);
        }
      };
      
      recognition.onerror = (error: any) => {
        console.error('Speech recognition error:', error.error, error.message);
        setIsListening(false);
        
        // Show user-friendly error message but don't interrupt conversation
        const errorMessages: Record<string, string> = {
          'no-speech': 'I\'m still listening... please speak when ready.',
          'audio-capture': 'Microphone not accessible. Please check permissions.',
          'not-allowed': 'Microphone permission denied. Please allow microphone access.',
          'network': 'Network error. Please check your connection.',
          'aborted': 'Speech recognition was interrupted.',
        };
        
        const userMessage = errorMessages[error.error] || 'Speech recognition error. Please try again.';
        
        // Only show critical errors, ignore no-speech errors
        if (error.error !== 'no-speech') {
          setCurrentMessage(userMessage);
        }
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };
      
      // Configure recognition settings for better accuracy
      recognition.lang = selectedLanguage === 'zh' ? 'zh-CN' : selectedLanguage === 'ja' ? 'ja-JP' : selectedLanguage;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3; // Get more alternatives for better matching
      
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

  const handleVoiceCommand = async (command: string, detectedLanguage?: string, speakerId?: string) => {
    console.log('Processing voice command:', command, 'Language:', detectedLanguage, 'Speaker:', speakerId);
    
    if (!command || command.trim() === '') {
      console.log('Empty command received');
      return;
    }
    
    try {
      const currentTime = new Date();
      const finalSpeakerId = speakerId || currentSpeaker;
      const finalLanguage = detectedLanguage || selectedLanguage;
      
      // Add speaker to detected speakers set
      setDetectedSpeakers(prev => new Set(prev).add(finalSpeakerId));
      setCurrentSpeaker(finalSpeakerId);
      
      // Auto-switch language if detected different language
      if (autoLanguageDetection && detectedLanguage && detectedLanguage !== selectedLanguage) {
        console.log(`Auto-switching language from ${selectedLanguage} to ${detectedLanguage}`);
        setSelectedLanguage(detectedLanguage);
      }
      
      // Add user message to conversation history with metadata
      setConversationHistory(prev => [...prev, { 
        type: 'user', 
        message: command, 
        timestamp: currentTime,
        language: finalLanguage,
        speaker: finalSpeakerId
      }]);
      
      // Use NLP engine with context from conversation history
      nlpEngine.setLanguage(finalLanguage);
      
      // Provide conversation context to NLP engine
      const contextualResponse = await generateContextualResponse(command, finalLanguage, finalSpeakerId);
      
      console.log('Generated contextual response:', contextualResponse);
      
      // Add AI response to conversation history
      setConversationHistory(prev => [...prev, { 
        type: 'ai', 
        message: contextualResponse, 
        timestamp: new Date(),
        language: finalLanguage
      }]);
      
      // Update UI and speak response
      setCurrentMessage(contextualResponse);
      
      // Speak response in detected language
      setTimeout(() => {
        speakMessage(contextualResponse, finalLanguage);
      }, 100);
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      const fallbackResponse = 'I apologize, I had trouble processing that. Could you please try again?';
      setCurrentMessage(fallbackResponse);
      speakMessage(fallbackResponse);
    }
  };

  const generateContextualResponse = async (command: string, language: string, speakerId: string): Promise<string> => {
    console.log('Generating contextual response for:', command);
    const lowerCommand = command.toLowerCase();
    
    // Check for VFX creation request
    if (lowerCommand.includes('vfx') || lowerCommand.includes('visual effect')) {
      console.log('VFX creation detected, navigating to Create Studio...');
      setWorkflowState(WORKFLOW_STATES.PROCESSING);
      setCurrentProject({ type: 'vfx', request: command });
      
      // Directly navigate to create page using window.location
      window.location.href = '/create';
      
      // Set a flag in localStorage to auto-select VFX after page loads
      localStorage.setItem('autoSelectContent', 'vfx');
      
      return 'Perfect! I\'m taking you to the Create Studio now to create your VFX content. The page is loading...';
    }
    
    // Check for review/modification commands
    if (workflowState === WORKFLOW_STATES.REVIEWING) {
      if (lowerCommand.includes('change') || lowerCommand.includes('modify') || lowerCommand.includes('different')) {
        handleWorkflowStep('MODIFY');
        return 'I understand. What specific changes would you like me to make?';
      }
      if (lowerCommand.includes('good') || lowerCommand.includes('perfect') || lowerCommand.includes('save')) {
        handleWorkflowStep('SAVE');
        return 'Excellent! Let me save this for you.';
      }
    }
    
    // Check for save location
    if (workflowState === WORKFLOW_STATES.SAVING) {
      setCurrentProject({ ...currentProject, savePath: command });
      handleWorkflowStep('COMPLETE');
      return `Perfect! I\'ve saved your project as "${command}". It\'s ready for use.`;
    }
    
    // First priority: Execute action commands
    const actionResult = await executeCommand(command);
    if (actionResult.success) {
      console.log('Executed action:', actionResult.action, actionResult.message);
      
      // If there's a redirect, provide enhanced feedback
      if (actionResult.redirect) {
        console.log('Navigation command received for:', actionResult.redirect);
        setCurrentMessage(actionResult.message + ' Opening now!');
        
        // Reset welcome message for new page
        setHasSpokenWelcome(false);
      }
      
      return actionResult.message;
    }
    
    // Get recent conversation context for NLP fallback
    const recentHistory = conversationHistory.slice(-6);
    const userMessages = recentHistory.filter(msg => msg.type === 'user');
    
    // Set important context flags
    const hasVFXContext = userMessages.some(msg => 
      msg.message.toLowerCase().includes('vfx') || 
      msg.message.toLowerCase().includes('visual effects') ||
      msg.message.toLowerCase().includes('ship') ||
      msg.message.toLowerCase().includes('sea')
    );
    
    const hasChildContext = userMessages.some(msg => 
      msg.message.toLowerCase().includes('son') || 
      msg.message.toLowerCase().includes('child')
    );
    
    const hasFantasyContext = userMessages.some(msg => 
      msg.message.toLowerCase().includes('fantasy')
    );
    
    // Update NLP engine context (avoid duplicates)
    if (hasVFXContext && !nlpEngine.conversationContext.userInterests.includes('VFX')) {
      nlpEngine.conversationContext.userInterests.push('VFX');
    }
    if (hasChildContext && !nlpEngine.conversationContext.userInterests.includes('child project')) {
      nlpEngine.conversationContext.userInterests.push('child project');
    }
    if (hasFantasyContext && !nlpEngine.conversationContext.userInterests.includes('fantasy')) {
      nlpEngine.conversationContext.userInterests.push('fantasy');
    }
    
    // Generate conversational response as fallback
    const baseResponse = nlpEngine.processInput(command);
    
    console.log('Generated base response:', baseResponse);
    return baseResponse;
  };

  const detectLanguage = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    // Simple language detection based on common words and patterns
    if (/\b(hola|gracias|por favor|qué|cómo|sí|no)\b/i.test(text)) return 'es';
    if (/\b(bonjour|merci|s'il vous plaît|que|comment|oui|non)\b/i.test(text)) return 'fr';
    if (/\b(hallo|danke|bitte|was|wie|ja|nein)\b/i.test(text)) return 'de';
    if (/\b(こんにちは|ありがとう|はい|いいえ)\b/i.test(text)) return 'ja';
    if (/\b(你好|谢谢|请|是|不)\b/i.test(text)) return 'zh';
    if (/\b(привет|спасибо|пожалуйста|да|нет)\b/i.test(text)) return 'ru';
    if (/\b(ciao|grazie|prego|sì|no)\b/i.test(text)) return 'it';
    if (/\b(olá|obrigado|por favor|sim|não)\b/i.test(text)) return 'pt';
    
    return 'en'; // Default to English
  };

  const identifySpeaker = (text: string): string => {
    // Simple speaker identification based on speech patterns and content
    const lowerText = text.toLowerCase();
    
    // Look for self-identification
    if (lowerText.includes('my name is') || lowerText.includes('i am')) {
      const nameMatch = text.match(/(?:my name is|i am)\s+([a-zA-Z]+)/i);
      if (nameMatch) {
        return nameMatch[1];
      }
    }
    
    // Look for child-specific language patterns
    if (lowerText.includes('dad') || lowerText.includes('daddy') || lowerText.includes('papa')) {
      return 'Child';
    }
    
    // Look for adult-specific language patterns
    if (lowerText.includes('my son') || lowerText.includes('my daughter') || lowerText.includes('my child')) {
      return 'Parent';
    }
    
    // Check conversation history for voice pattern matching
    const recentSpeakers = conversationHistory
      .filter(msg => msg.type === 'user')
      .slice(-3)
      .map(msg => ({ speaker: msg.speaker, message: msg.message.toLowerCase() }));
    
    // Simple voice pattern matching based on similar words/phrases
    for (const prevMsg of recentSpeakers) {
      if (prevMsg.speaker && prevMsg.speaker !== 'Speaker 1') {
        const commonWords = lowerText.split(' ').filter(word => 
          word.length > 3 && prevMsg.message.includes(word)
        );
        if (commonWords.length >= 1) {
          return prevMsg.speaker;
        }
      }
    }
    
    // Return incrementing speaker IDs for unidentified speakers
    const existingSpeakers = Array.from(detectedSpeakers);
    if (existingSpeakers.length === 0) return 'Speaker 1';
    
    const speakerNumbers = existingSpeakers
      .map(s => s.match(/Speaker (\d+)/))
      .filter(match => match)
      .map(match => parseInt(match![1]));
    
    const lastSpeakerNum = speakerNumbers.length > 0 ? Math.max(...speakerNumbers) : 0;
    
    return `Speaker ${lastSpeakerNum + 1}`;
  };

  const toggleAssistant = () => {
    console.log('Toggling assistant, current state:', isOpen);
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
    
    if (newState) {
      // Reset workflow states for fresh conversation
      setWorkflowState(WORKFLOW_STATES.IDLE);
      setCurrentProject(null);
      setHasSpokenWelcome(false);
      setIsUserSpeaking(false);
      setLastInterimTranscript('');
      
      // Clear any existing timers
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
      
      // Reset NLP engine context for fresh conversation
      nlpEngine.resetContext();
      
      const welcomeMessage = selectedLanguage === 'en' 
        ? 'Hello! I can help you create professional content. What would you like to make today? You can say "video", "audio", or "VFX".'
        : selectedLanguage === 'es'
        ? '¡Hola! Puedo ayudarte a crear contenido profesional. ¿Qué te gustaría hacer hoy? Puedes decir "video", "audio" o "VFX".'
        : selectedLanguage === 'fr'
        ? 'Bonjour! Je peux vous aider à créer du contenu professionnel. Que souhaitez-vous créer aujourd\'hui? Vous pouvez dire "vidéo", "audio" ou "VFX".'
        : 'Hello! I can help you create professional content. What would you like to make today?';
      
      console.log('Setting welcome message:', welcomeMessage);
      setCurrentMessage(welcomeMessage);
      
      // Speak welcome and then start listening
      setTimeout(() => {
        speakMessage(welcomeMessage);
      }, 500);
    } else {
      // Clean up when closing
      stopSpeaking();
      stopListening();
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
      setWorkflowState(WORKFLOW_STATES.IDLE);
      setIsUserSpeaking(false);
    }
  };

  return (
    <>
      {/* Floating Assistant Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-[70]"
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
            className="voice-assistant-panel fixed bottom-24 right-6 w-80 max-h-96 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-[65] overflow-hidden"
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
                  {conversationHistory.slice(-6).map((msg, index) => (
                    <div key={index} className={`text-xs ${msg.type === 'user' ? 'text-cyan-300' : 'text-white/60'}`}>
                      <span className="font-medium">
                        {msg.type === 'user' 
                          ? `${msg.speaker || 'You'}${msg.language && msg.language !== 'en' ? ` (${msg.language.toUpperCase()})` : ''}: `
                          : 'AI: '
                        }
                      </span>
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
                <div className="flex items-center gap-3">
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
                  {detectedSpeakers.size > 1 && (
                    <div className="flex items-center gap-1 text-blue-400">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      {detectedSpeakers.size} Speakers
                    </div>
                  )}
                  {isProcessing && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                      Executing...
                    </div>
                  )}
                </div>
                
                {/* Language & Debug Info */}
                <div className="flex items-center gap-3 text-white/40">
                  <span>Lang: {selectedLanguage.toUpperCase()}</span>
                  {process.env.NODE_ENV === 'development' && (
                    <span>Speech: {synthesis ? '✓' : '✗'} | Rec: {recognition ? '✓' : '✗'}</span>
                  )}
                </div>
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