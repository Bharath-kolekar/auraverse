// Behavior Explorer Component
// Explore and configure AI behaviors

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Sparkles, BarChart3, Users, Settings } from 'lucide-react';

interface AIBehavior {
  id: string;
  category: string;
  name: string;
  description: string;
  tier: string;
  active: boolean;
  performance: number;
  examples: string[];
}

interface BehaviorExplorerProps {
  behaviors: AIBehavior[];
  onToggle: (behavior: AIBehavior) => void;
  isAuthenticated?: boolean;
}

export function BehaviorExplorer({ behaviors, onToggle, isAuthenticated }: BehaviorExplorerProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'creative':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'analytical':
        return <BarChart3 className="w-5 h-5 text-blue-400" />;
      case 'interactive':
        return <Users className="w-5 h-5 text-green-400" />;
      case 'adaptive':
        return <Settings className="w-5 h-5 text-orange-400" />;
      default:
        return <Settings className="w-5 h-5 text-gray-400" />;
    }
  };

  const getCategoryBackground = (category: string) => {
    switch (category) {
      case 'creative':
        return 'bg-purple-500/20';
      case 'analytical':
        return 'bg-blue-500/20';
      case 'interactive':
        return 'bg-green-500/20';
      case 'adaptive':
        return 'bg-orange-500/20';
      default:
        return 'bg-gray-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {behaviors.map((behavior, index) => (
        <motion.div
          key={behavior.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="glass-morphism border-white/10 hover:border-white/30 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getCategoryBackground(behavior.category)}`}>
                    {getCategoryIcon(behavior.category)}
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{behavior.name}</CardTitle>
                    <Badge variant="outline" className="text-xs mt-1">
                      {behavior.tier} tier
                    </Badge>
                  </div>
                </div>
                <Switch 
                  checked={behavior.active}
                  onCheckedChange={() => onToggle(behavior)}
                  disabled={!isAuthenticated}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-white/70">{behavior.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">Performance</span>
                  <div className="flex items-center gap-2">
                    <Progress value={behavior.performance} className="w-20 h-1" />
                    <span className="text-white/70">{behavior.performance}%</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-white/50 mb-2">Examples:</p>
                <div className="flex flex-wrap gap-1">
                  {behavior.examples.map((example, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}