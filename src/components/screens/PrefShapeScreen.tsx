import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { ShapePreference } from '../../types';
import {
  IconRoundFrame,
  IconSquareFrame,
  IconRectangleFrame,
  IconCatEyeFrame,
  IconWayfarerFrame,
  IconNoPreference
} from '../common/EyewearIcons';

export const PrefShapeScreen: React.FC = () => {
  const { preferences, updatePreferences, goToScreen } = useApp();

  const shapeOptions: { id: ShapePreference; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'Round', label: 'Round', icon: IconRoundFrame },
    { id: 'Square', label: 'Square', icon: IconSquareFrame },
    { id: 'Rectangle', label: 'Rectangle', icon: IconRectangleFrame },
    { id: 'Cat-Eye', label: 'Cat-Eye', icon: IconCatEyeFrame },
    { id: 'Wayfarer', label: 'Wayfarer', icon: IconWayfarerFrame },
    { id: 'No Preference', label: 'No Preference', icon: IconNoPreference },
  ];

  const handleSelect = (shape: ShapePreference) => {
    updatePreferences({ shape });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="CHOOSE A FRAME SHAPE"
        subtitle="Select a shape you like, or choose No Preference."
        step={2}
        showBack={true}
        showProgress={true}
      />

      <div className="flex-1 flex flex-col items-center justify-between px-4 sm:px-8 py-6 max-w-3xl mx-auto w-full">
        
        {/* 6 Shape Selection Cards (3 columns x 2 rows) */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 my-auto mt-4">
          {shapeOptions.map((item) => {
            const Icon = item.icon;
            const isSelected = preferences.shape === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`group flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-200 touch-btn min-h-[140px] sm:min-h-[160px] ${
                  isSelected
                    ? 'bg-showroom-900 border-showroom-cream ring-1 ring-showroom-cream text-showroom-cream shadow-kiosk-selected'
                    : 'bg-showroom-900/80 hover:bg-showroom-850 border-showroom-750/90 hover:border-showroom-700 text-showroom-muted hover:text-white'
                }`}
              >
                <div className="mb-4 flex items-center justify-center h-10 sm:h-12">
                  <Icon className={`w-16 h-8 sm:w-20 sm:h-10 transition-transform duration-200 group-hover:scale-105 ${isSelected ? 'text-showroom-cream' : 'text-showroom-cream/80'}`} />
                </div>
                <span className={`font-display font-medium text-xs sm:text-sm tracking-wide ${isSelected ? 'text-white font-semibold' : 'text-showroom-ivory'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom CTA Bar */}
        <div className="w-full max-w-md mx-auto mt-8 mb-4 flex items-center gap-4">
          <button
            onClick={() => {
              updatePreferences({ shape: 'No Preference' });
              goToScreen('pref-color-size');
            }}
            className="flex-1 py-4 px-6 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-showroom-ivory font-semibold text-xs sm:text-sm tracking-wider uppercase transition-colors touch-btn"
          >
            SKIP
          </button>

          <button
            onClick={() => goToScreen('pref-color-size')}
            id="kiosk-pref-shape-next-btn"
            className="flex-[2] flex items-center justify-center py-4 px-8 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-semibold text-sm sm:text-base tracking-wider uppercase shadow-kiosk-button transition-all touch-btn"
          >
            <span>NEXT</span>
          </button>
        </div>

      </div>
    </div>
  );
};
