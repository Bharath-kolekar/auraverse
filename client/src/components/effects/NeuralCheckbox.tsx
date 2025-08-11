import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface NeuralCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function NeuralCheckbox({ 
  checked, 
  onChange, 
  label,
  disabled = false
}: NeuralCheckboxProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 24;
    canvas.height = 24;

    let phase = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (checked) {
        phase += 0.1;
        
        // Draw neural pulse
        const pulseRadius = (Math.sin(phase) + 1) * 8 + 4;
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, pulseRadius
        );
        gradient.addColorStop(0, 'rgba(34, 211, 238, 0.6)');
        gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.3)');
        gradient.addColorStop(1, 'rgba(244, 114, 182, 0)');
        
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
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
  }, [checked]);

  return (
    <label className={`flex items-center gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (!disabled) onChange(!checked);
          }}
          disabled={disabled}
          className={`
            w-6 h-6 rounded-md border-2 transition-all duration-300 relative
            ${checked 
              ? 'bg-gradient-to-r from-purple-600 to-cyan-600 border-purple-500' 
              : 'bg-black/40 border-purple-500/30 hover:border-purple-500/50'
            }
          `}
        >
          <canvas 
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
          />
          
          <AnimatePresence>
            {checked && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        
        {/* Glow effect */}
        {checked && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-purple-600/40 to-cyan-600/40 rounded-md blur-md pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </div>
      
      {label && (
        <span className="text-sm font-medium text-white/80 select-none">
          {label}
        </span>
      )}
    </label>
  );
}