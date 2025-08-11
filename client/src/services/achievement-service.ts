import { type Achievement } from '@/components/ui/achievement-popup';

export class AchievementService {
  private static instance: AchievementService;
  private achievementCallbacks: ((achievement: Achievement) => void)[] = [];
  private userStats = {
    totalGenerations: 0,
    consecutiveDays: 0,
    creditsEarned: 0,
    featuresUsed: new Set<string>(),
    qualityScores: [] as number[],
    lastVisit: new Date(),
    joinDate: new Date(),
    streakDays: 0,
    perfectDays: 0,
    experimentsRun: 0,
    advancedFeaturesUsed: 0,
    speedRecords: [] as number[],
    collaborations: 0
  };

  static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }

  onAchievementUnlocked(callback: (achievement: Achievement) => void) {
    this.achievementCallbacks.push(callback);
  }

  private triggerAchievement(achievement: Achievement) {
    this.achievementCallbacks.forEach(callback => callback(achievement));
    
    // Send to backend for persistence
    this.sendAchievementToServer(achievement);
  }

  private async sendAchievementToServer(achievement: Achievement) {
    try {
      await fetch('/api/achievements/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(achievement)
      });
    } catch (error) {
      console.log('Achievement logged locally:', achievement.title);
    }
  }

  // Track various user actions
  trackContentGeneration(type: string, quality?: number) {
    this.userStats.totalGenerations++;
    this.userStats.featuresUsed.add(type);
    
    if (quality) {
      this.userStats.qualityScores.push(quality);
    }

    this.checkGenerationMilestones();
    this.checkQualityAchievements(quality);
    this.checkExplorationAchievements();
  }

  trackLogin() {
    const now = new Date();
    const lastVisit = this.userStats.lastVisit;
    const daysDiff = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      this.userStats.streakDays++;
      this.userStats.consecutiveDays++;
    } else if (daysDiff > 1) {
      this.userStats.streakDays = 1;
      this.userStats.consecutiveDays = 1;
    }
    
    this.userStats.lastVisit = now;
    this.checkStreakAchievements();
  }

  trackSpeedRecord(timeMs: number) {
    this.userStats.speedRecords.push(timeMs);
    this.checkSpeedAchievements(timeMs);
  }

  trackAdvancedFeature(feature: string) {
    this.userStats.advancedFeaturesUsed++;
    this.checkMasteryAchievements();
  }

  trackExperiment() {
    this.userStats.experimentsRun++;
    this.checkExplorationAchievements();
  }

  trackCollaboration() {
    this.userStats.collaborations++;
    this.checkSocialAchievements();
  }

  private checkGenerationMilestones() {
    const milestones = [
      { count: 1, title: 'First Creation', desc: 'Generated your first AI content!', rarity: 'common' as const },
      { count: 10, title: 'Getting Started', desc: 'Created 10 AI generations', rarity: 'common' as const },
      { count: 50, title: 'Content Creator', desc: 'Reached 50 successful generations', rarity: 'rare' as const },
      { count: 100, title: 'Prolific Creator', desc: '100 AI generations completed', rarity: 'rare' as const },
      { count: 500, title: 'AI Master', desc: 'Achieved 500 generations milestone', rarity: 'epic' as const },
      { count: 1000, title: 'Legend Creator', desc: '1000 AI generations - You are unstoppable!', rarity: 'legendary' as const }
    ];

    const milestone = milestones.find(m => m.count === this.userStats.totalGenerations);
    if (milestone) {
      this.triggerAchievement({
        id: `generation_${milestone.count}`,
        title: milestone.title,
        description: milestone.desc,
        type: 'milestone',
        rarity: milestone.rarity,
        credits: milestone.count >= 100 ? milestone.count / 10 : 5,
        unlockedAt: new Date(),
        category: 'generation'
      });
    }
  }

  private checkQualityAchievements(quality?: number) {
    if (!quality) return;

    if (quality >= 0.95) {
      this.triggerAchievement({
        id: 'perfectionist',
        title: 'Perfectionist',
        description: 'Achieved 95%+ quality score on a generation',
        type: 'quality',
        rarity: 'epic',
        credits: 25,
        unlockedAt: new Date(),
        category: 'quality'
      });
    }

    const recentScores = this.userStats.qualityScores.slice(-5);
    if (recentScores.length === 5 && recentScores.every(score => score >= 0.9)) {
      this.triggerAchievement({
        id: 'consistency_master',
        title: 'Consistency Master',
        description: 'Maintained 90%+ quality for 5 consecutive generations',
        type: 'quality',
        rarity: 'legendary',
        credits: 50,
        unlockedAt: new Date(),
        category: 'quality'
      });
    }
  }

  private checkStreakAchievements() {
    const streakMilestones = [
      { days: 3, title: 'Getting Into Rhythm', desc: '3-day streak!', rarity: 'common' as const },
      { days: 7, title: 'Week Warrior', desc: 'Used the platform for 7 days straight', rarity: 'rare' as const },
      { days: 30, title: 'Monthly Master', desc: '30-day streak achieved!', rarity: 'epic' as const },
      { days: 100, title: 'Dedication Deity', desc: '100 days of continuous usage!', rarity: 'legendary' as const }
    ];

    const milestone = streakMilestones.find(m => m.days === this.userStats.streakDays);
    if (milestone) {
      this.triggerAchievement({
        id: `streak_${milestone.days}`,
        title: milestone.title,
        description: milestone.desc,
        type: 'streak',
        rarity: milestone.rarity,
        credits: milestone.days * 2,
        unlockedAt: new Date(),
        category: 'engagement'
      });
    }
  }

  private checkExplorationAchievements() {
    const featureCount = this.userStats.featuresUsed.size;
    
    const explorationMilestones = [
      { count: 3, title: 'Explorer', desc: 'Tried 3 different AI features', rarity: 'common' as const },
      { count: 5, title: 'Feature Hunter', desc: 'Explored 5 different capabilities', rarity: 'rare' as const },
      { count: 10, title: 'Platform Master', desc: 'Used 10+ different AI features', rarity: 'epic' as const }
    ];

    const milestone = explorationMilestones.find(m => m.count === featureCount);
    if (milestone) {
      this.triggerAchievement({
        id: `exploration_${milestone.count}`,
        title: milestone.title,
        description: milestone.desc,
        type: 'exploration',
        rarity: milestone.rarity,
        credits: milestone.count * 3,
        unlockedAt: new Date(),
        category: 'exploration'
      });
    }

    // Experiments milestone
    if (this.userStats.experimentsRun === 25) {
      this.triggerAchievement({
        id: 'mad_scientist',
        title: 'Mad Scientist',
        description: 'Ran 25 experimental AI features',
        type: 'exploration',
        rarity: 'epic',
        credits: 40,
        unlockedAt: new Date(),
        category: 'innovation'
      });
    }
  }

  private checkMasteryAchievements() {
    if (this.userStats.advancedFeaturesUsed === 10) {
      this.triggerAchievement({
        id: 'advanced_user',
        title: 'Advanced User',
        description: 'Mastered advanced AI capabilities',
        type: 'mastery',
        rarity: 'epic',
        credits: 35,
        unlockedAt: new Date(),
        category: 'mastery'
      });
    }
  }

  private checkSpeedAchievements(timeMs: number) {
    // Fast generation (under 2 seconds)
    if (timeMs < 2000) {
      this.triggerAchievement({
        id: 'speed_demon',
        title: 'Speed Demon',
        description: 'Generated content in under 2 seconds!',
        type: 'speed',
        rarity: 'rare',
        credits: 15,
        unlockedAt: new Date(),
        category: 'performance'
      });
    }

    // Lightning fast (under 1 second)
    if (timeMs < 1000) {
      this.triggerAchievement({
        id: 'lightning_fast',
        title: 'Lightning Fast',
        description: 'Sub-second AI generation achieved!',
        type: 'speed',
        rarity: 'legendary',
        credits: 50,
        unlockedAt: new Date(),
        category: 'performance'
      });
    }
  }

  private checkSocialAchievements() {
    if (this.userStats.collaborations === 5) {
      this.triggerAchievement({
        id: 'team_player',
        title: 'Team Player',
        description: 'Collaborated on 5 projects',
        type: 'milestone',
        rarity: 'rare',
        credits: 20,
        unlockedAt: new Date(),
        category: 'social'
      });
    }
  }

  // Seasonal and special achievements
  checkSeasonalAchievements() {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // New Year achievement
    if (dayOfYear <= 7 && this.userStats.totalGenerations > 0) {
      this.triggerAchievement({
        id: 'new_year_creator',
        title: 'New Year Creator',
        description: 'Started the year with AI creativity!',
        type: 'milestone',
        rarity: 'rare',
        credits: 25,
        unlockedAt: new Date(),
        category: 'seasonal'
      });
    }
  }

  // Random surprise achievements
  maybeGrantSurpriseAchievement() {
    // 1% chance per generation
    if (Math.random() < 0.01) {
      const surprises = [
        { title: 'Lucky Break', desc: 'Sometimes the stars align just right!', credits: 20 },
        { title: 'Serendipity', desc: 'A delightful surprise from the AI gods', credits: 15 },
        { title: 'Cosmic Luck', desc: 'The universe smiled upon you today', credits: 30 }
      ];
      
      const surprise = surprises[Math.floor(Math.random() * surprises.length)];
      this.triggerAchievement({
        id: `surprise_${Date.now()}`,
        title: surprise.title,
        description: surprise.desc,
        type: 'milestone',
        rarity: 'rare',
        credits: surprise.credits,
        unlockedAt: new Date(),
        category: 'surprise'
      });
    }
  }

  // Get user achievement stats
  getStats() {
    return {
      ...this.userStats,
      featuresUsedCount: this.userStats.featuresUsed.size,
      averageQuality: this.userStats.qualityScores.length > 0 
        ? this.userStats.qualityScores.reduce((a, b) => a + b, 0) / this.userStats.qualityScores.length 
        : 0,
      bestSpeed: this.userStats.speedRecords.length > 0 
        ? Math.min(...this.userStats.speedRecords) 
        : null
    };
  }
}

export const achievementService = AchievementService.getInstance();