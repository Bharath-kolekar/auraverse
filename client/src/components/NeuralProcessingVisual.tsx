import React from 'react';
import { motion } from 'framer-motion';

export default function NeuralProcessingVisual() {
  return (
    <div className="relative w-full h-64 overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Background neural mesh */}
        <defs>
          <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(138, 43, 226, 0.3)" />
            <stop offset="50%" stopColor="rgba(0, 255, 255, 0.2)" />
            <stop offset="100%" stopColor="rgba(138, 43, 226, 0.3)" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Neural pathway lines */}
        <motion.path
          d="M 0 100 Q 100 50 200 100 T 400 100"
          stroke="url(#neuralGrad)"
          strokeWidth="3"
          fill="none"
          filter="url(#glow)"
          strokeDasharray="10 5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1, 0],
            opacity: [0, 1, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.path
          d="M 0 120 Q 150 80 300 120 T 400 120"
          stroke="rgba(0, 255, 255, 0.6)"
          strokeWidth="2"
          fill="none"
          filter="url(#glow)"
          strokeDasharray="8 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1, 0],
            opacity: [0, 0.8, 0.2]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            delay: 1,
            ease: "easeInOut"
          }}
        />
        
        <motion.path
          d="M 0 80 Q 80 40 160 80 T 400 80"
          stroke="rgba(138, 43, 226, 0.5)"
          strokeWidth="2"
          fill="none"
          filter="url(#glow)"
          strokeDasharray="6 3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1, 0],
            opacity: [0, 0.6, 0.1]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            delay: 2,
            ease: "easeInOut"
          }}
        />
        
        {/* Neural nodes */}
        {[
          { x: 50, y: 100, delay: 0 },
          { x: 150, y: 80, delay: 0.3 },
          { x: 250, y: 120, delay: 0.6 },
          { x: 350, y: 100, delay: 0.9 },
          { x: 100, y: 60, delay: 1.2 },
          { x: 300, y: 140, delay: 1.5 }
        ].map((node, index) => (
          <motion.g key={index}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="6"
              fill="rgba(138, 43, 226, 0.7)"
              filter="url(#glow)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.5, 1],
                opacity: [0, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: node.delay,
                ease: "easeInOut"
              }}
            />
            
            {/* Data pulses from nodes */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="3"
              fill="rgba(0, 255, 255, 0.9)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 2, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: node.delay + 0.5,
                ease: "easeOut"
              }}
            />
          </motion.g>
        ))}
        
        {/* Floating data particles */}
        {Array.from({ length: 8 }).map((_, index) => (
          <motion.circle
            key={`particle-${index}`}
            cx={0}
            cy={100 + Math.sin(index) * 30}
            r="2"
            fill="rgba(0, 255, 255, 0.8)"
            initial={{ x: -10 }}
            animate={{
              x: [0, 420],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: index * 0.5,
              ease: "linear"
            }}
          />
        ))}
      </svg>
      
      {/* Text overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <motion.h3
            className="text-2xl font-bold text-white mb-2"
            animate={{ 
              textShadow: [
                "0 0 10px rgba(138, 43, 226, 0.5)",
                "0 0 20px rgba(138, 43, 226, 0.8)",
                "0 0 10px rgba(138, 43, 226, 0.5)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Neural Processing Active
          </motion.h3>
          <motion.p
            className="text-sm text-white/70"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Advanced AI algorithms optimizing your content
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}