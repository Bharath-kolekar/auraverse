import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Crown, Medal, Sparkles, Target, Brain, Mic, MicOff, Share2, X, MessageCircle, Download, Image } from 'lucide-react';
import { FaLinkedin, FaTwitter, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AchievementVisual, generateShareableImage } from './achievement-visual';

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
    // LinkedIn - plain text without emojis for better compatibility
    const achievementText = `Achievement Unlocked: ${achievement?.title}!\n\n${achievement?.description}\n\nRarity: ${achievement?.rarity?.toUpperCase()}\nCredits Earned: ${achievement?.credits || 0}\n\n#Achievement #InfiniteIntelligence #AI\n\nPlatform: ${window.location.href}`;
    navigator.clipboard.writeText(achievementText);
    const shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(achievementText)}`;
    window.open(shareUrl, '_blank');
    toast({ 
      title: "Opening LinkedIn", 
      description: "Achievement text copied to clipboard. Paste it in the LinkedIn post!" 
    });
  };

  const shareOnTwitter = () => {
    const achievementText = `Just unlocked "${achievement?.title}" achievement!\n\n${achievement?.description}\n\nRarity: ${achievement?.rarity?.toUpperCase()}\nCredits: +${achievement?.credits || 0}\n\n#Achievement #InfiniteIntelligence #AI #ContentCreation`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(achievementText)}`;
    window.open(shareUrl, '_blank');
    toast({ title: "Shared on Twitter!" });
  };

  const shareOnFacebook = () => {
    const achievementText = `Achievement Unlocked: ${achievement?.title}!\n\n${achievement?.description}\n\nRarity: ${achievement?.rarity?.toUpperCase()}\nCredits Earned: ${achievement?.credits || 0}`;
    navigator.clipboard.writeText(achievementText);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(achievementText)}&hashtag=%23Achievement`;
    window.open(shareUrl, '_blank');
    toast({ 
      title: "Opening Facebook", 
      description: "Achievement text copied. It will appear with your post!" 
    });
  };

  const shareOnWhatsApp = () => {
    const achievementText = `*Achievement Unlocked!*\n\n*${achievement?.title}*\n${achievement?.description}\n\nRarity: ${achievement?.rarity?.toUpperCase()}\nCredits: +${achievement?.credits || 0}\n\nCheck out Infinite Intelligence AI Platform!`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(achievementText + '\n\n' + window.location.href)}`;
    window.open(shareUrl, '_blank');
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
            
            {/* Enhanced Visual Achievement Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <AchievementVisual
                title={achievement.title}
                description={achievement.description}
                rarity={achievement.rarity}
                credits={achievement.credits}
                className="w-full"
              />
            </motion.div>
            

            

            
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
                <div className="mt-2 text-xs opacity-75">Note: Social platforms may show site preview, but your achievement text will be in the post</div>
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
              
              {/* Visual Download Option */}
              <Button
                onClick={async () => {
                  try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;

                    // Create high-quality achievement card
                    canvas.width = 800;
                    canvas.height = 600;
                    
                    // Background gradient
                    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                    const colors = {
                      common: ['#4B5563', '#6B7280'],
                      rare: ['#2563EB', '#3B82F6'],
                      epic: ['#7C3AED', '#9333EA'],
                      legendary: ['#D97706', '#DC2626']
                    };
                    const [color1, color2] = colors[achievement?.rarity || 'common'];
                    gradient.addColorStop(0, color1);
                    gradient.addColorStop(1, color2);
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // White card background
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                    ctx.roundRect(50, 50, 700, 500, 20);
                    ctx.fill();
                    
                    // Title
                    ctx.fillStyle = '#111827';
                    ctx.font = 'bold 48px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(achievement?.title || '', 400, 150);
                    
                    // Rarity badge
                    ctx.fillStyle = color1;
                    ctx.font = 'bold 24px sans-serif';
                    ctx.fillText(achievement?.rarity?.toUpperCase() || '', 400, 200);
                    
                    // Description
                    ctx.fillStyle = '#4B5563';
                    ctx.font = '28px sans-serif';
                    const lines = achievement?.description?.match(/.{1,40}/g) || [];
                    lines.forEach((line, i) => {
                      ctx.fillText(line, 400, 280 + i * 40);
                    });
                    
                    // Credits
                    if (achievement?.credits) {
                      ctx.fillStyle = '#10B981';
                      ctx.font = 'bold 36px sans-serif';
                      ctx.fillText(`+${achievement.credits} Credits`, 400, 450);
                    }
                    
                    // Branding
                    ctx.fillStyle = '#9CA3AF';
                    ctx.font = '20px sans-serif';
                    ctx.fillText('Infinite Intelligence AI', 400, 520);
                    
                    // Download the image
                    canvas.toBlob((blob) => {
                      if (blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `achievement-${achievement?.title?.replace(/\s+/g, '-').toLowerCase()}.png`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast({ 
                          title: "Achievement downloaded!", 
                          description: "Share your achievement image on social media!"
                        });
                      }
                    });
                  } catch (error) {
                    toast({ 
                      title: "Download failed", 
                      description: "Could not generate achievement image",
                      variant: "destructive"
                    });
                  }
                }}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Achievement Image
              </Button>
              
              {/* Copy to Clipboard Option */}
              <Button
                onClick={() => {
                  const text = `Achievement Unlocked: ${achievement?.title}!\n\n${achievement?.description}\n\nRarity: ${achievement?.rarity?.toUpperCase()}\nCredits: +${achievement?.credits || 0}\n\n#InfiniteIntelligence #Achievement #AI`;
                  navigator.clipboard.writeText(text);
                  toast({ 
                    title: "Copied to clipboard!", 
                    description: "Achievement details copied. You can paste it anywhere."
                  });
                }}
                variant="outline"
                className="w-full"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Copy Achievement Text
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