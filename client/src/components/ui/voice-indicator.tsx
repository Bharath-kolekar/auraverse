import { Mic, MicOff } from "lucide-react";
import { Button } from "./button";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";
import { cn } from "@/lib/utils";

export function VoiceIndicator() {
  const { isListening, startListening, stopListening } = useVoiceCommands();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={isListening ? stopListening : startListening}
      className={cn(
        "relative",
        isListening && "bg-red-500/20 hover:bg-red-500/30"
      )}
    >
      {isListening ? (
        <>
          <MicOff className="w-4 h-4 text-red-400" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </>
      ) : (
        <Mic className="w-4 h-4 text-gray-400 hover:text-electric-blue transition-colors" />
      )}
    </Button>
  );
}