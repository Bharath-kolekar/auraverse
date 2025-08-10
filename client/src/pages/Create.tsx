import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { VoiceIndicator } from "@/components/ui/voice-indicator";
import type { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Music, 
  Video, 
  Zap, 
  Mic, 
  Play, 
  Download,
  Settings,
  Sparkles,
  Brain
} from "lucide-react";

export default function Create() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("audio");
  const [audioText, setAudioText] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [vfxType, setVfxType] = useState("explosion");

  if (!isAuthenticated && !isLoading) {
    window.location.href = "/api/login";
    return null;
  }

  // Audio Generation
  const generateAudioMutation = useMutation({
    mutationFn: async (data: { text: string; voice?: string; type?: string }) => {
      const response = await apiRequest('POST', '/api/ai/generate-audio', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Audio Generated",
        description: "Your audio content has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content/user'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Video Generation
  const generateVideoMutation = useMutation({
    mutationFn: async (data: { prompt: string; style?: string; duration?: number }) => {
      const response = await apiRequest('POST', '/api/ai/generate-video', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Video Generated",
        description: "Your video content has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content/user'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // VFX Generation
  const generateVfxMutation = useMutation({
    mutationFn: async (data: { type: string; parameters: any }) => {
      const response = await apiRequest('POST', '/api/ai/generate-vfx', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "VFX Generated",
        description: "Your VFX content has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content/user'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-space-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-electric-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navbar />
      
      {/* Header */}
      <section className="pt-24 pb-8 cinematic-gradient">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
                Create Content
              </h1>
              <p className="text-xl text-gray-300">
                Generate professional-quality content with AI assistance
              </p>
            </div>
            <VoiceIndicator />
          </div>
        </div>
      </section>

      {/* Creation Dashboard */}
      <section className="py-12 bg-gradient-to-b from-space-black to-deep-black">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Creation Area */}
            <div className="lg:col-span-2">
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-electric-blue">
                    <Sparkles className="mr-2 h-5 w-5" />
                    AI Content Generator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="audio" className="flex items-center">
                        <Music className="mr-2 h-4 w-4" />
                        Audio
                      </TabsTrigger>
                      <TabsTrigger value="video" className="flex items-center">
                        <Video className="mr-2 h-4 w-4" />
                        Video
                      </TabsTrigger>
                      <TabsTrigger value="vfx" className="flex items-center">
                        <Zap className="mr-2 h-4 w-4" />
                        VFX
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="audio" className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Text to Speech / Music Description</label>
                        <Textarea
                          placeholder="Enter text for speech synthesis or describe the music you want to create..."
                          value={audioText}
                          onChange={(e) => setAudioText(e.target.value)}
                          className="min-h-[120px] bg-cyber-gray/30 border-gray-600"
                        />
                      </div>
                      
                      <div className="flex gap-4">
                        <Button
                          onClick={() => generateAudioMutation.mutate({ text: audioText, type: "speech" })}
                          disabled={!audioText || generateAudioMutation.isPending}
                          className="bg-gradient-to-r from-green-500 to-emerald-400"
                        >
                          <Mic className="mr-2 h-4 w-4" />
                          Generate Speech
                        </Button>
                        <Button
                          onClick={() => generateAudioMutation.mutate({ text: audioText, type: "music" })}
                          disabled={!audioText || generateAudioMutation.isPending}
                          className="bg-gradient-to-r from-blue-500 to-purple-500"
                        >
                          <Music className="mr-2 h-4 w-4" />
                          Generate Music
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="video" className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Video Description</label>
                        <Textarea
                          placeholder="Describe the video you want to create. Be specific about scenes, style, and mood..."
                          value={videoPrompt}
                          onChange={(e) => setVideoPrompt(e.target.value)}
                          className="min-h-[120px] bg-cyber-gray/30 border-gray-600"
                        />
                      </div>
                      
                      <Button
                        onClick={() => generateVideoMutation.mutate({ 
                          prompt: videoPrompt, 
                          style: "cinematic", 
                          duration: 30 
                        })}
                        disabled={!videoPrompt || generateVideoMutation.isPending}
                        className="bg-gradient-to-r from-neon-purple to-pink-500"
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Generate Video
                      </Button>
                    </TabsContent>

                    <TabsContent value="vfx" className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">VFX Type</label>
                        <select 
                          value={vfxType}
                          onChange={(e) => setVfxType(e.target.value)}
                          className="w-full p-3 bg-cyber-gray/30 border border-gray-600 rounded-lg"
                        >
                          <option value="explosion">Explosion</option>
                          <option value="particle_system">Particle System</option>
                          <option value="lightning">Lightning</option>
                          <option value="fire">Fire</option>
                          <option value="smoke">Smoke</option>
                          <option value="magic">Magic Effects</option>
                        </select>
                      </div>
                      
                      <Button
                        onClick={() => generateVfxMutation.mutate({ 
                          type: vfxType, 
                          parameters: { intensity: "high", duration: 5 } 
                        })}
                        disabled={generateVfxMutation.isPending}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        Generate VFX
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Status */}
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-neon-purple flex items-center">
                    <Brain className="mr-2 h-5 w-5" />
                    AI Processing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">GPU Utilization</span>
                    <span className="text-sm font-mono text-green-400">98.5%</span>
                  </div>
                  <Progress value={98.5} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Queue Position</span>
                    <span className="text-sm font-mono text-blue-400">#3</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Est. Completion</span>
                    <span className="text-sm font-mono text-purple-400">2m 30s</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Projects */}
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-electric-blue">Recent Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  {projectsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-cyber-gray rounded mb-2"></div>
                          <div className="h-2 bg-cyber-gray/50 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : projects && projects.length > 0 ? (
                    <div className="space-y-3">
                      {projects.slice(0, 3).map((project) => (
                        <div key={project.id} className="bg-cyber-gray/30 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-medium">{project.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              project.status === 'completed' ? 'bg-green-500' :
                              project.status === 'processing' ? 'bg-yellow-500' :
                              'bg-gray-500'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                          <Progress value={project.progress || 0} className="h-1" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No projects yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Voice Commands */}
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center">
                    <Mic className="mr-2 h-5 w-5" />
                    Voice Commands
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div>"Generate epic music"</div>
                    <div>"Create explosion VFX"</div>
                    <div>"Make cinematic trailer"</div>
                    <div>"Export in 4K"</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
