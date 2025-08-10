import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Mic, Video, Music, Image, Cpu, Globe, Play, ArrowRight, Star, Award, TrendingUp } from 'lucide-react';
import NeuralBackground from '@/components/NeuralBackground';
import AIProcessingIcon from '@/components/AIProcessingIcon';
import NeuralCard from '@/components/NeuralCard';
import NeuralProcessingVisual from '@/components/NeuralProcessingVisual';

export default function Landing() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollY } = useScroll();
  
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Music className="w-8 h-8" />,
      title: "Music Creation & Enhancement",
      description: "Generate new soundtracks or enhance your existing audio with neural composition",
      gradient: "from-purple-600 to-pink-600",
      delay: 0.1,
      stats: "12 AI Models"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Video Creation & Enhancement", 
      description: "Create new videos or enhance your footage with advanced VFX and AI rendering",
      gradient: "from-blue-600 to-cyan-600",
      delay: 0.2,
      stats: "4K/8K Output"
    },
    {
      icon: <Image className="w-8 h-8" />,
      title: "Image Creation & Enhancement",
      description: "Generate new images or enhance your photos with AI upscaling and style transfer",
      gradient: "from-green-600 to-emerald-600",
      delay: 0.3,
      stats: "Unlimited Generation"
    },
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Voice Creation & Enhancement",
      description: "Generate realistic voices or enhance your recordings with AI audio processing",
      gradient: "from-orange-600 to-red-600",
      delay: 0.4,
      stats: "100+ Voices"
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      title: "GPU Acceleration",
      description: "5-20x faster processing with intelligent caching and optimization",
      gradient: "from-indigo-600 to-purple-600",
      delay: 0.5,
      stats: "10-1500x Faster"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Marketplace",
      description: "Share and monetize your creations with worldwide accessibility",
      gradient: "from-teal-600 to-blue-600",
      delay: 0.6,
      stats: "99.8% Profit Margin"
    }
  ];

  const stats = [
    { number: "10-1500x", label: "Faster Processing", suffix: "", icon: <Zap className="w-6 h-6" /> },
    { number: "99.8", label: "Profit Margin", suffix: "%", icon: <TrendingUp className="w-6 h-6" /> },
    { number: "2-5", label: "Credits Per Use", suffix: "", icon: <Award className="w-6 h-6" /> },
    { number: "12", label: "AI Models", suffix: "", icon: <Star className="w-6 h-6" /> }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Creator", 
      content: "Revolutionary! I'm creating Hollywood-quality content with affordable pay-per-use pricing.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Film Director",
      content: "The AI optimization delivers results 1000x faster than traditional tools.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Music Producer",
      content: "Professional soundtracks in minutes. This platform is game-changing.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="particles-bg" />
      <NeuralBackground />
      
      {/* Mouse Follower */}
      <motion.div
        className="fixed pointer-events-none z-50 w-6 h-6 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(138, 43, 226, 0.8) 0%, transparent 70%)',
          filter: 'blur(1px)',
        }}
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      />

      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-40 glass-morphism border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div 
              className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold holographic">
              Infinite Intelligence
            </h1>
          </motion.div>
          
          <div className="hidden md:flex items-center space-x-8">
            <motion.a 
              href="#features" 
              className="text-white/70 hover:text-white transition-colors duration-300 font-medium"
              whileHover={{ scale: 1.05 }}
            >
              Features
            </motion.a>
            <motion.a 
              href="#testimonials" 
              className="text-white/70 hover:text-white transition-colors duration-300 font-medium"
              whileHover={{ scale: 1.05 }}
            >
              Reviews
            </motion.a>
            <motion.a 
              href="#pricing" 
              className="text-white/70 hover:text-white transition-colors duration-300 font-medium"
              whileHover={{ scale: 1.05 }}
            >
              Pricing
            </motion.a>
          </div>
          
          <motion.a
            href="/api/login"
            className="btn-primary px-6 py-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center gap-2">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </span>
          </motion.a>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <motion.div 
          className="text-center max-w-6xl mx-auto"
          style={{ y: y1, opacity }}
        >
          <AnimatePresence>
            {isLoaded && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  className="inline-flex items-center gap-3 glass-card px-8 py-4 mb-8"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </motion.div>
                  <span className="text-lg font-semibold text-white">
                    Revolutionary Creative Intelligence Platform
                  </span>
                  <motion.div
                    className="w-3 h-3 bg-green-400 rounded-full status-online"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                <motion.p 
                  className="text-xl md:text-3xl text-white/80 mb-16 max-w-5xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  Create and enhance <strong className="text-white">Oscar-quality</strong> content with 
                  cutting-edge AI. Upload your media or generate from scratch. Experience <strong className="text-gradient">10-1500x faster</strong> processing 
                  with <strong className="text-green-400">affordable pay-per-use</strong> pricing.
                </motion.p>

                <motion.div 
                  className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  <motion.a
                    href="/api/login"
                    className="group relative btn-primary text-xl px-12 py-5 will-change-transform"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <Zap className="w-6 h-6" />
                      Start Creating Now
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </span>
                  </motion.a>
                  
                  <motion.button
                    className="group neon-border text-white px-12 py-5 font-semibold text-xl will-change-transform"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center gap-3">
                      <Play className="w-6 h-6" />
                      Watch Demo
                    </span>
                  </motion.button>
                </motion.div>

                {/* Neural Processing Visual */}
                <motion.div
                  className="mb-16"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                >
                  <NeuralProcessingVisual />
                </motion.div>

                {/* Enhanced Stats Bar */}
                <motion.div
                  className="glass-card p-10 mx-auto max-w-5xl"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={index}
                        className="text-center group"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <motion.div 
                          className="text-purple-400 mb-3 flex justify-center"
                          whileHover={{ rotate: 5 }}
                        >
                          {stat.icon}
                        </motion.div>
                        <div className="text-4xl md:text-5xl font-bold text-gradient mb-3">
                          {stat.suffix === "$" && stat.suffix}
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.4 + index * 0.1 }}
                          >
                            {stat.number}
                          </motion.span>
                          {stat.suffix !== "$" && stat.suffix}
                        </div>
                        <div className="text-white/60 font-medium text-lg">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-32 left-20 w-24 h-24 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl"
          animate={{ y: [-30, 30, -30], rotate: [0, 180, 360] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-40 right-16 w-20 h-20 rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-xl"
          animate={{ y: [30, -30, 30], rotate: [360, 180, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-10 w-16 h-16 rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-xl"
          animate={{ x: [-20, 20, -20], y: [-10, 10, -10] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </section>

      {/* Features Section */}
      <motion.section 
        className="py-32 px-4"
        id="features"
        style={{ y: y2 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-24"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-6xl md:text-7xl font-bold text-white mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Unleash Your <span className="text-gradient">Creative Potential</span>
            </motion.h2>
            <motion.p 
              className="text-2xl text-white/70 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Advanced AI models with revolutionary optimization delivering unmatched performance 
              and zero-cost operation for unlimited creativity.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <NeuralCard
                key={index}
                className="feature-card group will-change-transform"
                isActive={index === 0}
              >
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: feature.delay, duration: 0.6 }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16" />
                  
                  <motion.div
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r ${feature.gradient} mb-8 shadow-2xl relative`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {feature.icon}
                    <div className="absolute -top-2 -right-2">
                      <AIProcessingIcon size={16} isProcessing={index === 0} />
                    </div>
                  </motion.div>
                
                <div className="mb-4">
                  <span className="inline-block px-4 py-2 text-sm font-semibold text-purple-400 bg-purple-400/10 rounded-full mb-4">
                    {feature.stats}
                  </span>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-6 group-hover:text-gradient transition-all duration-500">
                  {feature.title}
                </h3>
                
                <p className="text-white/70 text-lg leading-relaxed group-hover:text-white/90 transition-colors duration-500">
                  {feature.description}
                </p>

                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </NeuralCard>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        className="py-32 px-4"
        id="testimonials"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Trusted by <span className="text-gradient">Creators Worldwide</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Join thousands of professionals who've transformed their creative workflow
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="glass-card p-8 h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -8 }}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white/80 text-lg mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-white/60">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-32 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            className="glass-card p-16 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-pink-600/10" />
            
            <motion.h2
              className="text-5xl md:text-6xl font-bold text-white mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Ready to Transform Your Creative Workflow?
            </motion.h2>
            
            <motion.p
              className="text-2xl text-white/70 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Join thousands of creators using the most advanced creative platform. 
              Upload your content for AI enhancement or create entirely new media with transparent pay-per-use pricing.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <motion.a
                href="/api/login"
                className="btn-primary text-xl px-12 py-5 inline-flex items-center gap-3"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-6 h-6" />
                Begin Your Journey
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.a>
              
              <motion.button
                className="neon-border text-white px-12 py-5 font-semibold text-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center gap-3">
                  <Play className="w-6 h-6" />
                  Explore Features
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}