import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Music, Video, Mic, Image, Download, Cpu, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { FixedNavigation } from './fixed-navigation';
import { VideoPlayer } from './video-player';

interface ContentGenerationRequest {
  type: 'video' | 'audio' | 'image' | 'voice' | 'vfx';
  prompt: string;
  style?: string;
  duration?: number;
  quality?: 'standard' | 'hd' | 'ultra';
}

interface ContentGenerationResult {
  id: string;
  type: string;
  status: 'generating' | 'completed' | 'failed';
  progress: number;
  url?: string;
  metadata?: any;
  error?: string;
}

export function RealCreateStudio() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('video');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [quality, setQuality] = useState<'standard' | 'hd' | 'ultra'>('hd');
  const [duration, setDuration] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJob, setCurrentJob] = useState<ContentGenerationResult | null>(null);
  const [generatedContent, setGeneratedContent] = useState<ContentGenerationResult[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Real-time progress polling
  useEffect(() => {
    if (currentJob && currentJob.status === 'generating') {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/ai/status/${currentJob.id}`, {
            credentials: 'include'
          });
          const status: ContentGenerationResult = await response.json();
          setCurrentJob(status);
          
          if (status.status === 'completed') {
            setIsGenerating(false);
            setGeneratedContent(prev => [...prev, status]);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
            clearInterval(pollInterval);
          } else if (status.status === 'failed') {
            setIsGenerating(false);
            console.error('Generation failed:', status.error);
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error('Error polling status:', error);
          clearInterval(pollInterval);
        }
      }, 1000);

      return () => clearInterval(pollInterval);
    }
  }, [currentJob]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt for content generation');
      return;
    }

    setIsGenerating(true);
    setCurrentJob(null);

    try {
      const request: ContentGenerationRequest = {
        type: activeTab as any,
        prompt: prompt.trim(),
        style,
        quality,
        duration: activeTab === 'audio' ? duration * 2 : duration
      };

      console.log('Starting real AI generation:', request);
      
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        throw new Error('Failed to start generation');
      }
      
      const result: ContentGenerationResult = await response.json();
      setCurrentJob(result);
      
    } catch (error) {
      console.error('Generation error:', error);
      setIsGenerating(false);
      alert('Failed to start generation. Please try again.');
    }
  };

  const handleDownload = async (content: ContentGenerationResult) => {
    if (!content.url) return;
    
    if (content.type === 'voice' && content.url.startsWith('data:audio')) {
      // Handle base64 audio download
      const link = document.createElement('a');
      link.href = content.url;
      link.download = `voice_${content.id}.mp3`;
      link.click();
    } else if (content.type === 'video' && content.metadata?.downloadable) {
      // Handle procedural video download - will be handled by VideoPlayer component
      const event = new CustomEvent('downloadVideo', { detail: content });
      window.dispatchEvent(event);
    } else if (content.url.startsWith('data:image/svg+xml')) {
      // Handle SVG downloads
      const link = document.createElement('a');
      link.href = content.url;
      link.download = `${content.type}_${content.id}.svg`;
      link.click();
    } else {
      // Handle regular image URLs
      const link = document.createElement('a');
      link.href = content.url;
      link.download = `${content.type}_${content.id}.${content.type === 'image' ? 'png' : 'jpg'}`;
      link.target = '_blank';
      link.click();
    }
  };

  const contentTypes = [
    {
      id: 'video',
      title: 'Video Production',
      icon: Video,
      description: 'Create cinematic videos with AI',
      color: 'from-red-600 to-pink-600'
    },
    {
      id: 'image',
      title: 'Image Generation',
      icon: Image,
      description: 'Generate stunning visuals',
      color: 'from-green-600 to-teal-600'
    },
    {
      id: 'audio',
      title: 'Music Studio',
      icon: Music,
      description: 'Compose original soundtracks',
      color: 'from-purple-600 to-indigo-600'
    },
    {
      id: 'voice',
      title: 'Voice Synthesis',
      icon: Mic,
      description: 'Generate natural speech',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'vfx',
      title: 'VFX Laboratory',
      icon: Zap,
      description: 'Create visual effects',
      color: 'from-orange-600 to-red-600'
    }
  ];

  const qualityOptions = [
    { value: 'standard', label: 'Standard', description: 'Fast generation' },
    { value: 'hd', label: 'HD', description: 'High quality' },
    { value: 'ultra', label: 'Ultra', description: 'Maximum quality' }
  ];

  const styleOptions = {
    video: ['cinematic', 'documentary', 'commercial', 'artistic', 'corporate'],
    image: ['photorealistic', 'artistic', 'concept art', 'portrait', 'landscape'],
    audio: ['cinematic', 'electronic', 'orchestral', 'ambient', 'epic'],
    voice: ['professional', 'casual', 'dramatic', 'narrative', 'commercial'],
    vfx: ['realistic', 'fantasy', 'sci-fi', 'horror', 'abstract']
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="particles-bg" />
      <FixedNavigation currentPath="/create" />
      
      <div className="container mx-auto px-6 py-24 relative z-10">
        {/* Development Mode Header */}
        <motion.div 
          className="glass-card p-6 mb-8 border border-purple-500/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">AI Create Studio</h1>
                <p className="text-purple-300">Hybrid AI system: OpenAI when available, local processing as fallback</p>
              </div>
            </div>
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-4 py-2">
              <span className="text-blue-400 font-semibold">⚡ Hybrid AI Mode</span>
            </div>
          </div>
        </motion.div>

        {/* Content Type Selection */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Choose Content Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {contentTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <motion.button
                  key={type.id}
                  className={`glass-card p-6 text-center transition-all duration-300 ${
                    activeTab === type.id 
                      ? 'border-purple-500/50 bg-purple-500/10' 
                      : 'hover:border-purple-500/30 hover:bg-white/5'
                  }`}
                  onClick={() => setActiveTab(type.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${type.color} mb-4`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{type.title}</h3>
                  <p className="text-white/70 text-sm">{type.description}</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Generation Controls */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Input Panel */}
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-white mb-6">Generation Settings</h3>
            
            {/* Prompt Input */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-3">Describe what you want to create:</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Enter your ${activeTab} prompt... (e.g., "A rocket launching from Earth with spectacular visual effects and dramatic lighting")`}
                className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/50 focus:border-purple-500 focus:outline-none resize-none"
                rows={4}
                disabled={isGenerating}
              />
            </div>

            {/* Style Selection */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-3">Style:</label>
              <div className="grid grid-cols-2 gap-3">
                {styleOptions[activeTab as keyof typeof styleOptions]?.map((styleOption) => (
                  <button
                    key={styleOption}
                    onClick={() => setStyle(styleOption)}
                    className={`p-3 rounded-lg border transition-all ${
                      style === styleOption
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-black/30 border-white/10 text-white/70 hover:border-purple-500/50'
                    }`}
                    disabled={isGenerating}
                  >
                    {styleOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Selection */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-3">Quality:</label>
              <div className="grid grid-cols-3 gap-3">
                {qualityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setQuality(option.value as any)}
                    className={`p-3 rounded-lg border transition-all ${
                      quality === option.value
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-black/30 border-white/10 text-white/70 hover:border-purple-500/50'
                    }`}
                    disabled={isGenerating}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs opacity-70">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration for audio/video */}
            {(activeTab === 'audio' || activeTab === 'video') && (
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">
                  Duration: {duration} seconds
                </label>
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                  disabled={isGenerating}
                />
              </div>
            )}

            {/* Generate Button */}
            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all ${
                isGenerating || !prompt.trim()
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              }`}
              whileHover={!isGenerating && prompt.trim() ? { scale: 1.02 } : {}}
              whileTap={!isGenerating && prompt.trim() ? { scale: 0.98 } : {}}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating {activeTab}...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate {activeTab}
                </>
              )}
            </motion.button>
          </div>

          {/* Status Panel */}
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-white mb-6">Generation Status</h3>
            
            {currentJob ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Job ID: {currentJob.id}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    currentJob.status === 'generating' ? 'bg-blue-500/20 text-blue-400' :
                    currentJob.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {currentJob.status.toUpperCase()}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="bg-black/30 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${currentJob.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                <p className="text-white/70">{currentJob.progress}% complete</p>

                {currentJob.status === 'completed' && currentJob.url && (
                  <div className="space-y-4">
                    {/* Preview */}
                    <div className="bg-black/30 rounded-xl p-4">
                      {currentJob.type === 'voice' && currentJob.url.startsWith('data:audio') ? (
                        <audio controls autoPlay className="w-full">
                          <source src={currentJob.url} type="audio/mp3" />
                        </audio>
                      ) : currentJob.type === 'video' && currentJob.metadata?.autoplay ? (
                        <div className="space-y-4">
                          <VideoPlayer 
                            videoData={currentJob.url}
                            thumbnail={currentJob.metadata.thumbnail}
                            duration={currentJob.metadata.duration}
                            prompt={currentJob.metadata.prompt}
                          />
                        </div>
                      ) : (
                        <img 
                          src={currentJob.metadata?.thumbnail || currentJob.url} 
                          alt="Generated content"
                          className="w-full rounded-lg max-h-64 object-cover"
                        />
                      )}
                    </div>

                    {/* Metadata */}
                    {currentJob.metadata && (
                      <div className="bg-black/30 rounded-xl p-4">
                        <h4 className="text-white font-semibold mb-2">Generation Details:</h4>
                        <div className="text-white/70 text-sm space-y-1">
                          <p><strong>Model:</strong> {currentJob.metadata.model}</p>
                          <p><strong>Mode:</strong> {currentJob.metadata.mode === 'openai' ? '🌐 OpenAI' : '🔧 Local Processing'}</p>
                          <p><strong>Quality:</strong> {quality}</p>
                          <p><strong>Style:</strong> {style}</p>
                          {currentJob.metadata.note && (
                            <p><strong>Info:</strong> {currentJob.metadata.note}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => handleDownload(currentJob)}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </motion.button>
                      
                      <motion.button
                        onClick={() => {
                          setCurrentJob(null);
                          setPrompt('');
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Sparkles className="w-4 h-4" />
                        Create Another
                      </motion.button>
                    </div>
                  </div>
                )}

                {currentJob.status === 'failed' && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400 font-semibold">Generation Failed</p>
                    <p className="text-red-300 text-sm">{currentJob.error}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-white/50 py-8">
                <Cpu className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Ready for AI generation</p>
                <p className="text-sm">Enter a prompt and click generate to start</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Success Animation */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              className="fixed top-20 right-6 glass-card p-6 border border-green-500/30 z-50"
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold">Generation Complete!</h4>
                  <p className="text-green-400 text-sm">Your {activeTab} has been created successfully</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}