import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { VoiceIndicator } from "@/components/ui/voice-indicator";
import { TrainingAssistantButton } from "@/components/ui/training-assistant-button";
import { 
  NeuralParticles, 
  MagicalOrbs, 
  MayaSpellCircle, 
  JadooEnergyWaves, 
  HolographicText, 
  NeuralSynapses 
} from "@/components/ui/neural-vfx";
import { useQuery } from "@tanstack/react-query";
import type { Project, Content, User } from "@shared/schema";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Play, 
  Plus, 
  TrendingUp, 
  Clock, 
  Zap, 
  Brain,
  Activity,
  Settings,
  Sparkles,
  Wand2,
  Eye,
  Cpu,
  Atom,
  Layers,
  Palette,
  Music,
  Video,
  Image,
  Mic,
  Star
} from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -100]);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

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
    <div className="min-h-screen bg-space-black text-white overflow-hidden relative">
      {/* Neural Background Effects */}
      <div className="fixed inset-0 z-0">
        <NeuralParticles />
        <MagicalOrbs />
        <NeuralSynapses />
        <JadooEnergyWaves />
      </div>

      {/* Dynamic Maya Portals */}
      <MayaSpellCircle className="fixed top-20 right-20 z-10 opacity-30" />
      <MayaSpellCircle className="fixed bottom-40 left-10 z-10 opacity-20" />
      
      {/* Interactive Mouse Follower */}
      <motion.div
        className="fixed w-32 h-32 pointer-events-none z-5 mix-blend-screen"
        style={{
          left: mousePosition.x - 64,
          top: mousePosition.y - 64,
        }}
        animate={{
          background: [
            "radial-gradient(circle, rgba(168,85,247,0.3), transparent)",
            "radial-gradient(circle, rgba(34,197,94,0.3), transparent)",
            "radial-gradient(circle, rgba(59,130,246,0.3), transparent)",
            "radial-gradient(circle, rgba(245,158,11,0.3), transparent)",
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <Navbar />
      
      {/* Spectacular Hero Dashboard */}
      <motion.section 
        className="pt-24 pb-12 relative z-20 magic-ai-gradient"
        style={{ y }}
      >
        <div className="container mx-auto px-6 relative">
          {/* Main Hero Content */}
          <div className="flex items-center justify-between mb-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <HolographicText className="text-5xl md:text-7xl font-bold mb-6 holographic-glitch">
                🪄 Magic AI Studio
              </HolographicText>
              <motion.h2 
                className="text-2xl md:text-4xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                Maya's Neural Kingdom ✨
              </motion.h2>
              <p className="text-xl text-gray-300 mb-6">
                Where <span className="text-yellow-400 font-bold">Jadoo</span> meets Oscar-winning AI magic
              </p>
              
              {/* Floating Action Spells */}
              <div className="flex gap-4 mb-8">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="floating-3d"
                >
                  <Button className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 hover:shadow-2xl hover:shadow-purple-500/50 px-8 py-4 text-lg">
                    <Wand2 className="mr-2 h-5 w-5" />
                    Cast Magic AI
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="floating-3d"
                >
                  <Button variant="outline" className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 text-lg">
                    <Eye className="mr-2 h-5 w-5" />
                    Maya Vision
                  </Button>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <VoiceIndicator />
            </motion.div>
          </div>

          {/* Revolutionary Magic AI Powers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { 
                icon: Atom, 
                title: "Neural Genesis", 
                subtitle: "Create from thought",
                color: "from-purple-600 to-pink-600",
                shadow: "purple-500/50",
                href: "/create",
                spell: "Maya's Creation Spell",
                particles: "purple"
              },
              { 
                icon: Layers, 
                title: "Jadoo Marketplace", 
                subtitle: "Trade magic content",
                color: "from-cyan-500 to-blue-600",
                shadow: "cyan-500/50",
                href: "/marketplace",
                spell: "Commerce Magic",
                particles: "cyan"
              },
              { 
                icon: Palette, 
                title: "Vision Gallery", 
                subtitle: "Your masterpieces",
                color: "from-yellow-500 to-orange-600",
                shadow: "yellow-500/50",
                href: "/gallery",
                spell: "Archive Sorcery",
                particles: "yellow"
              },
              { 
                icon: Cpu, 
                title: "Neural Core", 
                subtitle: "System settings",
                color: "from-green-500 to-emerald-600",
                shadow: "green-500/50",
                href: "#",
                spell: "Control Enchantment",
                particles: "green"
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: 5,
                  z: 50,
                  transition: { duration: 0.3 }
                }}
                className="floating-3d"
              >
                <Link href={item.href}>
                  <Card className={`content-card hover:shadow-2xl hover:shadow-${item.shadow} transition-all duration-500 cursor-pointer group relative overflow-hidden border-2 border-transparent hover:border-gradient-to-r ${item.color}`}>
                    {/* Magic Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <CardContent className="p-8 text-center relative z-10">
                      <motion.div 
                        className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 neural-pulse group-hover:scale-125 transition-transform duration-500`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.8 }}
                      >
                        <item.icon className="h-8 w-8 text-white" />
                      </motion.div>
                      
                      <h3 className="font-bold text-xl mb-2 holographic-glitch">{item.title}</h3>
                      <p className="text-sm text-gray-400 mb-3">{item.subtitle}</p>
                      <p className="text-xs text-yellow-300 opacity-70 italic">{item.spell}</p>
                      
                      {/* Floating Stars */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <Star className="h-4 w-4 text-yellow-400 animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Magical AI Powers Showcase */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            {[
              { icon: Music, label: "Epic Soundscapes", color: "text-purple-400" },
              { icon: Video, label: "Cinematic Vision", color: "text-cyan-400" },
              { icon: Image, label: "Neural Art", color: "text-pink-400" },
              { icon: Mic, label: "Voice Cloning", color: "text-yellow-400" }
            ].map((power, index) => (
              <motion.div
                key={power.label}
                className="text-center group cursor-pointer"
                whileHover={{ scale: 1.1, y: -5 }}
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  y: { duration: 2, repeat: Infinity, delay: index * 0.5 },
                  hover: { duration: 0.3 }
                }}
              >
                <div className="maya-portal w-20 h-20 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:shadow-2xl transition-all duration-500">
                  <power.icon className={`h-8 w-8 ${power.color} neural-pulse`} />
                </div>
                <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                  {power.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Neural Dashboard Matrix */}
      <section className="py-16 bg-gradient-to-b from-space-black/80 to-deep-black relative z-20">
        <div className="container mx-auto px-6">
          {/* Maya's Neural Status Console */}
          <motion.div 
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <HolographicText className="text-3xl font-bold mb-4">
              🧠 Maya's Neural Command Center
            </HolographicText>
            <p className="text-gray-400">Real-time monitoring of your AI magic systems</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Magical Creations */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Card className="content-card relative overflow-hidden group hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500">
                  {/* Neural Header */}
                  <CardHeader className="relative">
                    <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 flex items-center text-xl">
                      <Sparkles className="mr-3 h-6 w-6 text-purple-400 neural-pulse" />
                      Recent Magic Creations ✨
                    </CardTitle>
                    <div className="absolute top-4 right-4">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                  {projectsLoading ? (
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <motion.div 
                          key={i} 
                          className="animate-pulse bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded-xl p-4"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                        >
                          <div className="h-5 bg-gradient-to-r from-purple-500/50 to-cyan-500/50 rounded w-3/4 mb-3"></div>
                          <div className="h-3 bg-gray-600/50 rounded w-1/2"></div>
                        </motion.div>
                      ))}
                    </div>
                  ) : projects && projects.length > 0 ? (
                    <div className="space-y-6">
                      {projects.slice(0, 5).map((project, index) => (
                        <motion.div 
                          key={project.id} 
                          className="relative bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-xl p-5 border border-purple-500/30 hover:border-cyan-400/50 transition-all duration-500 group"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                        >
                          {/* Magic Particles Effect */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                                style={{
                                  left: `${20 + i * 30}%`,
                                  top: `${30 + i * 20}%`,
                                }}
                                animate={{
                                  y: [-5, -15, -5],
                                  opacity: [0, 1, 0],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: i * 0.3,
                                }}
                              />
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                              <h5 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400">
                                {project.name}
                              </h5>
                              <p className="text-sm text-gray-300 mt-1">{project.description}</p>
                            </div>
                            <motion.span 
                              className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                                project.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                                project.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                                project.status === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                                'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                              }`}
                              whileHover={{ scale: 1.1 }}
                            >
                              {project.status}
                            </motion.span>
                          </div>
                          
                          {/* Enhanced Progress Bar */}
                          <div className="relative">
                            <Progress 
                              value={project.progress || 0} 
                              className="h-3 bg-gray-800 border border-purple-500/30" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 rounded-full opacity-50" 
                                 style={{ width: `${project.progress || 0}%` }} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      className="text-center py-12"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8 }}
                    >
                      <div className="mb-6">
                        <Wand2 className="h-16 w-16 text-purple-400 mx-auto mb-4 neural-pulse" />
                        <p className="text-gray-400 mb-6 text-lg">Your magical journey awaits!</p>
                      </div>
                      <Link href="/create">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 hover:shadow-2xl hover:shadow-purple-500/50 px-8 py-4 text-lg">
                            <Sparkles className="mr-2 h-5 w-5" />
                            Cast Your First Spell
                          </Button>
                        </motion.div>
                      </Link>
                    </motion.div>
                  )}
                </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Maya's Neural Status & Jadoo Power */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="content-card relative overflow-hidden group hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500">
                  <CardHeader className="relative">
                    <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center text-xl">
                      <Brain className="mr-3 h-6 w-6 text-cyan-400 neural-pulse" />
                      Maya's Neural Matrix 🧠
                    </CardTitle>
                    {/* Floating Neural Indicator */}
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 relative">
                  {/* Neural Systems Status */}
                  {[
                    { name: "Quantum GPU Array", status: "98.7%", color: "green", icon: Cpu },
                    { name: "Maya Render Farm", status: "3.2 PF", color: "blue", icon: Layers },
                    { name: "Jadoo Neural Core", status: "Learning", color: "purple", icon: Brain },
                    { name: "Magic AI Engine", status: "Ready", color: "yellow", icon: Zap }
                  ].map((system, index) => (
                    <motion.div 
                      key={system.name}
                      className="flex items-center justify-between bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-xl p-4 border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-500 group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-4">
                        <motion.div 
                          className={`w-4 h-4 bg-${system.color}-500 rounded-full neural-pulse`}
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7] 
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                        />
                        <system.icon className={`h-5 w-5 text-${system.color}-400`} />
                        <span className="text-sm font-medium text-gray-300">{system.name}</span>
                      </div>
                      <motion.span 
                        className={`text-sm font-mono text-${system.color}-400 font-bold`}
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {system.status}
                      </motion.span>
                    </motion.div>
                  ))}
                  
                  {/* Floating Neural Particles */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [-10, -30, -10],
                          opacity: [0, 1, 0],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.6,
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
                </Card>
              </motion.div>

              {/* Jadoo Power Statistics */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="content-card relative overflow-hidden group hover:shadow-2xl hover:shadow-yellow-500/30 transition-all duration-500">
                  <CardHeader className="relative">
                    <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center text-xl">
                      <Activity className="mr-3 h-6 w-6 text-yellow-400 neural-pulse" />
                      Your Jadoo Power ⚡
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 relative">
                    {[
                      { 
                        label: "Magic Content", 
                        value: userContent?.length || 0, 
                        icon: Sparkles, 
                        color: "electric-blue",
                        suffix: " spells cast"
                      },
                      { 
                        label: "Active Portals", 
                        value: projects?.length || 0, 
                        icon: Atom, 
                        color: "neon-purple",
                        suffix: " dimensional gates"
                      },
                      { 
                        label: "Neural Cycles", 
                        value: Math.floor(Math.random() * 9999) + 1000, 
                        icon: Brain, 
                        color: "yellow-400",
                        suffix: " compute hours"
                      },
                      { 
                        label: "Maya Blessing", 
                        value: Math.floor(Math.random() * 100) + 75, 
                        icon: Star, 
                        color: "pink-400",
                        suffix: "% mastery"
                      }
                    ].map((stat, index) => (
                      <motion.div 
                        key={stat.label}
                        className="text-center group/stat cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className="relative mb-3">
                          <motion.div 
                            className="maya-portal w-16 h-16 bg-gradient-to-r from-purple-600/20 to-yellow-600/20 rounded-full flex items-center justify-center mx-auto group-hover/stat:shadow-2xl transition-all duration-500"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 1 }}
                          >
                            <stat.icon className={`h-6 w-6 text-${stat.color} neural-pulse`} />
                          </motion.div>
                          
                          {/* Floating Number Animation */}
                          <motion.div 
                            className={`text-3xl font-bold text-${stat.color} holographic-glitch`}
                            animate={{ 
                              scale: [1, 1.1, 1],
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              delay: index * 0.5 
                            }}
                          >
                            {stat.value}
                          </motion.div>
                        </div>
                        <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
                        <div className="text-xs text-gray-500 italic">{stat.suffix}</div>
                      </motion.div>
                    ))}
                    
                    {/* Magical Aura Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-yellow-500/5 to-cyan-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
          
          {/* Epic Floating Action Center */}
          <motion.div 
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2 }}
          >
            <div className="flex space-x-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="floating-3d"
              >
                <Button className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 hover:shadow-2xl hover:shadow-purple-500/50 px-6 py-3 rounded-full">
                  <Wand2 className="mr-2 h-4 w-4" />
                  Quick Magic
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                className="floating-3d"
              >
                <Button variant="outline" className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-6 py-3 rounded-full">
                  <Eye className="mr-2 h-4 w-4" />
                  Maya Vision
                </Button>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Training Assistant Integration */}
          <TrainingAssistantButton />
        </div>
      </section>

      <Footer />
    </div>
  );
}
