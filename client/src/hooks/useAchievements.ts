import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAchievements as useAchievementContext } from '@/contexts/AchievementContext';
import { achievementService } from '@/services/achievement-service';

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'milestone' | 'progress' | 'streak' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  maxProgress?: number;
  progress?: number;
  unlocked: boolean;
  unlockedAt?: Date;
  icon?: string;
  order: number;
}

// Utility functions for achievement styling
export function getAchievementRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common': return 'text-gray-600 dark:text-gray-400';
    case 'rare': return 'text-blue-600 dark:text-blue-400';
    case 'epic': return 'text-purple-600 dark:text-purple-400';
    case 'legendary': return 'text-yellow-600 dark:text-yellow-400';
    default: return 'text-gray-600 dark:text-gray-400';
  }
}

export function getAchievementRarityBadgeClass(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    case 'rare': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'epic': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
}

export function calculateExpForNextLevel(experience: number): number {
  const currentLevel = Math.floor(experience / 100) + 1;
  return (currentLevel * 100) - experience;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Custom hooks for fetching achievement data
export function useUserStats() {
  return useQuery({
    queryKey: ['/api/achievements/stats'],
    select: (data: any) => ({
      level: data.level || 1,
      experience: data.experience || 0,
      totalPoints: data.totalPoints || 0,
      streak: data.streak || 0,
      activityCount: data.activityCount || 0,
      achievementCount: data.achievementCount || 0
    })
  });
}

export function useLeaderboard(period: string) {
  return useQuery({
    queryKey: ['/api/achievements/leaderboard', period],
    queryParams: { period, limit: 10 }
  });
}

export function useActivityTracker() {
  useEffect(() => {
    // Track page visits and activity
    const trackActivity = () => {
      fetch('/api/achievements/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'page_visit',
          metadata: { page: window.location.pathname },
          points: 1
        })
      }).catch(() => {});
    };

    trackActivity();
    
    // Track activity every minute
    const interval = setInterval(trackActivity, 60000);
    return () => clearInterval(interval);
  }, []);
}

// Main hook for achievements
export function useAchievements() {
  const { showAchievement, hasQueuedAchievements } = useAchievementContext();
  
  // Fetch achievements data
  const achievementsQuery = useQuery({
    queryKey: ['/api/achievements'],
    select: (data: any[]) => data.map(achievement => ({
      ...achievement,
      unlocked: !!achievement.unlockedAt,
      unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined
    }))
  });

  return {
    achievements: achievementsQuery.data || [],
    isLoading: achievementsQuery.isLoading,
    hasQueuedAchievements
  };
}

// Original hook for tracking activities
export function useAchievementTracking() {
  const { showAchievement, hasQueuedAchievements } = useAchievementContext();

  useEffect(() => {
    // Initialize achievement service with the context callback
    achievementService.onAchievementUnlocked(showAchievement);
    
    // Track user login
    achievementService.trackLogin();
    
    // Check for seasonal achievements
    achievementService.checkSeasonalAchievements();
  }, [showAchievement]);

  const trackContentGeneration = (type: string, quality?: number) => {
    achievementService.trackContentGeneration(type, quality);
    achievementService.maybeGrantSurpriseAchievement();
  };

  const trackAdvancedFeature = (feature: string) => {
    achievementService.trackAdvancedFeature(feature);
  };

  const trackSpeedRecord = (timeMs: number) => {
    achievementService.trackSpeedRecord(timeMs);
  };

  const trackExperiment = () => {
    achievementService.trackExperiment();
  };

  const trackCollaboration = () => {
    achievementService.trackCollaboration();
  };

  const getStats = () => {
    return achievementService.getStats();
  };

  return {
    trackContentGeneration,
    trackAdvancedFeature,
    trackSpeedRecord,
    trackExperiment,
    trackCollaboration,
    getStats,
    hasQueuedAchievements
  };
}