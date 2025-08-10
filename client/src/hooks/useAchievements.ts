import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

// Achievement types
export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  rarity: string;
  points: number;
  requirement: any;
  order: number;
  unlocked?: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  claimed?: boolean;
}

export interface UserStats {
  level: number;
  experience: number;
  totalPoints: number;
  streak: number;
  achievementCount: number;
  activityCount: number;
}

export interface LeaderboardEntry {
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  points: number;
  rank: number;
}

export function useAchievements() {
  const { data: achievements, isLoading } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
  });

  return { achievements, isLoading };
}

export function useUserAchievements() {
  const { data: userAchievements, isLoading } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements/user'],
  });

  return { userAchievements, isLoading };
}

export function useUserStats() {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ['/api/achievements/stats'],
  });

  return { stats, isLoading };
}

export function useLeaderboard(period: string = 'all-time', limit: number = 10) {
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/achievements/leaderboard', period, limit],
    queryFn: async () => {
      const response = await fetch(`/api/achievements/leaderboard?period=${period}&limit=${limit}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json();
    },
  });

  return { leaderboard, isLoading };
}

export function useTrackActivity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (activity: { type: string; metadata?: any; points?: number }) => {
      return apiRequest('/api/achievements/track', 'POST', activity);
    },
    onSuccess: (data: any) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/achievements/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/achievements/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/achievements/leaderboard'] });

      // Show notifications for unlocked achievements
      if (data?.unlockedAchievements && data.unlockedAchievements.length > 0) {
        data.unlockedAchievements.forEach((achievement: Achievement) => {
          toast({
            title: "🎉 Achievement Unlocked!",
            description: `${achievement.name}: ${achievement.description}`,
            className: `achievement-toast achievement-${achievement.rarity}`,
            duration: 5000,
          });
        });
      }
    },
    onError: (error) => {
      console.error('Error tracking activity:', error);
    },
  });

  return mutation.mutate;
}

// Auto-track page visits and interactions
export function useActivityTracker() {
  const trackActivity = useTrackActivity();

  useEffect(() => {
    // Track login/visit on mount
    trackActivity({ type: 'login', points: 5 });

    // Track theme changes
    const handleThemeChange = () => {
      trackActivity({ type: 'theme_changed', points: 2 });
    };

    window.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, [trackActivity]);
}

// Get achievement icon based on rarity
export function getAchievementRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-500 dark:text-gray-400';
    case 'rare':
      return 'text-blue-500 dark:text-blue-400';
    case 'epic':
      return 'text-purple-500 dark:text-purple-400';
    case 'legendary':
      return 'text-yellow-500 dark:text-yellow-400';
    default:
      return 'text-gray-500 dark:text-gray-400';
  }
}

// Get achievement rarity badge styles
export function getAchievementRarityBadgeClass(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    case 'rare':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
    case 'epic':
      return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
    case 'legendary':
      return 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 text-yellow-700 dark:text-yellow-300 font-bold';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  }
}

// Calculate experience needed for next level
export function calculateExpForNextLevel(currentExp: number): number {
  const currentLevel = Math.floor(currentExp / 100) + 1;
  const nextLevelExp = currentLevel * 100;
  return nextLevelExp - currentExp;
}

// Format numbers with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}