import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Navbar } from '../layout/Navbar';
import { Footer } from '../layout/Footer';
import { FrameCard } from '../frames/FrameCard';
import { FrameItem } from '../../types';
import { FRAMES_CATALOGUE } from '../../data/framesData';
import { getRecommendedFrames } from '../../utils/frameRecommender';
import { Sparkles, Heart } from 'lucide-react';

export const ExploreFramesScreen: React.FC = () => {
  const {
    goToScreen,
    currentScreen,
    preferences,
    selectedFrameId,
    setSelectedFrameId,
    favourites,
    toggleFavourite,
    isFavourite,
    addToCart
  } = useApp();

  const isFavouritesMode = currentScreen === 'favourites';
  const [selectedFilter, setSelectedFilter] = useState<string>(isFavouritesMode ? 'Favourites' : 'All');

  // Sync filter when navigating to favourites
  useEffect(() => {
    if (isFavouritesMode) {
      setSelectedFilter('Favourites');
    }
  }, [isFavouritesMode]);

  const filterCategories = ['All', 'Classic', 'Modern', 'Trendy', 'Professional', 'Casual', 'Favourites'];

  const hasPreferences = Boolean(
    preferences.style ||
    (preferences.shape && preferences.shape !== 'No Preference') ||
    (preferences.color && preferences.color !== 'No Preference') ||
    (preferences.size && preferences.size !== 'No Preference')
  );

  // Compute recommendation scores and sorted ordering based on user-selected preferences
  const rankedFrames = useMemo(() => {
    return getRecommendedFrames({
      frames: FRAMES_CATALOGUE,
      stylePreference: preferences.style,
      shapePreference: preferences.shape,
      colorPreference: preferences.color,
      sizePreference: preferences.size
    });
  }, [preferences.style, preferences.shape, preferences.color, preferences.size]);

  // Set default selected frame to highest scoring frame if none set
  useEffect(() => {
    if (!selectedFrameId && rankedFrames.length > 0) {
      setSelectedFrameId(rankedFrames[0].id);
    }
  }, [rankedFrames, selectedFrameId, setSelectedFrameId]);

  // Filtered frames preserve recommendation sorting order
  const filteredFrames = useMemo(() => {
    if (selectedFilter === 'Favourites') {
      return rankedFrames.filter(f => favourites.includes(f.id));
    }
    if (selectedFilter === 'All') {
      return rankedFrames;
    }
    return rankedFrames.filter(f => f.style.toLowerCase() === selectedFilter.toLowerCase());
  }, [rankedFrames, selectedFilter, favourites]);

  // Top recommended frames for showcase
  const recommendedShowcaseFrames = useMemo(() => {
    return rankedFrames.filter(f => f.isRecommended);
  }, [rankedFrames]);

  const otherFrames = useMemo(() => {
    return rankedFrames.filter(f => !f.isRecommended);
  }, [rankedFrames]);

  const handleFrameSelect = (frame: FrameItem) => {
    setSelectedFrameId(frame.id);
  };

  const handleTryOnFrame = (frame: FrameItem) => {
    setSelectedFrameId(frame.id);
    goToScreen('try-on');
  };

  // Dynamic header text
  const getHeaderTitle = () => {
    if (selectedFilter === 'Favourites') {
      return 'SAVED FAVOURITES';
    }
    if (hasPreferences) {
      return `${preferences.style} Collection`;
    }
    return 'EXPLORE ALL FRAMES';
  };

  const getHeaderBadge = () => {
    if (selectedFilter === 'Favourites') {
      return 'YOUR COLLECTION';
    }
    if (hasPreferences) {
      return 'TAILORED RECOMMENDATIONS';
    }
    return 'CURATED COLLECTION';
  };

  const getHeaderSubtitle = () => {
    if (selectedFilter === 'Favourites') {
      return `Frames you have saved to your favourites (${filteredFrames.length} saved).`;
    }
    if (hasPreferences) {
      return `Selected based on your ${preferences.style} style and aesthetic preferences.`;
    }
    return 'Explore our curated collection of 40 handcrafted frames.';
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-showroom-950 text-showroom-ivory">
      <Navbar />

      <main className="flex-1 px-4 sm:px-8 py-10 max-w-7xl mx-auto w-full">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-showroom-850">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider text-showroom-cream font-semibold block">
                {getHeaderBadge()}
              </span>
              {hasPreferences && selectedFilter !== 'Favourites' && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-showroom-cream/15 text-showroom-cream border border-showroom-cream/30">
                  <Sparkles className="w-3 h-3" />
                  <span>PREFERENCE MATCH</span>
                </span>
              )}
            </div>
            
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              {getHeaderTitle()}
            </h1>
            
            <p className="text-sm sm:text-base text-showroom-muted mt-2">
              {getHeaderSubtitle()}
            </p>
          </div>

          {/* Category Filter Controls */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {filterCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-all duration-300 touch-btn ${
                  selectedFilter === cat
                    ? 'bg-showroom-cream text-showroom-950 shadow-kiosk-button'
                    : 'bg-showroom-900 hover:bg-showroom-850 border border-showroom-750 text-showroom-muted hover:text-white'
                }`}
              >
                {cat === 'Favourites' ? `Favourites (${favourites.length})` : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state for Favourites */}
        {selectedFilter === 'Favourites' && filteredFrames.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl bg-showroom-900/60 border border-showroom-800 mb-14">
            <Heart className="w-12 h-12 text-showroom-muted mx-auto mb-4 stroke-[1.5]" />
            <h3 className="font-display font-bold text-xl text-white mb-2">No favourites saved yet</h3>
            <p className="text-sm text-showroom-muted max-w-md mx-auto mb-6">
              Browse frames and click the heart icon to save frames to your favourites.
            </p>
            <button
              onClick={() => setSelectedFilter('All')}
              className="py-3 px-6 rounded-full bg-showroom-cream text-showroom-950 font-semibold text-xs uppercase tracking-wider shadow-sm"
            >
              Browse All Frames
            </button>
          </div>
        ) : selectedFilter === 'All' && hasPreferences ? (
          /* When viewing All with active recommendations: recommended showcase then full catalog */
          <div className="space-y-12 mb-14">
            
            {/* Section 1: Top Recommended Frames */}
            {recommendedShowcaseFrames.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-showroom-cream" />
                    <span className="text-xs uppercase font-bold tracking-wider text-showroom-cream">
                      TOP MATCHES FOR YOU
                    </span>
                  </div>
                  <span className="text-xs text-showroom-muted">
                    {recommendedShowcaseFrames.length} matches ranked by preference
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedShowcaseFrames.map((frame) => (
                    <FrameCard
                      key={frame.id}
                      frame={frame}
                      isSelected={selectedFrameId === frame.id}
                      onSelect={handleFrameSelect}
                      onTryOn={handleTryOnFrame}
                      onAddToCart={(f) => addToCart(f)}
                      onToggleFavourite={toggleFavourite}
                      isFavourite={isFavourite(frame.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Full Catalog */}
            <div>
              <div className="flex items-center justify-between mb-5 pt-8 border-t border-showroom-850">
                <span className="text-xs uppercase font-bold tracking-wider text-showroom-muted">
                  ALL FRAMES
                </span>
                <span className="text-xs text-showroom-muted">
                  40 styles
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherFrames.map((frame) => (
                  <FrameCard
                    key={frame.id}
                    frame={frame}
                    isSelected={selectedFrameId === frame.id}
                    onSelect={handleFrameSelect}
                    onTryOn={handleTryOnFrame}
                    onAddToCart={(f) => addToCart(f)}
                    onToggleFavourite={toggleFavourite}
                    isFavourite={isFavourite(frame.id)}
                  />
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* Filtered Category Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
            {filteredFrames.map((frame) => (
              <FrameCard
                key={frame.id}
                frame={frame}
                isSelected={selectedFrameId === frame.id}
                onSelect={handleFrameSelect}
                onTryOn={handleTryOnFrame}
                onAddToCart={(f) => addToCart(f)}
                onToggleFavourite={toggleFavourite}
                isFavourite={isFavourite(frame.id)}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA Banner */}
        <div className="rounded-3xl bg-showroom-900 border border-showroom-750 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight">
              Virtual Eyewear Try-On
            </h3>
            <p className="text-xs sm:text-sm text-showroom-muted mt-1">
              Capture a photo to preview how any frame looks on your face in real-time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => goToScreen('pref-style')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-showroom-ivory font-semibold text-xs uppercase tracking-wider transition-colors touch-btn"
            >
              FIND MY FRAMES
            </button>
            <button
              onClick={() => goToScreen('try-on')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-semibold text-xs uppercase tracking-wider shadow-kiosk-button transition-all touch-btn"
            >
              TRY ON FRAMES →
            </button>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};
