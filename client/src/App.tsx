import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TransitionProvider } from "@/contexts/TransitionContext";
import { TrainingAssistantButton } from "@/components/ui/training-assistant-button";
import { PageTransition, PageLoadingSkeleton } from "@/components/ui/page-transition";
import { NeuralThemeProvider } from "@/components/effects/NeuralThemeProvider";
import { NeuralThemeSelector } from "@/components/effects/NeuralThemeSelector";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Create from "@/pages/Create";
import CreateSimple from "@/pages/Create-Simple";
import Marketplace from "@/pages/Marketplace";
import Gallery from "@/pages/Gallery";
import Intelligence from "@/pages/Intelligence";
import NotFound from "@/pages/not-found";

// Transition configuration for different routes with creative effects
const routeTransitions = {
  '/': 'curtain',           // Dramatic curtain opening for home
  '/create': 'wipe',         // Professional wipe for creation page
  '/video-production': 'diagonal',  // Diagonal wipe for video
  '/video': 'diagonal',      // Same diagonal wipe for video route
  '/marketplace': 'wave',    // Wave effect for marketplace
  '/gallery': 'flip',        // 3D flip for gallery
  '/intelligence': 'rotate', // Rotate perspective for intelligence
} as const;

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [previousLocation, setPreviousLocation] = useState(location);
  
  // Detect route changes for transition effects
  useEffect(() => {
    if (location !== previousLocation) {
      setIsPageTransitioning(true);
      const timer = setTimeout(() => {
        setIsPageTransitioning(false);
        setPreviousLocation(location);
      }, 700); // Match longest transition duration
      return () => clearTimeout(timer);
    }
  }, [location, previousLocation]);

  if (isLoading) {
    return <PageLoadingSkeleton />;
  }

  // Get transition type based on current route
  const transitionType = (routeTransitions[location as keyof typeof routeTransitions] || 'fade') as any;

  return (
    <PageTransition pageKey={location} transitionType={transitionType}>
      <Switch>
        {/* All routes accessible regardless of authentication status */}
        <Route path="/create" component={Create} />
        <Route path="/video-production" component={CreateSimple} />
        <Route path="/video" component={CreateSimple} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/intelligence" component={Intelligence} />
        
        {/* Home/Landing based on authentication */}
        <Route path="/" component={isAuthenticated ? Home : Landing} />
        
        {/* Fallback for any other route */}
        <Route component={NotFound} />
      </Switch>
    </PageTransition>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Router />
      {/* AI Components temporarily disabled until proper positioning is implemented */}
      {/* <NeuralIntelligenceCore /> */}
      {/* <SuperIntelligencePanel /> */}
      {/* <EnhancedVoiceAssistant /> */}
      {isAuthenticated && <TrainingAssistantButton />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NeuralThemeProvider>
        <ThemeProvider>
          <TransitionProvider>
            <TooltipProvider>
              <Toaster />
              <AppContent />
              <NeuralThemeSelector />
            </TooltipProvider>
          </TransitionProvider>
        </ThemeProvider>
      </NeuralThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
