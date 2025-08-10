import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Mic, Video, Music, Zap, Globe, BarChart3, Brain, Cpu, TrendingUp, Award, Calendar, Clock, Star, Settings, Bell, User, Plus, ArrowRight, Play, Pause, Palette, Trophy } from "lucide-react";
import { Link, useLocation } from "wouter";
import { FixedNavigation } from '@/components/ui/fixed-navigation';
import { ThemeCustomizer } from '@/components/ui/theme-customizer';
import { useTheme } from '@/contexts/ThemeContext';
import { AchievementPanel } from '@/components/achievements/AchievementPanel';
import { useTrackActivity, useUserStats } from '@/hooks/useAchievements';

export default function Home() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [themeCustomizerOpen, setThemeCustomizerOpen] = useState(false);
  const [achievementPanelOpen, setAchievementPanelOpen] = useState(false);
  const { currentTheme, themeName } = useTheme();
  const trackActivity = useTrackActivity();
  const { stats: userStats } = useUserStats();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: "Content Created", value: "1,247", icon: <Sparkles className="w-6 h-6" />, color: "text-purple-400", gradient: "from-purple-600 to-pink-600" },
    { label: "Voice Commands", value: "3,429", icon: <Mic className="w-6 h-6" />, color: "text-blue-400", gradient: "from-blue-600 to-cyan-600" },
    { label: "Time Saved", value: "456h", icon: <Zap className="w-6 h-6" />, color: "text-green-400", gradient: "from-green-600 to-emerald-600" },
    { label: "Revenue", value: "$12,847", icon: <TrendingUp className="w-6 h-6" />, color: "text-yellow-400", gradient: "from-yellow-600 to-orange-600" }
  ];

  const recentProjects = [
    { name: "Epic Orchestral Suite", type: "Music", duration: "3:42", status: "completed", color: "text-purple-400" },
    { name: "Corporate Video Intro", type: "Video", duration: "0:30", status: "processing", color: "text-blue-400" },
    { name: "Podcast Intro Voice", type: "Audio", duration: "0:15", status: "completed", color: "text-green-400" },
    { name: "Product Demo VFX", type: "VFX", duration: "1:20", status: "rendering", color: "text-orange-400" }
  ];

  const voiceCommands = [
    { category: "Music", command: "Create an epic orchestral soundtrack", description: "Generate cinematic music" },
    { category: "Video", command: "Add explosion VFX to my video", description: "Advanced visual effects" },
    { category: "Voice", command: "Generate Morgan Freeman narration", description: "Professional voiceovers" },
    { category: "Export", command: "Export in 4K with surround sound", description: "High-quality output" },
    { category: "Style", command: "Apply Marvel movie style", description: "Cinematic style transfer" },
    { category: "Marketplace", command: "Upload to marketplace for $50", description: "Monetize your content" }
  ];

  const quickActions = [
    { title: "AI Music Studio", icon: <Music className="w-8 h-8" />, gradient: "from-purple-600 to-pink-600", description: "Create professional soundtracks" },
    { title: "Video Production", icon: <Video className="w-8 h-8" />, gradient: "from-blue-600 to-cyan-600", description: "Cinematic video creation" },
    { title: "Voice Synthesis", icon: <Mic className="w-8 h-8" />, gradient: "from-green-600 to-emerald-600", description: "Advanced speech generation" },
    { title: "VFX Laboratory", icon: <Zap className="w-8 h-8" />, gradient: "from-orange-600 to-red-600", description: "Hollywood-grade effects" },
    { title: "Intelligence Hub", icon: <Brain className="w-8 h-8" />, gradient: "from-indigo-600 to-purple-600", description: "AI model management" },
    { title: "Global Marketplace", icon: <Globe className="w-8 h-8" />, gradient: "from-teal-600 to-blue-600", description: "Share and monetize" }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="particles-bg" />
      <FixedNavigation currentPath="/" />
      
      {/* Enhanced Header */}
      <motion.header 
        className="glass-morphism border-b border-white/10 sticky top-0 z-30"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold holographic">Infinite Intelligence</h1>
                <p className="text-sm text-white/60">Creative Command Center</p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-3 md:space-x-6">
              <div className="hidden md:block text-right">
                <p className="text-sm text-white/60">Welcome back,</p>
                <p className="font-semibold text-white">Creator</p>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3">
                <motion.button 
                  className="p-2 md:p-3 glass-card rounded-xl hover:bg-white/10 transition-all duration-300 relative bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAchievementPanelOpen(true)}
                  title="Achievements"
                >
                  <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                  {userStats && userStats.level >= 1 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-lg">
                      {userStats.level}
                    </span>
                  )}
                </motion.button>
                <motion.button 
                  className="hidden sm:block p-2 md:p-3 glass-card rounded-xl hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="w-5 h-5 text-white/70" />
                </motion.button>
                <motion.button 
                  className="p-2 md:p-3 glass-card rounded-xl hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setThemeCustomizerOpen(true)}
                  title="Customize Theme"
                >
                  <Palette className="w-5 h-5 text-white/70" />
                </motion.button>
                <motion.button 
                  className="hidden sm:block p-2 md:p-3 glass-card rounded-xl hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-5 h-5 text-white/70" />
                </motion.button>
                <motion.a
                  href="/api/logout"
                  className="hidden md:flex p-3 glass-card rounded-xl hover:bg-white/10 transition-all duration-300 items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <User className="w-5 h-5 text-white/70" />
                  <span className="text-sm text-white/70">Logout</span>
                </motion.a>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-6 py-8">
        {/* Hero Dashboard */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-5xl font-bold text-gradient mb-4">Your Creative Command Center</h2>
              <p className="text-xl text-white/70">
                Generate professional content with voice commands and AI-powered tools.
              </p>
            </div>
            <motion.div 
              className="glass-card p-4 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-white font-semibold">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-white/60 text-sm">
                {currentTime.toLocaleDateString()}
              </div>
            </motion.div>
          </div>
          
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="feature-card group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.div 
                    className={`p-3 rounded-2xl bg-gradient-to-r ${stat.gradient} shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {stat.icon}
                  </motion.div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-white group-hover:text-gradient transition-all duration-300">
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Zap className="w-8 h-8 text-purple-400" />
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                className="feature-card group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -12, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  console.log(`${action.title} clicked - navigating`);
                  if (action.title === 'AI Music Studio') window.location.href = '/create?type=audio';
                  else if (action.title === 'Video Production') window.location.href = '/create?type=video';
                  else if (action.title === 'Voice Synthesis') window.location.href = '/create?type=voice';
                  else if (action.title === 'VFX Laboratory') window.location.href = '/create?type=vfx';
                  else if (action.title === 'Intelligence Hub') window.location.href = '/intelligence';
                  else if (action.title === 'Global Marketplace') window.location.href = '/marketplace';
                }}
              >
                <motion.div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-r ${action.gradient} mb-6 shadow-2xl`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {action.icon}
                </motion.div>
                
                <h4 className="text-2xl font-bold text-white mb-3 group-hover:text-gradient transition-all duration-500">
                  {action.title}
                </h4>
                
                <p className="text-white/70 mb-6 group-hover:text-white/90 transition-colors duration-500">
                  {action.description}
                </p>
                
                <motion.div 
                  className="flex items-center justify-between"
                  whileHover={{ x: 5 }}
                >
                  <span className="text-purple-400 font-semibold">Get Started</span>
                  <ArrowRight className="w-5 h-5 text-purple-400" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Voice Command Center */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                <motion.div
                  animate={{ scale: isRecording ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: isRecording ? Infinity : 0 }}
                >
                  <Mic className="w-8 h-8 text-purple-400" />
                </motion.div>
                Voice Command Center
              </h3>
              
              <motion.button
                className={`btn-primary px-8 py-4 ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
                onClick={() => {
                  console.log('Voice control button clicked');
                  setIsRecording(!isRecording);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isRecording ? (
                  <span className="flex items-center gap-2">
                    <Pause className="w-5 h-5" />
                    Stop Recording
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Start Voice Control
                  </span>
                )}
              </motion.button>
            </div>
            
            <p className="text-white/70 text-lg mb-8">
              Control your creative workflow with natural voice commands. Just speak to create professional content.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {voiceCommands.map((command, index) => (
                <motion.div
                  key={index}
                  className="glass-card p-6 hover:bg-white/5 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
                    <span className="text-sm font-semibold text-purple-400 uppercase tracking-wide">
                      {command.category}
                    </span>
                  </div>
                  <p className="text-white font-medium mb-2">"{command.command}"</p>
                  <p className="text-white/60 text-sm">{command.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Projects */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-400" />
              Recent Projects
            </h3>
            <motion.button 
              className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              View All <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
          
          <div className="glass-card p-8">
            <div className="space-y-4">
              {recentProjects.map((project, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">{project.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{project.name}</h4>
                      <p className="text-white/60 text-sm">{project.type} • {project.duration}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      project.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {project.status}
                    </span>
                    <ArrowRight className="w-5 h-5 text-white/40" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
      
      {/* Theme Customizer */}
      <ThemeCustomizer 
        isOpen={themeCustomizerOpen}
        onClose={() => {
          setThemeCustomizerOpen(false);
          trackActivity({ type: 'theme_changed', points: 5 });
        }}
      />
      
      {/* Achievement Panel Modal */}
      <AnimatePresence>
        {achievementPanelOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setAchievementPanelOpen(false)}
            />
            <motion.div
              className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <AchievementPanel className="shadow-2xl" />
              <button
                onClick={() => setAchievementPanelOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <span className="text-white text-xl">×</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}