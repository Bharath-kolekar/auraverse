// Global Placement Context for managing component positions
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useIntelligentPlacement, ComponentDimensions, ComponentPosition, PlacementConfig } from '@/hooks/useIntelligentPlacement';

interface PlacementContextValue {
  registerComponent: (id: string, dimensions: ComponentDimensions) => void;
  unregisterComponent: (id: string) => void;
  getPosition: (id: string) => ComponentPosition | undefined;
  updateDimensions: (id: string, dimensions: Partial<ComponentDimensions>) => void;
  recalculate: () => void;
}

const PlacementContext = createContext<PlacementContextValue | null>(null);

export function PlacementProvider({ children }: { children: ReactNode }) {
  const [components, setComponents] = useState<Map<string, ComponentDimensions>>(new Map());
  const [componentsList, setComponentsList] = useState<ComponentDimensions[]>([]);

  // Convert map to array for the placement hook
  useEffect(() => {
    setComponentsList(Array.from(components.values()));
  }, [components]);

  const placementConfig: PlacementConfig = {
    margin: 20,
    screenPadding: 16,
    avoidCenter: true,
    smartCollisionDetection: true
  };

  const { positions, getPosition, recalculate } = useIntelligentPlacement(componentsList, placementConfig);

  const registerComponent = useCallback((id: string, dimensions: ComponentDimensions) => {
    setComponents(prev => {
      const newMap = new Map(prev);
      newMap.set(id, { ...dimensions, id });
      return newMap;
    });
  }, []);

  const unregisterComponent = useCallback((id: string) => {
    setComponents(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const updateDimensions = useCallback((id: string, dimensions: Partial<ComponentDimensions>) => {
    setComponents(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(id);
      if (existing) {
        newMap.set(id, { ...existing, ...dimensions });
      }
      return newMap;
    });
  }, []);

  const value: PlacementContextValue = {
    registerComponent,
    unregisterComponent,
    getPosition,
    updateDimensions,
    recalculate
  };

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
  const { registerComponent, unregisterComponent, getPosition, updateDimensions } = usePlacement();
  const [position, setPosition] = useState<ComponentPosition | undefined>();

  useEffect(() => {
    // Register component on mount
    registerComponent(componentId, {
      id: componentId,
      width: defaultDimensions.width,
      height: defaultDimensions.height,
      priority
    });

    // Unregister on unmount
    return () => {
      unregisterComponent(componentId);
    };
  }, [componentId, registerComponent, unregisterComponent, priority]);

  // Update dimensions if they change
  useEffect(() => {
    updateDimensions(componentId, {
      width: defaultDimensions.width,
      height: defaultDimensions.height
    });
  }, [componentId, defaultDimensions.width, defaultDimensions.height, updateDimensions]);

  // Get position updates
  useEffect(() => {
    const interval = setInterval(() => {
      const pos = getPosition(componentId);
      if (pos) {
        setPosition(pos);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [componentId, getPosition]);

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