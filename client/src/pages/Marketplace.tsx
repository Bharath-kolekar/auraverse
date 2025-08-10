import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { ContentCard } from "@/components/ui/content-card";
import type { Content } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Filter,
  TrendingUp,
  Music,
  Video,
  Zap,
  Image,
  Flame
} from "lucide-react";

export default function Marketplace() {
  const [selectedFilter, setSelectedFilter] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: marketplaceContent, isLoading } = useQuery<Content[]>({
    queryKey: ['/api/content/marketplace', selectedFilter === "trending" ? "" : selectedFilter],
  });

  const filterButtons = [
    { id: "trending", label: "Trending", icon: Flame },
    { id: "audio", label: "Audio", icon: Music },
    { id: "video", label: "Video", icon: Video },
    { id: "vfx", label: "VFX", icon: Zap },
    { id: "image", label: "Images", icon: Image },
  ];

  const stats = [
    { label: "Premium Assets", value: "50K+", color: "text-electric-blue" },
    { label: "Active Creators", value: "15K+", color: "text-neon-purple" },
    { label: "Creator Earnings", value: "$2.3M", color: "text-green-400" },
    { label: "Quality Score", value: "98.5%", color: "text-yellow-400" },
  ];

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navbar />
      
      {/* Header */}
      <section className="pt-24 pb-8 cinematic-gradient">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-neon-purple to-pink-500 bg-clip-text text-transparent">
              Content Marketplace
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Buy, sell, and discover premium AI-generated content. From cinematic scores to VFX assets, 
              find everything you need for your next project.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for content, creators, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-deep-black/60 border-gray-600 text-lg"
              />
              <Button size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gradient-to-b from-space-black to-deep-black">
        <div className="container mx-auto px-6">
          {/* Filter Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {filterButtons.map((filter) => (
              <Button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                variant={selectedFilter === filter.id ? "default" : "outline"}
                className={`${
                  selectedFilter === filter.id
                    ? "bg-gradient-to-r from-electric-blue to-glow-blue"
                    : "bg-cyber-gray/50 hover:bg-cyber-gray"
                } transition-all duration-300`}
              >
                <filter.icon className="mr-2 h-4 w-4" />
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Content Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="content-card animate-pulse">
                  <div className="aspect-video bg-cyber-gray/30"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-cyber-gray/30 rounded mb-2"></div>
                    <div className="h-3 bg-cyber-gray/20 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-cyber-gray/20 rounded w-1/3"></div>
                      <div className="h-3 bg-cyber-gray/20 rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : marketplaceContent && marketplaceContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
              {marketplaceContent.map((item) => (
                <ContentCard
                  key={item.id}
                  content={item}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Content Found</h3>
              <p className="text-gray-400 mb-6">
                {selectedFilter === "trending" 
                  ? "No trending content available at the moment"
                  : `No ${selectedFilter} content found`}
              </p>
              <Button onClick={() => setSelectedFilter("trending")}>
                Browse All Content
              </Button>
            </div>
          )}

          {/* Load More */}
          {marketplaceContent && marketplaceContent.length > 0 && (
            <div className="text-center">
              <Button size="lg" className="bg-gradient-to-r from-electric-blue to-neon-purple">
                Load More Content
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Marketplace Stats */}
      <section className="py-12 bg-gradient-to-b from-deep-black to-cyber-gray">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="content-card text-center">
                <CardContent className="p-6">
                  <div className={`text-3xl font-bold mb-2 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
