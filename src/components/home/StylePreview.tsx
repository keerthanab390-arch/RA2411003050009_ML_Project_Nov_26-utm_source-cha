import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  IconStyleClassic,
  IconStyleModern,
  IconStyleTrendy,
  IconStyleProfessional,
  IconStyleCasual
} from '../common/EyewearIcons';
import { ArrowRight } from 'lucide-react';
import { StylePreference } from '../../types';

export const StylePreview: React.FC = () => {
  const { preferences, updatePreferences, goToScreen } = useApp();

  const styles: { id: StylePreference; label: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'Classic', label: 'Classic', desc: 'Timeless shapes & balanced proportions', icon: IconStyleClassic },
    { id: 'Modern', label: 'Modern', desc: 'Clean lines & understated minimalism', icon: IconStyleModern },
    { id: 'Trendy', label: 'Trendy', desc: 'Bold statements & expressive designs', icon: IconStyleTrendy },
    { id: 'Professional', label: 'Professional', desc: 'Refined silhouettes & everyday durability', icon: IconStyleProfessional },
    { id: 'Casual', label: 'Casual', desc: 'Effortless comfort & easy wear', icon: IconStyleCasual },
  ];

  const handleSelect = (style: StylePreference) => {
    updatePreferences({ style });
    goToScreen('pref-shape');
  };

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs uppercase tracking-wider text-showroom-cream font-semibold block mb-3">
          YOUR STYLE
        </span>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
          Your style matters.
        </h2>
        <p className="text-sm text-showroom-muted mt-3">
          Choose the aesthetic that best describes your look.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {styles.map((style) => {
          const Icon = style.icon;
          const isSelected = preferences.style === style.id;

          return (
            <button
              key={style.id}
              onClick={() => handleSelect(style.id)}
              className={`p-6 rounded-3xl border transition-all duration-300 touch-btn text-left flex flex-col justify-between min-h-[160px] ${
                isSelected
                  ? 'bg-showroom-900 border-showroom-cream shadow-kiosk-selected'
                  : 'bg-showroom-900/80 hover:bg-showroom-850 border-showroom-750 hover:border-showroom-cream/40'
              }`}
            >
              <div>
                <div className="h-8 flex items-center justify-start mb-4">
                  <Icon className={`w-12 h-6 transition-colors ${isSelected ? 'text-showroom-cream' : 'text-showroom-muted'}`} />
                </div>
                <h3 className={`font-display font-semibold text-base mb-1 ${isSelected ? 'text-showroom-cream' : 'text-white'}`}>
                  {style.label}
                </h3>
                <p className="text-xs text-showroom-muted leading-relaxed">
                  {style.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-showroom-800/80 flex items-center gap-1 text-[11px] font-semibold text-showroom-cream">
                <span>Select & Continue</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
