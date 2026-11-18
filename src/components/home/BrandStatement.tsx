import React from 'react';
import { OptiGlassesLogo } from '../common/EyewearIcons';

export const BrandStatement: React.FC = () => {
  return (
    <section className="py-20 border-y border-showroom-850/80 bg-showroom-900/40 relative overflow-hidden">
      {/* Background warm ambient line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Large Editorial Headline */}
          <div className="lg:col-span-8">
            <span className="text-xs uppercase tracking-wider text-showroom-cream font-semibold block mb-4">
              PHILOSOPHY
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
              Eyewear should fit <br className="hidden sm:inline" />
              <span className="text-showroom-cream">more than your face.</span>
            </h2>
            <p className="text-sm sm:text-base text-showroom-muted mt-6 max-w-2xl leading-relaxed">
              True alignment is both personal and precise. OptiTry pairs your facial features with your personal aesthetic to find frames that complement who you are.
            </p>
          </div>

          {/* Editorial Logo Treatment Callout */}
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <div className="p-8 rounded-3xl bg-showroom-900 border border-showroom-750 shadow-2xl flex flex-col items-center text-center max-w-xs w-full">
              <div className="w-16 h-16 rounded-full bg-showroom-850 border border-showroom-700 flex items-center justify-center text-showroom-cream mb-4">
                <OptiGlassesLogo className="w-8 h-8" />
              </div>
              <span className="font-display font-semibold text-lg text-white">Precision & Style</span>
              <p className="text-xs text-showroom-muted mt-2">
                Designed for natural ergonomics and modern eyewear fitting.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
