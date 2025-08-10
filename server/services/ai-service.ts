import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ContentGenerationRequest {
  type: 'video' | 'audio' | 'image' | 'voice' | 'vfx';
  prompt: string;
  style?: string;
  duration?: number;
  quality?: 'standard' | 'hd' | 'ultra';
  userId: string;
}

export interface ContentGenerationResult {
  id: string;
  type: string;
  status: 'generating' | 'completed' | 'failed';
  progress: number;
  url?: string;
  metadata?: any;
  error?: string;
}

class AIService {
  private activeJobs = new Map<string, ContentGenerationResult>();

  async generateImage(request: ContentGenerationRequest): Promise<ContentGenerationResult> {
    const jobId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: ContentGenerationResult = {
      id: jobId,
      type: 'image',
      status: 'generating',
      progress: 0
    };
    
    this.activeJobs.set(jobId, job);
    
    try {
      // Update progress
      this.updateProgress(jobId, 25);
      
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: this.enhanceImagePrompt(request.prompt, request.style),
        n: 1,
        size: request.quality === 'ultra' ? "1792x1024" : request.quality === 'hd' ? "1024x1024" : "512x512",
        quality: request.quality === 'standard' ? 'standard' : 'hd',
        response_format: 'url'
      });
      
      this.updateProgress(jobId, 100);
      
      const result: ContentGenerationResult = {
        id: jobId,
        type: 'image',
        status: 'completed',
        progress: 100,
        url: response.data?.[0]?.url || '',
        metadata: {
          prompt: request.prompt,
          enhancedPrompt: this.enhanceImagePrompt(request.prompt, request.style),
          size: request.quality === 'ultra' ? "1792x1024" : request.quality === 'hd' ? "1024x1024" : "512x512",
          model: 'dall-e-3'
        }
      };
      
      this.activeJobs.set(jobId, result);
      return result;
      
    } catch (error) {
      const failedResult: ContentGenerationResult = {
        id: jobId,
        type: 'image',
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.activeJobs.set(jobId, failedResult);
      return failedResult;
    }
  }

  async generateVideo(request: ContentGenerationRequest): Promise<ContentGenerationResult> {
    const jobId = `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: ContentGenerationResult = {
      id: jobId,
      type: 'video',
      status: 'generating',
      progress: 0
    };
    
    this.activeJobs.set(jobId, job);
    
    try {
      // Simulate advanced video generation process
      this.updateProgress(jobId, 10);
      await this.delay(1000);
      
      // Generate storyboard with DALL-E
      const storyboardResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Cinematic storyboard frames for: ${this.enhanceVideoPrompt(request.prompt)}`,
        n: 1,
        size: "1792x1024",
        quality: 'hd'
      });
      
      this.updateProgress(jobId, 30);
      await this.delay(1500);
      
      // Generate video script using GPT-4o
      const scriptResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert video producer. Create a detailed video production plan with scene descriptions, camera angles, lighting, and VFX notes."
          },
          {
            role: "user",
            content: `Create a professional video production plan for: ${request.prompt}. Include specific technical details for ${request.duration || 30} seconds of content.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });
      
      this.updateProgress(jobId, 60);
      await this.delay(2000);
      
      // Generate video preview image
      const previewResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `High-quality video thumbnail for: ${request.prompt}, cinematic lighting, professional composition`,
        n: 1,
        size: "1792x1024",
        quality: 'hd'
      });
      
      this.updateProgress(jobId, 90);
      await this.delay(1000);
      
      const videoScript = JSON.parse(scriptResponse.choices[0].message.content || '{}');
      
      const result: ContentGenerationResult = {
        id: jobId,
        type: 'video',
        status: 'completed',
        progress: 100,
        url: previewResponse.data?.[0]?.url || '',
        metadata: {
          prompt: request.prompt,
          duration: request.duration || 30,
          storyboard: storyboardResponse.data?.[0]?.url || '',
          script: videoScript,
          quality: request.quality,
          model: 'dall-e-3 + gpt-4o',
          production_notes: 'Video preview generated. Full video rendering would require additional video generation API.'
        }
      };
      
      this.activeJobs.set(jobId, result);
      return result;
      
    } catch (error) {
      const failedResult: ContentGenerationResult = {
        id: jobId,
        type: 'video',
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.activeJobs.set(jobId, failedResult);
      return failedResult;
    }
  }

  async generateAudio(request: ContentGenerationRequest): Promise<ContentGenerationResult> {
    const jobId = `aud_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: ContentGenerationResult = {
      id: jobId,
      type: 'audio',
      status: 'generating',
      progress: 0
    };
    
    this.activeJobs.set(jobId, job);
    
    try {
      this.updateProgress(jobId, 20);
      
      // Generate music composition using GPT-4o
      const compositionResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional music composer and audio engineer. Create detailed music production specifications including BPM, key signature, instruments, and mixing notes."
          },
          {
            role: "user",
            content: `Create a professional music composition for: ${request.prompt}. Duration: ${request.duration || 60} seconds. Include specific technical details for ${request.style || 'cinematic'} style.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500
      });
      
      this.updateProgress(jobId, 50);
      await this.delay(2000);
      
      // Generate audio waveform visualization
      const waveformResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Professional audio waveform visualization for ${request.prompt}, ${request.style || 'cinematic'} music, frequency spectrum, studio quality`,
        n: 1,
        size: "1792x1024",
        quality: 'hd'
      });
      
      this.updateProgress(jobId, 80);
      await this.delay(1500);
      
      const composition = JSON.parse(compositionResponse.choices[0].message.content || '{}');
      
      this.updateProgress(jobId, 100);
      
      const result: ContentGenerationResult = {
        id: jobId,
        type: 'audio',
        status: 'completed',
        progress: 100,
        url: waveformResponse.data?.[0]?.url || '',
        metadata: {
          prompt: request.prompt,
          duration: request.duration || 60,
          style: request.style || 'cinematic',
          composition: composition,
          quality: request.quality,
          model: 'gpt-4o + dall-e-3',
          production_notes: 'Audio composition and waveform generated. Full audio synthesis would require additional audio generation API.'
        }
      };
      
      this.activeJobs.set(jobId, result);
      return result;
      
    } catch (error) {
      const failedResult: ContentGenerationResult = {
        id: jobId,
        type: 'audio',
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.activeJobs.set(jobId, failedResult);
      return failedResult;
    }
  }

  async generateVoice(request: ContentGenerationRequest): Promise<ContentGenerationResult> {
    const jobId = `voi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: ContentGenerationResult = {
      id: jobId,
      type: 'voice',
      status: 'generating',
      progress: 0
    };
    
    this.activeJobs.set(jobId, job);
    
    try {
      this.updateProgress(jobId, 25);
      
      // Generate voice script using GPT-4o
      const scriptResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional voice director and script writer. Create engaging voice-over scripts with timing, emphasis, and emotional direction notes."
          },
          {
            role: "user",
            content: `Create a professional voice-over script for: ${request.prompt}. Include timing marks, emphasis notes, and emotional direction.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });
      
      this.updateProgress(jobId, 60);
      await this.delay(1000);
      
      // Generate voice synthesis using OpenAI TTS
      const ttsResponse = await openai.audio.speech.create({
        model: "tts-1-hd",
        voice: "nova",
        input: request.prompt,
        response_format: "mp3"
      });
      
      this.updateProgress(jobId, 90);
      
      // Convert to base64 for client display
      const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
      const audioBase64 = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;
      
      const script = JSON.parse(scriptResponse.choices[0].message.content || '{}');
      
      this.updateProgress(jobId, 100);
      
      const result: ContentGenerationResult = {
        id: jobId,
        type: 'voice',
        status: 'completed',
        progress: 100,
        url: audioBase64,
        metadata: {
          prompt: request.prompt,
          script: script,
          voice: 'nova',
          model: 'tts-1-hd',
          format: 'mp3',
          quality: request.quality,
          production_notes: 'High-quality voice synthesis completed using OpenAI TTS-1-HD model.'
        }
      };
      
      this.activeJobs.set(jobId, result);
      return result;
      
    } catch (error) {
      const failedResult: ContentGenerationResult = {
        id: jobId,
        type: 'voice',
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.activeJobs.set(jobId, failedResult);
      return failedResult;
    }
  }

  async generateVFX(request: ContentGenerationRequest): Promise<ContentGenerationResult> {
    const jobId = `vfx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: ContentGenerationResult = {
      id: jobId,
      type: 'vfx',
      status: 'generating',
      progress: 0
    };
    
    this.activeJobs.set(jobId, job);
    
    try {
      this.updateProgress(jobId, 15);
      
      // Generate VFX technical specification
      const vfxSpecResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional VFX supervisor and technical director. Create detailed VFX specifications including particle systems, lighting, shaders, and rendering parameters."
          },
          {
            role: "user",
            content: `Create professional VFX specifications for: ${request.prompt}. Include technical details for particle systems, lighting, materials, and rendering pipeline.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });
      
      this.updateProgress(jobId, 40);
      await this.delay(1500);
      
      // Generate VFX concept art
      const conceptResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Professional VFX concept art: ${request.prompt}, cinematic quality, detailed particle effects, realistic lighting, studio-quality visual effects`,
        n: 1,
        size: "1792x1024",
        quality: 'hd'
      });
      
      this.updateProgress(jobId, 70);
      await this.delay(2000);
      
      // Generate VFX breakdown visualization
      const breakdownResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `VFX breakdown layers visualization for: ${request.prompt}, technical diagram showing particle systems, lighting passes, compositing layers`,
        n: 1,
        size: "1792x1024",
        quality: 'hd'
      });
      
      this.updateProgress(jobId, 95);
      await this.delay(1000);
      
      const vfxSpec = JSON.parse(vfxSpecResponse.choices[0].message.content || '{}');
      
      this.updateProgress(jobId, 100);
      
      const result: ContentGenerationResult = {
        id: jobId,
        type: 'vfx',
        status: 'completed',
        progress: 100,
        url: conceptResponse.data?.[0]?.url || '',
        metadata: {
          prompt: request.prompt,
          specification: vfxSpec,
          concept_art: conceptResponse.data?.[0]?.url || '',
          breakdown: breakdownResponse.data?.[0]?.url || '',
          quality: request.quality,
          model: 'gpt-4o + dall-e-3',
          production_notes: 'VFX concept, specifications, and breakdown generated. Full VFX rendering would require 3D rendering pipeline.'
        }
      };
      
      this.activeJobs.set(jobId, result);
      return result;
      
    } catch (error) {
      const failedResult: ContentGenerationResult = {
        id: jobId,
        type: 'vfx',
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.activeJobs.set(jobId, failedResult);
      return failedResult;
    }
  }

  getJobStatus(jobId: string): ContentGenerationResult | null {
    return this.activeJobs.get(jobId) || null;
  }

  getAllJobs(userId: string): ContentGenerationResult[] {
    return Array.from(this.activeJobs.values());
  }

  private updateProgress(jobId: string, progress: number) {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.progress = progress;
      this.activeJobs.set(jobId, job);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private enhanceImagePrompt(prompt: string, style?: string): string {
    const baseEnhancement = "Professional, high-quality, detailed, cinematic lighting, 8K resolution";
    const styleEnhancement = style ? `, ${style} style` : ", photorealistic";
    return `${prompt}, ${baseEnhancement}${styleEnhancement}`;
  }

  private enhanceVideoPrompt(prompt: string): string {
    return `${prompt}, cinematic quality, professional cinematography, dynamic camera movement, high production value`;
  }
}

export const aiService = new AIService();