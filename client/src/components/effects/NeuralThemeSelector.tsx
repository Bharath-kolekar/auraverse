import { motion, AnimatePresence } from "framer-motion";
import { Palette, ChevronRight } from "lucide-react";
import { useNeuralTheme, themes } from "./NeuralThemeProvider";
import { useState, useRef, useEffect } from "react";

export function NeuralThemeSelector() {
  const { theme, themeName, setTheme, availableThemes } = useNeuralTheme();
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const themeDescriptions: Record<string, string> = {
    aurora: "Northern lights dancing across the sky",
    sunset: "Warm golden hour glow",
    ocean: "Deep sea mysteries",
    nebula: "Cosmic stellar clouds",
    matrix: "Digital rain and code streams",
    volcanic: "Molten lava flows",
    crystal: "Frozen ice formations",
    quantum: "Subatomic particle dance"
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 50;

    let phase = 0;
    const colors = theme.particleColors;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      phase += 0.02;
      
      // Draw theme-specific wave pattern
      for (let i = 0; i < colors.length; i++) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 5) {
          const y = canvas.height / 2 + 
            Math.sin((x / 30) + phase + (i * Math.PI / colors.length)) * 
            theme.effects.waveAmplitude;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.strokeStyle = colors[i] + '40';
        ctx.lineWidth = 2;
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
  }, [theme]);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-full left-0 mb-2 w-80 bg-black/90 backdrop-blur-xl rounded-2xl border-2 overflow-hidden"
            style={{ borderColor: `rgba(${theme.primary}, 0.3)` }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="p-4">
              <h3 className="text-lg font-bold mb-3 text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(to right, ${theme.particleColors.join(', ')})`
                }}
              >
                Neural Themes
              </h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableThemes.map((name) => {
                  const isActive = name === themeName;
                  const themeOption = themes[name];
                  
                  return (
                    <motion.button
                      key={name}
                      onClick={() => {
                        setTheme(name);
                        setIsOpen(false);
                      }}
                      className={`
                        w-full p-3 rounded-xl text-left transition-all duration-300
                        ${isActive 
                          ? 'bg-white/10 border-2' 
                          : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                        }
                      `}
                      style={{
                        borderColor: isActive ? `rgba(${themeOption.primary}, 0.5)` : 'transparent'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 rounded-full"
                              style={{
                                background: `linear-gradient(135deg, ${themeOption.particleColors[0]}, ${themeOption.particleColors[1]})`
                              }}
                            />
                            <span className="font-semibold text-white">
                              {themeOption.name}
                            </span>
                          </div>
                          <p className="text-xs text-white/60">
                            {themeDescriptions[name]}
                          </p>
                        </div>
                        {isActive && (
                          <ChevronRight className="w-4 h-4 text-white/80" />
                        )}
                      </div>
                      
                      <div className="flex gap-1 mt-2">
                        {themeOption.particleColors.map((color: string, i: number) => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
            
            <canvas 
              ref={canvasRef}
              className="absolute bottom-0 left-0 w-full pointer-events-none opacity-50"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 rounded-xl backdrop-blur-xl border-2 transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${theme.particleColors[0]}20, ${theme.particleColors[1]}20)`,
          borderColor: `rgba(${theme.primary}, 0.3)`
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            `0 0 20px ${theme.glow}`,
            `0 0 40px ${theme.glow}`,
            `0 0 20px ${theme.glow}`
          ]
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <Palette className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  );
}