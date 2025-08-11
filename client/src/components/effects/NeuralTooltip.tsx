import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NeuralTooltipProps {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function NeuralTooltip({ 
  children, 
  content,
  position = "top"
}: NeuralTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const positionClasses = {
    top: "-top-2 left-1/2 -translate-x-1/2 -translate-y-full",
    bottom: "-bottom-2 left-1/2 -translate-x-1/2 translate-y-full",
    left: "top-1/2 -left-2 -translate-y-1/2 -translate-x-full",
    right: "top-1/2 -right-2 -translate-y-1/2 translate-x-full"
  };
  
  useEffect(() => {
    if (!isVisible) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 200;
    canvas.height = 60;

    let phase = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      phase += 0.05;
      
      // Draw flowing neural waves
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          const y = canvas.height / 2 + 
            Math.sin((x / 20) + phase + (i * Math.PI / 3)) * 10;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, `rgba(168, 85, 247, ${0.3 - i * 0.1})`);
        gradient.addColorStop(0.5, `rgba(34, 211, 238, ${0.3 - i * 0.1})`);
        gradient.addColorStop(1, `rgba(244, 114, 182, ${0.3 - i * 0.1})`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible]);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`absolute ${positionClasses[position]} z-50 pointer-events-none`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative px-4 py-2 bg-black/90 backdrop-blur-xl border border-purple-500/30 rounded-lg">
              <canvas 
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none rounded-lg"
                style={{ opacity: 0.5 }}
              />
              
              <span className="relative text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 whitespace-nowrap">
                {content}
              </span>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-cyan-600/20 to-pink-600/20 rounded-lg blur-xl" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}