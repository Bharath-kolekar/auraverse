import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Sparkles,
  Zap
} from "lucide-react";

export function VoiceIndicator() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>("");
  const [audioLevel, setAudioLevel] = useState(0);

  // Simulate voice activity
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [isListening]);

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setLastCommand("");
    }
  };

  const simulateCommand = () => {
    setIsProcessing(true);
    const commands = [
      "Generate epic orchestral music",
      "Create cinematic VFX scene",
      "Maya, cast magic spell",
      "Jadoo power activate",
      "Neural art creation mode"
    ];
    
    setTimeout(() => {
      setLastCommand(commands[Math.floor(Math.random() * commands.length)]);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="relative">
      {/* Main Voice Control */}
      <motion.div 
        className="relative p-6 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-2xl border border-purple-500/30 backdrop-blur-sm"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {/* Voice Activity Visualizer */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10"
            animate={{
              opacity: isListening ? [0.3, 0.7, 0.3] : 0,
            }}
            transition={{
              duration: 1.5,
              repeat: isListening ? Infinity : 0,
            }}
          />
        </div>

        <div className="relative z-10 text-center">
          {/* Microphone Button */}
          <motion.div
            className="relative mb-4"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              onClick={toggleListening}
              size="lg"
              className={`w-16 h-16 rounded-full ${
                isListening 
                  ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600" 
                  : "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
              }`}
            >
              <AnimatePresence mode="wait">
                {isListening ? (
                  <motion.div
                    key="listening"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                  >
                    <Mic className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="muted"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                  >
                    <MicOff className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {/* Audio Level Rings */}
            <AnimatePresence>
              {isListening && (
                <>
                  {[1, 2, 3].map((ring) => (
                    <motion.div
                      key={ring}
                      className="absolute inset-0 rounded-full border-2 border-purple-400/50"
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ 
                        scale: 1 + (audioLevel / 100) * ring * 0.3,
                        opacity: [0, 0.7, 0]
                      }}
                      exit={{ scale: 1, opacity: 0 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: ring * 0.2,
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Status Text */}
          <div className="mb-3">
            <motion.h3 
              className="text-lg font-semibold text-white mb-1"
              animate={{
                color: isListening ? "#22c55e" : "#a855f7"
              }}
            >
              {isListening ? "🎙️ Maya Listening..." : "🪄 Voice Magic Ready"}
            </motion.h3>
            <p className="text-sm text-gray-400">
              {isListening ? "Speak your creative command" : "Click to activate Jadoo voice"}
            </p>
          </div>

          {/* Quick Command Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={simulateCommand}
              disabled={isProcessing}
              variant="outline"
              size="sm"
              className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/20"
            >
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="h-4 w-4 mr-2" />
                </motion.div>
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isProcessing ? "Processing..." : "Quick Spell"}
            </Button>
          </motion.div>
        </div>

        {/* Audio Level Bars */}
        {isListening && (
          <div className="absolute bottom-2 left-2 right-2 flex justify-center space-x-1">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-purple-500 to-cyan-400 rounded-full"
                animate={{
                  height: [4, Math.random() * 20 + 4, 4],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Last Command Display */}
      <AnimatePresence>
        {lastCommand && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute top-full mt-4 left-0 right-0 bg-gradient-to-r from-green-900/80 to-emerald-900/80 rounded-xl p-4 border border-green-500/30 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Volume2 className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-400">Command Received:</p>
                <p className="text-white font-semibold">"{lastCommand}"</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}