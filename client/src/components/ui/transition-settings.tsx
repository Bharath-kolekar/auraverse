import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransition } from '@/contexts/TransitionContext';
import { X, Zap, Sparkles, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface TransitionSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransitionSettings({ isOpen, onClose }: TransitionSettingsProps) {
  const {
    transitionSpeed,
    transitionStyle,
    enableTransitions,
    setTransitionSpeed,
    setTransitionStyle,
    setEnableTransitions
  } = useTransition();

  const speedOptions = [
    { value: 'slow', label: 'Slow', icon: '🐢' },
    { value: 'normal', label: 'Normal', icon: '⚡' },
    { value: 'fast', label: 'Fast', icon: '🚀' }
  ];

  const styleOptions = [
    { value: 'minimal', label: 'Minimal', description: 'Simple fade transitions' },
    { value: 'creative', label: 'Creative', description: 'Balanced animations' },
    { value: 'extreme', label: 'Extreme', description: 'Dynamic & dramatic effects' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Settings Panel */}
          <motion.div
            className="fixed right-4 top-20 w-96 glass-morphism p-6 rounded-2xl z-[95] border border-white/10"
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Transition Settings</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Enable/Disable Transitions */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="enable-transitions" className="text-white">
                  Enable Page Transitions
                </Label>
                <Switch
                  id="enable-transitions"
                  checked={enableTransitions}
                  onCheckedChange={setEnableTransitions}
                />
              </div>
              <p className="text-sm text-white/60">
                Toggle smooth animations between pages
              </p>
            </div>

            {enableTransitions && (
              <>
                {/* Transition Speed */}
                <div className="mb-6">
                  <Label className="text-white mb-3 block">Transition Speed</Label>
                  <div className="flex gap-2">
                    {speedOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTransitionSpeed(option.value as any)}
                        className={`flex-1 p-3 rounded-xl border transition-all ${
                          transitionSpeed === option.value
                            ? 'bg-purple-500/20 border-purple-400 text-white'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-2xl mb-1">{option.icon}</div>
                        <div className="text-sm">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transition Style */}
                <div className="mb-6">
                  <Label className="text-white mb-3 block">Animation Style</Label>
                  <div className="space-y-2">
                    {styleOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTransitionStyle(option.value as any)}
                        className={`w-full p-3 rounded-xl border transition-all text-left ${
                          transitionStyle === option.value
                            ? 'bg-purple-500/20 border-purple-400'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-white font-medium">{option.label}</div>
                        <div className="text-sm text-white/60 mt-1">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Demo */}
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-white">Preview</span>
                  </div>
                  <motion.div
                    className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"
                    animate={{
                      x: [-50, 50, -50],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: transitionSpeed === 'slow' ? 3 : transitionSpeed === 'fast' ? 1 : 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                </div>
              </>
            )}

            {/* Apply Button */}
            <Button
              onClick={onClose}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Apply Settings
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}