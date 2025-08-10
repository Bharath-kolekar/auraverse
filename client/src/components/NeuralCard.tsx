import React from 'react';
import { motion } from 'framer-motion';

interface NeuralCardProps {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
}

export default function NeuralCard({ children, className = "", isActive = false }: NeuralCardProps) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Neural circuit overlay */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20" 
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Circuit traces */}
        <motion.path
          d="M 0 20 L 25 20 L 25 40 L 50 40 L 50 20 L 75 20 L 75 60 L 100 60"
          stroke="rgba(138, 43, 226, 0.5)"
          strokeWidth="0.5"
          fill="none"
          strokeDasharray="2 1"
          initial={{ pathLength: 0 }}
          animate={isActive ? { pathLength: [0, 1, 0] } : { pathLength: 0.3 }}
          transition={{
            duration: 3,
            repeat: isActive ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
        
        <motion.path
          d="M 0 80 L 30 80 L 30 60 L 70 60 L 70 80 L 100 80"
          stroke="rgba(0, 255, 255, 0.4)"
          strokeWidth="0.5"
          fill="none"
          strokeDasharray="1 2"
          initial={{ pathLength: 0 }}
          animate={isActive ? { pathLength: [0, 1, 0] } : { pathLength: 0.2 }}
          transition={{
            duration: 4,
            repeat: isActive ? Infinity : 0,
            delay: 1,
            ease: "easeInOut"
          }}
        />
        
        {/* Circuit nodes */}
        {[20, 40, 60, 80].map((x, index) => (
          <motion.circle
            key={x}
            cx={x}
            cy="40"
            r="1"
            fill="rgba(138, 43, 226, 0.7)"
            initial={{ scale: 0 }}
            animate={isActive ? {
              scale: [0.5, 1.2, 0.5],
              opacity: [0.5, 1, 0.5]
            } : { scale: 0.8 }}
            transition={{
              duration: 2,
              repeat: isActive ? Infinity : 0,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
      
      {/* Glowing edge effect */}
      <motion.div
        className="absolute inset-0 rounded-lg border border-purple-500/20"
        animate={isActive ? {
          boxShadow: [
            "0 0 10px rgba(138, 43, 226, 0.2)",
            "0 0 20px rgba(138, 43, 226, 0.4)",
            "0 0 10px rgba(138, 43, 226, 0.2)"
          ]
        } : {}}
        transition={{
          duration: 2,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Processing indicator */}
      {isActive && (
        <motion.div
          className="absolute top-2 right-2 w-3 h-3 bg-cyan-400 rounded-full"
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
}