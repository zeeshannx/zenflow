import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidCrystalBackground from './ui/liquid-crystal-shader.tsx';

interface BackgroundProps {
  gradientClass: string;
}

export const Background: React.FC<BackgroundProps> = ({ gradientClass }) => {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden bg-black">
      {/* Base Shader Layer */}
      <div className="absolute inset-0 opacity-40 mix-blend-screen">
        <LiquidCrystalBackground 
          speed={0.2} 
          radii={[0.3, 0.25, 0.35]} 
          smoothK={[0.3, 0.4]} 
        />
      </div>

      {/* Dynamic Gradient Tint Layer */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={gradientClass}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          className={`absolute inset-0 w-full h-full bg-gradient-to-br ${gradientClass}`}
        />
      </AnimatePresence>

      {/* Grain/Stardust Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none" />
      
      {/* Dark Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 pointer-events-none" />
    </div>
  );
};