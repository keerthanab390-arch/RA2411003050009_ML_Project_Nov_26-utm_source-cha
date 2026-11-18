import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { goToScreen } = useApp();

  return (
    <section className="relative overflow-hidden pt-6 pb-16 sm:pt-12 sm:pb-24">
      {/* Soft warm spotlight background effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-showroom-cream/5 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Editorial Copy */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">

            {/* Small Brand Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-showroom-900 border border-showroom-700/80 text-xs font-medium text-showroom-cream mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-showroom-cream" />
              <span>Personalized Eyewear Selection</span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] mb-6">
              Find the frame that{' '}
              <span className="text-showroom-cream">feels like you.</span>
            </h1>

            {/* Supporting Subtext */}
            <p className="text-base sm:text-lg text-showroom-muted max-w-xl font-normal leading-relaxed mb-8 sm:mb-10">
              Tell us what you like. We'll help you find frames that suit your face, style and fit.
            </p>

            {/* CTAs */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4">

              {/* Primary Try On CTA */}
              <button
                onClick={() => goToScreen('try-on')}
                id="hero-try-on-btn"
                className="flex items-center justify-center gap-3 py-4 px-8 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-semibold text-sm sm:text-base tracking-wider uppercase shadow-kiosk-button transition-all touch-btn"
              >
                <span>TRY ON FRAMES</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Find My Frames CTA */}
              <button
                onClick={() => goToScreen('pref-style')}
                id="hero-find-my-frames-btn"
                className="flex items-center justify-center py-4 px-8 rounded-full bg-showroom-900 hover:bg-showroom-850 border border-showroom-700 text-showroom-ivory font-semibold text-xs sm:text-sm tracking-wider uppercase transition-colors touch-btn"
              >
                <span>FIND MY FRAMES</span>
              </button>

            </div>

            {/* Minimal Stat Points */}
            <div className="grid grid-cols-3 gap-6 pt-10 mt-10 border-t border-showroom-800/80 w-full max-w-lg">
              <div>
                <span className="font-display font-bold text-xl sm:text-2xl text-white block">Virtual Try-On</span>
                <span className="text-xs text-showroom-muted">Real-time Fit</span>
              </div>
              <div className="border-x border-showroom-800/80 px-4">
                <span className="font-display font-bold text-xl sm:text-2xl text-showroom-cream block">Smart Match</span>
                <span className="text-xs text-showroom-muted">Personalized</span>
              </div>
              <div>
                <span className="font-display font-bold text-xl sm:text-2xl text-white block">40 Frames</span>
                <span className="text-xs text-showroom-muted">Curated Choice</span>
              </div>
            </div>

          </div>

          {/* Right Layered Editorial Composition */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">

              {/* Main Model Portrait Frame */}
              <div className="relative rounded-3xl overflow-hidden bg-showroom-900 border border-showroom-750 shadow-2xl">
                <img
                  src="/images/editorial-model.jpg"
                  alt="OptiTry Eyewear Campaign"
                  className="w-full h-[420px] sm:h-[480px] object-cover object-top filter contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-showroom-950/80 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Luxury Glass Product Card (Layered Overlay) */}
              <div className="absolute -bottom-6 -left-4 sm:-left-8 sm:-bottom-8 p-3 rounded-2xl bg-showroom-900/95 backdrop-blur-xl border border-showroom-700 shadow-2xl max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="rounded-xl overflow-hidden bg-showroom-950 border border-showroom-800 p-2 mb-2">
                  <img
                    src="/images/frame23.jpg"
                    alt="Aero Titanium Eyewear"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-between px-1">
                  <div>
                    <span className="text-[10px] uppercase font-medium text-showroom-muted block">Featured Frame</span>
                    <span className="font-display font-semibold text-sm text-white">Monolith Acetate</span>
                  </div>
                  <span className="text-xs font-semibold text-showroom-cream px-2 py-0.5 rounded bg-showroom-850 border border-showroom-700">
                    Square
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
