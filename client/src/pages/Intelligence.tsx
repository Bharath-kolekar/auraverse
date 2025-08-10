import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Cpu, Zap, TrendingUp, BarChart3, Settings, 
  Activity, Target, Layers, Globe, Star, Award,
  ArrowUp, ArrowDown, CheckCircle, Clock, AlertCircle
} from 'lucide-react';

export default function Intelligence() {
  const [activeMetric, setActiveMetric] = useState('performance');
  const [optimizationLevel, setOptimizationLevel] = useState(85);

  const performanceMetrics = [
    {
      id: 'performance',
      title: 'Performance Optimization',
      icon: <Zap className="w-6 h-6" />,
      value: '1,247x',
      change: '+15%',
      trend: 'up',
      color: 'text-yellow-400',
      gradient: 'from-yellow-600 to-orange-600'
    },
    {
      id: 'cache',
      title: 'Cache Hit Rate',
      icon: <Cpu className="w-6 h-6" />,
      value: '98.7%',
      change: '+2.3%',
      trend: 'up',
      color: 'text-blue-400',
      gradient: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'cost',
      title: 'Cost Optimization',
      icon: <TrendingUp className="w-6 h-6" />,
      value: '$0.00',
      change: '-100%',
      trend: 'up',
      color: 'text-green-400',
      gradient: 'from-green-600 to-emerald-600'
    },
    {
      id: 'revenue',
      title: 'Revenue Optimization',
      icon: <BarChart3 className="w-6 h-6" />,
      value: '425%',
      change: '+25%',
      trend: 'up',
      color: 'text-purple-400',
      gradient: 'from-purple-600 to-pink-600'
    }
  ];

  const aiModels = [
    { name: 'DeepSeek R1', status: 'active', performance: 98, cost: 0, usage: 'Advanced reasoning and problem solving' },
    { name: 'Stable Diffusion XL', status: 'active', performance: 95, cost: 0, usage: 'High-resolution image generation' },
    { name: 'MusicGen Large', status: 'active', performance: 92, cost: 0, usage: 'Professional music composition' },
    { name: 'Whisper Large', status: 'active', performance: 97, cost: 0, usage: 'Speech recognition and synthesis' },
    { name: 'LLaMA 3.1', status: 'standby', performance: 94, cost: 0, usage: 'Natural language processing' },
    { name: 'CLIP Vision', status: 'active', performance: 90, cost: 0, usage: 'Image understanding and analysis' }
  ];

  const optimizations = [
    {
      type: 'Memory Caching',
      description: 'Intelligent caching reduces response time by 95%',
      impact: 'High',
      savings: '$3,200/month',
      status: 'active'
    },
    {
      type: 'GPU Acceleration',
      description: 'Hardware optimization delivers 20x performance boost',
      impact: 'Critical',
      savings: '$8,600/month',
      status: 'active'
    },
    {
      type: 'Dynamic Pricing',
      description: 'Smart pricing increases revenue by 300-500%',
      impact: 'High',
      savings: '$15,000/month',
      status: 'active'
    },
    {
      type: 'Model Compression',
      description: 'Optimized models maintain quality at 50% size',
      impact: 'Medium',
      savings: '$2,100/month',
      status: 'active'
    }
  ];

  const intelligenceInsights = [
    {
      title: 'Zero API Costs Maintained',
      description: 'All AI processing runs locally with zero external API usage',
      impact: 'Saving $36,000-103,200 annually vs competitors',
      status: 'success'
    },
    {
      title: 'Performance Acceleration',
      description: 'Advanced optimization delivers 10-1500x faster processing',
      impact: 'Response times reduced from seconds to milliseconds',
      status: 'success'
    },
    {
      title: 'Revenue Maximization',
      description: 'Dynamic pricing and optimization increase profit margins',
      impact: '99.8% profit margin achieved through zero-cost operations',
      status: 'success'
    },
    {
      title: 'Quality Preservation',
      description: 'Optimizations maintain professional-grade output quality',
      impact: 'Oscar-worthy content generation at maximum efficiency',
      status: 'success'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="particles-bg" />
      
      {/* Header */}
      <motion.div 
        className="glass-morphism border-b border-white/10 sticky top-0 z-30"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2">Intelligence Hub</h1>
              <p className="text-white/70">Advanced AI optimization and performance monitoring</p>
            </div>
            
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="glass-card px-4 py-2 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-white">12 Active Models</span>
              </div>
              <div className="glass-card px-4 py-2 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                <span className="text-sm text-white">Optimal Performance</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Performance Metrics */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Activity className="w-8 h-8 text-purple-400" />
            Performance Metrics
          </h2>
          
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
                    {metric.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    {metric.change}
                  </div>
                </div>
                
                <h3 className="text-white font-semibold mb-2">{metric.title}</h3>
                <p className="text-3xl font-bold text-gradient mb-1">{metric.value}</p>
                <p className="text-white/60 text-sm">Current optimization level</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Models Grid */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-400" />
            AI Model Status
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiModels.map((model, index) => (
              <motion.div
                key={index}
                className="glass-card p-6 hover:bg-white/5 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">{model.name}</h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    model.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {model.status}
                  </div>
                </div>
                
                <p className="text-white/60 text-sm mb-4">{model.usage}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Performance</span>
                    <span className="text-green-400">{model.performance}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${model.performance}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Cost</span>
                    <span className="text-green-400">${model.cost}/month</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Optimization Insights */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Target className="w-8 h-8 text-green-400" />
            Active Optimizations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {optimizations.map((opt, index) => (
              <motion.div
                key={index}
                className="glass-card p-6"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">{opt.type}</h3>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-green-400">Active</span>
                  </div>
                </div>
                
                <p className="text-white/70 mb-4">{opt.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">Impact:</span>
                    <span className={`text-sm font-medium ${
                      opt.impact === 'Critical' ? 'text-red-400' :
                      opt.impact === 'High' ? 'text-orange-400' : 'text-yellow-400'
                    }`}>
                      {opt.impact}
                    </span>
                  </div>
                  <span className="text-green-400 font-semibold">{opt.savings}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Intelligence Insights */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-400" />
            Intelligence Insights
          </h2>
          
          <div className="space-y-6">
            {intelligenceInsights.map((insight, index) => (
              <motion.div
                key={index}
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.1 }}
                whileHover={{ scale: 1.01, x: 5 }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-green-500/20">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-2">{insight.title}</h3>
                    <p className="text-white/70 mb-3">{insight.description}</p>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">{insight.impact}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Optimization Control Panel */}
        <motion.div 
          className="glass-card p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Settings className="w-7 h-7 text-purple-400" />
            Optimization Control
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Performance Level</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Current Optimization</span>
                  <span className="text-gradient font-bold text-xl">{optimizationLevel}%</span>
                </div>
                
                <div className="w-full bg-white/10 rounded-full h-4">
                  <motion.div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full"
                    style={{ width: `${optimizationLevel}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-sm text-white/60">
                  <span>Conservative</span>
                  <span>Balanced</span>
                  <span>Maximum</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Overall Health</span>
                  <span className="text-green-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Excellent
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Response Time</span>
                  <span className="text-green-400">&lt; 100ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Uptime</span>
                  <span className="text-green-400">99.9%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Cost Efficiency</span>
                  <span className="text-green-400">Maximum</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}