import React from 'react';
import { useApp } from '../../context/AppContext';
import { OptiGlassesLogo } from './EyewearIcons';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { ProgressDots } from './ProgressDots';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  step?: number; // 1, 2, 3, 4
  showBack?: boolean;
  showProgress?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  step,
  showBack = false,
  showProgress = false
}) => {
  const { currentScreen, goBack, resetAll, goToScreen } = useApp();

  if (currentScreen === 'home') {
    return (
      <header className="w-full pt-6 pb-4 px-6 sm:px-10 flex items-center justify-between z-30">
        <div 
          onClick={() => goToScreen('home')}
          className="flex items-center gap-3 cursor-pointer group touch-btn"
          role="button"
          tabIndex={0}
        >
          <div className="w-10 h-10 rounded-full bg-showroom-850 border border-showroom-700 flex items-center justify-center text-showroom-cream group-hover:border-showroom-cream transition-colors">
            <OptiGlassesLogo className="w-6 h-6" />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight text-white block leading-none">
              OptiTry
            </span>
            <span className="text-[11px] text-showroom-muted font-medium tracking-wide">
              See Better. Choose Better.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => goToScreen('explore-frames')}
            className="px-4 py-2 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-xs font-semibold text-showroom-ivory transition-colors touch-btn"
          >
            Explore Frames
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full pt-5 pb-3 px-4 sm:px-8 flex flex-col z-30 border-b border-showroom-800/80 bg-showroom-950/90 backdrop-blur-md">
      <div className="flex items-center justify-between w-full">
        {/* Back Button */}
        {showBack ? (
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-xs font-semibold text-showroom-cream transition-all touch-btn"
            id="kiosk-back-btn"
          >
            <ChevronLeft className="w-4 h-4 text-showroom-cream" />
            <span className="uppercase tracking-wider">BACK</span>
          </button>
        ) : (
          <div className="w-20" />
        )}

        {/* Center Progress Dots if enabled */}
        {showProgress && step ? (
          <div className="flex flex-col items-center">
            <ProgressDots currentStep={step} totalSteps={4} />
          </div>
        ) : (
          <div 
            onClick={() => goToScreen('home')}
            className="flex items-center gap-2 cursor-pointer touch-btn"
          >
            <OptiGlassesLogo className="w-5 h-5 text-showroom-cream" />
            <span className="font-display font-bold text-base tracking-tight text-white">
              OptiTry
            </span>
          </div>
        )}

        {/* Reset Action */}
        <button
          onClick={resetAll}
          title="Restart Kiosk Experience"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-[11px] font-semibold text-showroom-muted hover:text-white transition-colors touch-btn"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Start Over</span>
        </button>
      </div>

      {/* Screen Title & Subtitle */}
      {title && (
        <div className="text-center mt-3 mb-1">
          <h1 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight uppercase">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-showroom-muted font-normal mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </header>
  );
};
