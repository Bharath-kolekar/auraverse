import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Layers, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import { NeuralCard } from '@/components/effects/NeuralCard';
import { NeuralButton } from '@/components/effects/NeuralButton';
import { PredictiveInput } from '@/components/effects/PredictiveInput';
import { DeepLearningPanel } from '@/components/effects/DeepLearningPanel';
import { useToast } from '@/hooks/use-toast';
import { useNeuralTheme } from '@/components/effects/NeuralThemeProvider';

export default function IntelligenceTest() {
  const [prompt, setPrompt] = useState('');
  const [ensembleResult, setEnsembleResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { theme } = useNeuralTheme();

  const testEnsembleLearning = async () => {
    if (!prompt) {
      toast({
        title: "Input Required",
        description: "Please enter a prompt to test ensemble learning",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setEnsembleResult(null);

    try {
      const response = await fetch('/api/ensemble/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          prompt,
          type: 'text',
          crossValidate: true,
          autoRank: true
        })
      });

      if (!response.ok) throw new Error('Generation failed');

      const result = await response.json();
      setEnsembleResult(result);

      toast({
        title: "Success!",
        description: `Generated with ${(result.confidence * 100).toFixed(0)}% confidence`,
      });
    } catch (error) {
      console.error('Ensemble generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content with ensemble learning",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const testSmartSwitch = async () => {
    if (!prompt) {
      toast({
        title: "Input Required",
        description: "Please enter a prompt to test smart switching",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/ensemble/smart-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          prompt,
          context: { domain: 'creative', quality: 'professional' }
        })
      });

      if (!response.ok) throw new Error('Smart switch failed');

      const result = await response.json();
      
      toast({
        title: "Smart Switch Success!",
        description: "Content generated using intelligent model switching",
      });

      setEnsembleResult({
        content: result.content,
        reasoning: "Used intelligent model switching to optimize generation"
      });
    } catch (error) {
      console.error('Smart switch error:', error);
      toast({
        title: "Smart Switch Failed",
        description: "Failed to process with smart switch",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            <span className={theme.gradients.text}>Intelligence Testing Lab</span>
          </h1>
          <p className="text-white/60 text-lg">
            Test ensemble learning and deep learning pattern recognition
          </p>
        </motion.div>

        {/* Main Testing Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ensemble Learning Test */}
          <NeuralCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Layers className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Ensemble Learning</h2>
            </div>

            <div className="space-y-4">
              <PredictiveInput
                placeholder="Enter your creative prompt..."
                value={prompt}
                onChange={setPrompt}
                enablePrediction={true}
              />

              <div className="grid grid-cols-2 gap-3">
                <NeuralButton
                  onClick={testEnsembleLearning}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Test Ensemble
                    </>
                  )}
                </NeuralButton>

                <NeuralButton
                  onClick={testSmartSwitch}
                  disabled={isGenerating}
                  className="w-full"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Smart Switch
                </NeuralButton>
              </div>

              {/* Results Display */}
              {ensembleResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="font-semibold">Generation Result</span>
                  </div>
                  
                  {ensembleResult.content && (
                    <p className="text-white/80 mb-4">{ensembleResult.content}</p>
                  )}
                  
                  {ensembleResult.confidence && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <TrendingUp className="w-4 h-4" />
                      <span>Confidence: {(ensembleResult.confidence * 100).toFixed(0)}%</span>
                    </div>
                  )}
                  
                  {ensembleResult.reasoning && (
                    <p className="text-sm text-white/60 mt-2">{ensembleResult.reasoning}</p>
                  )}

                  {ensembleResult.ensemble && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-semibold text-white/80">Ensemble Results:</h4>
                      {ensembleResult.ensemble.map((result: any, index: number) => (
                        <div key={index} className="text-xs p-2 bg-white/5 rounded">
                          <span className="text-purple-400">{result.source}:</span>
                          <span className="ml-2 text-white/60">
                            {(result.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </NeuralCard>

          {/* Features Overview */}
          <NeuralCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold">Intelligence Features</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-600/10 to-cyan-600/10 rounded-lg border border-purple-500/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Ensemble Learning
                </h3>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Combines multiple AI models for superior results</li>
                  <li>• Cross-validates between different approaches</li>
                  <li>• Automatically ranks and selects best output</li>
                  <li>• Intelligent model switching based on content</li>
                </ul>
              </div>

              <div className="p-4 bg-gradient-to-r from-cyan-600/10 to-pink-600/10 rounded-lg border border-cyan-500/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Deep Learning Recognition
                </h3>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• WebAssembly-based neural networks</li>
                  <li>• Real-time sentiment analysis</li>
                  <li>• Predictive text completion</li>
                  <li>• User behavior pattern analysis</li>
                </ul>
              </div>

              <div className="p-4 bg-gradient-to-r from-pink-600/10 to-purple-600/10 rounded-lg border border-pink-500/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Performance Optimization
                </h3>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Zero-cost local processing</li>
                  <li>• Intelligent caching system</li>
                  <li>• GPU acceleration support</li>
                  <li>• &lt;1ms cached response time</li>
                </ul>
              </div>
            </div>
          </NeuralCard>
        </div>

        {/* Deep Learning Panel */}
        <DeepLearningPanel 
          input={prompt}
          onPrediction={(prediction) => setPrompt(prompt + ' ' + prediction)}
        />
      </div>
    </div>
  );
}