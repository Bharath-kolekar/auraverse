import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Crown, Medal, Sparkles, Target, Brain, Mic, MicOff, Share2, X, MessageCircle } from 'lucide-react';
import { FaLinkedin, FaTwitter, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'milestone' | 'streak' | 'quality' | 'exploration' | 'mastery' | 'speed';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon?: string;
  credits?: number;
  unlockedAt: Date;
  category?: string;
}

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
  autoClose?: number; // milliseconds - default 0 (no auto-close)
}

const achievementIcons = {
  milestone: Trophy,
  streak: Star,
  quality: Crown,
  exploration: Target,
  mastery: Medal,
  speed: Zap
};

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600', 
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500'
};

const rarityGlow = {
  common: 'shadow-gray-400/20',
  rare: 'shadow-blue-400/30',
  epic: 'shadow-purple-400/40', 
  legendary: 'shadow-yellow-400/50'
};

const ParticleEffect = ({ rarity }: { rarity: Achievement['rarity'] }) => {
  const particleCount = rarity === 'legendary' ? 20 : rarity === 'epic' ? 15 : rarity === 'rare' ? 10 : 5;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            "absolute w-1 h-1 rounded-full",
            rarity === 'legendary' ? 'bg-yellow-400' :
            rarity === 'epic' ? 'bg-purple-400' :
            rarity === 'rare' ? 'bg-blue-400' : 'bg-gray-400'
          )}
          initial={{
            x: '50%',
            y: '50%',
            scale: 0,
            opacity: 1
          }}
          animate={{
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200,
            scale: [0, 1, 0],
            opacity: [1, 0.8, 0]
          }}
          transition={{
            duration: 2,
            delay: Math.random() * 0.5,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

const PulseRing = ({ rarity }: { rarity: Achievement['rarity'] }) => (
  <motion.div
    className={cn(
      "absolute inset-0 rounded-full border-2 opacity-20",
      rarity === 'legendary' ? 'border-yellow-400' :
      rarity === 'epic' ? 'border-purple-400' :
      rarity === 'rare' ? 'border-blue-400' : 'border-gray-400'
    )}
    initial={{ scale: 1, opacity: 0.5 }}
    animate={{ 
      scale: [1, 1.5, 2], 
      opacity: [0.5, 0.2, 0] 
    }}
    transition={{ 
      duration: 2, 
      repeat: Infinity, 
      ease: "easeOut" 
    }}
  />
);

export function AchievementPopup({ achievement, onClose, autoClose = 0 }: AchievementPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Initialize voice recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setVoiceCommand(transcript);
        
        // Process voice commands
        if (transcript.includes('close') || transcript.includes('dismiss')) {
          handleClose();
        } else if (transcript.includes('share')) {
          if (transcript.includes('linkedin')) {
            shareOnLinkedIn();
          } else if (transcript.includes('twitter') || transcript.includes('x')) {
            shareOnTwitter();
          } else if (transcript.includes('facebook')) {
            shareOnFacebook();
          } else if (transcript.includes('whatsapp')) {
            shareOnWhatsApp();
          } else {
            setShowShareMenu(true);
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      
      if (autoClose > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoClose);
        
        return () => clearTimeout(timer);
      }
    }
  }, [achievement, autoClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Commands Unavailable",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Say 'close' to dismiss or 'share on [platform]' to share.",
      });
    }
  };

  const shareOnLinkedIn = () => {
    const text = `🏆 Achievement Unlocked: ${achievement?.title}! ${achievement?.description}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(text)}`, '_blank');
    toast({ title: "Shared on LinkedIn!" });
  };

  const shareOnTwitter = () => {
    const text = `🏆 Just unlocked "${achievement?.title}" achievement! ${achievement?.description} #Achievement #Gaming`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
    toast({ title: "Shared on Twitter!" });
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
    toast({ title: "Shared on Facebook!" });
  };

  const shareOnWhatsApp = () => {
    const text = `🏆 Achievement Unlocked: ${achievement?.title}! ${achievement?.description}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + window.location.href)}`, '_blank');
    toast({ title: "Shared on WhatsApp!" });
  };

  if (!achievement) return null;

  const IconComponent = achievementIcons[achievement.type] || Trophy;
  const gradientClass = rarityColors[achievement.rarity];
  const glowClass = rarityGlow[achievement.rarity];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Achievement Card */}
          <motion.div
            className={cn(
              "relative bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4",
              "border-2 border-transparent shadow-2xl",
              glowClass
            )}
            initial={{ 
              scale: 0.5, 
              y: 50, 
              opacity: 0,
              rotateY: -180 
            }}
            animate={{ 
              scale: 1, 
              y: 0, 
              opacity: 1,
              rotateY: 0 
            }}
            exit={{ 
              scale: 0.8, 
              y: -20, 
              opacity: 0 
            }}
            transition={{ 
              type: "spring", 
              damping: 15, 
              stiffness: 300,
              duration: 0.6 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Particle Effects */}
            <ParticleEffect rarity={achievement.rarity} />
            
            {/* Header with sparkles */}
            <div className="text-center mb-6 relative">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", damping: 10 }}
                className="inline-block relative"
              >
                {/* Icon background with gradient */}
                <div className={cn(
                  "relative w-20 h-20 mx-auto mb-4 rounded-full",
                  "bg-gradient-to-br", gradientClass,
                  "flex items-center justify-center",
                  "shadow-lg", glowClass
                )}>
                  <PulseRing rarity={achievement.rarity} />
                  <IconComponent className="w-10 h-10 text-white drop-shadow-lg" />
                  
                  {/* Sparkle effects for legendary */}
                  {achievement.rarity === 'legendary' && (
                    <>
                      <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse" />
                      <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-yellow-300 animate-pulse delay-500" />
                    </>
                  )}
                </div>
              </motion.div>
              
              {/* Achievement Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={cn(
                  "text-2xl font-bold mb-2",
                  "bg-gradient-to-r bg-clip-text text-transparent",
                  gradientClass
                )}
              >
                {achievement.title}
              </motion.h2>
              
              {/* Rarity Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className={cn(
                  "inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide",
                  "bg-gradient-to-r text-white shadow-sm",
                  gradientClass
                )}
              >
                {achievement.rarity}
              </motion.div>
            </div>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center text-gray-600 dark:text-gray-300 mb-6 leading-relaxed"
            >
              {achievement.description}
            </motion.p>
            
            {/* Rewards Section */}
            {achievement.credits && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center mb-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full">
                  <Brain className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300 font-semibold">
                    +{achievement.credits} Credits
                  </span>
                </div>
              </motion.div>
            )}
            
            {/* Voice Command Guide */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Voice Commands Available
                </span>
                <Button
                  size="sm"
                  variant={isListening ? "destructive" : "outline"}
                  onClick={toggleVoiceRecognition}
                  className="h-8 px-3"
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-1" />
                      Start
                    </>
                  )}
                </Button>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>• Say <span className="font-semibold">"close"</span> or <span className="font-semibold">"dismiss"</span> to close</div>
                <div>• Say <span className="font-semibold">"share on LinkedIn"</span> to share on LinkedIn</div>
                <div>• Say <span className="font-semibold">"share on Twitter"</span> to share on Twitter</div>
                <div>• Say <span className="font-semibold">"share"</span> to see all sharing options</div>
              </div>
              {voiceCommand && (
                <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Heard: </span>
                  <span className="font-medium">{voiceCommand}</span>
                </div>
              )}
            </motion.div>

            {/* Social Sharing Section */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              {/* Share Toggle Button */}
              <Button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className={cn(
                  "w-full py-2 text-white rounded-lg font-medium",
                  "bg-gradient-to-r shadow-lg hover:shadow-xl",
                  "transition-all duration-200 transform hover:scale-105",
                  gradientClass
                )}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Achievement
              </Button>

              {/* Social Media Buttons */}
              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-4 gap-2"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={shareOnLinkedIn}
                      className="flex flex-col items-center p-2 h-auto"
                      title="Share on LinkedIn"
                    >
                      <FaLinkedin className="w-5 h-5 text-blue-600" />
                      <span className="text-xs mt-1">LinkedIn</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={shareOnTwitter}
                      className="flex flex-col items-center p-2 h-auto"
                      title="Share on Twitter"
                    >
                      <FaTwitter className="w-5 h-5 text-sky-500" />
                      <span className="text-xs mt-1">Twitter</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={shareOnFacebook}
                      className="flex flex-col items-center p-2 h-auto"
                      title="Share on Facebook"
                    >
                      <FaFacebook className="w-5 h-5 text-blue-700" />
                      <span className="text-xs mt-1">Facebook</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={shareOnWhatsApp}
                      className="flex flex-col items-center p-2 h-auto"
                      title="Share on WhatsApp"
                    >
                      <FaWhatsapp className="w-5 h-5 text-green-600" />
                      <span className="text-xs mt-1">WhatsApp</span>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Close Button */}
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </motion.div>

            {/* No auto-close - popup stays open until user interaction */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing achievement queue
export function useAchievementQueue() {
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [current, setCurrent] = useState<Achievement | null>(null);

  const addAchievement = (achievement: Achievement) => {
    setQueue(prev => [...prev, achievement]);
  };

  const showNext = () => {
    if (queue.length > 0 && !current) {
      const [next, ...rest] = queue;
      setCurrent(next);
      setQueue(rest);
    }
  };

  const clearCurrent = () => {
    setCurrent(null);
    // Show next achievement after a brief delay
    setTimeout(showNext, 500);
  };

  useEffect(() => {
    showNext();
  }, [queue, current]);

  return {
    currentAchievement: current,
    addAchievement,
    clearCurrent,
    hasQueue: queue.length > 0
  };
}