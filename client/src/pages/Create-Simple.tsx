import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Upload, Zap, Download, Play, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { FixedNavigation } from '@/components/ui/fixed-navigation';
import { VideoCanvas } from '@/components/video/VideoCanvas';
import { PredictivePrompt } from '@/components/PredictivePrompt';

export default function VideoProduction() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<any>(null);

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
      if (result.url || result.metadata) {
        setGeneratedVideo(result);
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
              <PredictivePrompt
                value={prompt}
                onChange={setPrompt}
                placeholder="Describe the video you want to create..."
                contentType="video"
                onSubmit={handleGenerateVideo}
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

        {/* Video Production Results */}
        {generatedVideo && (
          <motion.div 
            className="glass-card p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-white mb-4">Video Production Package</h3>
            
            {/* Animated Video Display */}
            <div className="mb-6">
              <VideoCanvas 
                prompt={generatedVideo.metadata?.prompt || prompt}
                duration={5}
              />
            </div>
            
            {/* Preview Frame */}
            {generatedVideo.url && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-purple-300 mb-3">Preview Frame</h4>
                <div className="rounded-lg overflow-hidden border border-purple-500/30">
                  <img 
                    src={generatedVideo.url} 
                    alt="Video preview frame"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}

            {/* Storyboard */}
            {generatedVideo.metadata?.storyboard && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-purple-300 mb-3">Storyboard</h4>
                <div className="rounded-lg overflow-hidden border border-purple-500/30">
                  <img 
                    src={generatedVideo.metadata.storyboard} 
                    alt="Video storyboard"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}

            {/* Production Details */}
            <div className="bg-black/30 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-purple-300 mb-4">Production Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60 text-sm">Duration</p>
                  <p className="text-white">{generatedVideo.metadata?.duration || 30} seconds</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Quality</p>
                  <p className="text-white">{generatedVideo.metadata?.quality || 'HD'}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">AI Model</p>
                  <p className="text-white">{generatedVideo.metadata?.model || 'Advanced AI'}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Status</p>
                  <p className="text-green-400">Production Plan Ready</p>
                </div>
              </div>

              {/* Production Plan Summary */}
              {generatedVideo.metadata?.productionPlan && (
                <div className="mt-4 pt-4 border-t border-purple-500/30">
                  <p className="text-white/60 text-sm mb-2">Production Plan</p>
                  <div className="bg-purple-600/10 rounded p-3">
                    <p className="text-purple-300 text-sm">
                      Complete production plan with scene breakdowns, technical specifications, and artistic direction has been generated.
                    </p>
                  </div>
                </div>
              )}

              {/* AI Enhancements */}
              {generatedVideo.metadata?.aiEnhancements && (
                <div className="mt-4 pt-4 border-t border-purple-500/30">
                  <p className="text-white/60 text-sm mb-2">AI Enhancements Applied</p>
                  <div className="flex flex-wrap gap-2">
                    {generatedVideo.metadata.aiEnhancements.map((enhancement: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full">
                        {enhancement.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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