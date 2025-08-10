import React from 'react';
import { motion } from 'framer-motion';

interface NeuralSkullProps {
  size?: number;
  isActive?: boolean;
  showMagic?: boolean;
}

export default function NeuralSkull({ size = 32, isActive = false, showMagic = false }: NeuralSkullProps) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 32 32" 
        className="neural-skull-icon"
      >
        <defs>
          <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(138, 43, 226, 0.8)" />
            <stop offset="100%" stopColor="rgba(0, 255, 255, 0.6)" />
          </linearGradient>
          
          <filter id="magicGlow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Skull outline */}
        <motion.path
          d="M16 4 C10 4 6 8 6 14 C6 18 7 20 8 22 L12 26 L20 26 L24 22 C25 20 26 18 26 14 C26 8 22 4 16 4 Z"
          fill="none"
          stroke="url(#neuralGrad)"
          strokeWidth="1.5"
          filter={showMagic ? "url(#magicGlow)" : "none"}
          initial={{ pathLength: 0 }}
          animate={isActive ? { 
            pathLength: [0, 1],
            opacity: [0.6, 1, 0.6]
          } : { pathLength: 1 }}
          transition={{
            duration: 2,
            repeat: isActive ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
        
        {/* Neural circuit patterns in skull */}
        <motion.path
          d="M12 10 L14 12 L18 12 L20 10 M14 14 L18 14 M10 16 L12 18 L20 18 L22 16"
          stroke="rgba(138, 43, 226, 0.4)"
          strokeWidth="0.8"
          fill="none"
          strokeDasharray="1 1"
          animate={isActive ? {
            strokeDashoffset: [0, -4, 0],
            opacity: [0.4, 0.8, 0.4]
          } : {}}
          transition={{
            duration: 1.5,
            repeat: isActive ? Infinity : 0,
            ease: "linear"
          }}
        />
        
        {/* Eye sockets with neural nodes */}
        <motion.circle
          cx="12"
          cy="12"
          r="2"
          fill="rgba(138, 43, 226, 0.3)"
          stroke="rgba(138, 43, 226, 0.6)"
          strokeWidth="0.5"
          animate={isActive ? {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.7, 0.3]
          } : {}}
          transition={{
            duration: 1.8,
            repeat: isActive ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
        
        <motion.circle
          cx="20"
          cy="12"
          r="2"
          fill="rgba(0, 255, 255, 0.3)"
          stroke="rgba(0, 255, 255, 0.6)"
          strokeWidth="0.5"
          animate={isActive ? {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.7, 0.3]
          } : {}}
          transition={{
            duration: 1.8,
            repeat: isActive ? Infinity : 0,
            delay: 0.2,
            ease: "easeInOut"
          }}
        />
        
        {/* Central neural processor */}
        <motion.circle
          cx="16"
          cy="16"
          r="1.5"
          fill="rgba(138, 43, 226, 0.6)"
          animate={isActive ? {
            scale: [1, 1.4, 1],
            opacity: [0.6, 1, 0.6]
          } : {}}
          transition={{
            duration: 1,
            repeat: isActive ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
        
        {/* Magic sparkles when showMagic is true */}
        {showMagic && [
          { x: 8, y: 8, delay: 0 },
          { x: 24, y: 6, delay: 0.3 },
          { x: 6, y: 20, delay: 0.6 },
          { x: 26, y: 22, delay: 0.9 }
        ].map((sparkle, index) => (
          <motion.g key={index}>
            <motion.path
              d={`M${sparkle.x} ${sparkle.y-2} L${sparkle.x} ${sparkle.y+2} M${sparkle.x-2} ${sparkle.y} L${sparkle.x+2} ${sparkle.y}`}
              stroke="rgba(255, 215, 0, 0.8)"
              strokeWidth="0.8"
              strokeLinecap="round"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.2, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: sparkle.delay,
                ease: "easeInOut"
              }}
            />
          </motion.g>
        ))}
      </svg>
      
      {/* Processing indicator */}
      {isActive && (
        <motion.div
          className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full"
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
}