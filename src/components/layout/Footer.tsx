import React from 'react';
import { OptiGlassesLogo } from '../common/EyewearIcons';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { goToScreen } = useApp();

  return (
    <footer className="w-full bg-showroom-950 border-t border-showroom-850/80 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2.5 mb-1.5">
              <OptiGlassesLogo className="w-5 h-5 text-showroom-cream" />
              <span className="font-display font-bold text-lg text-white tracking-tight">
                OptiTry
              </span>
            </div>
            <p className="text-xs text-showroom-muted font-normal">
              See Better. Choose Better. — Personalized Eyewear Selection
            </p>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-showroom-muted">
            <button
              onClick={() => goToScreen('home')}
              className="hover:text-showroom-cream transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => goToScreen('try-on')}
              className="hover:text-showroom-cream transition-colors"
            >
              Try On
            </button>
            <button
              onClick={() => goToScreen('pref-style')}
              className="hover:text-showroom-cream transition-colors"
            >
              Find My Frames
            </button>
            <button
              onClick={() => goToScreen('explore-frames')}
              className="hover:text-showroom-cream transition-colors"
            >
              Explore Frames
            </button>
          </div>

          {/* Copyright */}
          <div className="text-xs text-showroom-subtle text-center md:text-right">
            © {new Date().getFullYear()} OptiTry Technologies. All rights reserved.
          </div>

        </div>
      </div>
    </footer>
  );
};
