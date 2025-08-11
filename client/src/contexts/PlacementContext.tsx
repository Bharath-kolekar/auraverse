// Global Placement Context for managing component positions
import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode, useMemo } from 'react';
import { ComponentDimensions, ComponentPosition, PlacementConfig } from '@/hooks/useIntelligentPlacement';

interface PlacementContextValue {
  registerComponent: (id: string, dimensions: ComponentDimensions) => void;
  unregisterComponent: (id: string) => void;
  getPosition: (id: string) => ComponentPosition | undefined;
  updateDimensions: (id: string, dimensions: Partial<ComponentDimensions>) => void;
  recalculate: () => void;
}

const PlacementContext = createContext<PlacementContextValue | null>(null);

// Simple position management without complex hook
const SIMPLE_ZONES: Record<string, { x: number; y: number }> = {
  'top-left': { x: 16, y: 100 },
  'top-right': { x: -208, y: 100 },
  'bottom-left': { x: 16, y: -316 },
  'bottom-right': { x: -208, y: -316 },
};

export function PlacementProvider({ children }: { children: ReactNode }) {
  const [components] = useState<Map<string, ComponentDimensions>>(new Map());
  const [positions] = useState<Map<string, ComponentPosition>>(new Map());
  const componentsRef = useRef(components);
  const positionsRef = useRef(positions);

  // Simple position assignment based on component count
  const assignPosition = useCallback((id: string): ComponentPosition => {
    const zoneKeys = Object.keys(SIMPLE_ZONES);
    const index = componentsRef.current.size % zoneKeys.length;
    const zoneKey = zoneKeys[index];
    const zone = SIMPLE_ZONES[zoneKey];
    
    const position: ComponentPosition = {
      x: zone.x >= 0 ? zone.x : window.innerWidth + zone.x,
      y: zone.y >= 0 ? zone.y : window.innerHeight + zone.y,
      zone: zoneKey as any
    };
    
    positionsRef.current.set(id, position);
    return position;
  }, []);

  const registerComponent = useCallback((id: string, dimensions: ComponentDimensions) => {
    if (!componentsRef.current.has(id)) {
      componentsRef.current.set(id, { ...dimensions, id });
      assignPosition(id);
    }
  }, [assignPosition]);

  const unregisterComponent = useCallback((id: string) => {
    componentsRef.current.delete(id);
    positionsRef.current.delete(id);
  }, []);

  const getPosition = useCallback((id: string): ComponentPosition | undefined => {
    return positionsRef.current.get(id);
  }, []);

  const updateDimensions = useCallback((id: string, dimensions: Partial<ComponentDimensions>) => {
    const existing = componentsRef.current.get(id);
    if (existing) {
      componentsRef.current.set(id, { ...existing, ...dimensions });
    }
  }, []);

  const recalculate = useCallback(() => {
    // Simplified - just reassign positions
    componentsRef.current.forEach((_, id) => {
      assignPosition(id);
    });
  }, [assignPosition]);

  const value: PlacementContextValue = useMemo(() => ({
    registerComponent,
    unregisterComponent,
    getPosition,
    updateDimensions,
    recalculate
  }), [registerComponent, unregisterComponent, getPosition, updateDimensions, recalculate]);

  return (
    <PlacementContext.Provider value={value}>
      {children}
    </PlacementContext.Provider>
  );
}

export function usePlacement() {
  const context = useContext(PlacementContext);
  if (!context) {
    throw new Error('usePlacement must be used within a PlacementProvider');
  }
  return context;
}

// Hook for components to register and get their position
export function useSmartPosition(
  componentId: string,
  defaultDimensions: { width: number; height: number },
  priority: number = 0
) {
  const context = useContext(PlacementContext);
  if (!context) {
    // Return a dummy position if context is not available
    return {
      style: {
        position: 'fixed' as const,
        left: 16,
        top: 100,
        zIndex: 50
      }
    };
  }
  
  const { registerComponent, unregisterComponent, getPosition } = context;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    registerComponent(componentId, {
      id: componentId,
      width: defaultDimensions.width,
      height: defaultDimensions.height,
      priority
    });

    return () => {
      unregisterComponent(componentId);
    };
  }, []); // Empty deps is intentional - we only want to register once

  const position = mounted ? getPosition(componentId) : undefined;
  
  return {
    style: position ? {
      position: 'fixed' as const,
      left: position.x,
      top: position.y,
      zIndex: 50
    } : {
      position: 'fixed' as const,
      left: 16,
      top: 100,
      zIndex: 50
    }
  };

  return {
    position,
    style: position ? {
      position: 'fixed' as const,
      left: `${position.x}px`,
      top: `${position.y}px`,
      zIndex: 1000 + priority,
      transition: 'all 0.3s ease-in-out'
    } : {
      position: 'fixed' as const,
      left: '-9999px',
      top: '-9999px',
      opacity: 0
    }
  };
}