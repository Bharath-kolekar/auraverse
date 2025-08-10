import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransition, speedMultipliers } from '@/contexts/TransitionContext';

interface PageTransitionProps {
  children: React.ReactNode;
  pageKey: string;
  transitionType?: 'slide' | 'fade' | 'wipe' | 'diagonal' | 'zoom' | 'rotate' | 'blur' | 'curtain' | 'flip' | 'wave';
}

const transitions = {
  slide: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.4 }
  },
  wipe: {
    initial: { 
      clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
      opacity: 1 
    },
    animate: { 
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      opacity: 1 
    },
    exit: { 
      clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
      opacity: 1 
    },
    transition: { duration: 0.6, ease: [0.83, 0, 0.17, 1] }
  },
  diagonal: {
    initial: { 
      clipPath: 'polygon(0 0, 0 0, 0 0, 0 0)',
      opacity: 1 
    },
    animate: { 
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      opacity: 1 
    },
    exit: { 
      clipPath: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)',
      opacity: 1 
    },
    transition: { duration: 0.7, ease: [0.43, 0, 0.17, 1] }
  },
  zoom: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },
  rotate: {
    initial: { 
      rotateY: 90, 
      opacity: 0,
      transformPerspective: 1200 
    },
    animate: { 
      rotateY: 0, 
      opacity: 1,
      transformPerspective: 1200 
    },
    exit: { 
      rotateY: -90, 
      opacity: 0,
      transformPerspective: 1200 
    },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
  },
  blur: {
    initial: { 
      filter: 'blur(20px)',
      opacity: 0,
      scale: 0.95
    },
    animate: { 
      filter: 'blur(0px)',
      opacity: 1,
      scale: 1
    },
    exit: { 
      filter: 'blur(20px)',
      opacity: 0,
      scale: 1.05
    },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },
  curtain: {
    initial: { 
      clipPath: 'inset(0 50% 0 50%)',
      opacity: 1 
    },
    animate: { 
      clipPath: 'inset(0 0% 0 0%)',
      opacity: 1 
    },
    exit: { 
      clipPath: 'inset(0 50% 0 50%)',
      opacity: 1 
    },
    transition: { duration: 0.7, ease: [0.65, 0, 0.35, 1] }
  },
  flip: {
    initial: { 
      rotateX: -90,
      opacity: 0,
      transformPerspective: 1200
    },
    animate: { 
      rotateX: 0,
      opacity: 1,
      transformPerspective: 1200
    },
    exit: { 
      rotateX: 90,
      opacity: 0,
      transformPerspective: 1200
    },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
  },
  wave: {
    initial: { 
      y: '100%',
      opacity: 0,
      skewY: -5
    },
    animate: { 
      y: 0,
      opacity: 1,
      skewY: 0
    },
    exit: { 
      y: '-100%',
      opacity: 0,
      skewY: 5
    },
    transition: { 
      duration: 0.8, 
      ease: [0.19, 1, 0.22, 1],
      opacity: { duration: 0.3 }
    }
  }
};

export function PageTransition({ 
  children, 
  pageKey, 
  transitionType = 'wipe' 
}: PageTransitionProps) {
  const { transitionSpeed, enableTransitions, transitionStyle } = useTransition();
  
  // If transitions are disabled, just render children
  if (!enableTransitions) {
    return <>{children}</>;
  }
  
  // Select transition based on style preference
  let effectiveTransitionType = transitionType;
  if (transitionStyle === 'minimal') {
    effectiveTransitionType = 'fade';
  } else if (transitionStyle === 'extreme' && transitionType !== 'fade') {
    // Use more dramatic transitions in extreme mode
    const extremeTransitions = ['curtain', 'flip', 'wave', 'diagonal', 'rotate'];
    effectiveTransitionType = extremeTransitions[Math.floor(Math.random() * extremeTransitions.length)] as any;
  }
  
  const selectedTransition = transitions[effectiveTransitionType];
  const speedMultiplier = speedMultipliers[transitionSpeed];
  
  // Adjust transition duration based on speed setting
  const adjustedTransition = {
    ...selectedTransition.transition,
    duration: (selectedTransition.transition.duration || 0.5) * speedMultiplier
  };
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={selectedTransition.initial}
        animate={selectedTransition.animate}
        exit={selectedTransition.exit}
        transition={adjustedTransition}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Page loading skeleton for smooth transitions
export function PageLoadingSkeleton() {
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center">
        <motion.div
          className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          className="text-white/60"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.p>
      </div>
    </motion.div>
  );
}