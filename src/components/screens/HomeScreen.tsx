import React from 'react';
import { Navbar } from '../layout/Navbar';
import { HeroSection } from '../home/HeroSection';
import { BrandStatement } from '../home/BrandStatement';
import { HowItWorks } from '../home/HowItWorks';
import { FaceAnalysisPreview } from '../home/FaceAnalysisPreview';
import { StylePreview } from '../home/StylePreview';
import { FinalCTA } from '../home/FinalCTA';
import { Footer } from '../layout/Footer';
import { useApp } from '../../context/AppContext';
import { ArrowRight } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const { goToScreen } = useApp();

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 flex flex-col">
        <HeroSection />

        {/* Explore All Frames */}
        <section className="px-4 py-8 bg-showroom-950">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 rounded-3xl border border-showroom-750 bg-showroom-900/60 p-6 sm:p-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-showroom-cream font-semibold mb-2">
                THE COMPLETE COLLECTION
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Explore All 40 Frames
              </h2>

              <p className="text-sm text-showroom-muted mt-2">
                Browse every style, compare prices, and choose your favourite.
                No preferences required.
              </p>
            </div>

            <button
              onClick={() => goToScreen('explore-frames')}
              className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-semibold text-sm tracking-wide transition-all whitespace-nowrap"
            >
              EXPLORE ALL FRAMES
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        <BrandStatement />
        <HowItWorks />
        <FaceAnalysisPreview />
        <StylePreview />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
};