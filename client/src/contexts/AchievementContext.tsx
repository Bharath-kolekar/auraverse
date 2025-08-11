import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { AchievementPopup, type Achievement } from '@/components/ui/achievement-popup';

interface AchievementContextType {
  showAchievement: (achievement: Achievement) => void;
  hasQueuedAchievements: boolean;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within AchievementProvider');
  }
  return context;
}

interface AchievementProviderProps {
  children: ReactNode;
}

// Custom hook for managing achievement queue
function useAchievementQueue() {
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  const addAchievement = (achievement: Achievement) => {
    setQueue(prev => [...prev, achievement]);
  };

  const clearCurrent = () => {
    setCurrentAchievement(null);
  };

  // Process queue when current achievement is cleared
  useEffect(() => {
    if (!currentAchievement && queue.length > 0) {
      const [next, ...rest] = queue;
      setCurrentAchievement(next);
      setQueue(rest);
    }
  }, [currentAchievement, queue]);

  return {
    currentAchievement,
    addAchievement,
    clearCurrent,
    hasQueue: queue.length > 0
  };
}

export function AchievementProvider({ children }: AchievementProviderProps) {
  const { currentAchievement, addAchievement, clearCurrent, hasQueue } = useAchievementQueue();

  const showAchievement = (achievement: Achievement) => {
    addAchievement(achievement);
  };

  return (
    <AchievementContext.Provider 
      value={{ 
        showAchievement, 
        hasQueuedAchievements: hasQueue 
      }}
    >
      {children}
      <AchievementPopup
        achievement={currentAchievement}
        onClose={clearCurrent}
        autoClose={0}
      />
    </AchievementContext.Provider>
  );
}