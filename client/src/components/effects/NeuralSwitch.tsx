import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface NeuralSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function NeuralSwitch({ 
  checked, 
  onChange, 
  label,
  disabled = false
}: NeuralSwitchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 60;
    canvas.height = 30;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      opacity: number;
    }> = [];

    // Create energy particles
    for (let i = 0; i < 3; i++) {
      particles.push({
        x: checked ? canvas.width - 15 : 15,
        y: canvas.height / 2,
        vx: checked ? -0.5 : 0.5,
        opacity: 0
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (checked) {
        // Draw neural energy flow
        particles.forEach(particle => {
          particle.x += particle.vx;
          particle.opacity = Math.min(1, particle.opacity + 0.05);
          
          if (particle.x < 15) {
            particle.x = canvas.width - 15;
            particle.opacity = 0;
          }
          
          // Draw particle trail
          const gradient = ctx.createLinearGradient(
            particle.x, particle.y,
            particle.x + 10, particle.y
          );
          gradient.addColorStop(0, `rgba(34, 211, 238, ${particle.opacity * 0.5})`);
          gradient.addColorStop(1, `rgba(244, 114, 182, 0)`);
          
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [checked]);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative w-14 h-7 rounded-full transition-all duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${checked 
            ? 'bg-gradient-to-r from-purple-600 to-cyan-600' 
            : 'bg-black/40 border border-purple-500/20'
          }
        `}
      >
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none rounded-full"
        />
        
        <motion.div
          className={`
            absolute top-1 w-5 h-5 rounded-full
            ${checked 
              ? 'bg-white shadow-lg shadow-cyan-400/50' 
              : 'bg-gradient-to-r from-purple-400 to-pink-400'
            }
          `}
          animate={{ x: checked ? 28 : 4 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
        
        {/* Glow effect */}
        {checked && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full blur-md" />
        )}
      </button>
      
      {label && (
        <span className="text-sm font-medium text-white/80">
          {label}
        </span>
      )}
    </div>
  );
}