import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { ColorPreference, SizePreference } from '../../types';
import { IconNoPreference } from '../common/EyewearIcons';

export const PrefColorSizeScreen: React.FC = () => {
  const { preferences, updatePreferences, goToScreen } = useApp();

  const colorOptions: { id: ColorPreference; label: string; bgClass: string; borderClass: string }[] = [
    { id: 'Black', label: 'Black', bgClass: 'bg-[#181920]', borderClass: 'border-[#3D3E4E]' },
    { id: 'Brown', label: 'Brown', bgClass: 'bg-[#5C3D2E]', borderClass: 'border-[#7C533E]' },
    { id: 'Gold', label: 'Gold', bgClass: 'bg-[#C5A880]', borderClass: 'border-[#DFC6A0]' },
    { id: 'Silver', label: 'Silver', bgClass: 'bg-[#9E9FA8]', borderClass: 'border-[#C2C3CE]' },
    { id: 'Transparent', label: 'Transparent', bgClass: 'bg-white/10 backdrop-blur-md', borderClass: 'border-white/30' },
    { id: 'No Preference', label: 'No Preference', bgClass: 'bg-transparent', borderClass: 'border-showroom-700' },
  ];

  const sizeOptions: { id: SizePreference; label: string; scale: string }[] = [
    { id: 'Small', label: 'Small', scale: 'scale-90' },
    { id: 'Medium', label: 'Medium', scale: 'scale-100' },
    { id: 'Large', label: 'Large', scale: 'scale-110' },
    { id: 'No Preference', label: 'No Preference', scale: 'scale-100' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="COLOR & SIZE"
        subtitle="Choose your preferred colors and frame size."
        step={3}
        showBack={true}
        showProgress={true}
      />

      <div className="flex-1 flex flex-col items-center justify-between px-4 sm:px-8 py-6 max-w-2xl mx-auto w-full">
        
        <div className="w-full space-y-6 my-auto">
          
          {/* 1. Color Swatches Selection */}
          <div>
            <span className="text-xs uppercase tracking-wider text-showroom-muted font-semibold block mb-3 text-left">
              CHOOSE A COLOR
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-3.5">
              {colorOptions.map((item) => {
                const isSelected = preferences.color === item.id;
                const isNoPref = item.id === 'No Preference';

                return (
                  <button
                    key={item.id}
                    onClick={() => updatePreferences({ color: item.id })}
                    className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all touch-btn ${
                      isSelected
                        ? 'bg-showroom-900 border-showroom-cream ring-1 ring-showroom-cream shadow-kiosk-selected'
                        : 'bg-showroom-900/80 hover:bg-showroom-850 border-showroom-750/90'
                    }`}
                  >
                    {/* Circle Color Swatch */}
                    <div className="mb-2 w-8 h-8 rounded-full flex items-center justify-center">
                      {isNoPref ? (
                        <IconNoPreference className="w-6 h-6 text-showroom-muted" />
                      ) : (
                        <div className={`w-7 h-7 rounded-full ${item.bgClass} border ${item.borderClass} shadow-inner`} />
                      )}
                    </div>
                    <span className={`text-[11px] sm:text-xs font-medium ${isSelected ? 'text-white font-semibold' : 'text-showroom-muted'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Frame Size Selection */}
          <div>
            <span className="text-xs uppercase tracking-wider text-showroom-muted font-semibold block mb-3 text-left">
              CHOOSE YOUR SIZE
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
              {sizeOptions.map((item) => {
                const isSelected = preferences.size === item.id;
                const isNoPref = item.id === 'No Preference';

                return (
                  <button
                    key={item.id}
                    onClick={() => updatePreferences({ size: item.id })}
                    className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl border transition-all touch-btn ${
                      isSelected
                        ? 'bg-showroom-900 border-showroom-cream ring-1 ring-showroom-cream shadow-kiosk-selected'
                        : 'bg-showroom-900/80 hover:bg-showroom-850 border-showroom-750/90'
                    }`}
                  >
                    <div className="mb-2 h-7 flex items-center justify-center">
                      {isNoPref ? (
                        <IconNoPreference className="w-5 h-5 text-showroom-muted" />
                      ) : (
                        <div className={`w-10 h-5 rounded border border-current ${item.scale} ${isSelected ? 'text-showroom-cream' : 'text-showroom-muted'}`} />
                      )}
                    </div>
                    <span className={`text-[11px] sm:text-xs font-medium ${isSelected ? 'text-white font-semibold' : 'text-showroom-muted'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom CTA Bar */}
        <div className="w-full max-w-md mx-auto mt-8 mb-4 flex items-center gap-4">
          <button
            onClick={() => {
              updatePreferences({ color: 'No Preference', size: 'No Preference' });
              goToScreen('pref-budget');
            }}
            className="flex-1 py-4 px-6 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-showroom-ivory font-semibold text-xs sm:text-sm tracking-wider uppercase transition-colors touch-btn"
          >
            SKIP
          </button>

          <button
            onClick={() => goToScreen('pref-budget')}
            id="kiosk-pref-color-next-btn"
            className="flex-[2] flex items-center justify-center py-4 px-8 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-semibold text-sm sm:text-base tracking-wider uppercase shadow-kiosk-button transition-all touch-btn"
          >
            <span>NEXT</span>
          </button>
        </div>

      </div>
    </div>
  );
};
