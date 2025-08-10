import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Flame, 
  Star,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Target,
  Award,
  Medal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AchievementCard } from "./AchievementCard";
import { 
  useAchievements, 
  useUserStats, 
  useLeaderboard,
  calculateExpForNextLevel,
  formatNumber,
  useActivityTracker
} from "@/hooks/useAchievements";

interface AchievementPanelProps {
  className?: string;
  compact?: boolean;
}

export function AchievementPanel({ className, compact = false }: AchievementPanelProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('all-time');
  
  const { achievements, isLoading: achievementsLoading } = useAchievements();
  const { stats, isLoading: statsLoading } = useUserStats();
  const { leaderboard, isLoading: leaderboardLoading } = useLeaderboard(selectedPeriod);
  
  // Track activity
  useActivityTracker();

  const expForNextLevel = stats ? calculateExpForNextLevel(stats.experience) : 100;
  const levelProgress = stats ? ((stats.experience % 100) / 100) * 100 : 0;

  // Group achievements by category
  const achievementsByCategory = achievements?.reduce((acc, achievement) => {
    const category = achievement.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, typeof achievements>);

  // Calculate completion stats
  const totalAchievements = achievements?.length || 0;
  const unlockedAchievements = achievements?.filter(a => a.unlocked).length || 0;
  const completionPercentage = totalAchievements > 0 
    ? (unlockedAchievements / totalAchievements) * 100 
    : 0;

  if (compact && !isExpanded) {
    return (
      <Card className={cn("w-48 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800", className)}>
        <CardHeader className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold">Level {stats?.level || 1}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsExpanded(true)}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-2">
            <Progress value={levelProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatNumber(stats?.totalPoints || 0)} pts</span>
              <span>{stats?.streak || 0} 🔥</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>Achievement Center</span>
          </CardTitle>
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* User Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Level</p>
                  <p className="text-2xl font-bold">{stats?.level || 1}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
              <Progress value={levelProgress} className="h-1 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {expForNextLevel} XP to next level
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold">{formatNumber(stats?.totalPoints || 0)}</p>
                </div>
                <Star className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Lifetime earnings
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Daily Streak</p>
                  <p className="text-2xl font-bold flex items-center">
                    {stats?.streak || 0}
                    <Flame className="w-5 h-5 ml-1 text-orange-500" />
                  </p>
                </div>
                <Flame className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Keep it going!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Achievements</p>
                  <p className="text-2xl font-bold">
                    {unlockedAchievements}/{totalAchievements}
                  </p>
                </div>
                <Award className="w-8 h-8 text-green-500 opacity-50" />
              </div>
              <Progress value={completionPercentage} className="h-1 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {completionPercentage.toFixed(0)}% complete
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="achievements" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="achievements">
              <Trophy className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Users className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="progress">
              <Target className="w-4 h-4 mr-2" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-4">
            {achievementsLoading ? (
              <div className="text-center py-8">Loading achievements...</div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                {Object.entries(achievementsByCategory || {}).map(([category, categoryAchievements]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 capitalize flex items-center">
                      <Medal className="w-5 h-5 mr-2" />
                      {category} Achievements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryAchievements
                        .sort((a, b) => a.order - b.order)
                        .map((achievement) => (
                          <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <div className="flex justify-center space-x-2 mb-4">
              {(['daily', 'weekly', 'monthly', 'all-time'] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className="capitalize"
                >
                  {period.replace('-', ' ')}
                </Button>
              ))}
            </div>

            {leaderboardLoading ? (
              <div className="text-center py-8">Loading leaderboard...</div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {leaderboard?.map((entry, index) => (
                    <Card key={entry.user.id} className={cn(
                      "transition-all hover:shadow-md",
                      entry.rank <= 3 && "border-yellow-400 dark:border-yellow-600"
                    )}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-full font-bold",
                              entry.rank === 1 && "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
                              entry.rank === 2 && "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                              entry.rank === 3 && "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300",
                              entry.rank > 3 && "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400"
                            )}>
                              {entry.rank}
                            </div>
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={entry.user.profileImageUrl} />
                              <AvatarFallback>
                                {entry.user.firstName?.[0] || entry.user.lastName?.[0] || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {entry.user.firstName} {entry.user.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Rank #{entry.rank}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatNumber(entry.points)}</p>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                    Your Journey
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Completion</span>
                        <span className="font-bold">{completionPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={completionPercentage} className="h-3" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <p className="text-2xl font-bold text-blue-500">{stats?.activityCount || 0}</p>
                        <p className="text-xs text-muted-foreground">Total Activities</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <p className="text-2xl font-bold text-green-500">{stats?.achievementCount || 0}</p>
                        <p className="text-xs text-muted-foreground">Achievements Earned</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg">
                      <p className="text-sm font-medium mb-2">Next Milestone</p>
                      <p className="text-xs text-muted-foreground">
                        Reach level {(stats?.level || 0) + 1} to unlock new features and rewards!
                      </p>
                      <Progress value={levelProgress} className="h-2 mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-2">
                    {achievements
                      ?.filter(a => a.unlocked)
                      .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
                      .slice(0, 12)
                      .map((achievement) => (
                        <AchievementCard
                          key={achievement.id}
                          achievement={achievement}
                          compact
                        />
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}