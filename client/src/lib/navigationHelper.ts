// Advanced navigation helper for voice commands
import { useLocation } from 'wouter';

export interface NavigationResult {
  success: boolean;
  message: string;
  currentPath: string;
  targetPath: string;
}

export class VoiceNavigationManager {
  private setLocation: (path: string) => void;
  private location: string;

  constructor(setLocation: (path: string) => void, location: string) {
    this.setLocation = setLocation;
    this.location = location;
  }

  async navigateWithConfirmation(targetPath: string): Promise<NavigationResult> {
    console.log(`[Navigation] Attempting to navigate from ${this.location} to ${targetPath}`);
    
    // Record initial state
    const initialPath = this.location;
    
    // Execute navigation
    this.setLocation(targetPath);
    
    // Wait for navigation to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify navigation success
    const finalPath = window.location.pathname;
    const success = finalPath === targetPath;
    
    const result: NavigationResult = {
      success,
      message: success 
        ? `Successfully navigated to ${targetPath}`
        : `Navigation failed: still at ${finalPath}, expected ${targetPath}`,
      currentPath: finalPath,
      targetPath
    };

    console.log(`[Navigation] Result:`, result);
    return result;
  }

  // Enhanced navigation with retry mechanism
  async navigateWithRetry(targetPath: string, maxRetries = 3): Promise<NavigationResult> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`[Navigation] Attempt ${attempt}/${maxRetries} to navigate to ${targetPath}`);
      
      const result = await this.navigateWithConfirmation(targetPath);
      
      if (result.success) {
        return result;
      }
      
      if (attempt < maxRetries) {
        console.log(`[Navigation] Attempt ${attempt} failed, retrying in 200ms...`);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // All attempts failed
    return {
      success: false,
      message: `Navigation failed after ${maxRetries} attempts`,
      currentPath: window.location.pathname,
      targetPath
    };
  }
}

// Hook for voice navigation
export function useVoiceNavigation() {
  const [location, setLocation] = useLocation();
  
  const navigationManager = new VoiceNavigationManager(setLocation, location);
  
  return {
    location,
    navigateWithConfirmation: (path: string) => navigationManager.navigateWithConfirmation(path),
    navigateWithRetry: (path: string, maxRetries?: number) => navigationManager.navigateWithRetry(path, maxRetries)
  };
}