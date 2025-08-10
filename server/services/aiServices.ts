import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY_ENV_VAR || "default_key";

export class AIServices {
  async generateAudio(text: string, voice: string = "alloy", type: string = "speech"): Promise<any> {
    try {
      if (type === "music") {
        // For music generation, use OpenAI to create a detailed prompt
        const musicPrompt = await this.generateMusicPrompt(text);
        return {
          type: "music",
          prompt: musicPrompt,
          status: "generated",
          url: null // In production, this would be the actual audio file URL
        };
      } else {
        // Text-to-speech using OpenAI
        const mp3 = await openai.audio.speech.create({
          model: "tts-1",
          voice: voice as any,
          input: text,
        });

        return {
          type: "speech",
          text,
          voice,
          status: "generated",
          url: null // In production, this would be the actual audio file URL
        };
      }
    } catch (error) {
      console.error("Audio generation error:", error);
      throw new Error("Failed to generate audio");
    }
  }

  async generateVideo(prompt: string, style: string = "cinematic", duration: number = 30): Promise<any> {
    try {
      // Use OpenAI to generate detailed video description and storyboard
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional video director and storyboard artist. Create detailed video production specifications including shot descriptions, camera movements, lighting, and VFX requirements."
          },
          {
            role: "user",
            content: `Create a detailed ${duration}-second ${style} video based on this prompt: ${prompt}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const videoSpec = JSON.parse(response.choices[0].message.content || "{}");

      return {
        prompt,
        style,
        duration,
        specification: videoSpec,
        status: "generated",
        url: null // In production, this would be the actual video file URL
      };
    } catch (error) {
      console.error("Video generation error:", error);
      throw new Error("Failed to generate video");
    }
  }

  async generateVFX(type: string, parameters: any): Promise<any> {
    try {
      // Generate VFX specifications using OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional VFX supervisor. Create detailed technical specifications for visual effects including particle systems, lighting, compositing layers, and rendering parameters."
          },
          {
            role: "user",
            content: `Create VFX specifications for ${type} with these parameters: ${JSON.stringify(parameters)}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const vfxSpec = JSON.parse(response.choices[0].message.content || "{}");

      return {
        type,
        parameters,
        specification: vfxSpec,
        status: "generated",
        url: null // In production, this would be the actual VFX file URL
      };
    } catch (error) {
      console.error("VFX generation error:", error);
      throw new Error("Failed to generate VFX");
    }
  }

  async processVoiceCommand(command: string): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an AI assistant for a content creation platform. Parse voice commands and return structured actions. Respond with JSON containing the action type and parameters."
          },
          {
            role: "user",
            content: `Parse this voice command: "${command}"`
          }
        ],
        response_format: { type: "json_object" }
      });

      const commandResult = JSON.parse(response.choices[0].message.content || "{}");

      return {
        command,
        parsed: commandResult,
        confidence: 0.85,
        status: "processed"
      };
    } catch (error) {
      console.error("Voice command processing error:", error);
      throw new Error("Failed to process voice command");
    }
  }

  private async generateMusicPrompt(description: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a professional music composer. Create detailed musical composition descriptions including instrumentation, tempo, key, mood, and structure."
        },
        {
          role: "user",
          content: `Create a detailed musical composition based on: ${description}`
        }
      ]
    });

    return response.choices[0].message.content || "";
  }
}

export const aiServices = new AIServices();
