import { useEffect, useRef } from "react";

interface NeuralNetworkBackgroundProps {
  particleCount?: number;
  opacity?: number;
  className?: string;
}

export function NeuralNetworkBackground({ 
  particleCount = 50, 
  opacity = 0.3,
  className = ""
}: NeuralNetworkBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Neural network particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach((particle, i) => {
        // Update position with physics
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges
        if (particle.x <= particle.radius || particle.x >= canvas.width - particle.radius) {
          particle.vx *= -1;
        }
        if (particle.y <= particle.radius || particle.y >= canvas.height - particle.radius) {
          particle.vy *= -1;
        }
        
        // Draw dynamic connections
        particles.forEach((other, j) => {
          if (i !== j) {
            const distance = Math.sqrt(
              Math.pow(particle.x - other.x, 2) + 
              Math.pow(particle.y - other.y, 2)
            );
            
            if (distance < 150) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              const connectionOpacity = (1 - (distance / 150)) * opacity;
              
              // Triple gradient effect on connections
              const gradient = ctx.createLinearGradient(
                particle.x, particle.y, other.x, other.y
              );
              gradient.addColorStop(0, `rgba(168, 85, 247, ${connectionOpacity})`); // purple
              gradient.addColorStop(0.5, `rgba(34, 211, 238, ${connectionOpacity})`); // cyan
              gradient.addColorStop(1, `rgba(244, 114, 182, ${connectionOpacity})`); // pink
              
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        });
        
        // Draw particle with radial gradient
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 2
        );
        gradient.addColorStop(0, `rgba(168, 85, 247, ${opacity * 2})`); // purple center
        gradient.addColorStop(0.5, `rgba(34, 211, 238, ${opacity * 1.5})`); // cyan middle
        gradient.addColorStop(1, `rgba(244, 114, 182, ${opacity})`); // pink edge
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add shadow blur for depth
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
        ctx.fill();
        ctx.shadowBlur = 0;
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
  }, [particleCount, opacity]);

  return (
    <>
      <canvas 
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none ${className}`}
        style={{ zIndex: 1 }}
      />
      {/* Spinning background glow layer */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-cyan-600/10 to-pink-600/10 animate-spin-slow"></div>
      </div>
    </>
  );
}