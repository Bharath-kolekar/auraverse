import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Upload, Zap, Download, Play, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { FixedNavigation } from '@/components/ui/fixed-navigation';
// VideoPlayer component will be created if needed

export default function VideoProduction() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'video',
          prompt,
          quality: 'hd',
          duration: 30
        })
      });
      
      const result = await response.json();
      if (result.url) {
        setGeneratedVideo(result.url);
      }
    } catch (error) {
      console.error('Video generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="particles-bg" />
      <FixedNavigation currentPath="/video-production" />
      
      <div className="container mx-auto px-6 py-24 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Video Production Studio</h1>
          </div>
          <p className="text-xl text-purple-300 max-w-2xl mx-auto">
            Create professional quality videos with advanced AI processing and professional standards compliance
          </p>
        </motion.div>

        {/* Video Generation Section */}
        <motion.div 
          className="glass-card p-8 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Generate Professional Video</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-3">Video Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the video you want to create..."
                className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-white/50 focus:border-purple-500 focus:outline-none min-h-[120px]"
              />
            </div>
            
            <motion.button
              onClick={handleGenerateVideo}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-spin inline" />
                  Generating Professional Video...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-5 w-5 inline" />
                  Generate Video
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Video Display */}
        {generatedVideo && (
          <motion.div 
            className="glass-card p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-white mb-4">Generated Video</h3>
            <div className="bg-black/30 rounded-lg p-8 text-center">
              <Video className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-white">Video: {generatedVideo}</p>
              <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                <Play className="w-4 h-4 mr-2 inline" />
                Play Video
              </button>
            </div>
            
            <div className="mt-6 flex gap-4">
              <motion.button
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = generatedVideo;
                  link.download = 'generated-video.mp4';
                  link.click();
                }}
              >
                <Download className="w-4 h-4" />
                Download
              </motion.button>
              
              <motion.button
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Upload className="w-4 h-4" />
                Share to Marketplace
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="glass-card p-6 text-center">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Fast Processing</h3>
            <p className="text-white/70">Generate videos in seconds with optimized AI</p>
          </div>
          
          <div className="glass-card p-6 text-center">
            <Video className="w-8 h-8 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">HD Quality</h3>
            <p className="text-white/70">Professional quality output with industry standards</p>
          </div>
          
          <div className="glass-card p-6 text-center">
            <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">AI Enhanced</h3>
            <p className="text-white/70">Advanced AI processing for superior results</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}