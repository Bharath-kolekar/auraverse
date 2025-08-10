import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Sparkles, Music, Video, Mic, Image, Home, Globe, Eye, Brain } from 'lucide-react';

interface NavigationProps {
  currentPath?: string;
}

export function FixedNavigation({ currentPath = '/' }: NavigationProps) {
  const [location, setLocation] = useLocation();

  const navigationItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/create', label: 'Create Studio', icon: Sparkles },
    { path: '/video-production', label: 'Video Production', icon: Video },
    { path: '/gallery', label: 'Gallery', icon: Eye },
    { path: '/marketplace', label: 'Marketplace', icon: Globe },
    { path: '/intelligence', label: 'Intelligence', icon: Brain }
  ];

  const handleNavigation = (path: string, label: string) => {
    console.log(`Navigation clicked: ${label} -> ${path}`);
    
    // Use wouter's setLocation for proper client-side routing
    setLocation(path);
    
    console.log(`Navigation initiated to: ${path}`);
  };

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <motion.div
        className="flex items-center gap-2 glass-morphism px-4 py-3 rounded-2xl border border-white/10"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {navigationItems.map((item, index) => {
          const IconComponent = item.icon;
          const isActive = location === item.path || currentPath === item.path;
          
          return (
            <motion.button
              key={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigation(item.path, item.label)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">{item.label}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </nav>
  );
}