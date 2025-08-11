import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface NeuralLoaderProps {
  size?: "small" | "medium" | "large";
  text?: string;
}

export function NeuralLoader({ size = "medium", text = "Processing Intelligence..." }: NeuralLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const sizeConfig = {
    small: { canvas: 60, particles: 6, radius: 20 },
    medium: { canvas: 100, particles: 10, radius: 35 },
    large: { canvas: 150, particles: 15, radius: 50 }
  };
  
  const config = sizeConfig[size];
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = config.canvas;
    canvas.height = config.canvas;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let rotation = 0;

    const particles: Array<{
      angle: number;
      radius: number;
      size: number;
      speed: number;
    }> = [];

    // Initialize orbiting particles
    for (let i = 0; i < config.particles; i++) {
      particles.push({
        angle: (i / config.particles) * Math.PI * 2,
        radius: config.radius,
        size: Math.random() * 2 + 1,
        speed: 0.02 + Math.random() * 0.02
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rotation += 0.01;
      
      // Draw connections between particles
      particles.forEach((particle, i) => {
        particles.forEach((other, j) => {
          if (i < j) {
            const x1 = centerX + Math.cos(particle.angle + rotation) * particle.radius;
            const y1 = centerY + Math.sin(particle.angle + rotation) * particle.radius;
            const x2 = centerX + Math.cos(other.angle + rotation) * other.radius;
            const y2 = centerY + Math.sin(other.angle + rotation) * other.radius;
            
            const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            
            if (distance < config.radius * 1.5) {
              const opacity = 1 - (distance / (config.radius * 1.5));
              
              const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
              gradient.addColorStop(0, `rgba(168, 85, 247, ${opacity * 0.3})`);
              gradient.addColorStop(0.5, `rgba(34, 211, 238, ${opacity * 0.3})`);
              gradient.addColorStop(1, `rgba(244, 114, 182, ${opacity * 0.3})`);
              
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        });
        
        // Update particle position
        particle.angle += particle.speed;
        particle.radius = config.radius + Math.sin(rotation * 2) * 5;
        
        const x = centerX + Math.cos(particle.angle + rotation) * particle.radius;
        const y = centerY + Math.sin(particle.angle + rotation) * particle.radius;
        
        // Draw particle with radial gradient
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size * 3);
        gradient.addColorStop(0, 'rgba(168, 85, 247, 1)');
        gradient.addColorStop(0.5, 'rgba(34, 211, 238, 0.8)');
        gradient.addColorStop(1, 'rgba(244, 114, 182, 0.4)');
        
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      
      // Draw center neural core
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 10);
      coreGradient.addColorStop(0, 'rgba(34, 211, 238, 0.8)');
      coreGradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.5)');
      coreGradient.addColorStop(1, 'rgba(244, 114, 182, 0.2)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5 + Math.sin(rotation * 3) * 2, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(34, 211, 238, 0.8)';
      ctx.fill();
      ctx.shadowBlur = 0;
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [config]);

  return (
    <motion.div 
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <canvas 
          ref={canvasRef}
          width={config.canvas}
          height={config.canvas}
        />
        {/* Spinning background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-cyan-600/20 to-pink-600/20 blur-xl animate-spin-slow"></div>
      </div>
      
      {text && (
        <motion.p 
          className="text-sm font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 uppercase"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
}