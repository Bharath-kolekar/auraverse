import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Music, Video, Mic, Image, Zap, Brain, 
  Play, Pause, Download, Upload, Settings, Volume2,
  Layers, Palette, Wand2, Camera, Cpu, Globe, Eye
} from 'lucide-react';

export default function Create() {
  const [activeTab, setActiveTab] = useState('video'); // Default to video for voice commands
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [voiceTriggered, setVoiceTriggered] = useState(false);

  const creationTools = [
    {
      id: 'audio',
      title: 'AI Music Studio',
      icon: <Music className="w-8 h-8" />,
      gradient: 'from-purple-600 to-pink-600',
      description: 'Create professional soundtracks and audio',
      features: ['Neural Composition', 'Voice Synthesis', 'Sound Effects', 'Audio Mastering']
    },
    {
      id: 'video',
      title: 'Video Production',
      icon: <Video className="w-8 h-8" />,
      gradient: 'from-blue-600 to-cyan-600',
      description: 'Generate cinematic videos with VFX',
      features: ['Motion Graphics', 'VFX Rendering', '4K/8K Export', 'Scene Composition']
    },
    {
      id: 'image',
      title: 'Image Generator',
      icon: <Image className="w-8 h-8" />,
      gradient: 'from-green-600 to-emerald-600',
      description: 'Create stunning visual artwork',
      features: ['Style Transfer', 'HD Upscaling', 'Art Generation', 'Photo Enhancement']
    },
    {
      id: 'voice',
      title: 'Voice Synthesis',
      icon: <Mic className="w-8 h-8" />,
      gradient: 'from-orange-600 to-red-600',
      description: 'Advanced speech and voice generation',
      features: ['Voice Cloning', 'Multi-Language', 'Emotion Control', 'Narration']
    }
  ];

  const modelPowers = [
    { name: 'DeepSeek R1', power: 'Advanced reasoning', status: 'active' },
    { name: 'Stable Diffusion XL', power: 'Image generation', status: 'active' },
    { name: 'MusicGen Large', power: 'Music composition', status: 'active' },
    { name: 'Whisper Large', power: 'Speech processing', status: 'active' }
  ];

  // Check for voice-triggered navigation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === 'true') {
      const type = params.get('type') || 'video';
      setActiveTab(type);
      setVoiceTriggered(true);
      setIsGenerating(true);
      setProgress(10);
      
      // Simulate generation
      let currentProgress = 10;
      const interval = setInterval(() => {
        currentProgress += 15;
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setProgress(0);
        }
      }, 500);
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="particles-bg" />
      
      {/* Voice Command Success Banner */}
      {voiceTriggered && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600/90 text-white px-6 py-3 rounded-xl backdrop-blur-sm border border-green-400/30"
        >
          ✓ Voice Command Executed Successfully! Create Studio is now open.
        </motion.div>
      )}
      
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
              <h1 className="text-4xl font-bold text-gradient mb-2">Creative Studio</h1>
              <p className="text-white/70">Create from scratch or enhance your existing content with AI intelligence</p>
            </div>
            
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="glass-card px-4 py-2 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-green-400" />
                <span className="text-sm text-white">99.8% Profit Margin</span>
              </div>
              <div className="glass-card px-4 py-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-white">10-1500x Faster</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Creation Tool Tabs */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {creationTools.map((tool, index) => (
              <motion.button
                key={tool.id}
                className={`feature-card text-left transition-all duration-300 ${
                  activeTab === tool.id ? 'ring-2 ring-purple-400' : ''
                }`}
                onClick={() => setActiveTab(tool.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${tool.gradient} mb-4 shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {tool.icon}
                </motion.div>
                
                <h3 className="text-xl font-bold text-white mb-2">{tool.title}</h3>
                <p className="text-white/70 text-sm mb-4">{tool.description}</p>
                
                <div className="space-y-1">
                  {tool.features.slice(0, 2).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                      <div className="w-1 h-1 bg-purple-400 rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Active Creation Interface */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="glass-card p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Panel - Controls */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    className={`p-3 rounded-xl bg-gradient-to-r ${
                      creationTools.find(t => t.id === activeTab)?.gradient
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {creationTools.find(t => t.id === activeTab)?.icon}
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {creationTools.find(t => t.id === activeTab)?.title}
                    </h2>
                    <p className="text-white/60">Professional AI-powered creation</p>
                  </div>
                </div>

                {/* Creation Form */}
                <div className="space-y-6">
                  <div className="form-floating">
                    <input
                      type="text"
                      id="prompt"
                      placeholder=" "
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-purple-400 focus:outline-none transition-all duration-300"
                    />
                    <label htmlFor="prompt" className="text-white/60">
                      {activeTab === 'audio' && 'Describe your music or audio...'}
                      {activeTab === 'video' && 'Describe your video concept...'}
                      {activeTab === 'image' && 'Describe your image idea...'}
                      {activeTab === 'voice' && 'Enter text for voice synthesis...'}
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-floating">
                      <select className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-purple-400 focus:outline-none">
                        <option value="professional">Professional</option>
                        <option value="creative">Creative</option>
                        <option value="experimental">Experimental</option>
                      </select>
                      <label className="text-white/60">Style</label>
                    </div>
                    
                    <div className="form-floating">
                      <select className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-purple-400 focus:outline-none">
                        <option value="high">High Quality</option>
                        <option value="ultra">Ultra HD</option>
                        <option value="max">Maximum</option>
                      </select>
                      <label className="text-white/60">Quality</label>
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <motion.div 
                    className="glass-card p-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Advanced Settings
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Duration</span>
                        <span className="text-purple-400">3:00</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Format</span>
                        <span className="text-purple-400">MP4/WAV</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Resolution</span>
                        <span className="text-purple-400">4K</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Credits</span>
                        <span className="text-green-400">2-5</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Generation Button */}
                  <motion.button
                    className="w-full btn-primary py-4 text-lg font-semibold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsGenerating(!isGenerating)}
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Brain className="w-6 h-6" />
                        </motion.div>
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Wand2 className="w-6 h-6" />
                        Create with AI
                      </span>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Right Panel - Preview/Output */}
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Eye className="w-6 h-6" />
                  Preview & Output
                </h3>

                <div className="glass-card p-6 min-h-[400px] flex items-center justify-center">
                  {isGenerating ? (
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="w-20 h-20 border-4 border-purple-400/30 border-t-purple-400 rounded-full mx-auto mb-6"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <h4 className="text-white font-semibold mb-2">AI Processing</h4>
                      <p className="text-white/60 mb-4">Creating your content with neural intelligence</p>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "75%" }}
                          transition={{ duration: 3 }}
                        />
                      </div>
                      <p className="text-sm text-white/60 mt-2">75% Complete</p>
                    </motion.div>
                  ) : (
                    <div className="text-center">
                      <motion.div
                        className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Camera className="w-8 h-8 text-white" />
                      </motion.div>
                      <h4 className="text-white font-semibold mb-2">Ready to Create</h4>
                      <p className="text-white/60">Your AI-generated content will appear here</p>
                    </div>
                  )}
                </div>

                {/* Output Controls */}
                <div className="flex gap-3 mt-6">
                  <motion.button
                    className="flex-1 glass-card py-3 px-4 text-white hover:bg-white/10 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm">Download</span>
                  </motion.button>
                  
                  <motion.button
                    className="flex-1 glass-card py-3 px-4 text-white hover:bg-white/10 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Upload className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm">Share</span>
                  </motion.button>
                  
                  <motion.button
                    className="flex-1 glass-card py-3 px-4 text-white hover:bg-white/10 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Globe className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm">Marketplace</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* AI Models Status */}
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Brain className="w-6 h-6" />
            AI Intelligence Models
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modelPowers.map((model, index) => (
              <motion.div
                key={index}
                className="glass-card p-4 hover:bg-white/5 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-sm">{model.name}</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
                <p className="text-white/60 text-xs">{model.power}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}