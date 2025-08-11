import React, { useRef, useEffect } from 'react';
import { Trophy, Star, Zap, Crown, Shield, Gem, Award, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementVisualProps {
  title: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  credits?: number;
  icon?: string;
  className?: string;
  forSharing?: boolean;
}

const rarityConfig = {
  common: {
    bgGradient: 'from-gray-600 to-gray-800',
    borderColor: 'border-gray-400',
    glowColor: 'shadow-gray-400/50',
    particleColor: '#9CA3AF',
    label: 'COMMON',
    icon: Trophy
  },
  rare: {
    bgGradient: 'from-blue-600 to-blue-800',
    borderColor: 'border-blue-400',
    glowColor: 'shadow-blue-400/50',
    particleColor: '#60A5FA',
    label: 'RARE',
    icon: Star
  },
  epic: {
    bgGradient: 'from-purple-600 to-purple-800',
    borderColor: 'border-purple-400',
    glowColor: 'shadow-purple-400/50',
    particleColor: '#A78BFA',
    label: 'EPIC',
    icon: Gem
  },
  legendary: {
    bgGradient: 'from-yellow-600 via-orange-600 to-red-600',
    borderColor: 'border-yellow-400',
    glowColor: 'shadow-yellow-400/50',
    particleColor: '#FCD34D',
    label: 'LEGENDARY',
    icon: Crown
  }
};

export const AchievementVisual: React.FC<AchievementVisualProps> = ({
  title,
  description,
  rarity,
  credits = 0,
  className,
  forSharing = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = rarityConfig[rarity];
  const Icon = config.icon;

  useEffect(() => {
    if (!forSharing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for high quality
    canvas.width = 1200;
    canvas.height = 630;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add decorative pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 60, 0);
      ctx.lineTo(i * 60, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * 60);
      ctx.lineTo(canvas.width, i * 60);
      ctx.stroke();
    }

    // Achievement card background
    const cardGradient = ctx.createLinearGradient(100, 100, 1100, 530);
    if (rarity === 'legendary') {
      cardGradient.addColorStop(0, '#D97706');
      cardGradient.addColorStop(0.5, '#DC2626');
      cardGradient.addColorStop(1, '#9333EA');
    } else if (rarity === 'epic') {
      cardGradient.addColorStop(0, '#7C3AED');
      cardGradient.addColorStop(1, '#9333EA');
    } else if (rarity === 'rare') {
      cardGradient.addColorStop(0, '#2563EB');
      cardGradient.addColorStop(1, '#3B82F6');
    } else {
      cardGradient.addColorStop(0, '#4B5563');
      cardGradient.addColorStop(1, '#6B7280');
    }

    // Card with rounded corners
    ctx.fillStyle = cardGradient;
    ctx.shadowColor = config.particleColor;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.roundRect(100, 100, 1000, 430, 20);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Inner card frame
    ctx.strokeStyle = config.particleColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(120, 120, 960, 390, 15);
    ctx.stroke();

    // Trophy icon circle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(300, 315, 80, 0, Math.PI * 2);
    ctx.fill();

    // Trophy icon (simplified)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆', 300, 340);

    // Rarity badge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(450, 150, 180, 50, 25);
    ctx.fill();
    ctx.fillStyle = config.particleColor;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(config.label, 540, 183);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(title, 450, 270);

    // Description
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '28px Arial';
    const words = description.split(' ');
    let line = '';
    let y = 330;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > 580 && n > 0) {
        ctx.fillText(line, 450, y);
        line = words[n] + ' ';
        y += 35;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 450, y);

    // Credits
    if (credits > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.roundRect(450, 430, 200, 60, 30);
      ctx.fill();
      
      ctx.fillStyle = '#FCD34D';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`+${credits} Credits`, 550, 470);
    }

    // Branding
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Infinite Intelligence AI Platform', 600, 580);

    // Decorative stars
    ctx.fillStyle = config.particleColor;
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [title, description, rarity, credits, forSharing, config.particleColor]);

  if (forSharing) {
    return (
      <canvas 
        ref={canvasRef}
        className={cn("hidden", className)}
      />
    );
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl p-6",
      "bg-gradient-to-br",
      config.bgGradient,
      "border-2",
      config.borderColor,
      "shadow-2xl",
      config.glowColor,
      className
    )}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${5 + Math.random() * 5}s`
            }}
          >
            <div 
              className="w-2 h-2 rounded-full opacity-50"
              style={{ backgroundColor: config.particleColor }}
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon and rarity badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
            <Icon className="w-12 h-12 text-white" />
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-bold text-white",
            "bg-black/30 backdrop-blur-sm"
          )}>
            {config.label}
          </div>
        </div>

        {/* Title and description */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <p className="text-white/90 text-sm">{description}</p>
        </div>

        {/* Credits */}
        {credits > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span className="text-white font-semibold">+{credits} Credits</span>
          </div>
        )}
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};

// Function to generate shareable image
export const generateShareableImage = async (
  title: string,
  description: string,
  rarity: 'common' | 'rare' | 'epic' | 'legendary',
  credits?: number
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    // Set canvas size for social media sharing
    canvas.width = 1200;
    canvas.height = 630;

    // Similar drawing code as above but simplified for generation
    // ... (canvas drawing code)

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png');
    resolve(dataUrl);
  });
};