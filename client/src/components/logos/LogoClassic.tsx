import { Brain } from "lucide-react";

// Classic COGNOMEGA Logo - Preserved for reference
export function LogoClassic({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: {
      container: "flex flex-col items-end",
      brain: "w-5 h-5",
      text: "text-2xl",
      tagline: "text-[9px]"
    },
    default: {
      container: "flex flex-col items-end",
      brain: "w-6 h-6",
      text: "text-3xl",
      tagline: "text-[11px]"
    },
    large: {
      container: "flex flex-col items-end",
      brain: "w-12 h-12",
      text: "text-6xl",
      tagline: "text-[11px]"
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={classes.container}>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Brain className={`${classes.brain} text-purple-400 animate-pulse`} />
          <div className="absolute inset-0 blur-lg bg-purple-500/30 animate-pulse"></div>
        </div>
        <h1 className={`${classes.text} font-black tracking-tighter`}>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 animate-gradient">
            COGNO
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 animate-gradient-reverse">
            MEGA
          </span>
        </h1>
      </div>
      <div className="flex justify-end mt-0.5">
        <p className={`${classes.tagline} font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300 uppercase`}>
          Production Intelligence
        </p>
      </div>
    </div>
  );
}