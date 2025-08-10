import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TrainingAssistantButton } from "@/components/ui/training-assistant-button";
import { useAuth } from "@/hooks/useAuth";

import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Create from "@/pages/Create";
import Marketplace from "@/pages/Marketplace";
import Gallery from "@/pages/Gallery";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/create" component={Create} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/gallery" component={Gallery} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Router />
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
