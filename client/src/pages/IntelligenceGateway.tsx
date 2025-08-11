// AI Intelligence Gateway - Main Page
// Central hub for exploring and interacting with all AI intelligence levels

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { gpuAccelerator } from '@/services/gpu-accelerator';
import {
  Brain, Sparkles, Zap, Activity, Cpu, Layers, GitBranch,
  ChevronRight, Play, Settings, Info, ArrowRight, BarChart3,
  Rocket, Shield, Globe, Users, TrendingUp, Award, Target,
  Lightbulb, Code, Database, Cloud, Gauge, Filter, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreditDisplay } from '@/components/ui/credit-display';
import { PaymentModal } from '@/components/PaymentModal';

interface IntelligenceTier {
  id: string;
  name: string;
  level: number;
  description: string;
  capabilities: string[];
  costPerUse: number;
  processingPower: string;
  icon: string;
  gradient: string;
  available: boolean;
  features: any[];
  status?: {
    available: boolean;
    currentLoad: number;
    estimatedWaitTime: number;
  };
}

interface AIBehavior {
  id: string;
  category: string;
  name: string;
  description: string;
  tier: string;
  active: boolean;
  performance: number;
  examples: string[];
}

interface AICapability {
  id: string;
  name: string;
  type: string;
  description: string;
  requiredTier: string;
  inputTypes: string[];
  outputTypes: string[];
  performance: {
    speed: number;
    accuracy: number;
    cost: number;
  };
  usage: {
    total: number;
    successful: number;
    failed: number;
  };
}

export default function IntelligenceGateway() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedTier, setSelectedTier] = useState<IntelligenceTier | null>(null);
  const [selectedBehavior, setSelectedBehavior] = useState<AIBehavior | null>(null);
  const [selectedCapability, setSelectedCapability] = useState<AICapability | null>(null);
  const [activeTab, setActiveTab] = useState('explore');
  const [gpuStatus, setGpuStatus] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Playground state
  const [selectedPlaygroundTier, setSelectedPlaygroundTier] = useState<string>('basic');
  const [selectedPlaygroundCapability, setSelectedPlaygroundCapability] = useState<string>('text_generation');
  const [testInput, setTestInput] = useState<string>('');
  const [testResult, setTestResult] = useState<any>(null);
  
  // Evolution state
  const [evolutionConfig, setEvolutionConfig] = useState({
    preferredTier: 'basic',
    activeBehaviors: [] as string[],
    customParameters: {}
  });
  const [evolutionResult, setEvolutionResult] = useState<any>(null);

  // Fetch intelligence tiers
  const { data: tiersData, isLoading: tiersLoading } = useQuery({
    queryKey: ['/api/gateway/tiers'],
    enabled: true
  });

  // Fetch behaviors
  const { data: behaviorsData, isLoading: behaviorsLoading } = useQuery({
    queryKey: ['/api/gateway/behaviors'],
    enabled: true
  });

  // Fetch capabilities
  const { data: capabilitiesData, isLoading: capabilitiesLoading } = useQuery({
    queryKey: ['/api/gateway/capabilities'],
    enabled: true
  });

  // Test capability mutation
  const testCapabilityMutation = useMutation({
    mutationFn: async (data: { capabilityId: string; input: any }) => {
      return await apiRequest('/api/gateway/test', 'POST', data);
    },
    onSuccess: (data: any) => {
      setTestResult(data);
      toast({
        title: 'Test Successful',
        description: `Capability tested successfully. Processing time: ${data?.performance?.processingTime || 'N/A'}ms`
      });
    },
    onError: (error) => {
      toast({
        title: 'Test Failed',
        description: error instanceof Error ? error.message : 'Failed to test capability',
        variant: 'destructive'
      });
    }
  });
  
  // Evolution mutation
  const evolveMutation = useMutation({
    mutationFn: async (config: any) => {
      return await apiRequest('/api/gateway/evolve', 'POST', config);
    },
    onSuccess: (data: any) => {
      setEvolutionResult(data);
      toast({
        title: 'Evolution Complete',
        description: 'Your AI intelligence has been evolved successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Evolution Failed',
        description: error instanceof Error ? error.message : 'Failed to evolve intelligence',
        variant: 'destructive'
      });
    }
  });

  // Activate behavior mutation
  const activateBehaviorMutation = useMutation({
    mutationFn: async (data: { behaviorId: string; active: boolean }) => {
      return await apiRequest('/api/gateway/activate', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gateway/behaviors'] });
      toast({
        title: 'Behavior Updated',
        description: 'AI behavior has been updated successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update behavior',
        variant: 'destructive'
      });
    }
  });

  // Initialize GPU acceleration
  useEffect(() => {
    const status = gpuAccelerator.getStatus();
    setGpuStatus(status);
    console.log('🎮 GPU Status:', status);

    // Initialize WebGL visualization if canvas is available
    if (canvasRef.current && status.capabilities.webgl2) {
      gpuAccelerator.applyVisualEffect(canvasRef.current, 'neural', 1.0);
    }
  }, []);

  const handleTestCapability = async (capability: AICapability) => {
    const testInput = {
      prompt: 'Test prompt for capability',
      options: {
        quality: 'high' as const
      }
    };

    await testCapabilityMutation.mutateAsync({
      capabilityId: capability.id,
      input: testInput
    });
  };
  
  const handlePlaygroundTest = async () => {
    if (!selectedPlaygroundCapability || !testInput) return;
    
    await testCapabilityMutation.mutateAsync({
      capabilityId: selectedPlaygroundCapability,
      input: { 
        prompt: testInput,
        tier: selectedPlaygroundTier
      }
    });
  };
  
  const handleEvolve = async () => {
    await evolveMutation.mutateAsync(evolutionConfig);
  };

  const handleToggleBehavior = async (behavior: AIBehavior) => {
    await activateBehaviorMutation.mutateAsync({
      behaviorId: behavior.id,
      active: !behavior.active
    });
  };

  const tiers = (tiersData as any)?.tiers || [];
  const behaviors = (behaviorsData as any)?.behaviors || [];
  const capabilities = (capabilitiesData as any)?.capabilities || [];
  const userCredits = (capabilitiesData as any)?.userCredits || 100;
  const paymentMethods = (capabilitiesData as any)?.paymentMethods || [];

  // Filter behaviors by category
  const filteredBehaviors = filterCategory === 'all' 
    ? behaviors 
    : behaviors.filter((b: AIBehavior) => b.category === filterCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* GPU-accelerated background */}
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 w-full h-full opacity-30 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Header */}
      <motion.header 
        className="relative z-10 border-b border-white/10 glass-morphism"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <motion.div
                className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white">Intelligence Gateway</h1>
                <p className="text-white/70">Explore and control AI intelligence levels</p>
              </div>
            </div>
            
            {/* Credit Display */}
            <CreditDisplay
              credits={userCredits}
              onPurchase={() => setShowPaymentModal(true)}
              compact={true}
            />
            
            {/* GPU Status */}
            {gpuStatus && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <Cpu className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white/70">
                  {gpuStatus.capabilities.webgpu ? 'WebGPU' : 
                   gpuStatus.capabilities.webgl2 ? 'WebGL2' : 'WebGL'}
                </span>
                <Badge variant="outline" className="text-xs">
                  {gpuStatus.capabilities.parallelThreads} threads
                </Badge>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl mx-auto glass-morphism">
            <TabsTrigger value="explore" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Explore
            </TabsTrigger>
            <TabsTrigger value="behaviors" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Behaviors
            </TabsTrigger>
            <TabsTrigger value="capabilities" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Capabilities
            </TabsTrigger>
            <TabsTrigger value="playground" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Playground
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Explore Tab */}
          <TabsContent value="explore" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Intelligence Tiers</h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                Discover different levels of AI intelligence, from basic pattern matching to quantum-inspired processing
              </p>
            </motion.div>

            {/* Intelligence Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tiersLoading ? (
                <div className="col-span-full text-center text-white/50">Loading tiers...</div>
              ) : (
                tiers.map((tier: IntelligenceTier, index: number) => (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onClick={() => setSelectedTier(tier)}
                    className="cursor-pointer"
                  >
                    <Card className={`glass-morphism border-white/10 hover:border-white/30 transition-all ${
                      selectedTier?.id === tier.id ? 'ring-2 ring-purple-500' : ''
                    }`}>
                      <CardHeader>
                        <div className={`w-full h-2 rounded-full bg-gradient-to-r ${tier.gradient} mb-4`} />
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-3xl">{tier.icon}</span>
                          <Badge 
                            variant={tier.available ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            Level {tier.level}
                          </Badge>
                        </div>
                        <CardTitle className="text-white">{tier.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-white/70">{tier.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/50">Processing</span>
                            <span className="text-white/70">{tier.processingPower}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/50">Cost</span>
                            <span className="text-white/70">
                              {tier.costPerUse === 0 ? 'Free' : `${tier.costPerUse} credits`}
                            </span>
                          </div>
                          {tier.status && (
                            <div className="pt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-white/50">Load</span>
                                <span className="text-white/70">{Math.round(tier.status.currentLoad)}%</span>
                              </div>
                              <Progress value={tier.status.currentLoad} className="h-1" />
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-white/10">
                          <p className="text-xs text-white/50 mb-2">Capabilities:</p>
                          <div className="flex flex-wrap gap-1">
                            {tier.capabilities.slice(0, 3).map((cap, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                            {tier.capabilities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{tier.capabilities.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>

            {/* Selected Tier Details */}
            {selectedTier && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <Card className="glass-morphism border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-3">
                      <span className="text-3xl">{selectedTier.icon}</span>
                      {selectedTier.name} - Detailed View
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
                        <div className="space-y-2">
                          {selectedTier.features.map((feature: any) => (
                            <div key={feature.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                              <div>
                                <p className="text-white font-medium">{feature.name}</p>
                                <p className="text-xs text-white/50">{feature.description}</p>
                              </div>
                              <Switch checked={feature.enabled} disabled />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Capabilities</h3>
                        <div className="space-y-2">
                          {selectedTier.capabilities.map((capability, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 rounded bg-white/5">
                              <ChevronRight className="w-4 h-4 text-purple-400" />
                              <span className="text-sm text-white/80">{capability}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        onClick={() => setActiveTab('playground')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Try in Playground
                      </Button>
                      <Button variant="outline" className="border-white/20 text-white">
                        <Info className="w-4 h-4 mr-2" />
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Behaviors Tab */}
          <TabsContent value="behaviors" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">AI Behaviors</h2>
                <p className="text-white/70">Configure how AI responds and adapts</p>
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48 glass-morphism border-white/10">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="analytical">Analytical</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                  <SelectItem value="adaptive">Adaptive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBehaviors.map((behavior: AIBehavior, index: number) => (
                <motion.div
                  key={behavior.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-morphism border-white/10 hover:border-white/30 transition-all">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            behavior.category === 'creative' ? 'bg-purple-500/20' :
                            behavior.category === 'analytical' ? 'bg-blue-500/20' :
                            behavior.category === 'interactive' ? 'bg-green-500/20' :
                            'bg-orange-500/20'
                          }`}>
                            {behavior.category === 'creative' ? <Sparkles className="w-5 h-5 text-purple-400" /> :
                             behavior.category === 'analytical' ? <BarChart3 className="w-5 h-5 text-blue-400" /> :
                             behavior.category === 'interactive' ? <Users className="w-5 h-5 text-green-400" /> :
                             <Settings className="w-5 h-5 text-orange-400" />}
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg">{behavior.name}</CardTitle>
                            <Badge variant="outline" className="text-xs mt-1">
                              {behavior.tier} tier
                            </Badge>
                          </div>
                        </div>
                        <Switch 
                          checked={behavior.active}
                          onCheckedChange={() => handleToggleBehavior(behavior)}
                          disabled={!isAuthenticated}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-white/70">{behavior.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/50">Performance</span>
                          <div className="flex items-center gap-2">
                            <Progress value={behavior.performance} className="w-20 h-1" />
                            <span className="text-white/70">{behavior.performance}%</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-white/50 mb-2">Examples:</p>
                        <div className="flex flex-wrap gap-1">
                          {behavior.examples.map((example, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {example}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Capabilities Tab */}
          <TabsContent value="capabilities" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">AI Capabilities</h2>
                <p className="text-white/70">Explore what each intelligence level can do</p>
              </div>
              
              <Button 
                variant="outline" 
                className="border-white/20 text-white"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capabilities.map((capability: AICapability, index: number) => (
                <motion.div
                  key={capability.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="glass-morphism border-white/10 hover:border-white/30 transition-all h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{capability.type}</Badge>
                        <Badge className="text-xs">
                          {capability.requiredTier}
                        </Badge>
                      </div>
                      <CardTitle className="text-white text-lg">{capability.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-white/70">{capability.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-white/50 mb-1">Input</p>
                          <div className="flex flex-wrap gap-1">
                            {capability.inputTypes.map((type, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-white/50 mb-1">Output</p>
                          <div className="flex flex-wrap gap-1">
                            {capability.outputTypes.map((type, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {showAdvanced && (
                        <div className="pt-3 border-t border-white/10 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/50">Speed</span>
                            <span className="text-white/70">{capability.performance.speed}s</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/50">Accuracy</span>
                            <span className="text-white/70">{capability.performance.accuracy}%</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/50">Usage</span>
                            <span className="text-white/70">
                              {capability.usage.total} ({capability.usage.successful} success)
                            </span>
                          </div>
                        </div>
                      )}

                      <Button 
                        size="sm"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                        onClick={() => handleTestCapability(capability)}
                        disabled={!isAuthenticated || testCapabilityMutation.isPending}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Test Capability
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Playground Tab */}
          <TabsContent value="playground" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Test Interface */}
              <Card className="glass-morphism border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Test Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tier Selection */}
                  <div>
                    <label className="text-sm text-white/70 mb-2 block">Select Intelligence Tier</label>
                    <Select value={selectedPlaygroundTier} onValueChange={setSelectedPlaygroundTier}>
                      <SelectTrigger className="border-white/20 text-white">
                        <SelectValue placeholder="Choose tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic Intelligence</SelectItem>
                        <SelectItem value="advanced">Advanced Intelligence</SelectItem>
                        <SelectItem value="super">Super Intelligence</SelectItem>
                        <SelectItem value="quantum">Quantum Intelligence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Capability Selection */}
                  <div>
                    <label className="text-sm text-white/70 mb-2 block">Select Capability</label>
                    <Select value={selectedPlaygroundCapability} onValueChange={setSelectedPlaygroundCapability}>
                      <SelectTrigger className="border-white/20 text-white">
                        <SelectValue placeholder="Choose capability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text_generation">Text Generation</SelectItem>
                        <SelectItem value="image_generation">Image Generation</SelectItem>
                        <SelectItem value="audio_generation">Audio Generation</SelectItem>
                        <SelectItem value="video_synthesis">Video Synthesis</SelectItem>
                        <SelectItem value="sentiment_analysis">Sentiment Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Input */}
                  <div>
                    <label className="text-sm text-white/70 mb-2 block">Input Prompt</label>
                    <Textarea
                      placeholder="Enter your prompt or test input..."
                      className="border-white/20 text-white placeholder:text-white/40 min-h-[100px]"
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                    />
                  </div>

                  {/* Test Button */}
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    onClick={() => handlePlaygroundTest()}
                    disabled={!selectedPlaygroundTier || !selectedPlaygroundCapability || !testInput || testCapabilityMutation.isPending}
                  >
                    {testCapabilityMutation.isPending ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Run Test
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results Display */}
              <Card className="glass-morphism border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Test Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {testResult ? (
                    <div className="space-y-4">
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-white/50 mb-1">Processing Time</p>
                          <p className="text-lg font-bold text-white">
                            {testResult.performance?.processingTime || '0'}ms
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-white/50 mb-1">Accuracy</p>
                          <p className="text-lg font-bold text-white">
                            {testResult.performance?.accuracy || '0'}%
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-white/50 mb-1">Tier Used</p>
                          <p className="text-lg font-bold text-white capitalize">
                            {testResult.performance?.tier || 'Basic'}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-white/50 mb-1">Credits Used</p>
                          <p className="text-lg font-bold text-white">
                            {testResult.cost || '0'}
                          </p>
                        </div>
                      </div>

                      {/* Output */}
                      <div>
                        <p className="text-sm text-white/70 mb-2">Output</p>
                        <div className="bg-white/5 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                          <pre className="text-sm text-white whitespace-pre-wrap">
                            {JSON.stringify(testResult.output, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-white/50">
                      <FileText className="w-8 h-8 mr-2" />
                      <span>Run a test to see results</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Evolution Engine */}
            <Card className="glass-morphism border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Evolution Engine
                </CardTitle>
                <CardDescription className="text-white/70">
                  Configure and evolve your AI intelligence preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Preferred Tier */}
                  <div>
                    <label className="text-sm text-white/70 mb-2 block">Preferred Tier</label>
                    <Select value={evolutionConfig.preferredTier} 
                            onValueChange={(value) => setEvolutionConfig({...evolutionConfig, preferredTier: value})}>
                      <SelectTrigger className="border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="super">Super</SelectItem>
                        <SelectItem value="quantum">Quantum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Active Behaviors */}
                  <div className="md:col-span-2">
                    <label className="text-sm text-white/70 mb-2 block">Active Behaviors</label>
                    <div className="flex flex-wrap gap-2">
                      {behaviors.map((behavior: AIBehavior) => (
                        <Badge
                          key={behavior.id}
                          variant={evolutionConfig.activeBehaviors.includes(behavior.id) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const updated = evolutionConfig.activeBehaviors.includes(behavior.id)
                              ? evolutionConfig.activeBehaviors.filter(id => id !== behavior.id)
                              : [...evolutionConfig.activeBehaviors, behavior.id];
                            setEvolutionConfig({...evolutionConfig, activeBehaviors: updated});
                          }}
                        >
                          {behavior.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-cyan-600 to-purple-600"
                  onClick={() => handleEvolve()}
                  disabled={evolveMutation.isPending}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Evolve Intelligence
                </Button>

                {evolutionResult && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-sm text-white/70 mb-2">Recommendations:</p>
                    <ul className="space-y-1">
                      {evolutionResult.recommendations?.map((rec: string, i: number) => (
                        <li key={i} className="text-sm text-white flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 mt-0.5 text-purple-400" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-morphism border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Usage Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Total Requests</span>
                      <span className="text-lg font-bold text-white">1,247</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Success Rate</span>
                      <span className="text-lg font-bold text-green-400">94.3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Avg Response</span>
                      <span className="text-lg font-bold text-white">1.2s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    Top Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Image Generation</span>
                      <Badge variant="outline">423 uses</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Text Analysis</span>
                      <Badge variant="outline">312 uses</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Audio Synthesis</span>
                      <Badge variant="outline">189 uses</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-purple-400" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">GPU Utilization</span>
                      <span className="text-lg font-bold text-white">
                        {gpuStatus?.performance?.gpuUtilization || 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Cache Hit Rate</span>
                      <span className="text-lg font-bold text-white">87%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Queue Length</span>
                      <span className="text-lg font-bold text-white">
                        {gpuStatus?.queueLength || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Neural Network Visualization */}
            <Card className="glass-morphism border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Neural Network Activity
                </CardTitle>
                <CardDescription className="text-white/70">
                  Real-time visualization of AI processing pathways
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-white/50">
                  <Sparkles className="w-8 h-8 mr-2" />
                  <span>Neural Network Visualization</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        userId={(user as any)?.id}
        region="IN"
      />
    </div>
  );
}