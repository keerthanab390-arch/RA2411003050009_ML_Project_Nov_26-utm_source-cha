import React from 'react';

interface FacialLandmarksCanvasProps {
  isMeshVisible: boolean;
}

export const FacialLandmarksCanvas: React.FC<FacialLandmarksCanvasProps> = ({ isMeshVisible }) => {
  if (!isMeshVisible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
      <svg
        className="w-full h-full"
        viewBox="0 0 400 500"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Fine Landmark Mesh Lines & Triangles */}
        <g stroke="rgba(229, 212, 192, 0.4)" strokeWidth="0.8" fill="none">
          {/* Forehead Triangles */}
          <polygon points="140,150 200,130 260,150" />
          <polygon points="140,150 170,180 200,150" />
          <polygon points="200,150 230,180 260,150" />
          <polygon points="200,130 200,150 170,180" />
          <polygon points="200,130 200,150 230,180" />

          {/* Left Eyebrow & Eye Mesh */}
          <polygon points="130,190 160,185 185,195 160,205" />
          <polygon points="140,210 160,205 180,210 160,218" />
          <line x1="130" y1="190" x2="140" y2="210" />
          <line x1="185" y1="195" x2="180" y2="210" />

          {/* Right Eyebrow & Eye Mesh */}
          <polygon points="270,190 240,185 215,195 240,205" />
          <polygon points="260,210 240,205 220,210 240,218" />
          <line x1="270" y1="190" x2="260" y2="210" />
          <line x1="215" y1="195" x2="220" y2="210" />

          {/* Nose Bridge Mesh */}
          <polygon points="200,150 185,195 200,230" />
          <polygon points="200,150 215,195 200,230" />
          <polygon points="200,230 185,270 200,285" />
          <polygon points="200,230 215,270 200,285" />
          <polygon points="185,270 200,285 215,270" />

          {/* Cheek & Mid-face Tessellation */}
          <polygon points="130,190 100,250 140,270 185,270" />
          <polygon points="270,190 300,250 260,270 215,270" />
          <line x1="140" y1="210" x2="140" y2="270" />
          <line x1="260" y1="210" x2="260" y2="270" />

          {/* Lips & Mouth Mesh */}
          <polygon points="160,335 200,325 240,335 200,345" />
          <polygon points="160,335 200,345 240,335 200,360" />
          <line x1="185" y1="270" x2="200" y2="325" />
          <line x1="215" y1="270" x2="200" y2="325" />

          {/* Chin & Jawline Mesh */}
          <polygon points="160,335 125,360 150,410 200,425" />
          <polygon points="240,335 275,360 250,410 200,425" />
          <polygon points="200,360 150,410 200,425" />
          <polygon points="200,360 250,410 200,425" />

          {/* Outer Jaw Contour */}
          <path d="M 95,240 L 105,300 L 125,360 L 150,410 L 200,425 L 250,410 L 275,360 L 295,300 L 305,240" />
        </g>

        {/* 468 Fine Mesh Dots */}
        <g fill="#E5D4C0">
          {/* Eyes & Brows */}
          <circle cx="130" cy="190" r="2" />
          <circle cx="160" cy="185" r="2" />
          <circle cx="185" cy="195" r="2" />
          <circle cx="140" cy="210" r="2" />
          <circle cx="160" cy="205" r="2" />
          <circle cx="180" cy="210" r="2" />
          <circle cx="160" cy="218" r="2" />

          <circle cx="270" cy="190" r="2" />
          <circle cx="240" cy="185" r="2" />
          <circle cx="215" cy="195" r="2" />
          <circle cx="260" cy="210" r="2" />
          <circle cx="240" cy="205" r="2" />
          <circle cx="220" cy="210" r="2" />
          <circle cx="240" cy="218" r="2" />

          {/* Pupillary Distance Centers */}
          <circle cx="160" cy="210" r="3.5" fill="#FFFFFF" />
          <circle cx="240" cy="210" r="3.5" fill="#FFFFFF" />

          {/* Nose */}
          <circle cx="200" cy="150" r="2" />
          <circle cx="200" cy="230" r="2" />
          <circle cx="185" cy="270" r="2" />
          <circle cx="200" cy="285" r="2.5" />
          <circle cx="215" cy="270" r="2" />

          {/* Mouth */}
          <circle cx="160" cy="335" r="2" />
          <circle cx="200" cy="325" r="2" />
          <circle cx="240" cy="335" r="2" />
          <circle cx="200" cy="345" r="2" />
          <circle cx="200" cy="360" r="2" />

          {/* Cheeks & Jaw */}
          <circle cx="100" cy="250" r="2" />
          <circle cx="140" cy="270" r="2" />
          <circle cx="300" cy="250" r="2" />
          <circle cx="260" cy="270" r="2" />
          <circle cx="95" cy="240" r="2" />
          <circle cx="105" cy="300" r="2" />
          <circle cx="125" cy="360" r="2" />
          <circle cx="150" cy="410" r="2" />
          <circle cx="200" cy="425" r="3" fill="#FFFFFF" />
          <circle cx="250" cy="410" r="2" />
          <circle cx="275" cy="360" r="2" />
          <circle cx="295" cy="300" r="2" />
          <circle cx="305" cy="240" r="2" />
        </g>
      </svg>
    </div>
  );
};
