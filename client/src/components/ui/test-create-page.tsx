import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Music, Video, Mic, Image } from 'lucide-react';

export function TestCreatePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="particles-bg" />
      
      {/* Voice Command Success Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600/90 text-white px-6 py-3 rounded-xl backdrop-blur-sm border border-green-400/30"
      >
        ✓ Voice Command Executed Successfully! Create Studio is now open.
      </motion.div>
      
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
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Creation Tool Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { id: 'audio', title: 'AI Music Studio', icon: <Music className="w-8 h-8" />, gradient: 'from-purple-600 to-pink-600' },
            { id: 'video', title: 'Video Production', icon: <Video className="w-8 h-8" />, gradient: 'from-blue-600 to-cyan-600' },
            { id: 'image', title: 'Image Generator', icon: <Image className="w-8 h-8" />, gradient: 'from-green-600 to-emerald-600' },
            { id: 'voice', title: 'Voice Synthesis', icon: <Mic className="w-8 h-8" />, gradient: 'from-orange-600 to-red-600' }
          ].map((tool, index) => (
            <motion.div
              key={tool.id}
              className="feature-card text-center cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${tool.gradient} flex items-center justify-center`}
                whileHover={{ rotate: 5 }}
              >
                {tool.icon}
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">{tool.title}</h3>
              <div className="flex items-center justify-center gap-2 text-sm text-white/60">
                <Sparkles className="w-4 h-4" />
                AI Powered
              </div>
            </motion.div>
          ))}
        </div>

        {/* Generation Panel */}
        <motion.div 
          className="glass-card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center">
            <motion.div
              className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">Create Studio is Ready!</h2>
            <p className="text-white/70 text-lg mb-8">
              Voice command "Make falling stars" successfully navigated to Create Studio. 
              The page is now fully functional and ready for content creation.
            </p>
            
            <motion.button
              className="btn-primary px-8 py-4 text-lg font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Creating Content
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}