import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { ContentCard } from "@/components/ui/content-card";
import type { Content, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Grid,
  List,
  Filter,
  Plus,
  Video,
  Music,
  Zap,
  Image,
  Calendar,
  TrendingUp
} from "lucide-react";

export default function Gallery() {
  const { user } = useAuth();
  const typedUser = user as User | undefined;
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { data: userContent, isLoading } = useQuery<Content[]>({
    queryKey: ['/api/content/user'],
    enabled: !!typedUser,
  });

  const filterButtons = [
    { id: "all", label: "All", icon: Grid },
    { id: "video", label: "Videos", icon: Video },
    { id: "audio", label: "Audio", icon: Music },
    { id: "vfx", label: "VFX", icon: Zap },
    { id: "image", label: "Images", icon: Image },
    { id: "recent", label: "Recent", icon: Calendar },
    { id: "popular", label: "Popular", icon: TrendingUp },
  ];

  const filteredContent = userContent?.filter((item) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "recent") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(item.createdAt) > oneWeekAgo;
    }
    return item.type === selectedFilter;
  }) || [];

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navbar />
      
      {/* Header */}
      <section className="pt-24 pb-8 cinematic-gradient">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Creator Gallery
              </h1>
              <p className="text-xl text-gray-300">
                Showcase your masterpieces. Experience the future of AI-assisted content creation.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gradient-to-b from-space-black to-deep-black">
        <div className="container mx-auto px-6">
          {/* Filter Navigation */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {filterButtons.map((filter) => (
              <Button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                variant={selectedFilter === filter.id ? "default" : "outline"}
                size="sm"
                className={`${
                  selectedFilter === filter.id
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black"
                    : "bg-cyber-gray/50 hover:bg-cyber-gray"
                } transition-all duration-300`}
              >
                <filter.icon className="mr-2 h-4 w-4" />
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Content Grid/List */}
          {isLoading ? (
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            }`}>
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="content-card animate-pulse">
                  <div className={`bg-cyber-gray/30 ${
                    viewMode === "grid" ? "aspect-video" : "h-32"
                  }`}></div>
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
          ) : filteredContent.length > 0 ? (
            <>
              <div className={`grid gap-6 mb-12 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
              }`}>
                {filteredContent.map((item) => (
                  <ContentCard
                    key={item.id}
                    content={item}
                  />
                ))}
              </div>

              {/* Load More */}
              <div className="text-center">
                <Button size="lg" className="bg-gradient-to-r from-electric-blue to-neon-purple">
                  <Plus className="mr-2 h-5 w-5" />
                  Load More Content
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-electric-blue to-neon-purple rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">
                {selectedFilter === "all" ? "No Content Yet" : `No ${selectedFilter} content found`}
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {selectedFilter === "all" 
                  ? "Start creating amazing content with our AI-powered tools"
                  : `Create your first ${selectedFilter} content to see it here`}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => window.location.href = "/create"}
                  size="lg" 
                  className="bg-gradient-to-r from-electric-blue to-neon-purple"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create Content
                </Button>
                {selectedFilter !== "all" && (
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedFilter("all")}
                  >
                    View All Content
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
