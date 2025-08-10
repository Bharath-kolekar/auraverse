import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";

export function registerVideoRoutes(app: Express) {
  // Convert procedural video to MP4
  app.post('/api/video/convert', isAuthenticated, async (req: any, res) => {
    try {
      const { videoData, format = 'mp4' } = req.body;
      
      if (!videoData || !videoData.startsWith('data:application/json;base64,')) {
        return res.status(400).json({ error: 'Invalid video data' });
      }

      // Parse video data
      const jsonData = atob(videoData.split(',')[1]);
      const parsedData = JSON.parse(jsonData);
      
      if (parsedData.type !== 'procedural-video' || !parsedData.frames) {
        return res.status(400).json({ error: 'Invalid procedural video data' });
      }

      // For now, we'll create a downloadable package with all frames
      // In a production environment, you'd convert SVG frames to actual video using FFmpeg
      const videoPackage = {
        type: 'video-package',
        metadata: parsedData.metadata,
        frames: parsedData.frames,
        downloadInstructions: {
          note: 'This package contains all video frames as SVG files. Use a video editor or FFmpeg to compile into MP4.',
          frameRate: parsedData.metadata.fps || 30,
          duration: parsedData.metadata.duration,
          resolution: `${parsedData.metadata.width}x${parsedData.metadata.height}`
        }
      };

      // Create downloadable blob
      const packageBuffer = Buffer.from(JSON.stringify(videoPackage, null, 2));
      
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="video_${parsedData.metadata.prompt?.replace(/\s+/g, '_') || 'generated'}.mp4.package"`
      });
      
      res.send(packageBuffer);

    } catch (error) {
      console.error('Video conversion error:', error);
      res.status(500).json({ error: 'Failed to convert video' });
    }
  });

  // Download individual video frame
  app.get('/api/video/frame/:jobId/:frameIndex', isAuthenticated, async (req: any, res) => {
    try {
      const { jobId, frameIndex } = req.params;
      
      // In a real implementation, you'd retrieve the frame from storage
      // For now, we'll return a placeholder response
      res.json({ 
        message: 'Frame download endpoint ready',
        jobId,
        frameIndex: parseInt(frameIndex)
      });

    } catch (error) {
      console.error('Frame download error:', error);
      res.status(500).json({ error: 'Failed to download frame' });
    }
  });
}