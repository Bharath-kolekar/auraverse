import React from 'react';
import { Button } from '@/components/ui/button';
import { useAchievements as useAchievementContext } from '@/contexts/AchievementContext';
import { Trophy } from 'lucide-react';

export function AchievementTestButton() {
  const { showAchievement } = useAchievementContext();

  const triggerTestAchievement = () => {
    // Create a test achievement
    const testAchievement = {
      id: 'test_achievement_' + Date.now(),
      title: 'System Tested!',
      description: 'You successfully triggered the achievement system!',
      type: 'milestone' as const,
      rarity: 'rare' as const,
      credits: 25,
      unlockedAt: new Date(),
      category: 'testing'
    };

    showAchievement(testAchievement);
  };

  return (
    <Button 
      onClick={triggerTestAchievement}
      variant="outline"
      size="sm"
      className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600"
    >
      <Trophy className="w-4 h-4 mr-2" />
      Test Achievement
    </Button>
  );
}