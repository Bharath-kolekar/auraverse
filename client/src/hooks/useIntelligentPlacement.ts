// Intelligent Component Placement Algorithm
import { useState, useEffect, useRef, useCallback } from 'react';

export interface ComponentDimensions {
  width: number;
  height: number;
  id: string;
  priority: number; // Higher priority components get placed first
}

export interface ComponentPosition {
  x: number;
  y: number;
  zone: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-top' | 'center-bottom';
}

export interface PlacementConfig {
  margin: number; // Minimum margin between components
  screenPadding: number; // Padding from screen edges
  avoidCenter: boolean; // Avoid placing components in center of screen
  smartCollisionDetection: boolean;
}

const DEFAULT_CONFIG: PlacementConfig = {
  margin: 16,
  screenPadding: 16,
  avoidCenter: true,
  smartCollisionDetection: true
};

// Define safe zones for component placement
const PLACEMENT_ZONES = {
  'top-left': { x: 0, y: 0, anchorX: 'left', anchorY: 'top' },
  'top-right': { x: 1, y: 0, anchorX: 'right', anchorY: 'top' },
  'bottom-left': { x: 0, y: 1, anchorX: 'left', anchorY: 'bottom' },
  'bottom-right': { x: 1, y: 1, anchorX: 'right', anchorY: 'bottom' },
  'center-top': { x: 0.5, y: 0, anchorX: 'center', anchorY: 'top' },
  'center-bottom': { x: 0.5, y: 1, anchorX: 'center', anchorY: 'bottom' }
};

export function useIntelligentPlacement(
  components: ComponentDimensions[],
  config: Partial<PlacementConfig> = {}
) {
  const [positions, setPositions] = useState<Map<string, ComponentPosition>>(new Map());
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const occupiedSpaces = useRef<Map<string, DOMRect>>(new Map());
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Update viewport dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if two rectangles overlap
  const checkOverlap = (rect1: DOMRect, rect2: DOMRect): boolean => {
    return !(
      rect1.right + finalConfig.margin < rect2.left ||
      rect1.left > rect2.right + finalConfig.margin ||
      rect1.bottom + finalConfig.margin < rect2.top ||
      rect1.top > rect2.bottom + finalConfig.margin
    );
  };

  // Calculate position based on zone and component dimensions
  const calculatePosition = (
    component: ComponentDimensions,
    zone: keyof typeof PLACEMENT_ZONES
  ): { x: number; y: number; rect: DOMRect } => {
    const zoneConfig = PLACEMENT_ZONES[zone];
    let x = 0;
    let y = 0;

    // Calculate base position based on zone
    switch (zoneConfig.anchorX) {
      case 'left':
        x = finalConfig.screenPadding;
        break;
      case 'right':
        x = viewport.width - component.width - finalConfig.screenPadding;
        break;
      case 'center':
        x = (viewport.width - component.width) / 2;
        break;
    }

    switch (zoneConfig.anchorY) {
      case 'top':
        y = finalConfig.screenPadding;
        // Add navbar offset for top positions
        if (zone.includes('top')) {
          y += 80; // Account for navbar height
        }
        break;
      case 'bottom':
        y = viewport.height - component.height - finalConfig.screenPadding;
        break;
    }

    const rect = new DOMRect(x, y, component.width, component.height);
    return { x, y, rect };
  };

  // Find non-overlapping position for component
  const findSafePosition = (component: ComponentDimensions): ComponentPosition | null => {
    const zones = Object.keys(PLACEMENT_ZONES) as Array<keyof typeof PLACEMENT_ZONES>;
    
    // Sort zones by priority - corners first, then edges
    const prioritizedZones = zones.sort((a, b) => {
      if (a.includes('corner') && !b.includes('corner')) return -1;
      if (!a.includes('corner') && b.includes('corner')) return 1;
      return 0;
    });

    for (const zone of prioritizedZones) {
      // Skip center zones if configured to avoid center
      if (finalConfig.avoidCenter && zone.includes('center')) {
        continue;
      }

      const { x, y, rect } = calculatePosition(component, zone);
      
      // Check if position overlaps with any occupied space
      let hasOverlap = false;
      for (const [id, occupiedRect] of occupiedSpaces.current) {
        if (id !== component.id && checkOverlap(rect, occupiedRect)) {
          hasOverlap = true;
          break;
        }
      }

      if (!hasOverlap) {
        // Found a safe position
        occupiedSpaces.current.set(component.id, rect);
        return { x, y, zone };
      }
    }

    // If no safe position found, try offsetting from preferred zones
    for (const zone of prioritizedZones.slice(0, 4)) {
      const basePosition = calculatePosition(component, zone);
      
      // Try different offsets
      const offsets = [
        { dx: 0, dy: 100 },
        { dx: 100, dy: 0 },
        { dx: -100, dy: 0 },
        { dx: 0, dy: -100 },
        { dx: 50, dy: 50 },
        { dx: -50, dy: 50 },
        { dx: 50, dy: -50 },
        { dx: -50, dy: -50 }
      ];

      for (const { dx, dy } of offsets) {
        const x = basePosition.x + dx;
        const y = basePosition.y + dy;
        
        // Check boundaries
        if (x < 0 || y < 0 || x + component.width > viewport.width || y + component.height > viewport.height) {
          continue;
        }

        const rect = new DOMRect(x, y, component.width, component.height);
        
        let hasOverlap = false;
        for (const [id, occupiedRect] of occupiedSpaces.current) {
          if (id !== component.id && checkOverlap(rect, occupiedRect)) {
            hasOverlap = true;
            break;
          }
        }

        if (!hasOverlap) {
          occupiedSpaces.current.set(component.id, rect);
          return { x, y, zone };
        }
      }
    }

    return null;
  };

  // Recalculate positions when components or viewport change
  useEffect(() => {
    const newPositions = new Map<string, ComponentPosition>();
    occupiedSpaces.current.clear();

    // Sort components by priority (higher priority placed first)
    const sortedComponents = [...components].sort((a, b) => b.priority - a.priority);

    for (const component of sortedComponents) {
      const position = findSafePosition(component);
      if (position) {
        newPositions.set(component.id, position);
      }
    }

    setPositions(newPositions);
  }, [components, viewport, finalConfig]);

  // Get position for a specific component
  const getPosition = useCallback((componentId: string): ComponentPosition | undefined => {
    return positions.get(componentId);
  }, [positions]);

  // Force recalculation
  const recalculate = useCallback(() => {
    setViewport({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  return {
    positions,
    getPosition,
    recalculate,
    viewport
  };
}

// Helper hook for individual components
export function useComponentPlacement(
  componentId: string,
  dimensions: { width: number; height: number },
  priority: number = 0
) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [position, setPosition] = useState<ComponentPosition | null>(null);

  // This would connect to a global placement context in a real implementation
  // For now, returning default positions based on component ID
  useEffect(() => {
    // Simulate intelligent placement based on component ID
    const defaultPositions: Record<string, ComponentPosition> = {
      'neural-intelligence': { x: 16, y: 96, zone: 'top-left' },
      'voice-assistant': { x: window.innerWidth - dimensions.width - 16, y: 96, zone: 'top-right' },
      'super-intelligence': { x: 16, y: window.innerHeight - dimensions.height - 16, zone: 'bottom-left' }
    };

    const pos = defaultPositions[componentId];
    if (pos) {
      setPosition(pos);
      setIsRegistered(true);
    }
  }, [componentId, dimensions]);

  return {
    position,
    isRegistered,
    style: position ? {
      position: 'fixed' as const,
      left: `${position.x}px`,
      top: `${position.y}px`,
      zIndex: 1000 + priority
    } : undefined
  };
}