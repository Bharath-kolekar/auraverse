// Intelligence Tier Card Component
// Display individual intelligence tier information

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface IntelligenceTierCardProps {
  tier: {
    id: string;
    name: string;
    level: number;
    description: string;
    capabilities: string[];
    costPerUse: number;
    processingPower: string;
    icon: string;
    gradient: string;
    available: boolean;
    features: any[];
    status?: {
      available: boolean;
      currentLoad: number;
      estimatedWaitTime: number;
    };
  };
  selected?: boolean;
  onClick?: () => void;
}

export function IntelligenceTierCard({ tier, selected, onClick }: IntelligenceTierCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className={`glass-morphism border-white/10 hover:border-white/30 transition-all ${
        selected ? 'ring-2 ring-purple-500' : ''
      }`}>
        <CardHeader>
          <div className={`w-full h-2 rounded-full bg-gradient-to-r ${tier.gradient} mb-4`} />
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">{tier.icon}</span>
            <Badge 
              variant={tier.available ? 'default' : 'secondary'}
              className="text-xs"
            >
              Level {tier.level}
            </Badge>
          </div>
          <CardTitle className="text-white">{tier.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-white/70">{tier.description}</p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/50">Processing</span>
              <span className="text-white/70">{tier.processingPower}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/50">Cost</span>
              <span className="text-white/70">
                {tier.costPerUse === 0 ? 'Free' : `${tier.costPerUse} credits`}
              </span>
            </div>
            {tier.status && (
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/50">Load</span>
                  <span className="text-white/70">{Math.round(tier.status.currentLoad)}%</span>
                </div>
                <Progress value={tier.status.currentLoad} className="h-1" />
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-white/50 mb-2">Capabilities:</p>
            <div className="flex flex-wrap gap-1">
              {tier.capabilities.slice(0, 3).map((cap, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {cap}
                </Badge>
              ))}
              {tier.capabilities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tier.capabilities.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}