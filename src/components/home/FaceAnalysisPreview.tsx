import React from 'react';
import { useApp } from '../../context/AppContext';
import { FacialLandmarksCanvas } from '../face/FacialLandmarksCanvas';
import { FaceShapeOvalGraphic } from '../common/EyewearIcons';
import { Check, ArrowRight } from 'lucide-react';

export const FaceAnalysisPreview: React.FC = () => {
  const { goToScreen } = useApp();

  return (
    <section className="py-20 border-y border-showroom-850/80 bg-showroom-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider text-showroom-cream font-semibold block mb-3">
            VIRTUAL TRY-ON
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
            See Frames On Your Face
          </h2>
          <p className="text-sm text-showroom-muted mt-3">
            Using browser-based facial landmark detection, OptiTry aligns frames naturally over your eyes so you can find the perfect look before you decide.
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          
          {/* Left: Model with Landmark Mesh Overlay */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-3xl overflow-hidden bg-showroom-950 border border-showroom-750 shadow-2xl">
              <img
                src="/images/face-model.jpg"
                alt="OptiTry Landmark Preview"
                className="w-full h-full object-cover filter contrast-105"
              />
              {/* Landmark Mesh Overlay */}
              <FacialLandmarksCanvas isMeshVisible={true} />

              {/* Corner framing brackets */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-showroom-cream/80 pointer-events-none" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-showroom-cream/80 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-showroom-cream/80 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-showroom-cream/80 pointer-events-none" />

              {/* Live Tracking Pill */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-showroom-950/85 backdrop-blur-md border border-showroom-700 text-[10px] font-medium text-showroom-cream flex items-center gap-1.5 shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>LANDMARKS ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Right: Consumer-Facing Try-On Feature Card */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            
            {/* Status Checklist Box */}
            <div className="p-6 rounded-3xl bg-showroom-900 border border-showroom-750 shadow-2xl">
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-showroom-850">
                  <span className="text-xs uppercase text-showroom-muted font-semibold tracking-wide">EYE ALIGNMENT</span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>AUTOMATIC</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-showroom-850">
                  <span className="text-xs uppercase text-showroom-muted font-semibold tracking-wide">SCALE & ROTATION</span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>CALIBRATED</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs uppercase text-showroom-muted font-semibold tracking-wide">INSTANT SWITCHING</span>
                  <div className="flex items-center gap-1.5 text-xs text-showroom-cream font-semibold">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>40 STYLES</span>
                  </div>
                </div>
              </div>

              {/* Try On Showcase Result */}
              <div className="p-5 rounded-2xl bg-showroom-950/80 border border-showroom-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-showroom-muted font-semibold tracking-wider block mb-1">
                    VIRTUAL TRY-ON
                  </span>
                  <span className="font-display font-extrabold text-xl sm:text-2xl text-white">
                    ONE PHOTO. 40 LOOKS.
                  </span>
                  <p className="text-[11px] text-showroom-muted mt-1">
                    Switch between frames freely without taking multiple photos.
                  </p>
                </div>
                <div className="w-12 h-16 flex items-center justify-center">
                  <FaceShapeOvalGraphic className="w-full h-full text-showroom-cream" />
                </div>
              </div>
            </div>

            {/* Launch Try On Button */}
            <button
              onClick={() => goToScreen('try-on')}
              id="face-analysis-preview-try-on-btn"
              className="w-full flex items-center justify-center gap-3 py-4 px-8 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-semibold text-xs sm:text-sm tracking-wider uppercase shadow-kiosk-button transition-all touch-btn"
            >
              <span>TRY ON FRAMES</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

          </div>

        </div>

      </div>
    </section>
  );
};
