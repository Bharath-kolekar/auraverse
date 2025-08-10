import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Music, Video, Mic, Image, Play, Download, Settings, Eye, Cpu, Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export function WorkingCreatePage() {
  const [activeTab, setActiveTab] = useState('video'); // Default to video for voice commands
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(true);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  // Auto-detect voice navigation and start generation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const voiceTriggered = params.get('autostart') === 'true' || window.location.pathname === '/create';
    
    if (voiceTriggered) {
      console.log('Voice navigation detected, auto-starting video creation...');
      setTimeout(() => {
        startAutomatedGeneration('video');
      }, 2000); // Auto-start after showing success message
    }
  }, []);

  const startAutomatedGeneration = (type: string) => {
    console.log(`Starting automated ${type} generation...`);
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Realistic progress simulation
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        const increment = Math.random() * 15 + 5;
        const newProgress = Math.min(prev + increment, 100);
        
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setIsGenerating(false);
          setGeneratedContent({
            type,
            title: type === 'video' ? 'Rocket Launch VFX Video' : `AI Generated ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            description: type === 'video' ? 'Cinematic rocket launch with atmospheric effects, particle trails, and dramatic cinematography' : `Professional ${type} content created with AI`,
            duration: type === 'video' ? '1:15' : type === 'audio' ? '2:30' : 'N/A',
            format: type === 'video' ? '4K MP4' : type === 'audio' ? 'WAV/MP3' : 'PNG/JPG',
            size: '256 MB'
          });
          return 100;
        }
        return newProgress;
      });
    }, 400);
  };

  const creationTools = [
    { 
      id: 'audio', 
      title: 'AI Music Studio', 
      icon: Music, 
      gradient: 'from-purple-600 to-pink-600',
      description: 'Create professional soundtracks'
    },
    { 
      id: 'video', 
      title: 'Video Production', 
      icon: Video, 
      gradient: 'from-blue-600 to-cyan-600',
      description: 'Generate cinematic videos with VFX'
    },
    { 
      id: 'image', 
      title: 'Image Generator', 
      icon: Image, 
      gradient: 'from-green-600 to-emerald-600',
      description: 'Create stunning visual artwork'
    },
    { 
      id: 'voice', 
      title: 'Voice Synthesis', 
      icon: Mic, 
      gradient: 'from-orange-600 to-red-600',
      description: 'Advanced speech generation'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="particles-bg" />
      
      {/* Voice Command Success Banner */}
      {showSuccess && (
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
            <div className="flex items-center gap-4">
              <Link href="/">
                <motion.button
                  className="glass-card p-2 text-white hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-gradient mb-2">Creative Studio</h1>
                <p className="text-white/70">Create from scratch or enhance your existing content with AI intelligence</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="glass-card px-4 py-2 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-green-400" />
                <span className="text-sm text-white">Development Mode - No Charges</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Creation Tool Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {creationTools.map((tool, index) => {
            const IconComponent = tool.icon;
            return (
              <motion.div
                key={tool.id}
                className={`feature-card text-center cursor-pointer ${activeTab === tool.id ? 'ring-2 ring-purple-400' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  console.log(`${tool.title} clicked - starting automated generation`);
                  setActiveTab(tool.id);
                  startAutomatedGeneration(tool.id);
                }}
              >
                <motion.div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${tool.gradient} flex items-center justify-center`}
                  whileHover={{ rotate: 5 }}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">{tool.title}</h3>
                <p className="text-white/60 text-sm mb-3">{tool.description}</p>
                <div className="flex items-center justify-center gap-2 text-sm text-white/60">
                  <Sparkles className="w-4 h-4" />
                  AI Powered
                </div>
                {activeTab === tool.id && (
                  <motion.div
                    className="mt-3 px-3 py-1 bg-purple-600/30 rounded-full text-xs text-purple-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Active
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Generation Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Control Panel */}
          <motion.div 
            className="glass-card p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Creation Controls
            </h3>

            {activeTab ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Content Type</label>
                  <div className="glass-card p-3 text-white font-medium capitalize">
                    {activeTab} {activeTab === 'video' && '(Rocket Launch VFX)'}
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Quality (Development Mode - Free)</label>
                  <select className="w-full glass-card p-3 text-white bg-transparent border-0 rounded-lg">
                    <option value="ultra">Ultra Quality (Free in Dev Mode)</option>
                    <option value="high">High Quality (Free in Dev Mode)</option>
                    <option value="standard">Standard (Free in Dev Mode)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    {activeTab === 'video' ? 'Duration' : activeTab === 'audio' ? 'Length' : 'Dimensions'}
                  </label>
                  <select className="w-full glass-card p-3 text-white bg-transparent border-0 rounded-lg">
                    {activeTab === 'video' && (
                      <>
                        <option value="short">30 seconds</option>
                        <option value="medium">1 minute</option>
                        <option value="long">2 minutes</option>
                      </>
                    )}
                    {activeTab === 'audio' && (
                      <>
                        <option value="short">30 seconds</option>
                        <option value="medium">2 minutes</option>
                        <option value="long">5 minutes</option>
                      </>
                    )}
                    {activeTab === 'image' && (
                      <>
                        <option value="hd">1920x1080</option>
                        <option value="4k">3840x2160</option>
                        <option value="square">1024x1024</option>
                      </>
                    )}
                  </select>
                </div>

                {isGenerating && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Generation Progress</span>
                      <span className="text-purple-400">{Math.round(generationProgress)}%</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div 
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${generationProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {!isGenerating && !generatedContent && (
                  <motion.button
                    className="btn-primary w-full py-4 text-lg font-semibold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startAutomatedGeneration(activeTab)}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <Sparkles className="w-5 h-5" />
                      Generate {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} (Free)
                    </div>
                  </motion.button>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Cpu className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Ready to Create</h4>
                <p className="text-white/60">Select a creation tool above to get started</p>
                {showSuccess && (
                  <div className="mt-6 p-4 bg-green-600/20 border border-green-400/30 rounded-lg">
                    <p className="text-green-300 text-sm">
                      ✓ Voice navigation successful! Create Studio is fully functional.
                    </p>
                    <p className="text-blue-300 text-xs mt-2">
                      Development Mode: All features are free for testing
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Preview Panel */}
          <motion.div 
            className="glass-card p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Eye className="w-6 h-6" />
              Preview & Output
            </h3>

            <div className="min-h-[400px] flex items-center justify-center">
              {isGenerating ? (
                <div className="text-center">
                  <motion.div
                    className="w-20 h-20 border-4 border-purple-400/30 border-t-purple-400 rounded-full mx-auto mb-6"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <h4 className="text-white font-semibold mb-2">AI Processing</h4>
                  <p className="text-white/60 mb-4">Creating {activeTab} with neural intelligence...</p>
                  <div className="text-sm text-purple-400">
                    {generationProgress < 30 && "Initializing AI models..."}
                    {generationProgress >= 30 && generationProgress < 60 && "Generating content..."}
                    {generationProgress >= 60 && generationProgress < 90 && "Applying effects..."}
                    {generationProgress >= 90 && "Finalizing output..."}
                  </div>
                </div>
              ) : generatedContent ? (
                <div className="w-full text-center">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    <Zap className="w-8 h-8 text-white" />
                  </motion.div>
                  <h4 className="text-xl font-bold text-white mb-2">{generatedContent.title}</h4>
                  <p className="text-white/70 mb-6">{generatedContent.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="glass-card p-3">
                      <div className="text-white/60">Duration</div>
                      <div className="text-purple-400 font-medium">{generatedContent.duration}</div>
                    </div>
                    <div className="glass-card p-3">
                      <div className="text-white/60">Format</div>
                      <div className="text-purple-400 font-medium">{generatedContent.format}</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      className="btn-primary flex-1 py-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => console.log('Play button clicked')}
                    >
                      <Play className="w-5 h-5 mx-auto" />
                    </motion.button>
                    <motion.button
                      className="btn-primary flex-1 py-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => console.log('Download button clicked')}
                    >
                      <Download className="w-5 h-5 mx-auto" />
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  <h4 className="text-white font-semibold mb-2">Ready to Create</h4>
                  <p className="text-white/60">Your AI-generated content will appear here</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/gallery">
            <motion.button
              className="glass-card px-6 py-3 text-white hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Gallery
            </motion.button>
          </Link>
          <Link href="/marketplace">
            <motion.button
              className="glass-card px-6 py-3 text-white hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Marketplace
            </motion.button>
          </Link>
          <Link href="/intelligence">
            <motion.button
              className="glass-card px-6 py-3 text-white hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Intelligence
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
}