import { db } from "../db";
import { achievements, userAchievements, userActivities, users, leaderboard } from "@shared/schema";
import { eq, and, sql, desc, gte } from "drizzle-orm";
import type { User, Achievement, UserAchievement, InsertUserActivity } from "@shared/schema";

// Define achievement definitions
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'id' | 'createdAt'>[] = [
  // Content Creation Achievements
  {
    code: 'first_content',
    name: 'First Creation',
    description: 'Create your first AI-powered content',
    category: 'content',
    icon: 'Trophy',
    rarity: 'common',
    points: 10,
    requirement: { type: 'content_created', count: 1 },
    order: 1
  },
  {
    code: 'content_creator',
    name: 'Content Creator',
    description: 'Create 10 pieces of content',
    category: 'content',
    icon: 'Star',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'content_created', count: 10 },
    order: 2
  },
  {
    code: 'content_master',
    name: 'Content Master',
    description: 'Create 50 pieces of content',
    category: 'content',
    icon: 'Crown',
    rarity: 'epic',
    points: 200,
    requirement: { type: 'content_created', count: 50 },
    order: 3
  },
  {
    code: 'content_legend',
    name: 'Content Legend',
    description: 'Create 100 pieces of content',
    category: 'content',
    icon: 'Zap',
    rarity: 'legendary',
    points: 500,
    requirement: { type: 'content_created', count: 100 },
    order: 4
  },
  
  // Voice Command Achievements
  {
    code: 'voice_explorer',
    name: 'Voice Explorer',
    description: 'Use voice commands 5 times',
    category: 'exploration',
    icon: 'Mic',
    rarity: 'common',
    points: 15,
    requirement: { type: 'voice_command', count: 5 },
    order: 5
  },
  {
    code: 'voice_master',
    name: 'Voice Master',
    description: 'Use voice commands 50 times',
    category: 'exploration',
    icon: 'Radio',
    rarity: 'rare',
    points: 75,
    requirement: { type: 'voice_command', count: 50 },
    order: 6
  },
  
  // Daily Activity Achievements
  {
    code: 'daily_visitor',
    name: 'Daily Visitor',
    description: 'Visit the platform 3 days in a row',
    category: 'social',
    icon: 'Calendar',
    rarity: 'common',
    points: 20,
    requirement: { type: 'daily_streak', count: 3 },
    order: 7
  },
  {
    code: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    category: 'social',
    icon: 'Flame',
    rarity: 'rare',
    points: 100,
    requirement: { type: 'daily_streak', count: 7 },
    order: 8
  },
  {
    code: 'month_master',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    category: 'social',
    icon: 'Award',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'daily_streak', count: 30 },
    order: 9
  },
  
  // Theme Customization Achievements
  {
    code: 'theme_explorer',
    name: 'Theme Explorer',
    description: 'Try 3 different themes',
    category: 'exploration',
    icon: 'Palette',
    rarity: 'common',
    points: 10,
    requirement: { type: 'theme_changed', count: 3 },
    order: 10
  },
  {
    code: 'theme_creator',
    name: 'Theme Creator',
    description: 'Create your first custom theme',
    category: 'exploration',
    icon: 'Brush',
    rarity: 'rare',
    points: 30,
    requirement: { type: 'custom_theme_created', count: 1 },
    order: 11
  },
  
  // Level Achievements
  {
    code: 'level_5',
    name: 'Rising Star',
    description: 'Reach level 5',
    category: 'mastery',
    icon: 'TrendingUp',
    rarity: 'common',
    points: 25,
    requirement: { type: 'level_reached', level: 5 },
    order: 12
  },
  {
    code: 'level_10',
    name: 'Expert Creator',
    description: 'Reach level 10',
    category: 'mastery',
    icon: 'Rocket',
    rarity: 'rare',
    points: 100,
    requirement: { type: 'level_reached', level: 10 },
    order: 13
  },
  {
    code: 'level_25',
    name: 'Master Architect',
    description: 'Reach level 25',
    category: 'mastery',
    icon: 'Diamond',
    rarity: 'epic',
    points: 250,
    requirement: { type: 'level_reached', level: 25 },
    order: 14
  },
  {
    code: 'level_50',
    name: 'Legendary Creator',
    description: 'Reach level 50',
    category: 'mastery',
    icon: 'Gem',
    rarity: 'legendary',
    points: 1000,
    requirement: { type: 'level_reached', level: 50 },
    order: 15
  },
  
  // Feature Usage Achievements
  {
    code: 'ai_enthusiast',
    name: 'AI Enthusiast',
    description: 'Use AI features 20 times',
    category: 'exploration',
    icon: 'Brain',
    rarity: 'common',
    points: 20,
    requirement: { type: 'ai_feature_used', count: 20 },
    order: 16
  },
  {
    code: 'super_intelligence',
    name: 'Super Intelligence User',
    description: 'Use Super Intelligence features 10 times',
    category: 'mastery',
    icon: 'Cpu',
    rarity: 'rare',
    points: 80,
    requirement: { type: 'super_intelligence_used', count: 10 },
    order: 17
  }
];

export class AchievementService {
  private static instance: AchievementService;

  static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }

  // Initialize achievements in database
  async initializeAchievements() {
    try {
      for (const achievement of ACHIEVEMENT_DEFINITIONS) {
        await db
          .insert(achievements)
          .values(achievement as any)
          .onConflictDoNothing();
      }
      console.log('Achievements initialized');
    } catch (error) {
      console.error('Error initializing achievements:', error);
    }
  }

  // Track user activity and check for achievements
  async trackActivity(userId: string, activityType: string, metadata?: any, points: number = 0) {
    try {
      // Record the activity
      await db.insert(userActivities).values({
        userId,
        type: activityType,
        metadata,
        points
      });

      // Update user points
      await this.updateUserPoints(userId, points);

      // Check for new achievements
      const unlockedAchievements = await this.checkAchievements(userId, activityType);
      
      // Update daily streak if it's a login
      if (activityType === 'login') {
        await this.updateStreak(userId);
      }

      // Update leaderboard
      await this.updateLeaderboard(userId, points);

      return unlockedAchievements;
    } catch (error) {
      console.error('Error tracking activity:', error);
      return [];
    }
  }

  // Check if user has unlocked any achievements
  private async checkAchievements(userId: string, activityType: string) {
    try {
      const unlockedAchievements: Achievement[] = [];
      
      // Get all achievements that could be triggered by this activity
      const relevantAchievements = await db
        .select()
        .from(achievements)
        .where(sql`requirement->>'type' = ${activityType}`);

      for (const achievement of relevantAchievements) {
        // Check if already unlocked
        const existing = await db
          .select()
          .from(userAchievements)
          .where(
            and(
              eq(userAchievements.userId, userId),
              eq(userAchievements.achievementId, achievement.id)
            )
          );

        if (existing.length > 0) continue;

        // Check if requirements are met
        const requirement = achievement.requirement as any;
        const isMet = await this.checkRequirement(userId, requirement);

        if (isMet) {
          // Unlock achievement
          await db.insert(userAchievements).values({
            userId,
            achievementId: achievement.id,
            progress: requirement.count || 1,
            maxProgress: requirement.count || 1,
            claimed: false
          });

          // Award points
          await this.updateUserPoints(userId, achievement.points);
          
          unlockedAchievements.push(achievement);
        }
      }

      return unlockedAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  // Check if a specific requirement is met
  private async checkRequirement(userId: string, requirement: any): Promise<boolean> {
    try {
      switch (requirement.type) {
        case 'content_created':
        case 'voice_command':
        case 'theme_changed':
        case 'custom_theme_created':
        case 'ai_feature_used':
        case 'super_intelligence_used': {
          const [result] = await db
            .select({ count: sql<number>`count(*)` })
            .from(userActivities)
            .where(
              and(
                eq(userActivities.userId, userId),
                eq(userActivities.type, requirement.type)
              )
            );
          return (result?.count || 0) >= requirement.count;
        }

        case 'daily_streak': {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId));
          return (user?.streak || 0) >= requirement.count;
        }

        case 'level_reached': {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId));
          return (user?.level || 0) >= requirement.level;
        }

        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking requirement:', error);
      return false;
    }
  }

  // Update user points and level
  private async updateUserPoints(userId: string, points: number) {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user) return;

      const newTotalPoints = (user.totalPoints || 0) + points;
      const newExperience = (user.experience || 0) + points;
      const newLevel = Math.floor(newExperience / 100) + 1; // 100 XP per level

      await db
        .update(users)
        .set({
          totalPoints: newTotalPoints,
          experience: newExperience,
          level: newLevel
        })
        .where(eq(users.id, userId));

      // Check for level achievements
      if (newLevel > (user.level || 1)) {
        await this.checkAchievements(userId, 'level_reached');
      }
    } catch (error) {
      console.error('Error updating user points:', error);
    }
  }

  // Update user streak
  private async updateStreak(userId: string) {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user) return;

      const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let newStreak = 1;
      
      if (lastActive) {
        const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) {
          // Same day, no change
          return;
        } else if (daysDiff === 1) {
          // Consecutive day, increment streak
          newStreak = (user.streak || 0) + 1;
        }
        // If daysDiff > 1, streak resets to 1
      }

      await db
        .update(users)
        .set({
          streak: newStreak,
          lastActiveDate: today
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }

  // Update leaderboard
  private async updateLeaderboard(userId: string, points: number) {
    try {
      const periods = ['daily', 'weekly', 'monthly', 'all-time'];
      
      for (const period of periods) {
        const existing = await db
          .select()
          .from(leaderboard)
          .where(
            and(
              eq(leaderboard.userId, userId),
              eq(leaderboard.period, period)
            )
          );

        if (existing.length > 0) {
          await db
            .update(leaderboard)
            .set({
              points: sql`${leaderboard.points} + ${points}`,
              updatedAt: new Date()
            })
            .where(
              and(
                eq(leaderboard.userId, userId),
                eq(leaderboard.period, period)
              )
            );
        } else {
          await db.insert(leaderboard).values({
            userId,
            period,
            points
          });
        }
      }
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  }

  // Get user achievements
  async getUserAchievements(userId: string) {
    try {
      const userAchievementsList = await db
        .select({
          achievement: achievements,
          userAchievement: userAchievements
        })
        .from(userAchievements)
        .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
        .where(eq(userAchievements.userId, userId));

      return userAchievementsList.map(item => ({
        ...item.achievement,
        unlockedAt: item.userAchievement.unlockedAt,
        progress: item.userAchievement.progress,
        maxProgress: item.userAchievement.maxProgress,
        claimed: item.userAchievement.claimed
      }));
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  // Get all achievements with user progress
  async getAllAchievementsWithProgress(userId: string) {
    try {
      const allAchievements = await db.select().from(achievements);
      const userAchievementsList = await this.getUserAchievements(userId);
      
      const userAchievementMap = new Map(
        userAchievementsList.map(ua => [ua.id, ua])
      );

      return allAchievements.map(achievement => ({
        ...achievement,
        unlocked: userAchievementMap.has(achievement.id),
        unlockedAt: userAchievementMap.get(achievement.id)?.unlockedAt,
        progress: userAchievementMap.get(achievement.id)?.progress || 0,
        maxProgress: userAchievementMap.get(achievement.id)?.maxProgress || 1,
        claimed: userAchievementMap.get(achievement.id)?.claimed || false
      }));
    } catch (error) {
      console.error('Error getting achievements with progress:', error);
      return [];
    }
  }

  // Get leaderboard
  async getLeaderboard(period: string = 'all-time', limit: number = 10) {
    try {
      const leaderboardData = await db
        .select({
          user: users,
          points: leaderboard.points,
          rank: sql<number>`row_number() over (order by ${leaderboard.points} desc)`
        })
        .from(leaderboard)
        .innerJoin(users, eq(leaderboard.userId, users.id))
        .where(eq(leaderboard.period, period))
        .orderBy(desc(leaderboard.points))
        .limit(limit);

      return leaderboardData;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // Get user stats
  async getUserStats(userId: string) {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      const achievementCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));

      const activityCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(userActivities)
        .where(eq(userActivities.userId, userId));

      return {
        level: user?.level || 1,
        experience: user?.experience || 0,
        totalPoints: user?.totalPoints || 0,
        streak: user?.streak || 0,
        achievementCount: achievementCount[0]?.count || 0,
        activityCount: activityCount[0]?.count || 0
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        level: 1,
        experience: 0,
        totalPoints: 0,
        streak: 0,
        achievementCount: 0,
        activityCount: 0
      };
    }
  }
}

export const achievementService = AchievementService.getInstance();