import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'milestone' | 'streak' | 'quality' | 'exploration' | 'mastery' | 'speed';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  credits?: number;
  unlockedAt: Date;
  category?: string;
}

// In-memory storage for achievements (would use database in production)
const userAchievements = new Map<string, Achievement[]>();
const achievementStats = new Map<string, any>();

export function registerAchievementRoutes(app: Express) {
  // Unlock an achievement
  app.post("/api/achievements/unlock", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const achievement: Achievement = req.body;
      
      // Validate achievement data
      if (!achievement.id || !achievement.title || !achievement.type || !achievement.rarity) {
        return res.status(400).json({ error: "Invalid achievement data" });
      }

      // Get user's achievements or initialize empty array
      const userAchievementList = userAchievements.get(userId) || [];
      
      // Check if achievement already exists
      const existingAchievement = userAchievementList.find(a => a.id === achievement.id);
      if (existingAchievement) {
        return res.status(200).json({ 
          message: "Achievement already unlocked",
          achievement: existingAchievement 
        });
      }

      // Add achievement
      achievement.unlockedAt = new Date();
      userAchievementList.push(achievement);
      userAchievements.set(userId, userAchievementList);

      console.log(`🏆 Achievement unlocked for ${userId}: ${achievement.title}`);

      res.json({ 
        success: true, 
        achievement,
        message: "Achievement unlocked successfully!" 
      });
    } catch (error) {
      console.error("Error unlocking achievement:", error);
      res.status(500).json({ error: "Failed to unlock achievement" });
    }
  });

  // Get user's achievements
  app.get("/api/achievements", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const achievements = userAchievements.get(userId) || [];
      const stats = getAchievementStats(achievements);

      res.json({
        success: true,
        achievements,
        stats
      });
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  // Get achievement leaderboard
  app.get("/api/achievements/leaderboard", async (req, res) => {
    try {
      const leaderboard = Array.from(userAchievements.entries())
        .map(([userId, achievements]) => ({
          userId: userId.substring(0, 8) + "...", // Anonymize user IDs
          totalAchievements: achievements.length,
          totalCredits: achievements.reduce((sum, a) => sum + (a.credits || 0), 0),
          rareAchievements: achievements.filter(a => a.rarity === 'rare' || a.rarity === 'epic' || a.rarity === 'legendary').length,
          latestAchievement: achievements.sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())[0]?.title
        }))
        .sort((a, b) => b.totalCredits - a.totalCredits)
        .slice(0, 10);

      res.json({
        success: true,
        leaderboard
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Update user stats (for achievement tracking)
  app.post("/api/achievements/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const stats = req.body;
      achievementStats.set(userId, { ...achievementStats.get(userId), ...stats });

      res.json({ success: true, message: "Stats updated" });
    } catch (error) {
      console.error("Error updating stats:", error);
      res.status(500).json({ error: "Failed to update stats" });
    }
  });

  // Get available achievement categories
  app.get("/api/achievements/categories", async (req, res) => {
    try {
      const categories = [
        {
          id: 'generation',
          name: 'Content Generation',
          description: 'Achievements for creating AI content',
          icon: 'Zap'
        },
        {
          id: 'quality',
          name: 'Quality Master',
          description: 'High-quality generation achievements',
          icon: 'Crown'
        },
        {
          id: 'engagement',
          name: 'Engagement',
          description: 'Daily usage and streak achievements',
          icon: 'Star'
        },
        {
          id: 'exploration',
          name: 'Explorer',
          description: 'Feature discovery achievements',
          icon: 'Target'
        },
        {
          id: 'mastery',
          name: 'Mastery',
          description: 'Advanced feature usage',
          icon: 'Medal'
        },
        {
          id: 'performance',
          name: 'Performance',
          description: 'Speed and efficiency achievements',
          icon: 'Zap'
        },
        {
          id: 'social',
          name: 'Social',
          description: 'Collaboration achievements',
          icon: 'Users'
        },
        {
          id: 'seasonal',
          name: 'Seasonal',
          description: 'Special time-limited achievements',
          icon: 'Calendar'
        },
        {
          id: 'surprise',
          name: 'Surprise',
          description: 'Random lucky achievements',
          icon: 'Gift'
        }
      ];

      res.json({
        success: true,
        categories
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
}

function getAchievementStats(achievements: Achievement[]) {
  const stats = {
    total: achievements.length,
    common: achievements.filter(a => a.rarity === 'common').length,
    rare: achievements.filter(a => a.rarity === 'rare').length,
    epic: achievements.filter(a => a.rarity === 'epic').length,
    legendary: achievements.filter(a => a.rarity === 'legendary').length,
    totalCredits: achievements.reduce((sum, a) => sum + (a.credits || 0), 0),
    categories: {} as Record<string, number>
  };

  // Count by category
  achievements.forEach(achievement => {
    if (achievement.category) {
      stats.categories[achievement.category] = (stats.categories[achievement.category] || 0) + 1;
    }
  });

  return stats;
}