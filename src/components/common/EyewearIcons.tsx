import React from 'react';

interface IconProps {
  className?: string;
}

// Logo spectacles icon
export const OptiGlassesLogo: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 48 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Left Rim */}
    <circle cx="13" cy="12" r="9" />
    {/* Right Rim */}
    <circle cx="35" cy="12" r="9" />
    {/* Bridge */}
    <path d="M22 10 Q 24 8 26 10" />
    {/* Left Temple */}
    <path d="M4 11 L1 10" />
    {/* Right Temple */}
    <path d="M44 11 L47 10" />
  </svg>
);

// Frame Shape: Round
export const IconRoundFrame: React.FC<IconProps> = ({ className = 'w-10 h-6' }) => (
  <svg viewBox="0 0 64 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="18" cy="14" r="11" />
    <circle cx="46" cy="14" r="11" />
    <path d="M29 12 Q 32 10 35 12" />
    <path d="M7 12 L2 11" />
    <path d="M57 12 L62 11" />
  </svg>
);

// Frame Shape: Square
export const IconSquareFrame: React.FC<IconProps> = ({ className = 'w-10 h-6' }) => (
  <svg viewBox="0 0 64 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="7" y="4" width="22" height="20" rx="3" />
    <rect x="35" y="4" width="22" height="20" rx="3" />
    <path d="M29 12 L35 12" />
    <path d="M7 10 L2 9" />
    <path d="M57 10 L62 9" />
  </svg>
);

// Frame Shape: Rectangle
export const IconRectangleFrame: React.FC<IconProps> = ({ className = 'w-10 h-6' }) => (
  <svg viewBox="0 0 64 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="6" y="7" width="24" height="15" rx="3" />
    <rect x="34" y="7" width="24" height="15" rx="3" />
    <path d="M30 13 L34 13" />
    <path d="M6 11 L2 10" />
    <path d="M58 11 L62 10" />
  </svg>
);

// Frame Shape: Cat-Eye
export const IconCatEyeFrame: React.FC<IconProps> = ({ className = 'w-10 h-6' }) => (
  <svg viewBox="0 0 64 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Left Rim */}
    <path d="M5 6 C12 6, 26 10, 27 18 C28 23, 16 25, 10 22 C6 19, 4 12, 5 6 Z" />
    {/* Right Rim */}
    <path d="M59 6 C52 6, 38 10, 37 18 C36 23, 48 25, 54 22 C58 19, 60 12, 59 6 Z" />
    {/* Bridge */}
    <path d="M27 12 Q 32 9 37 12" />
    <path d="M5 8 L1 7" />
    <path d="M59 8 L63 7" />
  </svg>
);

// Frame Shape: Wayfarer
export const IconWayfarerFrame: React.FC<IconProps> = ({ className = 'w-10 h-6' }) => (
  <svg viewBox="0 0 64 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 6 L28 6 L26 22 L10 22 Z" />
    <path d="M36 6 L58 6 L54 22 L38 22 Z" />
    <path d="M28 10 Q 32 8 36 10" />
    <path d="M6 8 L2 7" />
    <path d="M58 8 L62 7" />
  </svg>
);

// No Preference / Neutral icon
export const IconNoPreference: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="16" cy="16" r="11" />
    <line x1="8" y1="8" x2="24" y2="24" />
  </svg>
);

// Style: Classic
export const IconStyleClassic: React.FC<IconProps> = ({ className = 'w-10 h-6' }) => (
  <svg viewBox="0 0 64 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 8 Q 18 5 28 8 Q 29 20 18 22 Q 7 20 7 8 Z" />
    <path d="M36 8 Q 46 5 57 8 Q 57 20 46 22 Q 35 20 36 8 Z" />
    <path d="M28 11 Q 32 9 36 11" />
  </svg>
);

// Style: Modern
export const IconStyleModern: React.FC<IconProps> = ({ className = 'w-10 h-6' }) => (
  <svg viewBox="0 0 64 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="7" y="6" width="22" height="16" rx="2" />
    <rect x="35" y="6" width="22" height="16" rx="2" />
    <path d="M29 12 L35 12" />
  </svg>
);

// Style: Trendy
export const IconStyleTrendy: React.FC<IconProps> = ({ className = 'w-10 h-6' }) => (
  <svg viewBox="0 0 64 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 7 L28 5 L27 21 L8 23 Z" />
    <path d="M36 5 L58 7 L56 23 L37 21 Z" />
    <path d="M28 8 L36 8" />
  </svg>
);

// Style: Professional
export const IconStyleProfessional: React.FC<IconProps> = ({ className = 'w-10 h-6' }) => (
  <svg viewBox="0 0 64 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Half-rim / browline */}
    <path d="M6 7 L28 7 L26 18 Q 17 21 8 18 Z" />
    <path d="M36 7 L58 7 L56 18 Q 47 21 38 18 Z" />
    <path d="M28 10 L36 10" />
  </svg>
);

// Style: Casual
export const IconStyleCasual: React.FC<IconProps> = ({ className = 'w-10 h-6' }) => (
  <svg viewBox="0 0 64 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="18" cy="14" r="10" />
    <circle cx="46" cy="14" r="10" />
    <path d="M28 12 Q 32 10 36 12" />
  </svg>
);

// Wireframe Face Contour Outline for Face Shape Analysis Result
export const FaceShapeOvalGraphic: React.FC<IconProps> = ({ className = 'w-24 h-32' }) => (
  <svg viewBox="0 0 100 140" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    {/* Oval Contour */}
    <path
      d="M 50 15 C 28 15, 18 35, 18 65 C 18 100, 32 125, 50 125 C 68 125, 82 100, 82 65 C 82 35, 72 15, 50 15 Z"
      stroke="#E5D4C0"
      strokeWidth="1.8"
    />
    {/* Eyebrow / Eye Axis */}
    <line x1="28" y1="52" x2="42" y2="52" stroke="#656773" strokeWidth="1.2" />
    <line x1="58" y1="52" x2="72" y2="52" stroke="#656773" strokeWidth="1.2" />
    {/* Nose Guide */}
    <path d="M 50 56 L 50 78 L 46 82 L 54 82" stroke="#656773" strokeWidth="1.2" fill="none" />
    {/* Lip Line */}
    <path d="M 40 98 Q 50 96 60 98" stroke="#656773" strokeWidth="1.2" fill="none" />
    {/* Symmetry Axis (Vertical center dashed) */}
    <line x1="50" y1="20" x2="50" y2="120" stroke="#3D3E4E" strokeWidth="1" strokeDasharray="3 3" />
    {/* Eye Distance Indicator Line */}
    <line x1="35" y1="58" x2="65" y2="58" stroke="#E5D4C0" strokeWidth="1.5" />
    <circle cx="35" cy="58" r="2.5" fill="#E5D4C0" />
    <circle cx="65" cy="58" r="2.5" fill="#E5D4C0" />
  </svg>
);
