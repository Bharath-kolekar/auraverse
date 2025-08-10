import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function NeuralBackground() {
  const [nodes, setNodes] = useState<Array<{x: number, y: number, id: number}>>([]);
  
  useEffect(() => {
    // Generate random neural network nodes
    const generateNodes = () => {
      const nodeCount = 12;
      const newNodes = [];
      for (let i = 0; i < nodeCount; i++) {
        newNodes.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          id: i
        });
      }
      setNodes(newNodes);
    };
    
    generateNodes();
  }, []);

  const generateConnections = () => {
    const connections = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = Math.sqrt(
          Math.pow(nodes[i].x - nodes[j].x, 2) + 
          Math.pow(nodes[i].y - nodes[j].y, 2)
        );
        
        // Only connect nearby nodes
        if (distance < 30) {
          connections.push({
            x1: nodes[i].x,
            y1: nodes[i].y,
            x2: nodes[j].x,
            y2: nodes[j].y,
            id: `${i}-${j}`
          });
        }
      }
    }
    return connections;
  };

  const connections = generateConnections();

  return (
    <div className="neural-bg-overlay">
      <svg 
        className="neural-network" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Neural connections */}
        {connections.map((connection, index) => (
          <motion.line
            key={connection.id}
            x1={connection.x1}
            y1={connection.y1}
            x2={connection.x2}
            y2={connection.y2}
            className="neural-connection"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{
              duration: 3 + index * 0.2,
              repeat: Infinity,
              delay: index * 0.1
            }}
          />
        ))}
        
        {/* Neural nodes */}
        {nodes.map((node, index) => (
          <motion.g key={node.id}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="0.8"
              className="neural-node"
              initial={{ scale: 0 }}
              animate={{ scale: [0.8, 1.2, 0.8] }}
              transition={{
                duration: 2 + index * 0.1,
                repeat: Infinity,
                delay: index * 0.1
              }}
            />
            
            {/* Data particles flowing through nodes */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="0.3"
              className="data-particle"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.3
              }}
            />
          </motion.g>
        ))}
        
        {/* Flowing data streams */}
        <defs>
          <linearGradient id="dataGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(138, 43, 226, 0.1)" />
            <stop offset="50%" stopColor="rgba(0, 255, 255, 0.3)" />
            <stop offset="100%" stopColor="rgba(138, 43, 226, 0.1)" />
          </linearGradient>
        </defs>
        
        <motion.path
          d="M 10 10 Q 30 40 50 20 T 90 30"
          stroke="url(#dataGradient)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="5 5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.path
          d="M 90 90 Q 70 60 50 80 T 10 70"
          stroke="url(#dataGradient)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="5 5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 0] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            delay: 2,
            ease: "easeInOut"
          }}
        />
      </svg>
    </div>
  );
}