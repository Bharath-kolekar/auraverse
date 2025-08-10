import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { getAchievementRarityColor, getAchievementRarityBadgeClass } from "@/hooks/useAchievements";
import type { Achievement } from "@/hooks/useAchievements";

interface AchievementCardProps {
  achievement: Achievement;
  compact?: boolean;
}

export function AchievementCard({ achievement, compact = false }: AchievementCardProps) {
  const iconName = achievement.icon as keyof typeof Icons;
  const IconComponent = (Icons[iconName] && typeof Icons[iconName] === 'function') ? Icons[iconName] : Icons.Trophy;
  const Icon = IconComponent as React.FC<{ className?: string }>;
  
  const progressPercentage = achievement.maxProgress 
    ? (achievement.progress || 0) / achievement.maxProgress * 100 
    : 0;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer",
                achievement.unlocked
                  ? "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-md"
                  : "bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-50 grayscale"
              )}
            >
              <Icon 
                className={cn(
                  "w-8 h-8 mb-1",
                  achievement.unlocked 
                    ? getAchievementRarityColor(achievement.rarity)
                    : "text-gray-400 dark:text-gray-600"
                )}
              />
              {achievement.unlocked && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <div className="font-semibold">{achievement.name}</div>
              <div className="text-xs text-muted-foreground">{achievement.description}</div>
              {!achievement.unlocked && achievement.maxProgress && achievement.maxProgress > 1 && (
                <div className="space-y-1">
                  <div className="text-xs">
                    Progress: {achievement.progress || 0} / {achievement.maxProgress}
                  </div>
                  <Progress value={progressPercentage} className="h-1" />
                </div>
              )}
              {achievement.unlocked && achievement.unlockedAt && (
                <div className="text-xs text-muted-foreground">
                  Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-lg",
        achievement.unlocked
          ? "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
          : "bg-gray-100 dark:bg-gray-900 opacity-75"
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                achievement.unlocked
                  ? "bg-white dark:bg-gray-800 shadow-sm"
                  : "bg-gray-200 dark:bg-gray-800"
              )}
            >
              <Icon 
                className={cn(
                  "w-6 h-6",
                  achievement.unlocked 
                    ? getAchievementRarityColor(achievement.rarity)
                    : "text-gray-400 dark:text-gray-600"
                )}
              />
            </div>
            <div>
              <h4 className={cn(
                "font-semibold",
                !achievement.unlocked && "text-gray-500 dark:text-gray-400"
              )}>
                {achievement.name}
              </h4>
              <p className="text-xs text-muted-foreground">{achievement.category}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge className={cn(
              "text-xs",
              getAchievementRarityBadgeClass(achievement.rarity)
            )}>
              {achievement.rarity}
            </Badge>
            <div className="flex items-center space-x-1">
              <Icons.Zap className="w-3 h-3 text-yellow-500" />
              <span className="text-xs font-semibold">{achievement.points}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          {achievement.description}
        </p>

        {!achievement.unlocked && achievement.maxProgress && achievement.maxProgress > 1 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{achievement.progress || 0} / {achievement.maxProgress}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {achievement.unlocked && achievement.unlockedAt && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Unlocked</span>
            <span>{new Date(achievement.unlockedAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {achievement.unlocked && (
        <div className="absolute top-2 right-2">
          <Icons.CheckCircle className="w-5 h-5 text-green-500" />
        </div>
      )}

      {achievement.rarity === 'legendary' && achievement.unlocked && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 animate-pulse" />
        </div>
      )}
    </Card>
  );
}