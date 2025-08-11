import { useEffect, useRef } from "react";
import { useNeuralTheme } from './NeuralThemeProvider';

interface NeuralNetworkBackgroundProps {
  particleCount?: number;
  opacity?: number;
  className?: string;
}

export function NeuralNetworkBackground({ 
  particleCount, 
  opacity = 0.3,
  className = ""
}: NeuralNetworkBackgroundProps) {
  const { theme } = useNeuralTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const finalParticleCount = particleCount || theme.effects.particleCount;
  
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
    for (let i = 0; i < finalParticleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * theme.effects.particleSpeed,
        vy: (Math.random() - 0.5) * theme.effects.particleSpeed,
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
            
            if (distance < theme.effects.connectionDistance) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              const connectionOpacity = (1 - (distance / theme.effects.connectionDistance)) * opacity * theme.effects.glowIntensity;
              
              // Theme-based gradient effect on connections
              const gradient = ctx.createLinearGradient(
                particle.x, particle.y, other.x, other.y
              );
              const colors = theme.particleColors;
              gradient.addColorStop(0, colors[0] + Math.floor(connectionOpacity * 255).toString(16).padStart(2, '0'));
              gradient.addColorStop(0.5, colors[1] + Math.floor(connectionOpacity * 255).toString(16).padStart(2, '0'));
              gradient.addColorStop(1, colors[2] + Math.floor(connectionOpacity * 255).toString(16).padStart(2, '0'));
              
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
        gradient.addColorStop(0, `rgba(${theme.primary}, ${opacity * 2 * theme.effects.glowIntensity})`);
        gradient.addColorStop(0.5, `rgba(${theme.secondary}, ${opacity * 1.5 * theme.effects.glowIntensity})`);
        gradient.addColorStop(1, `rgba(${theme.tertiary}, ${opacity * theme.effects.glowIntensity})`);
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add shadow blur for depth with theme color
        ctx.shadowBlur = 15;
        ctx.shadowColor = theme.glow;
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
  }, [finalParticleCount, opacity, theme]);

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