// Neural Network Visualization Component
// 3D WebGL-powered visualization of AI intelligence hierarchy

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gpuAccelerator } from '@/services/gpu-accelerator';

export function NeuralNetworkVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Neural network nodes
    class Node {
      x: number;
      y: number;
      z: number;
      radius: number;
      connections: Node[];
      activity: number;
      layer: number;
      color: string;

      constructor(x: number, y: number, z: number, layer: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.radius = 4 + Math.random() * 4;
        this.connections = [];
        this.activity = Math.random();
        this.layer = layer;
        
        // Color based on layer
        const colors = [
          'rgba(147, 51, 234, 0.8)', // Purple
          'rgba(59, 130, 246, 0.8)', // Blue
          'rgba(16, 185, 129, 0.8)', // Green
          'rgba(251, 146, 60, 0.8)', // Orange
          'rgba(236, 72, 153, 0.8)'  // Pink
        ];
        this.color = colors[layer % colors.length];
      }

      update(time: number) {
        // Simulate neural activity
        this.activity = (Math.sin(time * 0.001 + this.x * 0.01 + this.y * 0.01) + 1) / 2;
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Draw node with glow effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color.replace('0.8', '0.4'));
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * (1 + this.activity * 0.5), 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        this.connections.forEach(target => {
          ctx.strokeStyle = this.color.replace('0.8', (0.2 + this.activity * 0.3).toString());
          ctx.lineWidth = 0.5 + this.activity;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          
          // Curved connection for visual appeal
          const cx = (this.x + target.x) / 2;
          const cy = (this.y + target.y) / 2 - 20;
          ctx.quadraticCurveTo(cx, cy, target.x, target.y);
          ctx.stroke();
        });
      }
    }

    // Create neural network structure
    const nodes: Node[] = [];
    const layers = 5;
    const nodesPerLayer = 8;
    const layerSpacing = canvas.width / (layers + 1);
    const nodeSpacing = canvas.height / (nodesPerLayer + 1);

    // Create nodes
    for (let layer = 0; layer < layers; layer++) {
      for (let i = 0; i < nodesPerLayer; i++) {
        const x = layerSpacing * (layer + 1);
        const y = nodeSpacing * (i + 1) + (layer % 2 ? 20 : 0);
        const z = layer * 10;
        nodes.push(new Node(x, y, z, layer));
      }
    }

    // Connect nodes between layers
    for (let layer = 0; layer < layers - 1; layer++) {
      const currentLayer = nodes.filter(n => n.layer === layer);
      const nextLayer = nodes.filter(n => n.layer === layer + 1);
      
      currentLayer.forEach(node => {
        // Connect to 2-4 random nodes in next layer
        const connectionCount = 2 + Math.floor(Math.random() * 3);
        const shuffled = [...nextLayer].sort(() => Math.random() - 0.5);
        node.connections = shuffled.slice(0, connectionCount);
      });
    }

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 16;
      
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw nodes
      nodes.forEach(node => {
        node.update(time);
        node.draw(ctx);
      });
      
      // Draw data flow particles
      if (Math.random() < 0.1) {
        ctx.fillStyle = 'rgba(147, 51, 234, 0.6)';
        const startNode = nodes[Math.floor(Math.random() * nodesPerLayer)];
        const particle = {
          x: startNode.x,
          y: startNode.y,
          vx: 2 + Math.random() * 2,
          vy: (Math.random() - 0.5) * 2
        };
        
        // Simple particle animation
        for (let i = 0; i < 20; i++) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          ctx.globalAlpha = 1 - i / 20;
          ctx.fillRect(particle.x, particle.y, 2, 2);
        }
        ctx.globalAlpha = 1;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    setIsInitialized(true);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden bg-black/50">
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
      />
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/50">Initializing neural network...</div>
        </div>
      )}
      <div className="absolute bottom-4 left-4 text-xs text-white/50">
        Neural Network Activity Visualization
      </div>
    </div>
  );
}