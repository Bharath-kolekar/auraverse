import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNeuralTheme } from './NeuralThemeProvider';

interface NeuralProgressProps {
  value: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  size?: "small" | "medium" | "large";
}

export function NeuralProgress({ 
  value, 
  label, 
  showPercentage = true,
  size = "medium"
}: NeuralProgressProps) {
  const { theme } = useNeuralTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const sizeConfig = {
    small: { height: 8, fontSize: "text-xs" },
    medium: { height: 12, fontSize: "text-sm" },
    large: { height: 16, fontSize: "text-base" }
  };
  
  const config = sizeConfig[size];
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = config.height;

    const particles: Array<{
      x: number;
      speed: number;
      opacity: number;
    }> = [];

    // Create traveling particles
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: Math.random() * (canvas.width * value / 100),
        speed: 0.5 + Math.random() * 1.5,
        opacity: 0.5 + Math.random() * 0.5
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const progressWidth = canvas.width * value / 100;
      
      // Draw neural connections
      particles.forEach(particle => {
        particle.x += particle.speed;
        if (particle.x > progressWidth) {
          particle.x = 0;
        }
        
        // Draw particle trail
        const gradient = ctx.createLinearGradient(
          particle.x - 20, canvas.height / 2,
          particle.x + 5, canvas.height / 2
        );
        gradient.addColorStop(0, `rgba(168, 85, 247, 0)`);
        gradient.addColorStop(0.5, `rgba(34, 211, 238, ${particle.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(244, 114, 182, ${particle.opacity})`);
        
        ctx.beginPath();
        ctx.moveTo(particle.x - 20, canvas.height / 2);
        ctx.lineTo(particle.x + 5, canvas.height / 2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw particle
        const particleGradient = ctx.createRadialGradient(
          particle.x, canvas.height / 2, 0,
          particle.x, canvas.height / 2, 4
        );
        particleGradient.addColorStop(0, `rgba(34, 211, 238, ${particle.opacity})`);
        particleGradient.addColorStop(1, 'rgba(244, 114, 182, 0)');
        
        ctx.beginPath();
        ctx.arc(particle.x, canvas.height / 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = particleGradient;
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, config.height]);

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className={`${config.fontSize} font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400`}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span className={`${config.fontSize} text-pink-400 font-semibold`}>
              {Math.round(value)}%
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        {/* Background track */}
        <div 
          className="w-full rounded-full bg-black/40 backdrop-blur-sm border border-purple-500/20"
          style={{ height: config.height }}
        >
          {/* Progress fill */}
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 via-cyan-600 to-pink-600 relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </motion.div>
        </div>
        
        {/* Neural particles overlay */}
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full pointer-events-none rounded-full"
          style={{ height: config.height }}
        />
      </div>
    </div>
  );
}