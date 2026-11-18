import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { BudgetPreference } from '../../types';
import { Check, ArrowRight } from 'lucide-react';

export const PrefBudgetScreen: React.FC = () => {
  const { preferences, updatePreferences, goToScreen } = useApp();

  const budgetOptions: {
    id: BudgetPreference;
    title: string;
    range: string;
    description: string;
    badge: string;
  }[] = [
      {
        id: '₹1,000 - ₹1,200',
        title: 'Value & Essentials',
        range: '₹1,000 – ₹1,200',
        description: 'Affordable everyday frames with classic designs.',
        badge: 'Budget Friendly',
      },
      {
        id: '₹1,201 - ₹1,500',
        title: 'Everyday Premium',
        range: '₹1,201 – ₹1,500',
        description: 'Versatile frames for everyday wear and personal style.',
        badge: 'Popular Choice',
      },
      {
        id: '₹1,501 - ₹1,800',
        title: 'Premium Collection',
        range: '₹1,501 – ₹1,800',
        description: 'Distinctive designs for a refined look.',
        badge: 'Premium',
      },
      {
        id: '₹1,801 - ₹2,000',
        title: 'Signature Collection',
        range: '₹1,801 – ₹2,000',
        description: 'Explore standout styles within your budget.',
        badge: 'Signature',
      },
      {
        id: 'Any Budget',
        title: 'Explore Everything',
        range: '₹1,000 – ₹2,000',
        description: 'Explore all 40 frames without a budget restriction.',
        badge: 'All Frames',
      },
    ];

  const handleSelect = (budget: BudgetPreference) => {
    updatePreferences({ budget });
  };

  const handleSkip = () => {
    updatePreferences({ budget: 'Any Budget' });
    goToScreen('pref-saved');
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="WHAT IS YOUR BUDGET?"
        subtitle="Choose your preferred price range for personalised frame recommendations."
        step={4}
        showBack={true}
        showProgress={true}
      />

      <div className="flex-1 flex flex-col items-center justify-between px-4 sm:px-8 py-6 max-w-3xl mx-auto w-full">
        <div className="w-full flex items-center justify-between mt-2 mb-4">
          <span className="text-xs uppercase tracking-wider text-showroom-muted font-semibold">
            STEP 4: BUDGET FILTER
          </span>

          <button
            onClick={handleSkip}
            className="text-xs uppercase font-semibold text-showroom-cream hover:underline tracking-wider"
          >
            Skip
          </button>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 my-auto">
          {budgetOptions.map((item) => {
            const isSelected = preferences.budget === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                aria-pressed={isSelected}
                className={`group relative flex flex-col text-left justify-between p-6 rounded-2xl border transition-all duration-200 touch-btn min-h-[150px] ${isSelected
                    ? 'bg-showroom-900 border-showroom-cream ring-1 ring-showroom-cream shadow-kiosk-selected'
                    : 'bg-showroom-900/80 hover:bg-showroom-850 border-showroom-750/90 hover:border-showroom-700'
                  }`}
              >
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${isSelected
                          ? 'bg-showroom-cream text-showroom-950'
                          : 'bg-showroom-800 text-showroom-muted'
                        }`}
                    >
                      {item.badge}
                    </span>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${isSelected
                          ? 'bg-showroom-cream border-showroom-cream text-showroom-950'
                          : 'border-showroom-700 bg-showroom-850 text-transparent'
                        }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>

                  <h3
                    className={`font-display font-bold text-lg mb-1 tracking-tight ${isSelected ? 'text-white' : 'text-showroom-ivory'
                      }`}
                  >
                    {item.range}
                  </h3>

                  <span
                    className={`text-xs font-medium block mb-2 ${isSelected
                        ? 'text-showroom-cream'
                        : 'text-showroom-muted'
                      }`}
                  >
                    {item.title}
                  </span>

                  <p className="text-[11px] text-showroom-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="w-full max-w-md mx-auto mt-8 mb-4 flex items-center gap-4">
          <button
            onClick={handleSkip}
            className="flex-1 py-4 px-6 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-showroom-ivory font-semibold text-xs sm:text-sm tracking-wider uppercase transition-colors touch-btn"
          >
            Skip
          </button>

          <button
            onClick={() => goToScreen('pref-saved')}
            id="kiosk-pref-budget-next-btn"
            className="flex-[2] flex items-center justify-center gap-2 py-4 px-8 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-semibold text-sm sm:text-base tracking-wider uppercase shadow-kiosk-button transition-all touch-btn"
          >
            <span>NEXT</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};