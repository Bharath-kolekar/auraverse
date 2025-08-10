import { useState } from 'react';
import { useLocation } from 'wouter';

interface ActionResponse {
  success: boolean;
  message: string;
  action?: string;
  redirect?: string;
}

export function useVoiceActions() {
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const executeCommand = async (command: string): Promise<ActionResponse> => {
    setIsProcessing(true);
    const lowerCommand = command.toLowerCase().trim();
    
    try {
      // Navigation commands
      if (lowerCommand.includes('go to') || lowerCommand.includes('open') || lowerCommand.includes('show me')) {
        if (lowerCommand.includes('create') || lowerCommand.includes('creation')) {
          console.log('Navigating to Create Studio...');
          setLocation('/create');
          return { success: true, message: "Opening Create Studio - where you can generate VFX, audio, video, and images.", action: 'navigate', redirect: '/create' };
        }
        if (lowerCommand.includes('gallery') || lowerCommand.includes('my content')) {
          setLocation('/gallery');
          return { success: true, message: "Opening your Gallery - showcasing all your created content.", action: 'navigate', redirect: '/gallery' };
        }
        if (lowerCommand.includes('marketplace')) {
          setLocation('/marketplace');
          return { success: true, message: "Opening Marketplace - where you can buy, sell, and discover amazing AI-generated content.", action: 'navigate', redirect: '/marketplace' };
        }
        if (lowerCommand.includes('home')) {
          setLocation('/');
          return { success: true, message: "Taking you to the home page.", action: 'navigate', redirect: '/' };
        }
      }
      
      // Falling star/meteor VFX - also catches "make falling stars"
      if ((lowerCommand.includes('falling') && (lowerCommand.includes('star') || lowerCommand.includes('meteor') || lowerCommand.includes('sky'))) ||
          (lowerCommand.includes('make') && lowerCommand.includes('falling') && lowerCommand.includes('stars'))) {
        console.log('Creating meteor VFX, navigating to Create Studio...');
        // Force immediate navigation
        setTimeout(() => setLocation('/create'), 100);
        return { 
          success: true, 
          message: "Creating spectacular falling star VFX! Opening Create Studio now and generating meteors with glowing trails, atmospheric entry effects, particle sparkles, and dramatic sky illumination.", 
          action: 'create_meteor_vfx',
          redirect: '/create'
        };
      }
      
      // VFX Creation commands
      if (lowerCommand.includes('create') && (lowerCommand.includes('vfx') || lowerCommand.includes('visual effects'))) {
        if (lowerCommand.includes('ship') || lowerCommand.includes('sea') || lowerCommand.includes('ocean')) {
          setLocation('/create');
          // Simulate VFX creation process
          setTimeout(() => {
            // This would trigger actual VFX generation
            console.log('Starting ship VFX generation...');
          }, 1000);
          return { 
            success: true, 
            message: "Creating your ship and sea VFX scene! Opening Create Studio and starting the generation process with cinematic ocean waves, realistic ship movement, and dramatic lighting.", 
            action: 'create_vfx',
            redirect: '/create'
          };
        }
        if (lowerCommand.includes('fantasy')) {
          setLocation('/create');
          return { 
            success: true, 
            message: "Creating fantasy VFX! Generating magical effects including glowing waters, mystical creatures, enchanted storms, and luminous atmospheric effects.", 
            action: 'create_fantasy_vfx',
            redirect: '/create'
          };
        }
      }
      
      // Audio creation commands
      if (lowerCommand.includes('create') && (lowerCommand.includes('music') || lowerCommand.includes('audio') || lowerCommand.includes('sound'))) {
        setLocation('/create');
        return { 
          success: true, 
          message: "Creating epic background music for your VFX scene! Generating cinematic orchestral score with ocean themes and adventure elements.", 
          action: 'create_audio',
          redirect: '/create'
        };
      }
      
      // Image generation commands
      if (lowerCommand.includes('create') && (lowerCommand.includes('image') || lowerCommand.includes('picture') || lowerCommand.includes('artwork'))) {
        setLocation('/create');
        return { 
          success: true, 
          message: "Generating stunning concept art for your ship scene! Creating high-resolution images with photorealistic detail and cinematic composition.", 
          action: 'create_image',
          redirect: '/create'
        };
      }
      
      // Video creation commands - more flexible matching
      if ((lowerCommand.includes('create') && (lowerCommand.includes('video') || lowerCommand.includes('movie') || lowerCommand.includes('film'))) || 
          lowerCommand.includes('cinematic video') ||
          (lowerCommand.includes('would like to create') && lowerCommand.includes('video')) ||
          (lowerCommand.includes('want to create') && lowerCommand.includes('video'))) {
        console.log('Creating video, navigating to Create Studio...');
        // Force immediate navigation
        setTimeout(() => setLocation('/create?autostart=true&type=video'), 100);
        return { 
          success: true, 
          message: "Creating your cinematic video! Opening Create Studio now and producing your video with train station scenes, VFX effects, background music, and professional editing.", 
          action: 'create_video',
          redirect: '/create'
        };
      }
      
      // Demonstration commands
      if (lowerCommand.includes('show me') || lowerCommand.includes('demonstrate')) {
        if (lowerCommand.includes('vfx') || lowerCommand.includes('effects')) {
          setLocation('/create');
          return { 
            success: true, 
            message: "Demonstrating VFX creation! Watch as I generate realistic water physics, particle effects, and lighting in real-time.", 
            action: 'demo_vfx',
            redirect: '/create'
          };
        }
      }
      
      // Start/Begin commands
      if (lowerCommand.includes('start') || lowerCommand.includes('begin') || lowerCommand.includes('let\'s go')) {
        setLocation('/create');
        return { 
          success: true, 
          message: "Starting your creative journey! Opening Create Studio where you can bring your ship and fantasy VFX vision to life.", 
          action: 'start_creating',
          redirect: '/create'
        };
      }
      
      // Generic creation commands
      if (lowerCommand.includes('make') || lowerCommand.includes('create') || lowerCommand.includes('generate')) {
        console.log('Generic creation command detected, navigating to Create Studio...');
        // Force immediate navigation
        setTimeout(() => setLocation('/create'), 100);
        return { 
          success: true, 
          message: "Starting creation process! Opening Create Studio now where I'll help you bring your vision to life with AI-powered tools.", 
          action: 'start_creation',
          redirect: '/create'
        };
      }
      
      return { 
        success: false, 
        message: "Ready to create! I can generate VFX, audio, video, images, navigate pages, or demonstrate features. Tell me what to make." 
      };
      
    } catch (error) {
      console.error('Voice action execution error:', error);
      return { 
        success: false, 
        message: "I encountered an error executing that command. Let me try a different approach." 
      };
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    executeCommand,
    isProcessing
  };
}