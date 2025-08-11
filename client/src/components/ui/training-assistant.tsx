import { useState, useEffect } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Textarea } from "./textarea";
import { Badge } from "./badge";
import { ScrollArea } from "./scroll-area";
import { useToast } from "@/hooks/use-toast";
import { PredictivePrompt } from '@/components/PredictivePrompt';
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Lightbulb,
  PlayCircle,
  Mic,
  Video,
  Music,
  Zap,
  ShoppingBag,
  HelpCircle
} from "lucide-react";

interface TrainingMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'suggestion' | 'tutorial' | 'tip';
}

interface TrainingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
}

export function TrainingAssistant({ isOpen, onClose, currentPage }: TrainingAssistantProps) {
  const [messages, setMessages] = useState<TrainingMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const quickActions = [
    { id: 'voice-commands', icon: Mic, label: 'Voice Commands', color: 'bg-green-500' },
    { id: 'create-audio', icon: Music, label: 'Create Audio', color: 'bg-blue-500' },
    { id: 'create-video', icon: Video, label: 'Create Video', color: 'bg-purple-500' },
    { id: 'create-vfx', icon: Zap, label: 'Create VFX', color: 'bg-orange-500' },
    { id: 'marketplace', icon: ShoppingBag, label: 'Marketplace', color: 'bg-pink-500' },
    { id: 'general-help', icon: HelpCircle, label: 'General Help', color: 'bg-gray-500' },
  ];

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest('/api/training/chat', 'POST', { 
        message, 
        currentPage, 
        context: 'user_training' 
      });
    },
    onSuccess: (response: any) => {
      const assistantMessage: TrainingMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.message || "I'm here to help you learn the platform!",
        timestamp: new Date(),
        type: (response.type === 'tip' || response.type === 'tutorial' || response.type === 'suggestion') 
          ? response.type 
          : 'tutorial'
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('Training assistant error:', error);
      setIsTyping(false);
      toast({
        title: "Assistant Error",
        description: "Failed to get response from training assistant",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;

    const userMessage: TrainingMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    sendMessageMutation.mutate(message);
  };

  const handleQuickAction = (actionId: string) => {
    const actionMessages = {
      'voice-commands': "How do I use voice commands to create content?",
      'create-audio': "Guide me through creating audio content",
      'create-video': "How do I generate AI videos?",
      'create-vfx': "Teach me about VFX and special effects creation",
      'marketplace': "How does the marketplace work for buying and selling content?",
      'general-help': "I'm new to the platform, where should I start?"
    };

    const message = actionMessages[actionId as keyof typeof actionMessages];
    if (message) {
      handleSendMessage(message);
    }
  };

  // Initialize with welcome message based on current page
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessages = {
        '/': "Welcome to Infinite Intelligence! I'm your AI training assistant. I can help you learn to create Oscar-quality content using our voice-interactive tools. What would you like to learn about?",
        '/create': "Great! You're on the Create page. I can guide you through generating audio, video, VFX, and images using AI. What type of content would you like to create first?",
        '/marketplace': "You're exploring the Marketplace! I can help you understand how to buy premium content or sell your own creations. What interests you most?",
        '/gallery': "Welcome to your Gallery! Here you can view and manage all your created content. Need help organizing or sharing your work?"
      };

      const welcomeMessage = welcomeMessages[currentPage as keyof typeof welcomeMessages] || welcomeMessages['/'];
      
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
        type: 'tutorial'
      }]);
    }
  }, [isOpen, currentPage, messages.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[80vh] bg-deep-black border-electric-blue/30 flex flex-col">
        <CardHeader className="border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-electric-blue">
              <Bot className="mr-2 h-6 w-6" />
              AI Training Assistant
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-400">
            Learn to master voice-interactive content creation
          </p>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Quick Actions */}
          <div className="p-4 border-b border-gray-800">
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.id)}
                  className="text-xs p-2 h-auto flex flex-col items-center space-y-1 hover:border-electric-blue/50"
                >
                  <action.icon className="h-4 w-4" />
                  <span className="text-[10px]">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-electric-blue text-white'
                        : 'bg-cyber-gray/50 text-gray-100'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <Bot className="h-4 w-4 mt-0.5 text-electric-blue flex-shrink-0" />
                      )}
                      {message.role === 'user' && (
                        <User className="h-4 w-4 mt-0.5 text-white flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm">{message.content}</p>
                        {message.type && message.role === 'assistant' && (
                          <Badge
                            variant="secondary"
                            className="mt-2 text-xs"
                          >
                            {message.type === 'tip' && <Lightbulb className="h-3 w-3 mr-1" />}
                            {message.type === 'tutorial' && <PlayCircle className="h-3 w-3 mr-1" />}
                            {message.type}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-cyber-gray/50 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 text-electric-blue" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-gray-800 flex-shrink-0">
            <div className="flex space-x-2">
              <div className="flex-1">
                <PredictivePrompt
                  value={input}
                  onChange={setInput}
                  placeholder="Ask me anything about using the platform..."
                  contentType="text"
                  onSubmit={() => handleSendMessage(input)}
                />
              </div>
              <Button
                onClick={() => handleSendMessage(input)}
                disabled={!input.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-electric-blue to-neon-purple self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}