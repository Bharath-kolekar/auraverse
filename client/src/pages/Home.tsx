import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { VoiceIndicator } from "@/components/ui/voice-indicator";
import { useQuery } from "@tanstack/react-query";
import type { Project, Content, User } from "@shared/schema";
import { 
  Play, 
  Plus, 
  TrendingUp, 
  Clock, 
  Zap, 
  Brain,
  Activity,
  Settings
} from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: isAuthenticated,
  });

  const { data: userContent, isLoading: contentLoading } = useQuery<Content[]>({
    queryKey: ['/api/content/user'],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-space-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-electric-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navbar />
      
      {/* Hero Dashboard */}
      <section className="pt-24 pb-12 cinematic-gradient">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-electric-blue to-neon-purple bg-clip-text text-transparent">
                Welcome Back, Creator
              </h1>
              <p className="text-xl text-gray-300">
                Your content creation dashboard - where ideas become reality
              </p>
            </div>
            <VoiceIndicator />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Link href="/create">
              <Card className="content-card hover:shadow-2xl hover:shadow-electric-blue/30 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-electric-blue to-neon-purple rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-electric-blue">New Project</h3>
                  <p className="text-sm text-gray-400 mt-2">Start creating</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/marketplace">
              <Card className="content-card hover:shadow-2xl hover:shadow-neon-purple/30 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-neon-purple to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-neon-purple">Marketplace</h3>
                  <p className="text-sm text-gray-400 mt-2">Buy & sell content</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/gallery">
              <Card className="content-card hover:shadow-2xl hover:shadow-yellow-500/30 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-yellow-400">Gallery</h3>
                  <p className="text-sm text-gray-400 mt-2">View creations</p>
                </CardContent>
              </Card>
            </Link>

            <Card className="content-card hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-green-400">Settings</h3>
                <p className="text-sm text-gray-400 mt-2">Preferences</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-12 bg-gradient-to-b from-space-black to-deep-black">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Projects */}
            <div className="lg:col-span-2">
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-electric-blue flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Recent Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {projectsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-cyber-gray rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-cyber-gray/50 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : projects && projects.length > 0 ? (
                    <div className="space-y-4">
                      {projects.slice(0, 5).map((project) => (
                        <div key={project.id} className="bg-cyber-gray/50 rounded-lg p-4 border-l-4 border-electric-blue">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-semibold">{project.name}</h5>
                              <p className="text-sm text-gray-400">{project.description}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              project.status === 'completed' ? 'bg-green-500' :
                              project.status === 'processing' ? 'bg-yellow-500' :
                              project.status === 'failed' ? 'bg-red-500' :
                              'bg-gray-500'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                          <Progress value={project.progress || 0} className="h-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4">No projects yet</p>
                      <Link href="/create">
                        <Button className="bg-gradient-to-r from-electric-blue to-neon-purple">
                          Create Your First Project
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Processing Status */}
            <div className="space-y-6">
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-neon-purple flex items-center">
                    <Brain className="mr-2 h-5 w-5" />
                    AI Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between bg-cyber-gray/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">GPU Cluster</span>
                    </div>
                    <span className="text-sm font-mono text-green-400">98.5%</span>
                  </div>
                  <div className="flex items-center justify-between bg-cyber-gray/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">Render Farm</span>
                    </div>
                    <span className="text-sm font-mono text-blue-400">2.3 PF</span>
                  </div>
                  <div className="flex items-center justify-between bg-cyber-gray/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">Neural Net</span>
                    </div>
                    <span className="text-sm font-mono text-purple-400">Training</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-electric-blue">
                      {userContent?.length || 0}
                    </div>
                    <div className="text-sm text-gray-400">Content Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neon-purple">
                      {projects?.length || 0}
                    </div>
                    <div className="text-sm text-gray-400">Active Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {Math.floor(Math.random() * 1000)}
                    </div>
                    <div className="text-sm text-gray-400">AI Generations</div>
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
