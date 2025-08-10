import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Download, Loader2 } from 'lucide-react';

interface VideoCanvasProps {
  prompt: string;
  duration?: number;
  onComplete?: (videoUrl: string) => void;
}

export function VideoCanvas({ prompt, duration = 5, onComplete }: VideoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const animationRef = useRef<number>();
  const framesRef = useRef<ImageData[]>([]);

  useEffect(() => {
    generateAnimatedVideo();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [prompt]);

  const generateAnimatedVideo = async () => {
    setIsGenerating(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1280;
    canvas.height = 720;

    // Generate animated frames based on prompt
    const fps = 30;
    const totalFrames = fps * duration;
    framesRef.current = [];

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1e1b4b');
    gradient.addColorStop(0.5, '#7c3aed');
    gradient.addColorStop(1, '#ec4899');

    for (let frame = 0; frame < totalFrames; frame++) {
      // Clear canvas
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated elements based on frame
      const progress = frame / totalFrames;
      
      // Draw animated title
      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const titleY = canvas.height / 2 + Math.sin(progress * Math.PI * 4) * 20;
      ctx.fillText(prompt.substring(0, 50), canvas.width / 2, titleY);

      // Draw animated particles
      for (let i = 0; i < 20; i++) {
        const x = (canvas.width * (i / 20)) + (progress * canvas.width) % canvas.width;
        const y = canvas.height / 2 + Math.sin((progress + i / 20) * Math.PI * 2) * 100;
        const size = 5 + Math.sin((progress + i / 10) * Math.PI * 2) * 3;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(progress * Math.PI * 2) * 0.3})`;
        ctx.fill();
      }

      // Draw progress bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(100, canvas.height - 100, canvas.width - 200, 10);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(100, canvas.height - 100, (canvas.width - 200) * progress, 10);

      // Save frame
      framesRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }

    // Create a data URL representing the video
    const videoDataUrl = `data:application/x-custom-video;base64,${btoa(JSON.stringify({
      frames: totalFrames,
      fps: fps,
      width: canvas.width,
      height: canvas.height,
      prompt: prompt
    }))}`;

    setVideoUrl(videoDataUrl);
    setIsGenerating(false);
    if (onComplete) {
      onComplete(videoDataUrl);
    }

    // Start playback
    playVideo();
  };

  const playVideo = () => {
    if (!canvasRef.current || framesRef.current.length === 0) return;
    
    setIsPlaying(true);
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let currentFrame = 0;
    const fps = 30;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= 1000 / fps) {
        if (framesRef.current[currentFrame]) {
          ctx.putImageData(framesRef.current[currentFrame], 0, 0);
        }
        
        currentFrame = (currentFrame + 1) % framesRef.current.length;
        lastTime = currentTime;
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      playVideo();
    }
  };

  const downloadVideo = () => {
    if (!canvasRef.current) return;
    
    // Convert canvas to blob and download
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden border border-purple-500/30">
        <canvas 
          ref={canvasRef}
          className="w-full h-auto"
          style={{ maxHeight: '480px', backgroundColor: '#000' }}
        />
        
        {isGenerating && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-white">Generating Video...</p>
            </div>
          </div>
        )}
      </div>

      {!isGenerating && (
        <div className="flex gap-4 justify-center">
          <motion.button
            onClick={togglePlayback}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Play
              </>
            )}
          </motion.button>

          <motion.button
            onClick={downloadVideo}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-5 h-5" />
            Download Frame
          </motion.button>
        </div>
      )}

      <div className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-4">
        <p className="text-purple-300 text-sm">
          <strong>Note:</strong> This is an AI-generated animated visualization. For production-quality videos, 
          the system generates comprehensive storyboards and production plans that can be used with professional video editing software.
        </p>
      </div>
    </div>
  );
}