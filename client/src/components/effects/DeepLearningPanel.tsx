import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, MessageSquare, Zap } from 'lucide-react';
import { deepLearning } from '@/services/deep-learning';
import { useNeuralTheme } from './NeuralThemeProvider';

interface DeepLearningPanelProps {
  input?: string;
  onPrediction?: (prediction: string) => void;
}

export function DeepLearningPanel({ input = '', onPrediction }: DeepLearningPanelProps) {
  const { theme } = useNeuralTheme();
  const [sentiment, setSentiment] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [userModel, setUserModel] = useState<string>('balanced');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Analyze sentiment when input changes
  useEffect(() => {
    if (input.length > 10) {
      analyzeSentiment();
    }
  }, [input]);
  
  const analyzeSentiment = async () => {
    setIsAnalyzing(true);
    try {
      const result = await deepLearning.analyzeSentiment(input);
      setSentiment(result);
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
    }
    setIsAnalyzing(false);
  };
  
  const predictText = async () => {
    if (input.length < 3) return;
    
    try {
      const result = await deepLearning.predictCompletion(input);
      setPrediction(result);
      if (onPrediction && result.text) {
        onPrediction(result.text);
      }
    } catch (error) {
      console.error('Text prediction failed:', error);
    }
  };
  
  const analyzeUserBehavior = async () => {
    // Get recent interactions from localStorage or state
    const interactions = JSON.parse(localStorage.getItem('userInteractions') || '[]');
    
    try {
      const analysis = await deepLearning.analyzeUserBehavior(interactions);
      setUserModel(analysis.suggestedModel);
      
      // Save user pattern
      deepLearning.saveUserPattern('preferredModel', analysis.suggestedModel);
    } catch (error) {
      console.error('User behavior analysis failed:', error);
    }
  };
  
  const getSentimentColor = () => {
    if (!sentiment) return theme.secondary;
    switch (sentiment.sentiment) {
      case 'positive': return '34, 197, 94'; // green
      case 'negative': return '239, 68, 68'; // red
      default: return theme.secondary;
    }
  };
  
  const getEmotionIcon = (emotion: string) => {
    const icons: any = {
      joy: '😊',
      sadness: '😢',
      anger: '😠',
      fear: '😨',
      surprise: '😮'
    };
    return icons[emotion] || '🤔';
  };
  
  return (
    <motion.div
      className={`fixed bottom-4 left-4 z-50 ${theme.gradients.card} backdrop-blur-xl rounded-2xl shadow-2xl`}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ width: isExpanded ? '400px' : '200px' }}
    >
      {/* Header */}
      <div 
        className="p-4 border-b border-white/10 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm">Deep Learning</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-white/60"
          >
            ▼
          </motion.div>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Sentiment Analysis */}
            {sentiment && (
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-white/60" />
                  <span className="text-xs text-white/60">Sentiment Analysis</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `rgba(${getSentimentColor()}, 0.2)`,
                      color: `rgb(${getSentimentColor()})`
                    }}
                  >
                    {sentiment.sentiment}
                  </div>
                  <div className="text-xs text-white/40">
                    {(sentiment.confidence * 100).toFixed(0)}% confidence
                  </div>
                </div>
                
                {/* Emotions */}
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {Object.entries(sentiment.emotions).map(([emotion, value]: [string, any]) => (
                    <div key={emotion} className="text-center">
                      <div className="text-lg">{getEmotionIcon(emotion)}</div>
                      <div className="text-xs text-white/40">{(value * 100).toFixed(0)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Text Prediction */}
            {prediction && (
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-white/60" />
                  <span className="text-xs text-white/60">Text Prediction</span>
                </div>
                
                <div className="space-y-2">
                  <div 
                    className="p-2 rounded bg-white/5 text-sm text-white cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => onPrediction?.(prediction.text)}
                  >
                    {prediction.text}
                  </div>
                  
                  {prediction.alternatives?.length > 0 && (
                    <div className="space-y-1">
                      {prediction.alternatives.map((alt: string, index: number) => (
                        <div 
                          key={index}
                          className="p-1 rounded bg-white/5 text-xs text-white/60 cursor-pointer hover:bg-white/10 transition-colors"
                          onClick={() => onPrediction?.(alt)}
                        >
                          {alt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* User Model */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-white/60" />
                <span className="text-xs text-white/60">Personalized Model</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${theme.gradients.button}`}>
                  {userModel}
                </div>
                <button
                  onClick={analyzeUserBehavior}
                  className="px-2 py-1 rounded bg-white/10 text-xs text-white hover:bg-white/20 transition-colors"
                >
                  Optimize
                </button>
              </div>
            </div>
            
            {/* Actions */}
            <div className="p-4 flex gap-2">
              <button
                onClick={predictText}
                className="flex-1 px-3 py-2 rounded bg-white/10 text-xs text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-1"
              >
                <Zap className="w-3 h-3" />
                Predict
              </button>
              <button
                onClick={analyzeSentiment}
                className="flex-1 px-3 py-2 rounded bg-white/10 text-xs text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-1"
                disabled={isAnalyzing}
              >
                <Brain className="w-3 h-3" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}