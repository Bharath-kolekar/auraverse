import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Crown, Medal, Sparkles, Target, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  autoClose?: number; // milliseconds
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

export function AchievementPopup({ achievement, onClose, autoClose = 5000 }: AchievementPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      
      if (autoClose > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300); // Wait for exit animation
        }, autoClose);
        
        return () => clearTimeout(timer);
      }
    }
  }, [achievement, autoClose, onClose]);

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
            
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex gap-3 justify-center"
            >
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="px-6 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 font-medium"
              >
                Continue
              </button>
              
              <button
                onClick={() => {
                  // Share achievement logic could go here
                  navigator.clipboard?.writeText(`I just earned "${achievement.title}" in Infinite Intelligence! 🎉`);
                }}
                className={cn(
                  "px-6 py-2 text-white rounded-lg font-medium",
                  "bg-gradient-to-r shadow-lg hover:shadow-xl",
                  "transition-all duration-200 transform hover:scale-105",
                  gradientClass
                )}
              >
                Share
              </button>
            </motion.div>
            
            {/* Auto-close indicator */}
            {autoClose > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
              >
                <div className="text-xs text-gray-400 text-center">
                  Auto-closing in {Math.ceil(autoClose / 1000)}s
                </div>
                <motion.div
                  className="h-1 bg-gradient-to-r from-gray-200 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-full mt-1"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: autoClose / 1000, ease: "linear" }}
                />
              </motion.div>
            )}
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