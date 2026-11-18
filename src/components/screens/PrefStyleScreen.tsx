import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { StylePreference } from '../../types';
import {
  IconStyleClassic,
  IconStyleModern,
  IconStyleTrendy,
  IconStyleProfessional,
  IconStyleCasual
} from '../common/EyewearIcons';

export const PrefStyleScreen: React.FC = () => {
  const { preferences, updatePreferences, goToScreen } = useApp();

  const styleOptions: {
    id: StylePreference;
    label: string;
    desc: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'Classic', label: 'Classic', desc: 'Timeless & refined', icon: IconStyleClassic },
    { id: 'Modern', label: 'Modern', desc: 'Clean & minimal', icon: IconStyleModern },
    { id: 'Trendy', label: 'Trendy', desc: 'Bold & current', icon: IconStyleTrendy },
    { id: 'Professional', label: 'Professional', desc: 'Polished & composed', icon: IconStyleProfessional },
    { id: 'Casual', label: 'Casual', desc: 'Easy & relaxed', icon: IconStyleCasual },
  ];

  const handleSelect = (style: StylePreference) => {
    updatePreferences({ style });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="WHAT'S YOUR STYLE?"
        subtitle="Choose the look that feels most like you."
        step={1}
        showBack={true}
        showProgress={true}
      />

      <div className="flex-1 flex flex-col items-center justify-between px-4 sm:px-6 md:px-8 py-6 max-w-5xl mx-auto w-full">
        
        {/* Section Label */}
        <div className="w-full mt-2 mb-4 text-left">
          <span className="text-xs uppercase tracking-wider text-showroom-muted font-semibold block">
            STYLE PREFERENCE
          </span>
        </div>

        {/* Selection Cards (Horizontal row on desktop, wrapping on smaller screens) */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 my-auto">
          {styleOptions.map((item) => {
            const Icon = item.icon;
            const isSelected = preferences.style === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`group flex flex-col items-center text-center justify-between p-6 rounded-2xl border transition-all duration-200 touch-btn min-h-[190px] sm:min-h-[220px] ${
                  isSelected
                    ? 'bg-showroom-900 border-showroom-cream ring-1 ring-showroom-cream text-showroom-cream shadow-kiosk-selected'
                    : 'bg-showroom-900/80 hover:bg-showroom-850 border-showroom-750/90 hover:border-showroom-700 text-showroom-muted hover:text-white'
                }`}
              >
                {/* Larger glasses visual */}
                <div className="w-full h-16 sm:h-20 flex items-center justify-center mb-3">
                  <Icon className={`w-20 h-10 sm:w-24 sm:h-12 transition-transform duration-200 group-hover:scale-105 ${isSelected ? 'text-showroom-cream' : 'text-showroom-cream/80'}`} />
                </div>

                {/* Style Name */}
                <div className="w-full flex flex-col items-center">
                  <h3 className={`font-display font-semibold text-sm sm:text-base tracking-wide uppercase mb-1 ${isSelected ? 'text-white font-bold' : 'text-showroom-ivory'}`}>
                    {item.label}
                  </h3>
                  {/* Supporting Description */}
                  <p className={`text-xs leading-snug transition-colors ${isSelected ? 'text-showroom-cream/90 font-medium' : 'text-showroom-muted'}`}>
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom CTA Bar */}
        <div className="w-full max-w-md mx-auto mt-8 mb-4 flex items-center gap-4">
          <button
            onClick={() => goToScreen('pref-shape')}
            className="flex-1 py-4 px-6 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-showroom-ivory font-semibold text-xs sm:text-sm tracking-wider uppercase transition-colors touch-btn"
          >
            SKIP
          </button>

          <button
            onClick={() => goToScreen('pref-shape')}
            id="kiosk-pref-style-next-btn"
            className="flex-[2] flex items-center justify-center py-4 px-8 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-semibold text-sm sm:text-base tracking-wider uppercase shadow-kiosk-button transition-all touch-btn"
          >
            <span>NEXT</span>
          </button>
        </div>

      </div>
    </div>
  );
};
