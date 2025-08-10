import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Zap, Brain, Sparkles, Crown, Coins, History, CreditCard, Smartphone, Bitcoin } from "lucide-react";

export default function Intelligence() {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [parameters, setParameters] = useState<any>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available models and pricing
  const { data: modelsData } = useQuery({
    queryKey: ["/api/intelligence/models"],
  });

  // Fetch user credits
  const { data: creditsData } = useQuery({
    queryKey: ["/api/intelligence/credits"],
  });

  // Fetch usage history
  const { data: usageData } = useQuery({
    queryKey: ["/api/intelligence/usage"],
  });

  // Fetch global payment info
  const { data: paymentInfo } = useQuery({
    queryKey: ["/api/intelligence/payment-info"],
  });

  // Generate content mutation
  const generateMutation = useMutation({
    mutationFn: async (data: { modelType: string; prompt: string; parameters: any }) => {
      return await apiRequest("POST", "/api/intelligence/generate", data);
    },
    onSuccess: (data) => {
      toast({
        title: "Intelligence Generated Successfully",
        description: `Used ${data.creditsUsed} credits for ${data.tier} tier model`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/intelligence/credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/intelligence/usage"] });
    },
    onError: (error: any) => {
      if (error.message.includes("Insufficient credits")) {
        toast({
          title: "Insufficient Credits",
          description: "You need more intelligence credits to use this model",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  // Free credits mutation
  const freeCredits = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/intelligence/free-credits", {});
    },
    onSuccess: (data) => {
      toast({
        title: "Free Credits Added!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/intelligence/credits"] });
    },
  });

  const handleGenerate = () => {
    if (!selectedModel || !prompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a model and enter a prompt",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      modelType: selectedModel,
      prompt: prompt.trim(),
      parameters,
    });
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'basic': return <Zap className="h-4 w-4" />;
      case 'pro': return <Brain className="h-4 w-4" />;
      case 'ultimate': return <Crown className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-green-500';
      case 'pro': return 'bg-blue-500';
      case 'ultimate': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🧠 Super Intelligence Center
          </h1>
          <p className="text-xl text-blue-200">
            Pay-per-intelligence model - Use advanced AI models and pay only for what you consume
          </p>
        </div>

        {/* Credits Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Available Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {creditsData?.credits || 0}
              </div>
              <div className="text-blue-200 capitalize">
                {creditsData?.tier || 'basic'} tier
              </div>
              {(!creditsData?.credits || creditsData.credits === 0) && (
                <Button 
                  onClick={() => freeCredits.mutate()}
                  disabled={freeCredits.isPending}
                  className="mt-3 w-full bg-green-600 hover:bg-green-700"
                >
                  Get 100 Free Credits
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <History className="h-5 w-5" />
                Usage Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {usageData?.summary?.totalCreditsUsed || 0}
              </div>
              <div className="text-blue-200">Total credits used</div>
              <div className="text-sm text-gray-300 mt-1">
                Most used: {usageData?.summary?.mostUsedModel || 'None'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Intelligence Models</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {modelsData ? Object.keys(modelsData.models).length : 0}
              </div>
              <div className="text-blue-200">Available models</div>
            </CardContent>
          </Card>
        </div>

        {/* Generation Interface */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Model Selection */}
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Select Intelligence Model</CardTitle>
              <CardDescription className="text-blue-200">
                Choose the AI model that best fits your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select an intelligence model" />
                </SelectTrigger>
                <SelectContent>
                  {modelsData?.models && Object.entries(modelsData.models).map(([key, model]: [string, any]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {getTierIcon(model.credits === 0 ? 'basic' : model.credits <= 2 ? 'pro' : 'ultimate')}
                        <span>{model.description}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {model.credits === 0 ? 'FREE' : `${model.credits} credits`}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedModel && modelsData?.models[selectedModel] && (
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-white font-medium mb-2">Model Details</h4>
                  <p className="text-blue-200 text-sm">
                    {modelsData.models[selectedModel].description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${getTierColor(modelsData.models[selectedModel].credits === 0 ? 'basic' : 'pro')} text-white`}>
                      {modelsData.models[selectedModel].credits === 0 ? 'FREE' : `${modelsData.models[selectedModel].credits} credits`}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prompt Input */}
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Intelligence Prompt</CardTitle>
              <CardDescription className="text-blue-200">
                Describe what you want the AI to generate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here... Be specific for better results!"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[120px]"
              />

              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !selectedModel || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                {generateMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate with Intelligence
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {generateMutation.data && (
          <Card className="bg-white/10 backdrop-blur border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Generation Result</CardTitle>
              <CardDescription className="text-blue-200">
                Generated using {generateMutation.data.tier} tier model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black/20 p-4 rounded-lg">
                <pre className="text-white text-sm whitespace-pre-wrap overflow-auto">
                  {JSON.stringify(generateMutation.data.result, null, 2)}
                </pre>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-blue-200">
                <span>Credits used: {generateMutation.data.creditsUsed}</span>
                <span>Tier: {generateMutation.data.tier}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Global Payment Options */}
        <Card className="bg-white/10 backdrop-blur border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Global Payment Options</CardTitle>
            <CardDescription className="text-blue-200">
              Multiple payment methods available worldwide including India
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="h-5 w-5 text-green-400" />
                  <h4 className="text-white font-medium">India Payments</h4>
                </div>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• UPI: pay@cognomega.com</li>
                  <li>• Paytm, PhonePe, GPay</li>
                  <li>• Net Banking, Cards</li>
                  <li>• Bank Transfer</li>
                </ul>
                <Badge className="bg-green-600 text-white mt-2">
                  ₹799 - ₹8299
                </Badge>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-5 w-5 text-blue-400" />
                  <h4 className="text-white font-medium">International</h4>
                </div>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• PayPal Global</li>
                  <li>• Wise Transfer</li>
                  <li>• International Cards</li>
                  <li>• Bank Wire</li>
                </ul>
                <Badge className="bg-blue-600 text-white mt-2">
                  $9.99 - $99.99
                </Badge>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Bitcoin className="h-5 w-5 text-orange-400" />
                  <h4 className="text-white font-medium">Cryptocurrency</h4>
                </div>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• Bitcoin (BTC)</li>
                  <li>• Ethereum (ETH)</li>
                  <li>• USDT/USDC</li>
                  <li>• Other major coins</li>
                </ul>
                <Badge className="bg-orange-600 text-white mt-2">
                  Crypto Rates
                </Badge>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h4 className="text-green-400 font-medium mb-2">Easy Payment Process:</h4>
              <ol className="text-green-200 text-sm space-y-1">
                <li>1. Choose your preferred payment method</li>
                <li>2. Send payment with your user ID as reference</li>
                <li>3. Credits added instantly or within 24 hours</li>
                <li>4. Start using premium intelligence models</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Tiers */}
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Intelligence Tiers & Pricing</CardTitle>
            <CardDescription className="text-blue-200">
              Flexible pricing for global users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {paymentInfo?.pricing && Object.entries(paymentInfo.pricing).map(([currency, prices]: [string, any]) => (
                <div key={currency} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-white font-medium mb-3 uppercase">{currency} Pricing</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-200">Basic (100 credits):</span>
                      <span className="text-white">{prices.basic}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-200">Pro (500 credits):</span>
                      <span className="text-white">{prices.pro}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-200">Ultimate (1500 credits):</span>
                      <span className="text-white">{prices.ultimate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {modelsData?.tiers && Object.entries(modelsData.tiers).map(([tier, info]: [string, any]) => (
                <div key={tier} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    {getTierIcon(tier)}
                    <h4 className="text-white font-medium capitalize">{tier}</h4>
                  </div>
                  <p className="text-blue-200 text-sm mb-2">{info.description}</p>
                  <Badge className={`${getTierColor(tier)} text-white`}>
                    {info.cost}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}