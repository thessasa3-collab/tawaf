import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';

interface InteractiveGlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  delayIndex?: number;
  scrollReveal?: boolean;
}

export const InteractiveGlowCard: React.FC<InteractiveGlowCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(197, 155, 67, 0.16)',
  delayIndex = 0,
  scrollReveal = true,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [spot, setSpot] = useState<{ x: number; y: number; active: boolean }>({
    x: 50,
    y: 50,
    active: false,
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSpot({ x, y, active: true });
  };

  const handlePointerLeave = () => {
    setSpot((prev) => ({ ...prev, active: false }));
  };

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      initial={scrollReveal ? { opacity: 0, y: 20 } : false}
      whileInView={scrollReveal ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.42,
        delay: Math.min(delayIndex * 0.06, 0.3),
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`glow-surface overflow-hidden ${className}`}
    >
      {/* Soft radial pointer light overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: spot.active ? 1 : 0,
          background: `radial-gradient(280px circle at ${spot.x}% ${spot.y}%, ${glowColor}, transparent 72%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};
