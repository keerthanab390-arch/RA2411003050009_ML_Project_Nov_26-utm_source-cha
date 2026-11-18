import React from 'react';
import { useApp } from '../../context/AppContext';
import { ScanFace, SlidersHorizontal, Sparkles, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const { goToScreen } = useApp();

  const steps = [
    {
      num: '01',
      title: 'TRY ON',
      description: 'Capture a photo and instantly preview how different frames look on your face.',
      icon: ScanFace,
      action: () => goToScreen('try-on'),
      cta: 'Try On Frames'
    },
    {
      num: '02',
      title: 'FIND YOUR FIT',
      description: 'Select your preferred styles, shapes, and colors for personalized recommendations.',
      icon: SlidersHorizontal,
      action: () => goToScreen('pref-style'),
      cta: 'Find My Frames'
    },
    {
      num: '03',
      title: 'EXPLORE & SAVE',
      description: 'Browse the complete collection of 40 frames and save your favourite designs.',
      icon: Sparkles,
      action: () => goToScreen('explore-frames'),
      cta: 'Explore Catalog'
    }
  ];

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-wider text-showroom-cream font-semibold block mb-3">
          PROCESS
        </span>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
          How OptiTry Works
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              onClick={step.action}
              className="group relative p-8 rounded-3xl bg-showroom-900/80 hover:bg-showroom-850 border border-showroom-750 hover:border-showroom-cream/50 transition-all duration-300 touch-btn cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-showroom-850 border border-showroom-700 flex items-center justify-center text-showroom-cream group-hover:border-showroom-cream transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-display font-bold text-2xl text-showroom-subtle group-hover:text-showroom-cream transition-colors">
                    {step.num}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl text-white mb-2 tracking-tight">
                  {step.num} — {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-showroom-muted leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-showroom-800 flex items-center gap-2 text-xs font-semibold text-showroom-cream group-hover:translate-x-1 transition-transform">
                <span>{step.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
