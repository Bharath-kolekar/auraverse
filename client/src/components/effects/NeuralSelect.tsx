import { useEffect, useRef, SelectHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface NeuralSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: Array<{ value: string; label: string }>;
  onChange?: (value: string) => void;
  error?: string;
}

export function NeuralSelect({ 
  label, 
  options, 
  onChange, 
  error, 
  className = "", 
  ...props 
}: NeuralSelectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const isHovered = useRef(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 60;

    let rotation = 0;
    const centerY = canvas.height / 2;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (isHovered.current) {
        rotation += 0.02;
        
        // Draw rotating neural connections
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2 + rotation;
          const x1 = 20 + Math.cos(angle) * 10;
          const y1 = centerY + Math.sin(angle) * 10;
          const x2 = canvas.width - 20 + Math.cos(angle + Math.PI) * 10;
          const y2 = centerY + Math.sin(angle + Math.PI) * 10;
          
          const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          gradient.addColorStop(0, `rgba(168, 85, 247, ${0.3 - i * 0.05})`);
          gradient.addColorStop(0.5, `rgba(34, 211, 238, ${0.3 - i * 0.05})`);
          gradient.addColorStop(1, `rgba(244, 114, 182, ${0.3 - i * 0.05})`);
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(canvas.width / 2, centerY + Math.sin(rotation + i) * 20, x2, y2);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => { isHovered.current = true; }}
      onMouseLeave={() => { isHovered.current = false; }}
    >
      {label && (
        <label className="block text-sm font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          className={`
            w-full px-4 py-3 pr-10 rounded-xl appearance-none
            bg-black/40 backdrop-blur-xl
            border-2 transition-all duration-300
            text-white
            focus:outline-none focus:ring-0
            ${error 
              ? 'border-red-500/50 focus:border-red-400' 
              : 'border-purple-500/20 focus:border-cyan-400/50'
            }
          `}
          onChange={(e) => onChange?.(e.target.value)}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value} className="bg-gray-900">
              {option.label}
            </option>
          ))}
        </select>
        
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" />
        
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none rounded-xl"
          style={{ opacity: 0.6 }}
        />
        
        {/* Hover glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/0 via-cyan-600/0 to-pink-600/0 opacity-0 hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
      </div>
      
      {error && (
        <motion.p 
          className="mt-2 text-sm text-red-400"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}