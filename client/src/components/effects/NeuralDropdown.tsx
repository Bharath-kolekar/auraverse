import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface NeuralDropdownOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface NeuralDropdownProps {
  options: NeuralDropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function NeuralDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option",
  label
}: NeuralDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const selectedOption = options.find(opt => opt.value === value);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 50;

    let phase = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (isOpen) {
        phase += 0.05;
        
        // Draw expanding neural waves
        for (let i = 0; i < 3; i++) {
          const radius = (phase * 20 + i * 15) % 100;
          const opacity = Math.max(0, 1 - radius / 100);
          
          const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, radius
          );
          gradient.addColorStop(0, `rgba(168, 85, 247, ${opacity * 0.3})`);
          gradient.addColorStop(0.5, `rgba(34, 211, 238, ${opacity * 0.2})`);
          gradient.addColorStop(1, `rgba(244, 114, 182, 0)`);
          
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
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
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      {label && (
        <label className="block text-sm font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
          {label}
        </label>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-xl bg-black/40 backdrop-blur-xl border-2 border-purple-500/20 hover:border-cyan-400/50 transition-all duration-300 text-left flex items-center justify-between group"
      >
        <span className={selectedOption ? "text-white" : "text-white/40"}>
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon && <selectedOption.icon className="w-4 h-4" />}
              {selectedOption.label}
            </span>
          ) : (
            placeholder
          )}
        </span>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-purple-400" />
        </motion.div>
      </button>
      
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{ opacity: 0.5 }}
      />
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-black/90 backdrop-blur-xl border-2 border-purple-500/30 overflow-hidden z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {options.map((option, index) => {
              const Icon = option.icon;
              const isSelected = option.value === value;
              
              return (
                <motion.button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-3 text-left flex items-center gap-3
                    transition-all duration-200 relative
                    ${isSelected 
                      ? 'bg-purple-600/20 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400' 
                      : 'text-white/80 hover:bg-purple-600/10 hover:text-white'
                    }
                  `}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 5 }}
                >
                  {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                  <span className="font-medium">{option.label}</span>
                  
                  {isSelected && (
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 via-cyan-400 to-pink-400"
                      layoutId="selectedIndicator"
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}