import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  gradient: string;
  mode: 'light' | 'dark' | 'auto';
  animation: 'smooth' | 'reduced' | 'none';
  fontSize: 'small' | 'medium' | 'large';
  borderRadius: 'sharp' | 'rounded' | 'pill';
}

export interface PredefinedTheme {
  id: string;
  name: string;
  description: string;
  config: ThemeConfig;
  preview: string;
}

const defaultThemes: PredefinedTheme[] = [
  {
    id: 'neural-dark',
    name: 'Neural Dark',
    description: 'Deep neural network inspired dark theme',
    preview: 'from-purple-900 via-blue-900 to-slate-900',
    config: {
      primary: 'hsl(280, 100%, 70%)',
      secondary: 'hsl(220, 100%, 70%)',
      accent: 'hsl(300, 100%, 60%)',
      background: 'hsl(240, 10%, 4%)',
      surface: 'hsl(240, 6%, 10%)',
      text: 'hsl(0, 0%, 98%)',
      textSecondary: 'hsl(240, 5%, 64%)',
      border: 'hsl(240, 6%, 20%)',
      gradient: 'linear-gradient(135deg, hsl(280, 100%, 70%) 0%, hsl(220, 100%, 70%) 100%)',
      mode: 'dark' as const,
      animation: 'smooth' as const,
      fontSize: 'medium' as const,
      borderRadius: 'rounded' as const
    }
  },
  {
    id: 'cyber-blue',
    name: 'Cyber Blue',
    description: 'Futuristic cyberpunk blue theme',
    preview: 'from-blue-600 via-cyan-500 to-teal-400',
    config: {
      primary: 'hsl(200, 100%, 60%)',
      secondary: 'hsl(180, 100%, 50%)',
      accent: 'hsl(160, 100%, 40%)',
      background: 'hsl(210, 30%, 8%)',
      surface: 'hsl(210, 20%, 12%)',
      text: 'hsl(180, 100%, 90%)',
      textSecondary: 'hsl(200, 20%, 70%)',
      border: 'hsl(200, 30%, 25%)',
      gradient: 'linear-gradient(135deg, hsl(200, 100%, 60%) 0%, hsl(180, 100%, 50%) 100%)',
      mode: 'dark' as const,
      animation: 'smooth' as const,
      fontSize: 'medium' as const,
      borderRadius: 'rounded' as const
    }
  },
  {
    id: 'quantum-purple',
    name: 'Quantum Purple',
    description: 'Quantum computing inspired purple theme',
    preview: 'from-purple-600 via-pink-500 to-rose-400',
    config: {
      primary: 'hsl(280, 80%, 60%)',
      secondary: 'hsl(320, 80%, 60%)',
      accent: 'hsl(350, 80%, 60%)',
      background: 'hsl(260, 20%, 6%)',
      surface: 'hsl(260, 15%, 10%)',
      text: 'hsl(320, 50%, 95%)',
      textSecondary: 'hsl(280, 20%, 75%)',
      border: 'hsl(280, 20%, 20%)',
      gradient: 'linear-gradient(135deg, hsl(280, 80%, 60%) 0%, hsl(320, 80%, 60%) 100%)',
      mode: 'dark' as const,
      animation: 'smooth' as const,
      fontSize: 'medium' as const,
      borderRadius: 'rounded' as const
    }
  },
  {
    id: 'emerald-light',
    name: 'Emerald Light',
    description: 'Clean emerald light theme',
    preview: 'from-emerald-400 via-green-300 to-teal-200',
    config: {
      primary: 'hsl(160, 84%, 39%)',
      secondary: 'hsl(150, 70%, 45%)',
      accent: 'hsl(170, 80%, 40%)',
      background: 'hsl(0, 0%, 98%)',
      surface: 'hsl(0, 0%, 95%)',
      text: 'hsl(160, 20%, 10%)',
      textSecondary: 'hsl(160, 15%, 40%)',
      border: 'hsl(160, 20%, 85%)',
      gradient: 'linear-gradient(135deg, hsl(160, 84%, 39%) 0%, hsl(150, 70%, 45%) 100%)',
      mode: 'light' as const,
      animation: 'smooth' as const,
      fontSize: 'medium' as const,
      borderRadius: 'rounded' as const
    }
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm sunset inspired theme',
    preview: 'from-orange-500 via-red-500 to-pink-500',
    config: {
      primary: 'hsl(25, 95%, 53%)',
      secondary: 'hsl(10, 85%, 55%)',
      accent: 'hsl(340, 75%, 55%)',
      background: 'hsl(20, 15%, 8%)',
      surface: 'hsl(20, 10%, 12%)',
      text: 'hsl(25, 30%, 95%)',
      textSecondary: 'hsl(25, 15%, 70%)',
      border: 'hsl(25, 15%, 25%)',
      gradient: 'linear-gradient(135deg, hsl(25, 95%, 53%) 0%, hsl(10, 85%, 55%) 100%)',
      mode: 'dark' as const,
      animation: 'smooth' as const,
      fontSize: 'medium' as const,
      borderRadius: 'rounded' as const
    }
  }
];

interface ThemeContextValue {
  currentTheme: ThemeConfig;
  availableThemes: PredefinedTheme[];
  setTheme: (theme: PredefinedTheme | ThemeConfig) => void;
  updateThemeProperty: (key: keyof ThemeConfig, value: any) => void;
  resetToDefault: () => void;
  saveCustomTheme: (name: string, description: string) => void;
  deleteCustomTheme: (id: string) => void;
  isCustomTheme: boolean;
  themeName: string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(defaultThemes[0].config);
  const [customThemes, setCustomThemes] = useState<PredefinedTheme[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string>(defaultThemes[0].id);

  // Load saved themes and active theme on mount
  useEffect(() => {
    const savedCustomThemes = localStorage.getItem('customThemes');
    const savedActiveTheme = localStorage.getItem('activeTheme');
    
    if (savedCustomThemes) {
      try {
        const parsed = JSON.parse(savedCustomThemes);
        setCustomThemes(parsed);
      } catch (error) {
        console.error('Error loading custom themes:', error);
      }
    }

    if (savedActiveTheme) {
      const allThemes = [...defaultThemes, ...customThemes];
      const theme = allThemes.find(t => t.id === savedActiveTheme);
      if (theme) {
        setCurrentTheme(theme.config);
        setActiveThemeId(theme.id);
      }
    }
  }, []);

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    root.style.setProperty('--theme-primary', currentTheme.primary);
    root.style.setProperty('--theme-secondary', currentTheme.secondary);
    root.style.setProperty('--theme-accent', currentTheme.accent);
    root.style.setProperty('--theme-background', currentTheme.background);
    root.style.setProperty('--theme-surface', currentTheme.surface);
    root.style.setProperty('--theme-text', currentTheme.text);
    root.style.setProperty('--theme-text-secondary', currentTheme.textSecondary);
    root.style.setProperty('--theme-border', currentTheme.border);
    root.style.setProperty('--theme-gradient', currentTheme.gradient);
    
    // Apply mode class
    document.documentElement.classList.remove('light', 'dark');
    if (currentTheme.mode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.classList.add(currentTheme.mode);
    }

    // Apply animation preference
    if (currentTheme.animation === 'reduced' || currentTheme.animation === 'none') {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    // Apply font size
    root.style.setProperty('--theme-font-size-base', 
      currentTheme.fontSize === 'small' ? '14px' : 
      currentTheme.fontSize === 'large' ? '18px' : '16px'
    );

    // Apply border radius
    root.style.setProperty('--theme-border-radius', 
      currentTheme.borderRadius === 'sharp' ? '0px' : 
      currentTheme.borderRadius === 'pill' ? '9999px' : '0.5rem'
    );
  }, [currentTheme]);

  const setTheme = (theme: PredefinedTheme | ThemeConfig) => {
    if ('id' in theme) {
      // It's a predefined theme
      setCurrentTheme(theme.config);
      setActiveThemeId(theme.id);
      localStorage.setItem('activeTheme', theme.id);
    } else {
      // It's a custom theme config
      setCurrentTheme(theme);
      setActiveThemeId('custom');
      localStorage.setItem('activeTheme', 'custom');
      localStorage.setItem('customThemeConfig', JSON.stringify(theme));
    }
  };

  const updateThemeProperty = (key: keyof ThemeConfig, value: any) => {
    const newTheme = { ...currentTheme, [key]: value };
    setCurrentTheme(newTheme);
    if (activeThemeId === 'custom') {
      localStorage.setItem('customThemeConfig', JSON.stringify(newTheme));
    }
  };

  const resetToDefault = () => {
    setTheme(defaultThemes[0]);
  };

  const saveCustomTheme = (name: string, description: string) => {
    const customTheme: PredefinedTheme = {
      id: `custom-${Date.now()}`,
      name,
      description,
      config: { ...currentTheme },
      preview: currentTheme.gradient.includes('purple') ? 'from-purple-600 via-pink-500 to-rose-400' : 
                currentTheme.gradient.includes('blue') ? 'from-blue-600 via-cyan-500 to-teal-400' :
                'from-gray-600 via-gray-500 to-gray-400'
    };

    const newCustomThemes = [...customThemes, customTheme];
    setCustomThemes(newCustomThemes);
    localStorage.setItem('customThemes', JSON.stringify(newCustomThemes));
    setActiveThemeId(customTheme.id);
    localStorage.setItem('activeTheme', customTheme.id);
  };

  const deleteCustomTheme = (id: string) => {
    const newCustomThemes = customThemes.filter(t => t.id !== id);
    setCustomThemes(newCustomThemes);
    localStorage.setItem('customThemes', JSON.stringify(newCustomThemes));
    
    if (activeThemeId === id) {
      resetToDefault();
    }
  };

  const availableThemes = [...defaultThemes, ...customThemes];
  const isCustomTheme = activeThemeId === 'custom' || activeThemeId.startsWith('custom-');
  const activeTheme = availableThemes.find(t => t.id === activeThemeId);
  const themeName = activeTheme ? activeTheme.name : 'Custom Theme';

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      availableThemes,
      setTheme,
      updateThemeProperty,
      resetToDefault,
      saveCustomTheme,
      deleteCustomTheme,
      isCustomTheme,
      themeName
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}