import { useEffect, useRef } from "react";

// Advanced COGNOMEGA Logo with Neural Network visualization
export function LogoAdvanced({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const sizeConfig = {
    small: {
      container: "flex flex-col items-end",
      canvas: { width: 30, height: 30 },
      text: "text-2xl",
      tagline: "text-[9px]",
      particle: { count: 15, radius: 2 }
    },
    default: {
      container: "flex flex-col items-end",
      canvas: { width: 40, height: 40 },
      text: "text-3xl",
      tagline: "text-[11px]",
      particle: { count: 20, radius: 2.5 }
    },
    large: {
      container: "flex flex-col items-end",
      canvas: { width: 60, height: 60 },
      text: "text-6xl",
      tagline: "text-[11px]",
      particle: { count: 30, radius: 3 }
    }
  };

  const config = sizeConfig[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Neural network particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      connections: number[];
    }> = [];

    // Initialize particles
    for (let i = 0; i < config.particle.count; i++) {
      particles.push({
        x: Math.random() * config.canvas.width,
        y: Math.random() * config.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        connections: []
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, config.canvas.width, config.canvas.height);
      
      // Update and draw particles
      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off walls
        if (particle.x <= 0 || particle.x >= config.canvas.width) particle.vx *= -1;
        if (particle.y <= 0 || particle.y >= config.canvas.height) particle.vy *= -1;
        
        // Draw connections
        particles.forEach((other, j) => {
          if (i !== j) {
            const distance = Math.sqrt(
              Math.pow(particle.x - other.x, 2) + 
              Math.pow(particle.y - other.y, 2)
            );
            
            if (distance < config.canvas.width * 0.4) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              const opacity = 1 - (distance / (config.canvas.width * 0.4));
              ctx.strokeStyle = `rgba(168, 85, 247, ${opacity * 0.3})`; // purple
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        });
        
        // Draw particle with gradient
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, config.particle.radius
        );
        gradient.addColorStop(0, 'rgba(168, 85, 247, 1)'); // purple
        gradient.addColorStop(0.5, 'rgba(34, 211, 238, 0.8)'); // cyan
        gradient.addColorStop(1, 'rgba(244, 114, 182, 0.4)'); // pink
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, config.particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      
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
    <div className={config.container}>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <canvas 
            ref={canvasRef}
            width={config.canvas.width}
            height={config.canvas.height}
            className="relative z-10"
          />
          <div className="absolute inset-0 blur-xl bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-pink-500/40 animate-pulse"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-cyan-600 to-pink-600 opacity-20 blur-2xl animate-spin-slow"></div>
        </div>
        <h1 className={`${config.text} font-black tracking-tighter relative`}>
          <span className="absolute inset-0 blur-md bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 opacity-50"></span>
          <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 animate-gradient">
            COGNO
          </span>
          <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 animate-gradient-reverse">
            MEGA
          </span>
          <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></span>
        </h1>
      </div>
      <div className="flex justify-end mt-1">
        <div className="relative">
          <p className={`${config.tagline} font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-cyan-300 to-pink-300 uppercase relative`}>
            Production Intelligence
          </p>
          <div className="absolute -bottom-1 left-0 right-0 h-[0.5px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}