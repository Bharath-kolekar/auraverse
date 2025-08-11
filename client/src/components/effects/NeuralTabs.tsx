import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface NeuralTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function NeuralTabs({ tabs, activeTab, onChange }: NeuralTabsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let connectionPhase = 0;
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    const tabWidth = canvas.width / tabs.length;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      connectionPhase += 0.03;
      
      // Draw neural connections between tabs
      for (let i = 0; i < tabs.length - 1; i++) {
        const x1 = (i + 1) * tabWidth;
        const y1 = canvas.height / 2;
        const x2 = (i + 2) * tabWidth - tabWidth;
        const y2 = canvas.height / 2;
        
        const isActive = i === activeIndex || i === activeIndex - 1;
        const opacity = isActive ? 0.4 : 0.1;
        
        // Draw flowing connection
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, `rgba(168, 85, 247, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(34, 211, 238, ${opacity})`);
        gradient.addColorStop(1, `rgba(244, 114, 182, ${opacity})`);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        
        // Create wave effect
        const midX = (x1 + x2) / 2;
        const waveHeight = Math.sin(connectionPhase + i) * 10;
        ctx.quadraticCurveTo(midX, y1 + waveHeight, x2, y2);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.stroke();
      }
      
      // Draw active tab indicator
      if (activeIndex >= 0) {
        const activeX = activeIndex * tabWidth + tabWidth / 2;
        const glowRadius = 30 + Math.sin(connectionPhase * 2) * 5;
        
        const glow = ctx.createRadialGradient(
          activeX, canvas.height - 2, 0,
          activeX, canvas.height - 2, glowRadius
        );
        glow.addColorStop(0, 'rgba(34, 211, 238, 0.8)');
        glow.addColorStop(0.5, 'rgba(168, 85, 247, 0.4)');
        glow.addColorStop(1, 'rgba(244, 114, 182, 0)');
        
        ctx.beginPath();
        ctx.arc(activeX, canvas.height - 2, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [activeTab, tabs]);

  return (
    <div ref={containerRef} className="relative">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
      
      <div className="relative flex border-b border-purple-500/20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                flex-1 px-4 py-3 flex items-center justify-center gap-2
                transition-all duration-300 relative
                ${isActive 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400' 
                  : 'text-white/60 hover:text-white/80'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span className="font-semibold tracking-wider">{tab.label}</span>
              
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}