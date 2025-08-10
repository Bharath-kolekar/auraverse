import React, { createContext, useContext, useState, useEffect } from 'react';

interface TransitionContextType {
  transitionSpeed: 'slow' | 'normal' | 'fast';
  transitionStyle: 'minimal' | 'creative' | 'extreme';
  enableTransitions: boolean;
  setTransitionSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  setTransitionStyle: (style: 'minimal' | 'creative' | 'extreme') => void;
  setEnableTransitions: (enabled: boolean) => void;
}

const TransitionContext = createContext<TransitionContextType | null>(null);

const speedMultipliers = {
  slow: 1.5,
  normal: 1,
  fast: 0.5
};

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [transitionSpeed, setTransitionSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [transitionStyle, setTransitionStyle] = useState<'minimal' | 'creative' | 'extreme'>('creative');
  const [enableTransitions, setEnableTransitions] = useState(true);

  // Load preferences from localStorage
  useEffect(() => {
    const savedSpeed = localStorage.getItem('transitionSpeed') as any;
    const savedStyle = localStorage.getItem('transitionStyle') as any;
    const savedEnabled = localStorage.getItem('enableTransitions');
    
    if (savedSpeed) setTransitionSpeed(savedSpeed);
    if (savedStyle) setTransitionStyle(savedStyle);
    if (savedEnabled !== null) setEnableTransitions(savedEnabled === 'true');
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('transitionSpeed', transitionSpeed);
    localStorage.setItem('transitionStyle', transitionStyle);
    localStorage.setItem('enableTransitions', String(enableTransitions));
  }, [transitionSpeed, transitionStyle, enableTransitions]);

  return (
    <TransitionContext.Provider
      value={{
        transitionSpeed,
        transitionStyle,
        enableTransitions,
        setTransitionSpeed,
        setTransitionStyle,
        setEnableTransitions
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition must be used within a TransitionProvider');
  }
  return context;
}

export { speedMultipliers };