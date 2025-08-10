import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Download, Volume2, VolumeX, Maximize } from 'lucide-react';

interface VideoPlayerProps {
  videoData: string;
  thumbnail?: string;
  duration?: number;
  prompt?: string;
}

export function VideoPlayer({ videoData, thumbnail, duration = 30, prompt }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [frames, setFrames] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Parse video data
    try {
      if (videoData.startsWith('data:application/json;base64,')) {
        const jsonData = atob(videoData.split(',')[1]);
        const parsedData = JSON.parse(jsonData);
        if (parsedData.type === 'procedural-video' && parsedData.frames) {
          setFrames(parsedData.frames);
          // Auto-play when frames are loaded
          setTimeout(() => {
            setIsPlaying(true);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error parsing video data:', error);
    }
  }, [videoData]);

  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      const fps = 30;
      const frameInterval = 1000 / fps;
      
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + (1 / fps);
          if (newTime >= duration) {
            setIsPlaying(false);
            return 0; // Loop back to start
          }
          return newTime;
        });
      }, frameInterval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, frames.length, duration]);

  useEffect(() => {
    // Render current frame
    if (frames.length > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const frameIndex = Math.floor((currentTime / duration) * frames.length);
      const currentFrame = frames[Math.min(frameIndex, frames.length - 1)];

      if (ctx && currentFrame) {
        // Create image from SVG frame
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = currentFrame;
      }
    }
  }, [currentTime, frames]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (frames.length === 0) return;

    // Create downloadable video data
    const videoBlob = new Blob([JSON.stringify({
      type: 'procedural-video',
      frames,
      duration,
      prompt,
      metadata: {
        fps: 30,
        width: 1920,
        height: 1080,
        totalFrames: frames.length
      }
    })], { type: 'application/json' });

    const url = URL.createObjectURL(videoBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `video_${prompt?.replace(/\s+/g, '_') || 'generated'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Also download first frame as thumbnail
    if (frames[0]) {
      const thumbnailLink = document.createElement('a');
      thumbnailLink.href = frames[0];
      thumbnailLink.download = `thumbnail_${prompt?.replace(/\s+/g, '_') || 'generated'}.svg`;
      thumbnailLink.click();
    }
  };

  if (frames.length === 0) {
    return (
      <div className="w-full h-64 bg-black rounded-lg flex items-center justify-center">
        <div className="text-white/50">Loading video...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black rounded-xl overflow-hidden">
      {/* Video Display */}
      <div className="relative group">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full h-auto bg-black"
          style={{ aspectRatio: '16/9' }}
        />
        
        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <motion.button
            onClick={handlePlayPause}
            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white ml-0" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </motion.button>
        </div>

        {/* Video Info Overlay */}
        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-lg backdrop-blur-sm">
          <span className="text-sm font-medium">{prompt}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-900 space-y-3">
        {/* Progress Bar */}
        <div 
          className="w-full h-2 bg-gray-700 rounded-full cursor-pointer"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-purple-500 rounded-full transition-all duration-100"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handlePlayPause}
              className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </motion.button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-white hover:text-purple-400 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download className="w-4 h-4" />
              Download
            </motion.button>

            <button className="text-white hover:text-purple-400 transition-colors">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Stats */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Procedural Video • {frames.length} frames • 30 FPS</span>
          <span>Local Generation • Downloadable</span>
        </div>
      </div>
    </div>
  );
}