import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  X, 
  MessageCircle, 
  Sparkles, 
  Wand2,
  Eye,
  ShoppingBag,
  Image,
  Send
} from "lucide-react";

export function TrainingAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [inputMessage, setInputMessage] = useState("");

  const quickActions = [
    { 
      icon: Wand2, 
      label: "Voice Commands", 
      message: "How do I use voice commands effectively?",
      color: "from-purple-500 to-pink-500"
    },
    { 
      icon: Sparkles, 
      label: "Content Creation", 
      message: "Guide me through creating Oscar-quality content",
      color: "from-cyan-500 to-blue-500"
    },
    { 
      icon: ShoppingBag, 
      label: "Marketplace", 
      message: "How does the Jadoo marketplace work?",
      color: "from-yellow-500 to-orange-500"
    },
    { 
      icon: Image, 
      label: "Gallery", 
      message: "Help me organize my content gallery",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const handleQuickAction = (message: string) => {
    const newUserMessage = {
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = {
        "How do I use voice commands effectively?": "🎙️ Maya's voice magic is powerful! Try saying 'Generate epic orchestral music' or 'Create cinematic VFX scene'. I respond to natural language commands about content creation, editing, and marketplace actions.",
        "Guide me through creating Oscar-quality content": "🎬 Welcome to neural creation! Start by selecting your content type (audio, video, or VFX), describe your vision in detail, and let Maya's AI process your request. Use specific terms like 'cinematic', 'epic', or 'dramatic' for better results.",
        "How does the Jadoo marketplace work?": "💫 The Jadoo marketplace is where creators trade magical content! Upload your creations, set prices, browse others' work, and use our neural rating system. Premium content gets highlighted with special effects.",
        "Help me organize my content gallery": "🖼️ Your gallery is your digital spellbook! Organize by project type, creation date, or magical energy level. Use tags like #epic, #cinematic, or #neural for easy searching."
      };
      
      const assistantMessage = {
        type: 'assistant' as const,
        content: responses[message as keyof typeof responses] || "✨ I'm here to help you master the Magic AI platform! Ask me anything about voice commands, content creation, or platform features.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    handleQuickAction(inputMessage);
    setInputMessage("");
  };

  return (
    <>
      {/* Floating AI Trainer Button */}
      <motion.div
        className="fixed bottom-6 left-6 z-50"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 hover:shadow-2xl hover:shadow-purple-500/50 neural-pulse"
          >
            <Brain className="h-6 w-6 text-white" />
          </Button>
        </motion.div>
        
        {/* Floating Label */}
        <motion.div
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          AI Trainer
        </motion.div>
      </motion.div>

      {/* Training Assistant Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Modal Content */}
            <motion.div
              className="relative w-full max-w-2xl max-h-[80vh] bg-gradient-to-b from-space-black to-deep-black rounded-2xl border border-purple-500/30 overflow-hidden"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center neural-pulse">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                      Maya's AI Training Assistant
                    </h2>
                    <p className="text-sm text-gray-400">Your guide to Magic AI mastery</p>
                  </div>
                </div>
                
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Quick Actions */}
              <div className="p-6 border-b border-purple-500/20">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />
                  Quick Help Topics
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={action.label}
                      onClick={() => handleQuickAction(action.message)}
                      className={`flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r ${action.color} bg-opacity-20 border border-white/10 hover:border-white/30 transition-all duration-300 text-left`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <action.icon className="h-4 w-4 text-white" />
                      <span className="text-sm font-medium text-white">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 max-h-60">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Wand2 className="h-12 w-12 text-purple-400 mx-auto mb-4 neural-pulse" />
                      <p className="text-gray-400">Welcome to Maya's training session!</p>
                      <p className="text-sm text-gray-500 mt-2">Click a topic above or ask me anything about Magic AI</p>
                    </motion.div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className={`max-w-xs p-3 rounded-xl ${
                          message.type === 'user' 
                            ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white' 
                            : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-100 border border-purple-500/30'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-purple-500/20">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask Maya anything..."
                    className="flex-1 px-4 py-2 bg-gray-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 transition-colors"
                  />
                  <motion.button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}