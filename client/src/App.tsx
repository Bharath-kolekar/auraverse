import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NeuralIntelligenceCore from "@/components/NeuralIntelligenceCore";
import SuperIntelligencePanel from "@/components/ui/super-intelligence-panel";
import EnhancedVoiceAssistant from "@/components/ui/enhanced-voice-assistant";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TrainingAssistantButton } from "@/components/ui/training-assistant-button";
import { useAuth } from "@/hooks/useAuth";

import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Create from "@/pages/Create";
import CreateSimple from "@/pages/Create-Simple";
import Marketplace from "@/pages/Marketplace";
import Gallery from "@/pages/Gallery";
import Intelligence from "@/pages/Intelligence";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* All routes accessible regardless of authentication status */}
      <Route path="/create" component={Create} />
      <Route path="/video-production" component={CreateSimple} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/intelligence" component={Intelligence} />
      
      {/* Home/Landing based on authentication */}
      <Route path="/" component={isAuthenticated ? Home : Landing} />
      
      {/* Fallback for any other route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Router />
      {/* AI Components temporarily disabled to fix overlapping issues */}
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
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
