import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

// Neural Network Particle System
export function NeuralParticles({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const initParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 150; i++) {
        newParticles.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          life: Math.random() * 100,
          maxLife: 100 + Math.random() * 100,
          size: Math.random() * 2 + 1,
        });
      }
      setParticles(newParticles);
    };

    initParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      setParticles(prevParticles => {
        const updatedParticles = prevParticles.map(particle => {
          // Update position
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life++;

          // Boundary wrapping
          if (particle.x < 0) particle.x = canvas.offsetWidth;
          if (particle.x > canvas.offsetWidth) particle.x = 0;
          if (particle.y < 0) particle.y = canvas.offsetHeight;
          if (particle.y > canvas.offsetHeight) particle.y = 0;

          // Reset if life exceeded
          if (particle.life > particle.maxLife) {
            particle.life = 0;
            particle.x = Math.random() * canvas.offsetWidth;
            particle.y = Math.random() * canvas.offsetHeight;
          }

          return particle;
        });

        // Draw particles and connections
        updatedParticles.forEach((particle, i) => {
          const alpha = 1 - (particle.life / particle.maxLife);
          
          // Draw particle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(168, 85, 247, ${alpha * 0.8})`;
          ctx.fill();

          // Draw connections
          updatedParticles.slice(i + 1).forEach(otherParticle => {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              const connectionAlpha = (1 - distance / 100) * alpha * 0.3;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = `rgba(34, 197, 94, ${connectionAlpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });
        });

        return updatedParticles;
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// Magical Floating Orbs
export function MagicalOrbs() {
  const orbs = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <motion.div
          key={orb}
          className="absolute w-4 h-4 rounded-full"
          style={{
            background: `radial-gradient(circle, ${
              ['#a855f7', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'][orb]
            }, transparent)`,
            filter: 'blur(1px)',
          }}
          animate={{
            x: [0, Math.random() * 400 - 200, 0],
            y: [0, Math.random() * 400 - 200, 0],
            scale: [0.5, 1.5, 0.5],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: orb * 0.5,
          }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
        />
      ))}
    </div>
  );
}

// Maya Spell Circle
export function MayaSpellCircle({ className }: { className?: string }) {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      rotate: 360,
      transition: { duration: 20, repeat: Infinity, ease: "linear" }
    });
  }, [controls]);

  return (
    <motion.div
      animate={controls}
      className={cn("absolute", className)}
    >
      <div className="relative w-32 h-32">
        {/* Outer ring */}
        <div className="absolute inset-0 border-2 border-purple-400/30 rounded-full">
          <div className="absolute inset-2 border border-green-400/40 rounded-full">
            <div className="absolute inset-2 border border-blue-400/50 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Rotating symbols */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-yellow-400 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: '0 0',
            }}
            animate={{
              rotate: [angle, angle + 360],
              x: [Math.cos(angle * Math.PI / 180) * 60, Math.cos((angle + 360) * Math.PI / 180) * 60],
              y: [Math.sin(angle * Math.PI / 180) * 60, Math.sin((angle + 360) * Math.PI / 180) * 60],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Jadoo Energy Waves
export function JadooEnergyWaves() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute border border-cyan-400/20 rounded-full"
          style={{
            width: '200px',
            height: '200px',
            left: '50%',
            top: '50%',
            marginLeft: '-100px',
            marginTop: '-100px',
          }}
          animate={{
            scale: [0, 3],
            opacity: [0.8, 0],
            rotate: [0, 180],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// Holographic Text Effect
export function HolographicText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 blur-sm opacity-70">
        {children}
      </div>
      <div className="relative text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 animate-pulse">
        {children}
      </div>
    </div>
  );
}

// Neural Synapses Animation
export function NeuralSynapses() {
  const synapses = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    path: `M${Math.random() * 100},${Math.random() * 100} Q${Math.random() * 100},${Math.random() * 100} ${Math.random() * 100},${Math.random() * 100}`,
  }));

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      {synapses.map((synapse) => (
        <motion.path
          key={synapse.id}
          d={synapse.path}
          stroke="url(#synapseGradient)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1, 0], 
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: synapse.duration,
            repeat: Infinity,
            delay: synapse.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      <defs>
        <linearGradient id="synapseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </svg>
  );
}