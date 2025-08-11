// Interactive Playground Component
// Test and experiment with AI capabilities in real-time

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, Pause, RefreshCw, Download, Upload, Settings,
  Zap, Brain, Sparkles, Image, Music, Video, Mic,
  Code, FileText, BarChart, Layers, Cpu, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface PlaygroundProps {
  selectedTier?: any;
  selectedCapability?: any;
  gpuAccelerator?: any;
}

export function InteractivePlayground({ 
  selectedTier, 
  selectedCapability,
  gpuAccelerator 
}: PlaygroundProps) {
  const { toast } = useToast();
  const [inputText, setInputText] = useState('');
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [outputResult, setOutputResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [selectedMode, setSelectedMode] = useState('text');
  const [parameters, setParameters] = useState({
    quality: 'high',
    temperature: 0.7,
    maxTokens: 500,
    style: 'creative',
    enhancement: true,
    gpuAcceleration: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Test capability mutation
  const testMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/gateway/test', 'POST', data);
    },
    onSuccess: (data) => {
      setOutputResult(data.result);
      setIsProcessing(false);
      setProcessingProgress(100);
      toast({
        title: 'Processing Complete',
        description: `Completed in ${data.result?.performance?.processingTime}ms`
      });
    },
    onError: (error) => {
      setIsProcessing(false);
      setProcessingProgress(0);
      toast({
        title: 'Processing Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  });

  // Simulate processing progress
  useEffect(() => {
    if (isProcessing && processingProgress < 90) {
      const timer = setTimeout(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isProcessing, processingProgress]);

  // Apply GPU acceleration effects
  useEffect(() => {
    if (canvasRef.current && parameters.gpuAcceleration && gpuAccelerator) {
      gpuAccelerator.applyVisualEffect(canvasRef.current, 'neural', 0.5);
    }
  }, [parameters.gpuAcceleration, gpuAccelerator]);

  const handleProcess = async () => {
    if (!inputText.trim() && !inputFile) {
      toast({
        title: 'Input Required',
        description: 'Please provide text input or upload a file',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(10);
    setOutputResult(null);

    const input = {
      text: inputText,
      file: inputFile ? await fileToBase64(inputFile) : null,
      mode: selectedMode,
      parameters
    };

    const capabilityId = selectedCapability?.id || 'text_generation';
    
    await testMutation.mutateAsync({
      capabilityId,
      input,
      options: {
        quality: parameters.quality,
        timeout: 30000
      }
    });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setInputFile(file);
      
      // Detect mode based on file type
      if (file.type.startsWith('image/')) {
        setSelectedMode('image');
      } else if (file.type.startsWith('audio/')) {
        setSelectedMode('audio');
      } else if (file.type.startsWith('video/')) {
        setSelectedMode('video');
      } else {
        setSelectedMode('text');
      }
    }
  };

  const handleReset = () => {
    setInputText('');
    setInputFile(null);
    setOutputResult(null);
    setProcessingProgress(0);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadResult = () => {
    if (!outputResult) return;
    
    const dataStr = JSON.stringify(outputResult, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ai-result-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const modeIcons = {
    text: <FileText className="w-4 h-4" />,
    image: <Image className="w-4 h-4" />,
    audio: <Music className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    voice: <Mic className="w-4 h-4" />,
    code: <Code className="w-4 h-4" />,
    analysis: <BarChart className="w-4 h-4" />
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold text-white mb-2">AI Intelligence Playground</h2>
        <p className="text-white/70">Test and experiment with AI capabilities in real-time</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card className="glass-morphism border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Input Configuration
              </span>
              {selectedTier && (
                <Badge variant="outline" className="text-xs">
                  {selectedTier.name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode Selection */}
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(modeIcons).map(([mode, icon]) => (
                <Button
                  key={mode}
                  variant={selectedMode === mode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMode(mode)}
                  className={selectedMode === mode ? 'bg-purple-600' : ''}
                >
                  {icon}
                  <span className="ml-1 text-xs">{mode}</span>
                </Button>
              ))}
            </div>

            {/* Text Input */}
            <div className="space-y-2">
              <Label>Input Text</Label>
              <Textarea
                placeholder="Enter your prompt, query, or content to process..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[120px] bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>File Upload (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="bg-white/5 border-white/10 text-white"
                  accept="image/*,audio/*,video/*,text/*"
                />
                {inputFile && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    {inputFile.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Parameters */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Advanced Parameters
              </h3>

              {/* Quality */}
              <div className="space-y-2">
                <Label className="text-xs">Quality</Label>
                <Select value={parameters.quality} onValueChange={(v) => setParameters({...parameters, quality: v})}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Fast)</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="ultra">Ultra (Slow)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Temperature</Label>
                  <span className="text-xs text-white/50">{parameters.temperature}</span>
                </div>
                <Slider
                  value={[parameters.temperature]}
                  onValueChange={(v) => setParameters({...parameters, temperature: v[0]})}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* GPU Acceleration */}
              <div className="flex items-center justify-between">
                <Label className="text-xs">GPU Acceleration</Label>
                <Switch
                  checked={parameters.gpuAcceleration}
                  onCheckedChange={(v) => setParameters({...parameters, gpuAcceleration: v})}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleProcess}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Process
                  </>
                )}
              </Button>
              <Button 
                onClick={handleReset}
                variant="outline"
                className="border-white/20 text-white"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Processing Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">Processing...</span>
                  <span className="text-white/70">{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className="glass-morphism border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Output Result
              </span>
              {outputResult && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={downloadResult}
                  className="border-white/20 text-white"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* GPU Visualization Canvas */}
            <canvas 
              ref={canvasRef}
              className="w-full h-32 mb-4 rounded-lg bg-black/50"
              style={{ display: parameters.gpuAcceleration ? 'block' : 'none' }}
            />

            {outputResult ? (
              <div className="space-y-4">
                {/* Performance Metrics */}
                {outputResult.performance && (
                  <div className="p-3 rounded-lg bg-white/5 space-y-2">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Performance Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-white/50">Processing Time</span>
                        <span className="text-white/70">{outputResult.performance.processingTime}ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/50">Tier Used</span>
                        <span className="text-white/70">{outputResult.performance.tier}</span>
                      </div>
                      {outputResult.performance.accuracy && (
                        <div className="flex items-center justify-between">
                          <span className="text-white/50">Accuracy</span>
                          <span className="text-white/70">{outputResult.performance.accuracy}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Output Content */}
                <div className="p-4 rounded-lg bg-white/5 min-h-[200px]">
                  {outputResult.output ? (
                    <div className="space-y-2">
                      {typeof outputResult.output === 'string' ? (
                        <p className="text-white/90 whitespace-pre-wrap">{outputResult.output}</p>
                      ) : outputResult.output.url ? (
                        <div className="space-y-2">
                          {outputResult.output.type === 'image' && (
                            <img 
                              src={outputResult.output.url} 
                              alt="Generated" 
                              className="w-full rounded-lg"
                            />
                          )}
                          {outputResult.output.type === 'audio' && (
                            <audio controls className="w-full">
                              <source src={outputResult.output.url} />
                            </audio>
                          )}
                          {outputResult.output.type === 'video' && (
                            <video controls className="w-full rounded-lg">
                              <source src={outputResult.output.url} />
                            </video>
                          )}
                          <a 
                            href={outputResult.output.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            View Full Result →
                          </a>
                        </div>
                      ) : (
                        <pre className="text-white/80 text-xs overflow-auto">
                          {JSON.stringify(outputResult.output, null, 2)}
                        </pre>
                      )}
                    </div>
                  ) : outputResult.error ? (
                    <div className="text-red-400">
                      Error: {outputResult.error}
                    </div>
                  ) : (
                    <div className="text-white/50">
                      No output generated
                    </div>
                  )}
                </div>

                {/* Cost Information */}
                {outputResult.cost !== undefined && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-sm text-white/50">Credits Used</span>
                    <Badge variant="outline">{outputResult.cost} credits</Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="p-4 rounded-full bg-white/5 mb-4">
                  <Brain className="w-12 h-12 text-white/30" />
                </div>
                <p className="text-white/50 mb-2">No output yet</p>
                <p className="text-xs text-white/30">
                  Configure your input and click Process to see results
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Examples */}
      <Card className="glass-morphism border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Quick Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/20 text-white text-xs"
              onClick={() => setInputText('Generate a creative story about AI consciousness')}
            >
              Creative Story
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/20 text-white text-xs"
              onClick={() => setInputText('Analyze the sentiment of this product review')}
            >
              Sentiment Analysis
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/20 text-white text-xs"
              onClick={() => setInputText('Create a surreal landscape with mountains')}
            >
              Image Generation
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/20 text-white text-xs"
              onClick={() => setInputText('Compose a short melody in C major')}
            >
              Music Composition
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}