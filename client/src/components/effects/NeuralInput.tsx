import { useEffect, useRef, InputHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { useNeuralTheme } from './NeuralThemeProvider';

interface NeuralInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  onChange?: (value: string) => void;
  error?: string;
}

export const NeuralInput = forwardRef<HTMLInputElement, NeuralInputProps>(
  ({ label, onChange, error, className = "", ...props }, ref) => {
    const { theme } = useNeuralTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const isFocused = useRef(false);
    
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 400;
      canvas.height = 60;

      const particles: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
      }> = [];

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Add new particles when focused
        if (isFocused.current && particles.length < 15) {
          particles.push({
            x: 0,
            y: canvas.height / 2,
            vx: Math.random() * 2 + 1,
            vy: (Math.random() - 0.5) * 0.5,
            life: 1
          });
        }
        
        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const particle = particles[i];
          
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life -= 0.01;
          
          if (particle.life <= 0 || particle.x > canvas.width) {
            particles.splice(i, 1);
            continue;
          }
          
          // Draw particle trail
          const gradient = ctx.createLinearGradient(
            particle.x - 20, particle.y,
            particle.x, particle.y
          );
          gradient.addColorStop(0, `rgba(168, 85, 247, 0)`);
          gradient.addColorStop(0.5, `rgba(34, 211, 238, ${particle.life * 0.3})`);
          gradient.addColorStop(1, `rgba(244, 114, 182, ${particle.life * 0.5})`);
          
          ctx.beginPath();
          ctx.moveTo(particle.x - 20, particle.y);
          ctx.lineTo(particle.x, particle.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Draw particle
          const particleGradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, 3
          );
          particleGradient.addColorStop(0, `rgba(34, 211, 238, ${particle.life})`);
          particleGradient.addColorStop(1, `rgba(244, 114, 182, 0)`);
          
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = particleGradient;
          ctx.fill();
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animate();
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, []);

    return (
      <motion.div
        ref={containerRef}
        className={`relative ${className}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label && (
          <label className="block text-sm font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 rounded-xl
              bg-black/40 backdrop-blur-xl
              border-2 transition-all duration-300
              text-white placeholder-white/40
              focus:outline-none focus:ring-0
              ${error 
                ? 'border-red-500/50 focus:border-red-400' 
                : 'border-purple-500/20 focus:border-cyan-400/50'
              }
            `}
            onFocus={() => { isFocused.current = true; }}
            onBlur={() => { isFocused.current = false; }}
            onChange={(e) => onChange?.(e.target.value)}
            {...props}
          />
          
          <canvas 
            ref={canvasRef}
            className="absolute bottom-0 left-0 w-full h-1 pointer-events-none"
            style={{ opacity: 0.8 }}
          />
          
          {/* Glow effect on focus */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/0 via-cyan-600/0 to-pink-600/0 opacity-0 focus-within:opacity-20 transition-opacity duration-300 pointer-events-none" />
        </div>
        
        {error && (
          <motion.p 
            className="mt-2 text-sm text-red-400"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

NeuralInput.displayName = 'NeuralInput';