import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Sparkles, Brain } from 'lucide-react';

interface PredictivePromptProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  contentType?: 'image' | 'video' | 'audio' | 'text';
  onSubmit?: () => void;
}

export function PredictivePrompt({ 
  value, 
  onChange, 
  placeholder = "Describe what you want to create...",
  contentType,
  onSubmit
}: PredictivePromptProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Simulate neural network predictions (in production, this would use WebAssembly)
  const generatePredictions = useCallback(async (prompt: string) => {
    if (prompt.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate WebAssembly neural network processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const baseSuggestions = [
      'with cinematic lighting and dramatic atmosphere',
      'in high resolution with professional quality',
      'featuring vibrant colors and detailed textures',
      'with realistic style and perfect composition',
      'showcasing intricate details in 4K quality'
    ];
    
    // Content type specific suggestions
    const typeSpecific: Record<string, string[]> = {
      image: [
        'as a photorealistic masterpiece',
        'with artistic composition and depth',
        'in the style of famous artists'
      ],
      video: [
        'with smooth transitions and effects',
        'in cinematic style with motion blur',
        'featuring dynamic camera movements'
      ],
      audio: [
        'with crystal clear sound quality',
        'featuring immersive spatial audio',
        'with professional mixing and mastering'
      ],
      text: [
        'with engaging narrative structure',
        'in professional writing style',
        'with comprehensive details'
      ]
    };
    
    // Combine suggestions based on prompt content
    const allSuggestions = [...baseSuggestions];
    if (contentType && typeSpecific[contentType]) {
      allSuggestions.push(...typeSpecific[contentType]);
    }
    
    // Filter and rank suggestions based on prompt
    const filtered = allSuggestions
      .map(suggestion => ({
        text: `${prompt} ${suggestion}`,
        relevance: calculateRelevance(prompt, suggestion)
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5)
      .map(item => item.text);
    
    setSuggestions(filtered);
    setIsAnalyzing(false);
  }, [contentType]);

  // Calculate relevance score (simulated neural network output)
  const calculateRelevance = (prompt: string, suggestion: string): number => {
    const promptWords = prompt.toLowerCase().split(' ');
    const suggestionWords = suggestion.toLowerCase().split(' ');
    
    let score = 0;
    
    // Check for style keywords
    if (promptWords.some(w => ['create', 'generate', 'make'].includes(w))) {
      score += 0.3;
    }
    
    // Check for quality keywords
    if (suggestionWords.some(w => ['professional', 'high', '4k'].includes(w))) {
      score += 0.2;
    }
    
    // Random factor to simulate neural network variation
    score += Math.random() * 0.5;
    
    return Math.min(1, score);
  };

  // Debounced prediction generation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.length >= 3) {
        generatePredictions(value);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, generatePredictions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && onSubmit) {
        onSubmit();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          onChange(suggestions[selectedIndex]);
          setShowSuggestions(false);
          setSelectedIndex(-1);
        } else if (onSubmit) {
          onSubmit();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="pr-10"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {isAnalyzing ? (
            <Brain className="w-5 h-5 text-muted-foreground animate-pulse" />
          ) : (
            <Sparkles className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 p-2 shadow-lg">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Brain className="w-3 h-3" />
            AI-powered suggestions
          </div>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`
                px-3 py-2 cursor-pointer rounded-md transition-colors
                ${selectedIndex === index 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
                }
              `}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="text-sm">{suggestion}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}