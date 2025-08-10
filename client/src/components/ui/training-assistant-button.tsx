import { useState } from "react";
import { Button } from "./button";
import { TrainingAssistant } from "./training-assistant";
import { HelpCircle, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export function TrainingAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-electric-blue to-neon-purple hover:shadow-lg hover:shadow-electric-blue/30 transition-all duration-300 rounded-full p-4"
        size="lg"
      >
        <Sparkles className="h-5 w-5 mr-2" />
        AI Trainer
      </Button>
      
      <TrainingAssistant
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentPage={location}
      />
    </>
  );
}