import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAchievementTracking } from '@/hooks/useAchievements';
import { Trophy, Star, Crown, Target, Medal, Zap, Gift } from 'lucide-react';

export default function AchievementDemo() {
  const { trackContentGeneration, trackAdvancedFeature, trackSpeedRecord, trackExperiment, getStats } = useAchievementTracking();

  const demoAchievements = [
    {
      title: "Generate First Content",
      description: "Create your first AI content",
      action: () => trackContentGeneration("text", 0.85),
      icon: Trophy,
      color: "bg-blue-500"
    },
    {
      title: "High Quality Generation",
      description: "Achieve 95%+ quality score",
      action: () => trackContentGeneration("image", 0.96),
      icon: Crown,
      color: "bg-purple-500"
    },
    {
      title: "Speed Demon",
      description: "Generate content in under 2 seconds",
      action: () => trackSpeedRecord(1500),
      icon: Zap,
      color: "bg-yellow-500"
    },
    {
      title: "Feature Explorer",
      description: "Try an advanced feature",
      action: () => trackAdvancedFeature("neural-enhancement"),
      icon: Target,
      color: "bg-green-500"
    },
    {
      title: "Experimenter",
      description: "Run an experimental AI feature",
      action: () => trackExperiment(),
      icon: Medal,
      color: "bg-red-500"
    },
    {
      title: "Surprise Achievement",
      description: "Try your luck with a random achievement!",
      action: () => {
        // Force a surprise achievement for demo
        const surprises = [
          { title: 'Lucky Break', desc: 'Sometimes the stars align just right!', credits: 20 },
          { title: 'Serendipity', desc: 'A delightful surprise from the AI gods', credits: 15 },
          { title: 'Cosmic Luck', desc: 'The universe smiled upon you today', credits: 30 }
        ];
        
        const surprise = surprises[Math.floor(Math.random() * surprises.length)];
        // Manually trigger achievement for demo
        const achievement = {
          id: `surprise_${Date.now()}`,
          title: surprise.title,
          description: surprise.desc,
          type: 'milestone' as const,
          rarity: 'rare' as const,
          credits: surprise.credits,
          unlockedAt: new Date(),
          category: 'surprise'
        };
        
        // Show achievement directly for demo
        import('@/contexts/AchievementContext').then(({ useAchievements }) => {
          // This is a demo-only approach
          console.log('Demo achievement:', achievement);
        });
      },
      icon: Gift,
      color: "bg-pink-500"
    }
  ];

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🏆 Achievement System Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Try the buttons below to trigger different achievement pop-ups!
          </p>
        </div>

        {/* Stats Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Your Stats
            </CardTitle>
            <CardDescription>Current achievement progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalGenerations}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Generations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.streakDays}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.featuresUsedCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Features Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.creditsEarned}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Credits Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Achievement Triggers */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoAchievements.map((demo, index) => {
            const IconComponent = demo.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${demo.color} text-white`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    {demo.title}
                  </CardTitle>
                  <CardDescription>{demo.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={demo.action}
                    className="w-full"
                    variant="outline"
                  >
                    Trigger Achievement
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Achievement Types */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Achievement Types</CardTitle>
            <CardDescription>Different categories of achievements available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Common</Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">Easy to earn</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500">Rare</Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">Special accomplishments</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500">Epic</Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">Major milestones</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">Legendary</Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">Ultimate achievements</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Achievement pop-ups will appear with animations, particle effects, and reward credits!
        </div>
      </div>
    </div>
  );
}