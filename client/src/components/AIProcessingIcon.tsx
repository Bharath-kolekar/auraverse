import React from 'react';
import { motion } from 'framer-motion';

interface AIProcessingIconProps {
  size?: number;
  color?: string;
  isProcessing?: boolean;
}

export default function AIProcessingIcon({ 
  size = 24, 
  color = "rgba(138, 43, 226, 0.8)",
  isProcessing = false 
}: AIProcessingIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className="ai-processing-icon"
    >
      {/* Central brain/processor core */}
      <motion.circle
        cx="12"
        cy="12"
        r="3"
        fill={color}
        initial={{ scale: 1 }}
        animate={isProcessing ? { 
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        } : {}}
        transition={{
          duration: 1.5,
          repeat: isProcessing ? Infinity : 0,
          ease: "easeInOut"
        }}
      />
      
      {/* Neural connections radiating outward */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => {
        const radians = (angle * Math.PI) / 180;
        const x1 = 12 + Math.cos(radians) * 4;
        const y1 = 12 + Math.sin(radians) * 4;
        const x2 = 12 + Math.cos(radians) * 8;
        const y2 = 12 + Math.sin(radians) * 8;
        
        return (
          <motion.line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth="1.5"
            initial={{ opacity: 0.3 }}
            animate={isProcessing ? {
              opacity: [0.3, 1, 0.3],
              strokeWidth: [1.5, 2.5, 1.5]
            } : {}}
            transition={{
              duration: 2,
              repeat: isProcessing ? Infinity : 0,
              delay: index * 0.1,
              ease: "easeInOut"
            }}
          />
        );
      })}
      
      {/* Outer nodes */}
      {[0, 72, 144, 216, 288].map((angle, index) => {
        const radians = (angle * Math.PI) / 180;
        const x = 12 + Math.cos(radians) * 9;
        const y = 12 + Math.sin(radians) * 9;
        
        return (
          <motion.circle
            key={angle}
            cx={x}
            cy={y}
            r="1.5"
            fill={color}
            initial={{ scale: 0.8 }}
            animate={isProcessing ? {
              scale: [0.8, 1.3, 0.8],
              opacity: [0.6, 1, 0.6]
            } : {}}
            transition={{
              duration: 1.8,
              repeat: isProcessing ? Infinity : 0,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
          />
        );
      })}
      
      {/* Data flow particles */}
      {isProcessing && [0, 120, 240].map((angle, index) => {
        const radians = (angle * Math.PI) / 180;
        
        return (
          <motion.circle
            key={`particle-${angle}`}
            cx="12"
            cy="12"
            r="0.8"
            fill="rgba(0, 255, 255, 0.9)"
            initial={{ 
              x: Math.cos(radians) * 3,
              y: Math.sin(radians) * 3,
              opacity: 0 
            }}
            animate={{
              x: [
                Math.cos(radians) * 3,
                Math.cos(radians) * 7,
                Math.cos(radians) * 3
              ],
              y: [
                Math.sin(radians) * 3,
                Math.sin(radians) * 7,
                Math.sin(radians) * 3
              ],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: index * 0.3,
              ease: "easeInOut"
            }}
          />
        );
      })}
    </svg>
  );
}