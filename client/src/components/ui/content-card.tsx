import { Card, CardContent, CardFooter, CardHeader } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Heart, Share2, Download, Play } from "lucide-react";
import type { Content } from "@shared/schema";

interface ContentCardProps {
  content: Content;
  onLike?: (id: string) => void;
  onShare?: (id: string) => void;
  onDownload?: (id: string) => void;
  onPlay?: (id: string) => void;
}

export function ContentCard({ content, onLike, onShare, onDownload, onPlay }: ContentCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'audio': return 'bg-green-500';
      case 'video': return 'bg-blue-500';
      case 'image': return 'bg-purple-500';
      case 'vfx': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="content-card group hover:scale-105 transition-all duration-300">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          {content.thumbnailUrl ? (
            <img 
              src={content.thumbnailUrl} 
              alt={content.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-cyber-gray to-space-black flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <div className="w-12 h-12 mx-auto mb-2 opacity-50">
                  {content.type === 'audio' && <span className="text-2xl">🎵</span>}
                  {content.type === 'video' && <span className="text-2xl">🎬</span>}
                  {content.type === 'image' && <span className="text-2xl">🎨</span>}
                  {content.type === 'vfx' && <span className="text-2xl">✨</span>}
                </div>
                <p className="text-sm">No Preview</p>
              </div>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge className={`${getTypeColor(content.type)} text-white`}>
              {content.type.toUpperCase()}
            </Badge>
          </div>
          {onPlay && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPlay(content.id)}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                <Play className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-white mb-2 line-clamp-2">{content.title}</h3>
        {content.description && (
          <p className="text-sm text-gray-400 line-clamp-3 mb-3">{content.description}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{new Date(content.createdAt).toLocaleDateString()}</span>
          {content.duration && (
            <span>{Math.round(content.duration)}s</span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike?.(content.id)}
            className="text-gray-400 hover:text-red-400"
          >
            <Heart className="w-4 h-4" />
            <span className="ml-1 text-xs">{content.likes || 0}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShare?.(content.id)}
            className="text-gray-400 hover:text-electric-blue"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
        {onDownload && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload(content.id)}
            className="text-gray-400 hover:text-green-400"
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}