import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OptiGlassesLogo } from '../common/EyewearIcons';
import { ArrowRight, Menu, X, ShoppingBag } from 'lucide-react';
import { KioskScreen } from '../../types';

export const Navbar: React.FC = () => {
  const { currentScreen, goToScreen, cartCount, setIsCartOpen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  const navLinks: { label: string; screen: KioskScreen }[] = [
    { label: 'Home', screen: 'home' },
    { label: 'Store', screen: 'store' },
    { label: 'Try On', screen: 'try-on' },
    { label: 'Find My Frames', screen: 'pref-style' },
    { label: 'Favourites', screen: 'favourites' },
  ];

  const handleNavClick = (screen: KioskScreen) => {
    goToScreen(screen);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-showroom-950/85 backdrop-blur-xl border-b border-showroom-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <div
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 cursor-pointer group touch-btn"
              role="button"
              tabIndex={0}
            >
              <div className="w-10 h-10 rounded-full bg-showroom-900 border border-showroom-700/80 flex items-center justify-center text-showroom-cream group-hover:border-showroom-cream transition-colors duration-300">
                <OptiGlassesLogo className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-showroom-cream transition-colors">
                  OptiTry
                </span>
                <span className="text-[10px] text-showroom-muted font-medium tracking-wide">
                  See Better. Choose Better.
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = currentScreen === link.screen || 
                  (link.screen === 'store' && currentScreen === 'explore-frames') ||
                  (link.screen === 'try-on' && currentScreen === 'face-analysis') ||
                  (link.screen === 'pref-style' && (currentScreen === 'find-frames' || currentScreen === 'pref-shape' || currentScreen === 'pref-color-size' || currentScreen === 'pref-budget' || currentScreen === 'pref-saved' || currentScreen === 'summary'));
                return (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.screen)}
                    className={`text-sm font-medium transition-colors touch-btn ${isActive
                        ? 'text-showroom-cream font-bold'
                        : 'text-showroom-muted hover:text-white'
                      }`}
                  >
                    {link.label}
                  </button>
                );
              })}

              <button
                onClick={() => setAboutModalOpen(true)}
                className="text-sm font-medium text-showroom-muted hover:text-white transition-colors touch-btn"
              >
                About
              </button>
            </nav>

            {/* Right Action Buttons: Shopping Cart & TRY ON FRAMES */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => setIsCartOpen(true)}
                id="navbar-cart-btn"
                className="relative p-2.5 rounded-full bg-showroom-900 hover:bg-showroom-850 border border-showroom-750 text-showroom-ivory hover:text-showroom-cream transition-colors touch-btn"
                aria-label={`Shopping bag with ${cartCount} items`}
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-showroom-cream text-showroom-950 font-extrabold text-[10px] flex items-center justify-center shadow-md animate-in zoom-in-75">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => goToScreen('try-on')}
                id="navbar-try-on-btn"
                className="flex items-center gap-2 py-2.5 px-6 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-semibold text-xs tracking-wider uppercase shadow-kiosk-button transition-all touch-btn"
              >
                <span>TRY ON FRAMES</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Mobile Hamburger & Cart Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl bg-showroom-900 border border-showroom-700 text-showroom-ivory"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-showroom-cream text-showroom-950 font-extrabold text-[9px] flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl bg-showroom-900 border border-showroom-700 text-showroom-muted hover:text-white"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-showroom-800 bg-showroom-950/95 backdrop-blur-2xl px-6 py-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.screen)}
                className="text-left text-base font-medium py-2 text-showroom-ivory hover:text-showroom-cream"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                setAboutModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="text-left text-base font-medium py-2 text-showroom-muted hover:text-white"
            >
              About
            </button>

            <button
              onClick={() => handleNavClick('try-on')}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-full bg-showroom-cream text-showroom-950 font-semibold text-xs uppercase tracking-wider"
            >
              <span>TRY ON FRAMES</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* About Modal */}
      {aboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-showroom-900 border border-showroom-700 p-7 shadow-2xl">
            <button
              onClick={() => setAboutModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-showroom-850 text-showroom-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-showroom-850 border border-showroom-700 flex items-center justify-center text-showroom-cream">
                <OptiGlassesLogo className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-white">OptiTry</h3>
                <p className="text-xs text-showroom-cream font-medium">Personalized Eyewear Selection</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-showroom-muted leading-relaxed">
              <p>
                OptiTry helps you discover frames tailored to your facial proportions and individual style.
              </p>
              <p>
                We combine careful facial measurement with curated eyewear designs to recommend frames that look great, fit comfortably, and feel like you.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-showroom-800 flex justify-end">
              <button
                onClick={() => setAboutModalOpen(false)}
                className="px-6 py-2.5 rounded-full bg-showroom-cream text-showroom-950 font-semibold text-xs uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
