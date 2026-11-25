import React from 'react';

interface TawafEmblemProps {
  className?: string;
}

export const TawafEmblem: React.FC<TawafEmblemProps> = ({ className = 'w-11 h-11' }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer Octagonal Ministry-Inspired Sacred Geometric Frame */}
      <path
        d="M32 3L43 10.5L55.5 11.5L57 24L61 32L57 40L55.5 52.5L43 53.5L32 61L21 53.5L8.5 52.5L7 40L3 32L7 24L8.5 11.5L21 10.5L32 3Z"
        fill="#082D23"
        stroke="#C59B43"
        strokeWidth="2"
      />
      {/* Inner Architectural Arch Ring */}
      <circle
        cx="32"
        cy="32"
        r="20"
        stroke="#C59B43"
        strokeWidth="1.25"
        strokeOpacity="0.65"
      />
      {/* Kaaba-inspired Geometric Corner & Haram Gate Symmetry */}
      <path
        d="M20 26C20 19.5 25.4 14 32 14C38.6 14 44 19.5 44 26V42H20V26Z"
        stroke="#E6C77A"
        strokeWidth="1.75"
        fill="#0D4435"
      />
      {/* Gold Kiswah Band Accent */}
      <path d="M20 25H44" stroke="#C59B43" strokeWidth="1.5" />
      {/* Integrated Medical Triage Cross */}
      <path
        d="M30 28.5H34V32.5H38V36.5H34V40.5H30V36.5H26V32.5H30V28.5Z"
        fill="#FFFFFF"
      />
      {/* Subtle Top Crescent Crest */}
      <path
        d="M32 8.2C33.8 8.2 35.3 9.3 35.8 10.9C34.9 10.2 33.7 9.9 32.5 10.1C31.1 10.3 29.9 11.1 29.3 12.3C29.1 10.1 30.3 8.2 32 8.2Z"
        fill="#E6C77A"
      />
    </svg>
  );
};
