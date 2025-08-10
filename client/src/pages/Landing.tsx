import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Mic, Sparkles, Video, Music, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-space-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-deep-black/90 backdrop-blur-lg border-b border-gray-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
              Infinite Intelligence
            </h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="hover:text-electric-blue transition-colors duration-300">Features</a>
            <a href="#how-it-works" className="hover:text-electric-blue transition-colors duration-300">How It Works</a>
            <a href="#pricing" className="hover:text-electric-blue transition-colors duration-300">Pricing</a>
          </div>
          
          <a href="/api/login">
            <Button className="bg-gradient-to-r from-electric-blue to-neon-purple hover:shadow-lg hover:shadow-electric-blue/30 transition-all duration-300">
              Get Started
            </Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen cinematic-gradient flex items-center justify-center relative overflow-hidden pt-20">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-electric-blue/10 via-transparent to-neon-purple/10"></div>
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-electric-blue to-neon-purple bg-clip-text text-transparent animate-float">
              Gateway to Infinite Intelligence
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Create Oscar-worthy content with AI-powered audio, video, and VFX generation. 
              Voice-controlled creation meets cinematic excellence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <a href="/api/login">
                <Button size="lg" className="bg-gradient-to-r from-electric-blue to-glow-blue neon-glow">
                  <Mic className="mr-3 h-5 w-5" />
                  Start Creating
                </Button>
              </a>
              <Button size="lg" variant="outline" className="border-2 border-neon-purple hover:bg-neon-purple/20">
                <Play className="mr-3 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Voice Command Showcase */}
            <Card className="bg-deep-black/60 backdrop-blur-lg border-gray-800 max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-electric-blue flex items-center">
                  <Mic className="mr-2 h-5 w-5" />
                  Try Voice Commands
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-sm text-gray-300">"Create a cinematic trailer"</div>
                  <div className="text-sm text-gray-300">"Generate epic background music"</div>
                  <div className="text-sm text-gray-300">"Add VFX explosion effects"</div>
                  <div className="text-sm text-gray-300">"Export in 4K resolution"</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-space-black to-deep-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
              End-to-End Content Creation
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From concept to Oscar-worthy content. AI-powered tools for audio, video, and VFX generation 
              with professional quality standards.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="content-card hover:shadow-2xl hover:shadow-electric-blue/20 transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-400 rounded-xl flex items-center justify-center mb-6">
                  <Music className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-electric-blue">Audio Generation</h3>
                <p className="text-gray-400 mb-6">
                  AI-powered music composition, voice synthesis, and sound effects. Create professional soundscapes with simple voice commands.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Text-to-Speech (100+ voices)
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    AI Music Composition
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Sound Effects Library
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="content-card hover:shadow-2xl hover:shadow-neon-purple/20 transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-neon-purple to-pink-500 rounded-xl flex items-center justify-center mb-6">
                  <Video className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-neon-purple">Video Production</h3>
                <p className="text-gray-400 mb-6">
                  Advanced video editing, motion graphics, and visual effects. Create cinematic content with professional-grade tools.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    4K/8K Video Generation
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Motion Graphics Suite
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Real-time Preview
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="content-card hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-yellow-400">VFX & CGI</h3>
                <p className="text-gray-400 mb-6">
                  Hollywood-grade visual effects and CGI rendering. Create stunning visuals with AI-assisted workflows.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Particle Systems
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    3D Rendering Engine
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Compositing Tools
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-deep-black to-cyber-gray">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
            Ready to Create?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already using AI to produce professional content.
          </p>
          <a href="/api/login">
            <Button size="lg" className="bg-gradient-to-r from-electric-blue to-neon-purple hover:shadow-lg hover:shadow-electric-blue/30 transition-all duration-300">
              <Sparkles className="mr-3 h-5 w-5" />
              Get Started Free
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
