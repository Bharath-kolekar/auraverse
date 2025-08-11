import { useState, useEffect, useRef, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { deepLearning } from '@/services/deep-learning';
import { NeuralInput } from './NeuralInput';
import { Sparkles } from 'lucide-react';

interface PredictiveInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  className?: string;
  enablePrediction?: boolean;
}

export const PredictiveInput = forwardRef<HTMLInputElement, PredictiveInputProps>(
  ({ label, placeholder, value = '', onChange, onSubmit, className = '', enablePrediction = true }, ref) => {
    const [inputValue, setInputValue] = useState(value);
    const [predictions, setPredictions] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout>();
    
    useEffect(() => {
      setInputValue(value);
    }, [value]);
    
    useEffect(() => {
      if (!enablePrediction || inputValue.length < 3) {
        setPredictions([]);
        return;
      }
      
      // Debounce prediction requests
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      debounceTimer.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          const result = await deepLearning.predictCompletion(inputValue);
          const allPredictions = [result.text, ...result.alternatives].filter(Boolean);
          setPredictions(allPredictions);
        } catch (error) {
          console.error('Prediction failed:', error);
          setPredictions([]);
        }
        setIsLoading(false);
      }, 300);
      
      return () => {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
      };
    }, [inputValue, enablePrediction]);
    
    const handleChange = (newValue: string) => {
      setInputValue(newValue);
      onChange?.(newValue);
      setSelectedIndex(-1);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (predictions.length === 0) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < predictions.length - 1 ? prev + 1 : 0
          );
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : predictions.length - 1
          );
          break;
          
        case 'Tab':
        case 'Enter':
          if (selectedIndex >= 0 && predictions[selectedIndex]) {
            e.preventDefault();
            const prediction = predictions[selectedIndex];
            const newValue = inputValue + ' ' + prediction;
            setInputValue(newValue);
            onChange?.(newValue);
            setPredictions([]);
            setSelectedIndex(-1);
            
            if (e.key === 'Enter') {
              onSubmit?.(newValue);
            }
          } else if (e.key === 'Enter') {
            onSubmit?.(inputValue);
          }
          break;
          
        case 'Escape':
          setPredictions([]);
          setSelectedIndex(-1);
          break;
      }
    };
    
    const selectPrediction = (prediction: string) => {
      const newValue = inputValue + ' ' + prediction;
      setInputValue(newValue);
      onChange?.(newValue);
      setPredictions([]);
      setSelectedIndex(-1);
    };
    
    return (
      <div className="relative">
        <NeuralInput
          ref={ref}
          label={label}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={className}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          </div>
        )}
        
        {/* Predictions dropdown */}
        <AnimatePresence>
          {predictions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-1 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-white/60">AI Predictions</span>
                </div>
              </div>
              
              <div className="max-h-48 overflow-y-auto">
                {predictions.map((prediction, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      px-3 py-2 cursor-pointer transition-all
                      ${selectedIndex === index 
                        ? 'bg-gradient-to-r from-purple-600/30 to-cyan-600/30 text-white' 
                        : 'hover:bg-white/10 text-white/80'
                      }
                    `}
                    onClick={() => selectPrediction(prediction)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{prediction}</span>
                      {index === 0 && (
                        <span className="text-xs text-purple-400">Best match</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="p-2 border-t border-white/10">
                <div className="text-xs text-white/40">
                  Press <kbd className="px-1 py-0.5 bg-white/10 rounded">Tab</kbd> or <kbd className="px-1 py-0.5 bg-white/10 rounded">Enter</kbd> to accept
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

PredictiveInput.displayName = 'PredictiveInput';