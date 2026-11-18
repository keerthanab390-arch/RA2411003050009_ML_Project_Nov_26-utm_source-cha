import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  const { goToScreen } = useApp();

  return (
    <section className="py-24 border-t border-showroom-850/80 bg-showroom-900/50 relative overflow-hidden">
      {/* Background warm glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-showroom-cream/5 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        <div className="w-12 h-12 rounded-full bg-showroom-850 border border-showroom-700/80 flex items-center justify-center text-showroom-cream mb-6 shadow-xl">
          <Sparkles className="w-6 h-6" />
        </div>

        <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight mb-4">
          Ready to find your <span className="text-showroom-cream">perfect frame?</span>
        </h2>

        <p className="text-sm sm:text-base text-showroom-muted max-w-lg mb-10 leading-relaxed">
          Try on frames in real-time, share your style preferences, and discover the pair that feels like you.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => goToScreen('try-on')}
            id="final-cta-try-on-btn"
            className="flex items-center justify-center gap-3 py-4 px-10 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-semibold text-sm sm:text-base tracking-wider uppercase shadow-kiosk-button transition-all touch-btn"
          >
            <span>TRY ON FRAMES</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            onClick={() => goToScreen('pref-style')}
            id="final-cta-find-frames-btn"
            className="flex items-center justify-center py-4 px-10 rounded-full bg-showroom-900 hover:bg-showroom-850 border border-showroom-700 text-showroom-ivory font-semibold text-sm sm:text-base tracking-wider uppercase transition-colors touch-btn"
          >
            <span>FIND MY FRAMES</span>
          </button>
        </div>

      </div>
    </section>
  );
};
