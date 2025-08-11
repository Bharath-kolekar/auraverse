import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { NeuralButton } from "./NeuralButton";

interface NeuralModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
}

export function NeuralModal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = "medium"
}: NeuralModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-2xl",
    large: "max-w-4xl"
  };
  
  useEffect(() => {
    if (!isOpen) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      angle: number;
    }> = [];

    // Create orbital particles
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        radius: 150 + Math.random() * 100,
        angle: angle
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      particles.forEach((particle, i) => {
        particle.angle += 0.005;
        particle.x = centerX + Math.cos(particle.angle) * particle.radius;
        particle.y = centerY + Math.sin(particle.angle) * particle.radius;
        
        // Draw connections
        particles.forEach((other, j) => {
          if (i < j) {
            const distance = Math.sqrt(
              Math.pow(particle.x - other.x, 2) + 
              Math.pow(particle.y - other.y, 2)
            );
            
            if (distance < 200) {
              const opacity = (1 - distance / 200) * 0.2;
              const gradient = ctx.createLinearGradient(
                particle.x, particle.y, other.x, other.y
              );
              gradient.addColorStop(0, `rgba(168, 85, 247, ${opacity})`);
              gradient.addColorStop(0.5, `rgba(34, 211, 238, ${opacity})`);
              gradient.addColorStop(1, `rgba(244, 114, 182, ${opacity})`);
              
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
          particle.x, particle.y, 3
        );
        gradient.addColorStop(0, 'rgba(34, 211, 238, 0.8)');
        gradient.addColorStop(1, 'rgba(244, 114, 182, 0)');
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <canvas 
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
            />
          </motion.div>
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`
                relative ${sizeClasses[size]} w-full mx-4
                bg-black/80 backdrop-blur-2xl
                border-2 border-purple-500/30
                rounded-2xl shadow-2xl
                pointer-events-auto
              `}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Spinning glow background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-cyan-600/10 to-pink-600/10 rounded-2xl animate-spin-slow" />
              
              {/* Header */}
              {title && (
                <div className="relative px-6 py-4 border-b border-purple-500/20">
                  <h2 className="text-2xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400">
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-purple-400" />
                  </button>
                </div>
              )}
              
              {/* Content */}
              <div className="relative p-6">
                {children}
              </div>
              
              {/* Bottom gradient line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}