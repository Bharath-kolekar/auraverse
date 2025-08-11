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

  const handleDownload = async () => {
    if (frames.length === 0) return;

    try {
      // Create video package for download
      const videoPackage = {
        type: 'video-package',
        prompt,
        duration,
        frames,
        metadata: {
          fps: 30,
          width: 1920,
          height: 1080,
          totalFrames: frames.length,
          format: 'svg-sequence',
          instructions: 'This package contains all video frames as SVG files. Import into video editing software or use FFmpeg to create MP4.'
        }
      };

      // Create MP4-ready package
      const packageBlob = new Blob([JSON.stringify(videoPackage, null, 2)], { 
        type: 'application/octet-stream' 
      });

      const url = URL.createObjectURL(packageBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${prompt?.replace(/\s+/g, '_') || 'generated'}_video.mp4.package`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Also create a WebM video using Canvas recording
      await generateWebMVideo();

    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to JSON download
      const videoBlob = new Blob([JSON.stringify({
        frames,
        duration,
        prompt,
        fps: 30
      })], { type: 'application/json' });

      const url = URL.createObjectURL(videoBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `video_${prompt?.replace(/\s+/g, '_') || 'generated'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const generateWebMVideo = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const stream = canvas.captureStream(30); // 30 FPS
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8'
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const videoBlob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(videoBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${prompt?.replace(/\s+/g, '_') || 'generated'}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    // Record the entire video playback
    recorder.start();
    
    // Play through all frames quickly for recording
    let frameIndex = 0;
    const recordingInterval = setInterval(() => {
      if (frameIndex >= frames.length) {
        clearInterval(recordingInterval);
        recorder.stop();
        return;
      }

      // Render frame for recording
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
      img.src = frames[frameIndex];
      frameIndex++;
    }, 1000 / 30); // 30 FPS recording
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
      <div className="relative aspect-video">
        <canvas 
          ref={canvasRef}
          width={1920}
          height={1080}
          className="w-full h-full"
        />
        
        {/* Play button overlay when paused */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30"
            onClick={handlePlayPause}
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-gradient-to-t from-black/80 to-transparent">
        {/* Progress bar */}
        <div 
          className="relative h-2 bg-white/20 rounded-full cursor-pointer mb-4"
          onClick={handleSeek}
        >
          <div 
            className="absolute h-full bg-purple-600 rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
            </button>
            
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
            </button>
            
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}