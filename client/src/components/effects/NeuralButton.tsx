import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNeuralTheme } from './NeuralThemeProvider';

interface NeuralButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function NeuralButton({ 
  children, 
  variant = "primary",
  className = "",
  onClick,
  disabled,
  type = "button"
}: NeuralButtonProps) {
  const { theme } = useNeuralTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const isHovered = useRef(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 60;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
    }> = [];

    // Initialize particles
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.5 + 0.5,
        opacity: 0
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges
        if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1;
        if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1;
        
        // Fade in/out based on hover
        if (isHovered.current && particle.opacity < 1) {
          particle.opacity += 0.05;
        } else if (!isHovered.current && particle.opacity > 0) {
          particle.opacity -= 0.02;
        }
        
        if (particle.opacity > 0) {
          // Draw connections
          particles.forEach((other, j) => {
            if (i !== j) {
              const distance = Math.sqrt(
                Math.pow(particle.x - other.x, 2) + 
                Math.pow(particle.y - other.y, 2)
              );
              
              if (distance < 60) {
                const gradient = ctx.createLinearGradient(
                  particle.x, particle.y, other.x, other.y
                );
                gradient.addColorStop(0, `rgba(${theme.primary}, ${particle.opacity * 0.2})`);
                gradient.addColorStop(0.5, `rgba(${theme.secondary}, ${particle.opacity * 0.2})`);
                gradient.addColorStop(1, `rgba(${theme.tertiary}, ${particle.opacity * 0.2})`);
                
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(other.x, other.y);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 0.5;
                ctx.stroke();
              }
            }
          });
          
          // Draw particle
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.radius * 2
          );
          gradient.addColorStop(0, `rgba(${theme.primary}, ${particle.opacity})`);
          gradient.addColorStop(0.5, `rgba(${theme.secondary}, ${particle.opacity * 0.8})`);
          gradient.addColorStop(1, `rgba(${theme.tertiary}, ${particle.opacity * 0.5})`);
          
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.shadowBlur = 10;
          ctx.shadowColor = theme.glow;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [theme]);

  const baseClasses = "relative px-6 py-3 font-bold tracking-wider overflow-hidden rounded-xl transition-all duration-300";
  const variantClasses = {
    primary: `text-white shadow-lg hover:shadow-xl ${theme.gradients.button}`,
    secondary: "bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20",
    ghost: "text-white hover:bg-white/10"
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => { isHovered.current = true; }}
      onMouseLeave={() => { isHovered.current = false; }}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </motion.button>
  );
}