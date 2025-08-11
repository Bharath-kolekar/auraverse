import React, { createContext, useContext, ReactNode } from 'react';
import { AchievementPopup, useAchievementQueue, type Achievement } from '@/components/ui/achievement-popup';

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
        autoClose={5000}
      />
    </AchievementContext.Provider>
  );
}