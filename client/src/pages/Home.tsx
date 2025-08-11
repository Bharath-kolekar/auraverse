import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Brain, Mic, Image, Video, Film, Music, Wand2, 
  Zap, Target, Globe, TrendingUp, Code2, Layers, Send,
  User, Settings, Bell, Play, Pause, Trophy, Palette,
  Activity, ArrowUp, CheckCircle, Clock, AlertCircle,
  Home as HomeIcon, Star, Award, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { FixedNavigation } from '@/components/ui/fixed-navigation';
import { ThemeCustomizer } from '@/components/ui/theme-customizer';
import { useTheme } from '@/contexts/ThemeContext';
import { AchievementPanel } from '@/components/achievements/AchievementPanel';
import { useTrackActivity, useUserStats } from '@/hooks/useAchievements';
import { TransitionSettings } from '@/components/ui/transition-settings';
import { PredictivePrompt } from '@/components/PredictivePrompt';
import { LogoAdvanced } from '@/components/logos/LogoAdvanced';

export default function Home() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeMetric, setActiveMetric] = useState('created');
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [themeCustomizerOpen, setThemeCustomizerOpen] = useState(false);
  const [achievementPanelOpen, setAchievementPanelOpen] = useState(false);
  const [transitionSettingsOpen, setTransitionSettingsOpen] = useState(false);
  const [promptValue, setPromptValue] = useState('');
  const [selectedContentType, setSelectedContentType] = useState<'image' | 'video' | 'audio' | 'text'>('image');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{ type: string; url?: string; content?: string } | null>(null);
  const { currentTheme, themeName } = useTheme();
  const trackActivity = useTrackActivity();
  const { stats: userStats } = useUserStats();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const performanceMetrics = [
    {
      id: 'created',
      title: 'Content Created',
      icon: <Sparkles className="w-6 h-6" />,
      value: '1,247',
      change: '+15%',
      trend: 'up',
      color: 'text-purple-400',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      id: 'voice',
      title: 'Voice Commands',
      icon: <Mic className="w-6 h-6" />,
      value: '3,429',
      change: '+23%',
      trend: 'up',
      color: 'text-blue-400',
      gradient: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'saved',
      title: 'Time Saved',
      icon: <Zap className="w-6 h-6" />,
      value: '456h',
      change: '+38%',
      trend: 'up',
      color: 'text-green-400',
      gradient: 'from-green-600 to-emerald-600'
    },
    {
      id: 'revenue',
      title: 'Revenue',
      icon: <TrendingUp className="w-6 h-6" />,
      value: '$12,847',
      change: '+125%',
      trend: 'up',
      color: 'text-yellow-400',
      gradient: 'from-yellow-600 to-orange-600'
    }
  ];

  const quickActions = [
    { 
      title: "Generate Image", 
      icon: <Image className="w-6 h-6" />, 
      description: "AI-powered image creation",
      gradient: "from-purple-600 to-pink-600",
      status: 'active',
      link: '/create'
    },
    { 
      title: "Create Video", 
      icon: <Video className="w-6 h-6" />, 
      description: "Professional video production",
      gradient: "from-blue-600 to-cyan-600",
      status: 'active',
      link: '/video'
    },
    { 
      title: "Compose Audio", 
      icon: <Music className="w-6 h-6" />, 
      description: "Music and sound design",
      gradient: "from-green-600 to-emerald-600",
      status: 'active',
      link: '/create'
    },
    { 
      title: "VFX & Effects", 
      icon: <Film className="w-6 h-6" />, 
      description: "Visual effects and post-production",
      gradient: "from-orange-600 to-red-600",
      status: 'active',
      link: '/create'
    },
    { 
      title: "AI Assistant", 
      icon: <Wand2 className="w-6 h-6" />, 
      description: "Intelligent creative assistant",
      gradient: "from-indigo-600 to-purple-600",
      status: 'active',
      link: '/intelligence'
    },
    { 
      title: "Code Generation", 
      icon: <Code2 className="w-6 h-6" />, 
      description: "Generate code and scripts",
      gradient: "from-gray-600 to-gray-800",
      status: 'active',
      link: '/intelligence'
    }
  ];

  const recentActivity = [
    {
      title: 'Epic Orchestral Suite',
      type: 'Music',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      title: 'Corporate Video Intro',
      type: 'Video',
      time: '5 hours ago',
      status: 'processing'
    },
    {
      title: 'Podcast Intro Voice',
      type: 'Audio',
      time: '1 day ago',
      status: 'completed'
    },
    {
      title: 'Product Demo VFX',
      type: 'VFX',
      time: '2 days ago',
      status: 'completed'
    }
  ];

  const handleQuickAction = (action: any) => {
    // Safe activity tracking
    try {
      if (trackActivity) {
        trackActivity({ type: 'content_created', metadata: { contentType: action.title } });
      }
    } catch (err) {
      console.log('Activity tracking skipped');
    }
    setLocation(action.link);
  };

  const handleRecordToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      trackActivity({ type: 'voice_command_used' });
      console.log("Starting voice recording...");
    } else {
      console.log("Stopping voice recording...");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="particles-bg" />
      <FixedNavigation currentPath="/" />
      
      {/* Top Header Bar */}
      <motion.div 
        className="glass-morphism border-b border-white/10 sticky top-0 z-[60]"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <LogoAdvanced size="small" />
              </motion.div>
            </div>
            
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Achievement Trophy Button */}
              <motion.button 
                className="p-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAchievementPanelOpen(true)}
                title="Achievements"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Trophy className="w-5 h-5 text-white" />
                {userStats && userStats.level >= 1 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-4 px-1 flex items-center justify-center shadow-lg">
                    {userStats.level}
                  </span>
                )}
              </motion.button>

              <div className="glass-card px-3 py-1.5 flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-xs text-white">Active</span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                className="glass-card hover:bg-white/10"
                onClick={() => setThemeCustomizerOpen(true)}
              >
                <Palette className="w-4 h-4 mr-1" />
                Theme
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                className="glass-card hover:bg-white/10"
                onClick={() => setTransitionSettingsOpen(true)}
              >
                <Zap className="w-4 h-4 mr-1" />
                Transitions
              </Button>

              <a href="/api/logout">
                <Button variant="outline" size="sm" className="glass-card hover:bg-white/10">
                  <User className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </a>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8 mt-16">
        {/* Quick Actions Grid - No heading */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                className="glass-card p-6 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => handleQuickAction(action)}
              >
                <div className="flex items-start gap-4">
                  <motion.div 
                    className={`p-3 rounded-xl bg-gradient-to-r ${action.gradient} shadow-lg`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    {action.icon}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1">{action.title}</h3>
                    <p className="text-white/60 text-sm">{action.description}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Predictive Prompt Demo Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <Card className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI-Powered Predictive Prompt</h2>
                <p className="text-white/60 text-sm mt-1">Start typing and watch our deep learning system suggest completions in real-time</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Content Type Selector */}
              <div className="flex gap-2 mb-4">
                {(['image', 'video', 'audio', 'text'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={selectedContentType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedContentType(type)}
                    className={selectedContentType === type ? "bg-gradient-to-r from-purple-600 to-pink-600" : "glass-card"}
                  >
                    {type === 'image' && <Image className="w-4 h-4 mr-1" />}
                    {type === 'video' && <Video className="w-4 h-4 mr-1" />}
                    {type === 'audio' && <Music className="w-4 h-4 mr-1" />}
                    {type === 'text' && <Code2 className="w-4 h-4 mr-1" />}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>

              {/* Predictive Prompt Input */}
              <PredictivePrompt
                value={promptValue}
                onChange={setPromptValue}
                placeholder={`Describe the ${selectedContentType} you want to create...`}
                contentType={selectedContentType}
                onSubmit={async () => {
                  if (!promptValue || isGenerating) return;
                  
                  setIsGenerating(true);
                  setGeneratedContent(null);
                  
                  try {
                    const response = await fetch('/api/ai/generate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({
                        prompt: promptValue,
                        type: selectedContentType,
                        mode: 'enhanced'
                      })
                    });
                    
                    if (!response.ok) throw new Error('Generation failed');
                    
                    const result = await response.json();
                    setGeneratedContent({
                      type: selectedContentType,
                      url: result.url,
                      content: result.content
                    });
                    
                    // Safe activity tracking
                    try {
                      if (trackActivity) {
                        trackActivity({ 
                          type: 'content_generated',
                          metadata: {
                            contentType: selectedContentType,
                            prompt: promptValue 
                          }
                        });
                      }
                    } catch (err) {
                      console.log('Activity tracking skipped');
                    }
                  } catch (error) {
                    console.error('Generation error:', error);
                  } finally {
                    setIsGenerating(false);
                  }
                }}
              />

              {/* Generate Button */}
              <div className="flex items-center gap-4">
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                  disabled={!promptValue || isGenerating}
                  onClick={async () => {
                    if (!promptValue || isGenerating) return;
                    
                    setIsGenerating(true);
                    setGeneratedContent(null);
                    
                    try {
                      const response = await fetch('/api/ai/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                          prompt: promptValue,
                          type: selectedContentType,
                          mode: 'enhanced'
                        })
                      });
                      
                      if (!response.ok) throw new Error('Generation failed');
                      
                      const result = await response.json();
                      setGeneratedContent({
                        type: selectedContentType,
                        url: result.url,
                        content: result.content
                      });
                      
                      // Safe activity tracking
                      try {
                        if (trackActivity) {
                          trackActivity({ 
                            type: 'content_generated',
                            metadata: {
                              contentType: selectedContentType,
                              prompt: promptValue 
                            }
                          });
                        }
                      } catch (err) {
                        console.log('Activity tracking skipped');
                      }
                    } catch (error) {
                      console.error('Generation error:', error);
                    } finally {
                      setIsGenerating(false);
                    }
                  }}
                >
                  {isGenerating ? (
                    <>
                      <motion.div 
                        className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate {selectedContentType.charAt(0).toUpperCase() + selectedContentType.slice(1)}
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Brain className="w-4 h-4" />
                  <span>Neural network predictions powered by WebAssembly</span>
                </div>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold text-sm">Sentiment Analysis</h4>
                    <p className="text-white/60 text-xs mt-1">Understands emotions in your prompts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold text-sm">User Behavior Learning</h4>
                    <p className="text-white/60 text-xs mt-1">Adapts to your preferences over time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold text-sm">Real-time Predictions</h4>
                    <p className="text-white/60 text-xs mt-1">Instant suggestions as you type</p>
                  </div>
                </div>
              </div>

              {/* Generated Content Display */}
              {generatedContent && (
                <motion.div 
                  className="mt-6 p-6 bg-white/5 rounded-xl border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-semibold">Generated {generatedContent.type.charAt(0).toUpperCase() + generatedContent.type.slice(1)}</h3>
                  </div>
                  
                  {generatedContent.type === 'image' && generatedContent.url && (
                    <div className="relative rounded-lg overflow-hidden">
                      <img 
                        src={generatedContent.url} 
                        alt="Generated content" 
                        className="w-full h-auto max-h-[400px] object-contain"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p className="text-white text-sm">{promptValue}</p>
                      </div>
                    </div>
                  )}
                  
                  {generatedContent.type === 'text' && generatedContent.content && (
                    <div className="prose prose-invert max-w-none">
                      <p className="text-white/90 whitespace-pre-wrap">{generatedContent.content}</p>
                    </div>
                  )}
                  
                  {(generatedContent.type === 'video' || generatedContent.type === 'audio') && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-white">
                          {generatedContent.type === 'video' ? 'Video' : 'Audio'} generated successfully!
                        </span>
                      </div>
                      <p className="text-white/60 text-sm mt-3">
                        {generatedContent.type === 'video' ? 'Video preview coming soon' : 'Audio player coming soon'}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Performance Metrics Dashboard */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {performanceMetrics.map((metric, index) => (
              <motion.div
                key={metric.id}
                className={`feature-card cursor-pointer transition-all duration-300 ${
                  activeMetric === metric.id ? 'ring-2 ring-purple-400' : ''
                }`}
                onClick={() => setActiveMetric(metric.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.div 
                    className={`p-3 rounded-2xl bg-gradient-to-r ${metric.gradient} shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {metric.icon}
                  </motion.div>
                  <div className={`flex items-center gap-1 text-sm ${
                    metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {metric.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : null}
                    {metric.change}
                  </div>
                </div>
                
                <h3 className="text-white font-semibold mb-2">{metric.title}</h3>
                <p className="text-3xl font-bold text-gradient mb-1">{metric.value}</p>
                <p className="text-white/60 text-sm">Current performance</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Creative Studio Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="glass-card p-8 text-center relative">
            <motion.div 
              className="inline-flex items-center gap-4 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              <div className="text-left">
                <h1 className="text-5xl font-bold text-gradient">Creative Studio</h1>
                <p className="text-xl text-white/70 mt-2">Welcome back, {(user as any)?.email || 'Creator'}</p>
              </div>
            </motion.div>
            
            <p className="text-white/60 max-w-2xl mx-auto mb-8">
              Your AI-powered creative command center. Generate professional content with voice commands, 
              create stunning visuals, and compose award-winning audio—all with intelligent optimization.
            </p>
            
            <div className="flex justify-center gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={() => setLocation('/create')}
              >
                Start Creating
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="glass-card hover:bg-white/10"
                onClick={() => setLocation('/marketplace')}
              >
                Browse Marketplace
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Clock className="w-8 h-8 text-green-400" />
            Recent Activity
          </h2>
          
          <div className="glass-card p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-all duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-400' : 
                      activity.status === 'processing' ? 'bg-yellow-400 animate-pulse' : 
                      'bg-blue-400'
                    }`} />
                    <div>
                      <h4 className="text-white font-medium">{activity.title}</h4>
                      <p className="text-white/60 text-sm">{activity.type} • {activity.time}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-400/20 text-green-400' :
                    activity.status === 'processing' ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-blue-400/20 text-blue-400'
                  }`}>
                    {activity.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Voice Command Button */}
        <motion.div 
          className="fixed bottom-8 right-8 z-[45]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        >
          <motion.button
            className={`p-6 rounded-full shadow-2xl transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRecordToggle}
            animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
            transition={isRecording ? { duration: 1, repeat: Infinity } : {}}
          >
            <Mic className="w-8 h-8 text-white" />
          </motion.button>
        </motion.div>
      </div>

      {/* Theme Customizer Modal */}
      <AnimatePresence>
        {themeCustomizerOpen && (
          <div className="fixed inset-0 z-[100]">
            <ThemeCustomizer isOpen={themeCustomizerOpen} onClose={() => setThemeCustomizerOpen(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Achievement Panel */}
      <AnimatePresence>
        {achievementPanelOpen && (
          <div className="fixed inset-0 z-[100]">
            <AchievementPanel />
          </div>
        )}
      </AnimatePresence>

      {/* Transition Settings */}
      <TransitionSettings 
        isOpen={transitionSettingsOpen} 
        onClose={() => setTransitionSettingsOpen(false)} 
      />
    </div>
  );
}