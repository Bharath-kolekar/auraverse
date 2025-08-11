import { createContext, useContext, useState, useEffect } from "react";

export type NeuralTheme = {
  name: string;
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
  glow: string;
  particleColors: string[];
  gradients: {
    main: string;
    button: string;
    card: string;
    text: string;
  };
  effects: {
    particleCount: number;
    particleSpeed: number;
    glowIntensity: number;
    connectionDistance: number;
    waveAmplitude: number;
  };
};

export const themes: Record<string, NeuralTheme> = {
  aurora: {
    name: "Aurora Borealis",
    primary: "64, 224, 208", // Turquoise
    secondary: "72, 209, 204", // Medium Turquoise  
    tertiary: "127, 255, 212", // Aquamarine
    accent: "152, 251, 152", // Pale Green
    glow: "rgba(127, 255, 212, 0.4)",
    particleColors: ["#40E0D0", "#48D1CC", "#7FFFD4", "#98FB98"],
    gradients: {
      main: "from-teal-400 via-green-400 to-emerald-400",
      button: "from-teal-500 to-green-500",
      card: "from-teal-600/20 to-green-600/20",
      text: "from-teal-300 via-green-300 to-emerald-300"
    },
    effects: {
      particleCount: 50,
      particleSpeed: 0.8,
      glowIntensity: 0.6,
      connectionDistance: 150,
      waveAmplitude: 15
    }
  },
  sunset: {
    name: "Golden Sunset",
    primary: "255, 165, 0", // Orange
    secondary: "255, 99, 71", // Tomato
    tertiary: "255, 215, 0", // Gold
    accent: "255, 182, 193", // Light Pink
    glow: "rgba(255, 165, 0, 0.4)",
    particleColors: ["#FFA500", "#FF6347", "#FFD700", "#FFB6C1"],
    gradients: {
      main: "from-orange-400 via-red-400 to-yellow-400",
      button: "from-orange-500 to-red-500",
      card: "from-orange-600/20 to-red-600/20",
      text: "from-orange-300 via-red-300 to-yellow-300"
    },
    effects: {
      particleCount: 40,
      particleSpeed: 0.5,
      glowIntensity: 0.8,
      connectionDistance: 120,
      waveAmplitude: 20
    }
  },
  ocean: {
    name: "Deep Ocean",
    primary: "0, 119, 190", // Deep Blue
    secondary: "0, 150, 199", // Ocean Blue
    tertiary: "0, 180, 216", // Cyan Blue
    accent: "144, 224, 239", // Light Blue
    glow: "rgba(0, 180, 216, 0.4)",
    particleColors: ["#0077BE", "#0096C7", "#00B4D8", "#90E0EF"],
    gradients: {
      main: "from-blue-500 via-cyan-500 to-blue-400",
      button: "from-blue-600 to-cyan-600",
      card: "from-blue-700/20 to-cyan-700/20",
      text: "from-blue-300 via-cyan-300 to-blue-200"
    },
    effects: {
      particleCount: 60,
      particleSpeed: 0.3,
      glowIntensity: 0.5,
      connectionDistance: 100,
      waveAmplitude: 25
    }
  },
  nebula: {
    name: "Cosmic Nebula",
    primary: "147, 51, 234", // Purple
    secondary: "217, 70, 239", // Heliotrope
    tertiary: "240, 128, 128", // Light Coral
    accent: "255, 99, 132", // Pink Red
    glow: "rgba(217, 70, 239, 0.4)",
    particleColors: ["#9333EA", "#D946EF", "#F08080", "#FF6384"],
    gradients: {
      main: "from-purple-500 via-pink-500 to-red-400",
      button: "from-purple-600 to-pink-600",
      card: "from-purple-700/20 to-pink-700/20",
      text: "from-purple-300 via-pink-300 to-red-300"
    },
    effects: {
      particleCount: 70,
      particleSpeed: 1.0,
      glowIntensity: 0.7,
      connectionDistance: 180,
      waveAmplitude: 12
    }
  },
  matrix: {
    name: "Digital Matrix",
    primary: "0, 255, 0", // Lime
    secondary: "50, 205, 50", // Lime Green
    tertiary: "124, 252, 0", // Lawn Green
    accent: "173, 255, 47", // Green Yellow
    glow: "rgba(0, 255, 0, 0.4)",
    particleColors: ["#00FF00", "#32CD32", "#7CFC00", "#ADFF2F"],
    gradients: {
      main: "from-green-400 via-lime-400 to-green-300",
      button: "from-green-500 to-lime-500",
      card: "from-green-600/20 to-lime-600/20",
      text: "from-green-300 via-lime-300 to-green-200"
    },
    effects: {
      particleCount: 100,
      particleSpeed: 2.0,
      glowIntensity: 0.9,
      connectionDistance: 50,
      waveAmplitude: 5
    }
  },
  volcanic: {
    name: "Volcanic Fire",
    primary: "255, 69, 0", // Red Orange
    secondary: "255, 140, 0", // Dark Orange
    tertiary: "255, 215, 0", // Gold
    accent: "220, 20, 60", // Crimson
    glow: "rgba(255, 69, 0, 0.5)",
    particleColors: ["#FF4500", "#FF8C00", "#FFD700", "#DC143C"],
    gradients: {
      main: "from-red-500 via-orange-500 to-yellow-500",
      button: "from-red-600 to-orange-600",
      card: "from-red-700/20 to-orange-700/20",
      text: "from-red-300 via-orange-300 to-yellow-300"
    },
    effects: {
      particleCount: 80,
      particleSpeed: 1.5,
      glowIntensity: 1.0,
      connectionDistance: 130,
      waveAmplitude: 30
    }
  },
  crystal: {
    name: "Crystal Ice",
    primary: "230, 230, 250", // Lavender
    secondary: "176, 224, 230", // Powder Blue
    tertiary: "240, 248, 255", // Alice Blue
    accent: "135, 206, 235", // Sky Blue
    glow: "rgba(176, 224, 230, 0.4)",
    particleColors: ["#E6E6FA", "#B0E0E6", "#F0F8FF", "#87CEEB"],
    gradients: {
      main: "from-blue-200 via-purple-200 to-blue-100",
      button: "from-blue-300 to-purple-300",
      card: "from-blue-400/20 to-purple-400/20",
      text: "from-blue-100 via-purple-100 to-blue-50"
    },
    effects: {
      particleCount: 45,
      particleSpeed: 0.4,
      glowIntensity: 0.3,
      connectionDistance: 140,
      waveAmplitude: 10
    }
  },
  quantum: {
    name: "Quantum Flux",
    primary: "138, 43, 226", // Blue Violet
    secondary: "75, 0, 130", // Indigo
    tertiary: "238, 130, 238", // Violet
    accent: "255, 0, 255", // Magenta
    glow: "rgba(138, 43, 226, 0.5)",
    particleColors: ["#8A2BE2", "#4B0082", "#EE82EE", "#FF00FF"],
    gradients: {
      main: "from-violet-500 via-indigo-500 to-purple-500",
      button: "from-violet-600 to-indigo-600",
      card: "from-violet-700/20 to-indigo-700/20",
      text: "from-violet-300 via-indigo-300 to-purple-300"
    },
    effects: {
      particleCount: 90,
      particleSpeed: 1.8,
      glowIntensity: 0.8,
      connectionDistance: 200,
      waveAmplitude: 18
    }
  }
};

interface NeuralThemeContextType {
  theme: NeuralTheme;
  themeName: string;
  setTheme: (name: string) => void;
  availableThemes: string[];
}

const NeuralThemeContext = createContext<NeuralThemeContextType | undefined>(undefined);

export function NeuralThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem('neuralTheme') || 'aurora';
  });
  
  const theme = themes[themeName] || themes.aurora;
  
  useEffect(() => {
    localStorage.setItem('neuralTheme', themeName);
    
    // Update CSS variables for the theme
    const root = document.documentElement;
    root.style.setProperty('--neural-primary', theme.primary);
    root.style.setProperty('--neural-secondary', theme.secondary);
    root.style.setProperty('--neural-tertiary', theme.tertiary);
    root.style.setProperty('--neural-accent', theme.accent);
    root.style.setProperty('--neural-glow', theme.glow);
    
    // Update body classes for Tailwind
    document.body.className = document.body.className.replace(/theme-\w+/, '');
    document.body.classList.add(`theme-${themeName}`);
  }, [themeName, theme]);
  
  return (
    <NeuralThemeContext.Provider
      value={{
        theme,
        themeName,
        setTheme: setThemeName,
        availableThemes: Object.keys(themes)
      }}
    >
      {children}
    </NeuralThemeContext.Provider>
  );
}

export function useNeuralTheme() {
  const context = useContext(NeuralThemeContext);
  if (!context) {
    throw new Error('useNeuralTheme must be used within NeuralThemeProvider');
  }
  return context;
}