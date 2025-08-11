import { motion } from "framer-motion";

interface NeuralTextProps {
  children: React.ReactNode;
  variant?: "title" | "subtitle" | "body";
  className?: string;
}

export function NeuralText({ 
  children, 
  variant = "title",
  className = ""
}: NeuralTextProps) {
  const variantStyles = {
    title: "text-4xl font-black tracking-tight",
    subtitle: "text-xl font-bold tracking-wider",
    body: "text-base font-medium tracking-wide"
  };

  const letterSpacing = variant === "subtitle" ? "0.2em" : variant === "title" ? "-0.02em" : "0.05em";

  return (
    <motion.div
      className={`relative ${variantStyles[variant]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Blur backdrop for depth */}
      <span className="absolute inset-0 blur-md bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 opacity-50 -z-10"></span>
      
      {/* Main text with triple gradient */}
      <span 
        className="relative text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 animate-gradient"
        style={{ letterSpacing }}
      >
        {children}
      </span>
      
      {/* Subtle underline accent for titles */}
      {variant === "title" && (
        <motion.div 
          className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />
      )}
    </motion.div>
  );
}