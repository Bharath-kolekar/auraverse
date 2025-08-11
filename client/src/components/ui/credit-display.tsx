// Credit Display Component - Shows user credits and purchase options
import React from 'react';
import { motion } from 'framer-motion';
import { Coins, TrendingUp, ShoppingCart, CreditCard, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface CreditDisplayProps {
  credits: number;
  onPurchase: () => void;
  compact?: boolean;
}

export function CreditDisplay({ credits, onPurchase, compact = false }: CreditDisplayProps) {
  const getCreditStatus = () => {
    if (credits > 500) return { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Abundant' };
    if (credits > 100) return { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Good' };
    if (credits > 50) return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Low' };
    return { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Critical' };
  };

  const status = getCreditStatus();
  const progressPercentage = Math.min((credits / 1000) * 100, 100);

  if (compact) {
    return (
      <motion.div 
        className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-white/10"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-500" />
          <span className={`font-bold ${status.color}`}>{credits}</span>
          <span className="text-xs text-gray-400">credits</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onPurchase}
          className="ml-auto"
        >
          <ShoppingCart className="w-4 h-4 mr-1" />
          Buy
        </Button>
      </motion.div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-yellow-500" />
            <span>Intelligence Credits</span>
          </div>
          <Badge className={status.bg}>
            <span className={status.color}>{status.label}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl font-bold text-white">{credits}</span>
            <span className="text-sm text-gray-400">/ 1000</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-purple-500" />
            <span className="text-gray-400">Basic: Free</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-gray-400">Advanced: 3 credits</span>
          </div>
          <div className="flex items-center gap-1">
            <CreditCard className="w-4 h-4 text-pink-500" />
            <span className="text-gray-400">Super: 5 credits</span>
          </div>
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-400">Quantum: 10 credits</span>
          </div>
        </div>

        <Button
          onClick={onPurchase}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Purchase Credits
        </Button>

        <p className="text-xs text-center text-gray-500">
          💰 99.8% profit margin • India-compatible payments
        </p>
      </CardContent>
    </Card>
  );
}