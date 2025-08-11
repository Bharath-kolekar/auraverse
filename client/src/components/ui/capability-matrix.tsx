// Capability Matrix Component
// Visual matrix display of AI capabilities

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface AICapability {
  id: string;
  name: string;
  type: string;
  description: string;
  requiredTier: string;
  inputTypes: string[];
  outputTypes: string[];
  performance: {
    speed: number;
    accuracy: number;
    cost: number;
  };
  usage: {
    total: number;
    successful: number;
    failed: number;
  };
}

interface CapabilityMatrixProps {
  capabilities: AICapability[];
  onTest: (capability: AICapability) => void;
  isAuthenticated?: boolean;
  showAdvanced?: boolean;
  testingCapabilityId?: string;
}

export function CapabilityMatrix({ 
  capabilities, 
  onTest, 
  isAuthenticated,
  showAdvanced,
  testingCapabilityId 
}: CapabilityMatrixProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {capabilities.map((capability, index) => (
        <motion.div
          key={capability.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.05 }}
        >
          <Card className="glass-morphism border-white/10 hover:border-white/30 transition-all h-full">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">{capability.type}</Badge>
                <Badge className="text-xs">
                  {capability.requiredTier}
                </Badge>
              </div>
              <CardTitle className="text-white text-lg">{capability.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-white/70">{capability.description}</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-white/50 mb-1">Input</p>
                  <div className="flex flex-wrap gap-1">
                    {capability.inputTypes.map((type, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-white/50 mb-1">Output</p>
                  <div className="flex flex-wrap gap-1">
                    {capability.outputTypes.map((type, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {showAdvanced && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Speed</span>
                    <span className="text-white/70">{capability.performance.speed}s</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Accuracy</span>
                    <span className="text-white/70">{capability.performance.accuracy}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Usage</span>
                    <span className="text-white/70">
                      {capability.usage.total} ({capability.usage.successful} success)
                    </span>
                  </div>
                </div>
              )}

              <Button 
                size="sm"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                onClick={() => onTest(capability)}
                disabled={!isAuthenticated || testingCapabilityId === capability.id}
              >
                <Play className="w-3 h-3 mr-1" />
                {testingCapabilityId === capability.id ? 'Testing...' : 'Test Capability'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}