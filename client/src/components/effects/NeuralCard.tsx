import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface NeuralCardProps {
  children: React.ReactNode;
  intensity?: number;
  className?: string;
  onClick?: () => void;
}

export function NeuralCard({ 
  children, 
  intensity = 0.5,
  className = "",
  onClick
}: NeuralCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const mousePosition = useRef({ x: 0, y: 0 });
  const isHovered = useRef(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const card = cardRef.current;
    if (!canvas || !card) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      const rect = card.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    updateCanvasSize();

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      targetX: number;
      targetY: number;
      radius: number;
    }> = [];

    // Initialize edge particles
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.4;
      particles.push({
        x: canvas.width / 2 + Math.cos(angle) * radius,
        y: canvas.height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        targetX: 0,
        targetY: 0,
        radius: 2
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      mousePosition.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', () => { isHovered.current = true; });
    card.addEventListener('mouseleave', () => { isHovered.current = false; });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (isHovered.current) {
        particles.forEach((particle) => {
          // Attract to mouse on hover
          particle.targetX = mousePosition.current.x;
          particle.targetY = mousePosition.current.y;
          
          const dx = particle.targetX - particle.x;
          const dy = particle.targetY - particle.y;
          
          particle.vx += dx * 0.01 * intensity;
          particle.vy += dy * 0.01 * intensity;
          particle.vx *= 0.95; // Damping
          particle.vy *= 0.95;
          
          particle.x += particle.vx;
          particle.y += particle.vy;
        });
      } else {
        // Return to original positions
        particles.forEach((particle, i) => {
          const angle = (i / particleCount) * Math.PI * 2;
          const radius = Math.min(canvas.width, canvas.height) * 0.4;
          particle.targetX = canvas.width / 2 + Math.cos(angle) * radius;
          particle.targetY = canvas.height / 2 + Math.sin(angle) * radius;
          
          const dx = particle.targetX - particle.x;
          const dy = particle.targetY - particle.y;
          
          particle.x += dx * 0.05;
          particle.y += dy * 0.05;
        });
      }
      
      // Draw connections between all particles
      particles.forEach((particle, i) => {
        particles.forEach((other, j) => {
          if (i < j) {
            const distance = Math.sqrt(
              Math.pow(particle.x - other.x, 2) + 
              Math.pow(particle.y - other.y, 2)
            );
            
            const maxDistance = Math.min(canvas.width, canvas.height) * 0.8;
            if (distance < maxDistance) {
              const opacity = (1 - distance / maxDistance) * intensity;
              
              // Triple gradient connections
              const gradient = ctx.createLinearGradient(
                particle.x, particle.y, other.x, other.y
              );
              gradient.addColorStop(0, `rgba(168, 85, 247, ${opacity * 0.3})`);
              gradient.addColorStop(0.5, `rgba(34, 211, 238, ${opacity * 0.3})`);
              gradient.addColorStop(1, `rgba(244, 114, 182, ${opacity * 0.3})`);
              
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });
        
        // Draw particle with radial gradient
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 3
        );
        gradient.addColorStop(0, `rgba(168, 85, 247, ${intensity})`);
        gradient.addColorStop(0.5, `rgba(34, 211, 238, ${intensity * 0.8})`);
        gradient.addColorStop(1, `rgba(244, 114, 182, ${intensity * 0.5})`);
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [intensity]);

  return (
    <motion.div
      ref={cardRef}
      className={`relative bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-2xl overflow-hidden ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-60"
      />
      {/* Spinning background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-cyan-600/5 to-pink-600/5 animate-spin-slow pointer-events-none"></div>
      
      {/* Enhanced typography backdrop blur */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40 pointer-events-none"></div>
      
      <div className="relative z-10 p-6">
        {children}
      </div>
      
      {/* Subtle underline accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
    </motion.div>
  );
}