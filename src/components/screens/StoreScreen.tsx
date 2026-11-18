import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Navbar } from '../layout/Navbar';
import { Footer } from '../layout/Footer';
import { FRAMES_CATALOGUE } from '../../data/framesData';
import { FrameItem } from '../../types';
import {
  Search, Filter, ArrowUpDown, Camera, ShoppingBag, CreditCard,
  Heart, X, Check, RotateCcw
} from 'lucide-react';

const formatPrice = (price: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export const StoreScreen: React.FC = () => {
  const {
    goToScreen,
    setSelectedFrameId,
    addToCart,
    buyNow,
    toggleFavourite,
    isFavourite,
    setIsCartOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedShape, setSelectedShape] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [activeModalFrame, setActiveModalFrame] = useState<FrameItem | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const styles = ['All', 'Classic', 'Modern', 'Trendy', 'Professional', 'Casual'];
  const shapes = ['All', 'Round', 'Square', 'Rectangle', 'Geometric', 'Oval', 'Browline', 'Cat-Eye', 'Wayfarer'];
  const colors = ['All', 'Black', 'Brown', 'Gold', 'Silver', 'Tortoise', 'Clear', 'Transparent', 'Gunmetal', 'Burgundy', 'Teal', 'Blue', 'Champagne'];
  const priceRanges = [
    'All',
    '₹1,000 - ₹1,200',
    '₹1,201 - ₹1,500',
    '₹1,501 - ₹1,800',
    '₹1,801 - ₹2,000',
  ];

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStyle('All');
    setSelectedShape('All');
    setSelectedColor('All');
    setSelectedPriceRange('All');
    setSortBy('featured');
  };

  const handleTryOn = (frame: FrameItem) => {
    setSelectedFrameId(frame.id);
    goToScreen('try-on');
  };

  const handleAddToCart = (frame: FrameItem, quantity: number) => {
    addToCart(frame, quantity);
    setJustAddedId(frame.id);
    window.setTimeout(() => setJustAddedId((current) => current === frame.id ? null : current), 1200);
  };

  const handleBuyNow = (frame: FrameItem) => {
    buyNow(frame);
  };

  const filteredFrames = useMemo(() => {
    const filtered = FRAMES_CATALOGUE.filter((frame) => {
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const searchable = [
          frame.name,
          frame.description ?? '',
          frame.material,
          frame.style,
          frame.shape,
          frame.color,
        ].join(' ').toLowerCase();
        if (!searchable.includes(query)) return false;
      }

      if (selectedStyle !== 'All' && frame.style.toLowerCase() !== selectedStyle.toLowerCase()) return false;
      if (selectedShape !== 'All' && frame.shape.toLowerCase() !== selectedShape.toLowerCase()) return false;
      if (selectedColor !== 'All' && !frame.color.toLowerCase().includes(selectedColor.toLowerCase())) return false;

      const price = frame.price;
      switch (selectedPriceRange) {
        case '₹1,000 - ₹1,200':
          if (price < 1000 || price > 1200) return false;
          break;
        case '₹1,201 - ₹1,500':
          if (price < 1201 || price > 1500) return false;
          break;
        case '₹1,501 - ₹1,800':
          if (price < 1501 || price > 1800) return false;
          break;
        case '₹1,801 - ₹2,000':
          if (price < 1801 || price > 2000) return false;
          break;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'name-asc': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
  }, [searchQuery, selectedStyle, selectedShape, selectedColor, selectedPriceRange, sortBy]);

  return (
    <div className="min-h-screen bg-showroom-950 text-showroom-ivory">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-showroom-cream">OptiTry Showroom</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Explore All Frames</h1>
            <p className="mt-2 max-w-2xl text-sm text-showroom-muted">
              Explore our complete catalogue of spectacle frames, with transparent pricing and virtual try-on.
            </p>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-showroom-700 bg-showroom-900 px-5 py-3 text-sm hover:border-showroom-cream sm:self-auto"
          >
            <ShoppingBag className="h-4 w-4" /> Open Bag
          </button>
        </header>

        <section className="space-y-4 rounded-3xl border border-showroom-750 bg-showroom-900 p-5 shadow-xl">
          <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-showroom-muted" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, style, shape, colour, or material..."
                className="w-full rounded-full border border-showroom-750 bg-showroom-950/80 py-3 pl-10 pr-10 text-sm text-showroom-ivory placeholder-showroom-muted focus:border-showroom-cream focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} aria-label="Clear search" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-showroom-muted hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-showroom-cream" />
              <label htmlFor="store-sort" className="text-xs text-showroom-muted">Sort:</label>
              <select
                id="store-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="rounded-full border border-showroom-750 bg-showroom-950 px-3 py-3 text-xs text-showroom-ivory focus:outline-none"
              >
                <option value="featured">Featured Collection</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {[
            { label: 'Style', values: styles, selected: selectedStyle, set: setSelectedStyle },
            { label: 'Shape', values: shapes, selected: selectedShape, set: setSelectedShape },
            { label: 'Colour', values: colors, selected: selectedColor, set: setSelectedColor },
            { label: 'Price', values: priceRanges, selected: selectedPriceRange, set: setSelectedPriceRange },
          ].map((group) => (
            <div key={group.label} className="flex flex-wrap items-center gap-2 border-t border-showroom-800 pt-3">
              <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-showroom-muted">{group.label}:</span>
              {group.values.map((value) => (
                <button
                  key={value}
                  onClick={() => group.set(value)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${group.selected === value
                      ? 'bg-showroom-cream font-bold text-showroom-950'
                      : 'border border-showroom-800 bg-showroom-950/60 text-showroom-muted hover:border-showroom-700 hover:text-white'
                    }`}
                >
                  {value}
                </button>
              ))}
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-showroom-800 pt-3 text-xs text-showroom-muted">
            <span><Filter className="mr-1 inline h-3.5 w-3.5" /> Showing {filteredFrames.length} of {FRAMES_CATALOGUE.length} frames</span>
            <button onClick={resetFilters} className="inline-flex items-center gap-1 text-showroom-cream hover:underline">
              <RotateCcw className="h-3.5 w-3.5" /> Reset filters
            </button>
          </div>
        </section>

        {filteredFrames.length > 0 ? (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredFrames.map((frame) => {
              const isFav = isFavourite(frame.id);
              const justAdded = justAddedId === frame.id;
              return (
                <article
                  key={frame.id}
                  onClick={() => setActiveModalFrame(frame)}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-showroom-750 bg-showroom-900 shadow-lg transition hover:border-showroom-cream/60"
                >
                  <div className="flex items-center justify-between p-4 pb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-showroom-muted">{frame.style}</span>
                    <button
                      onClick={(event) => { event.stopPropagation(); toggleFavourite(frame.id); }}
                      title={isFav ? 'Remove from favourites' : 'Save to favourites'}
                      aria-label={isFav ? 'Remove from favourites' : 'Save to favourites'}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border ${isFav ? 'border-rose-700 bg-rose-950 text-rose-400' : 'border-showroom-700 text-showroom-muted hover:text-white'}`}
                    >
                      <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-showroom-950/70 p-3">
                    <img
                      src={frame.image}
                      alt={frame.name}
                      decoding="async"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.endsWith('.jpg')) {
                          target.src = target.src.replace('.jpg', '.png');
                        }
                      }}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-display text-base font-bold text-white">{frame.name}</h2>
                      <span className="whitespace-nowrap text-sm font-bold text-showroom-cream">{formatPrice(frame.price)}</span>
                    </div>
                    <p className="line-clamp-2 text-xs leading-relaxed text-showroom-muted">{frame.description}</p>
                    <div className="flex items-center justify-between border-t border-showroom-800 pt-2 text-[11px] text-showroom-muted">
                      <span>{frame.shape} · {frame.color}</span><span>{frame.material}</span>
                    </div>
                    <div className="mt-auto flex items-center gap-2 pt-1">
                      <button onClick={(event) => { event.stopPropagation(); handleTryOn(frame); }} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-showroom-700 px-3 py-2.5 text-[11px] font-semibold text-showroom-cream hover:bg-showroom-cream hover:text-showroom-950">
                        <Camera className="h-3.5 w-3.5" /> TRY ON
                      </button>
                      <button onClick={(event) => { event.stopPropagation(); handleAddToCart(frame, 1); }} title="Add to bag" className={`rounded-full border p-2.5 ${justAdded ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-showroom-700 text-showroom-ivory hover:text-showroom-cream'}`}>
                        {justAdded ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                      </button>
                      <button onClick={(event) => { event.stopPropagation(); handleBuyNow(frame); }} title="Buy now" className="rounded-full bg-showroom-cream p-2.5 text-showroom-950 hover:opacity-90">
                        <CreditCard className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <div className="flex flex-col items-center rounded-3xl border border-showroom-750 bg-showroom-900 p-12 text-center">
            <Filter className="mb-4 h-10 w-10 text-showroom-muted" />
            <h2 className="mb-2 font-display text-xl font-bold text-white">No matching frames found</h2>
            <p className="mb-5 max-w-sm text-sm text-showroom-muted">Try changing your search or filters.</p>
            <button onClick={resetFilters} className="rounded-full bg-showroom-cream px-6 py-3 text-xs font-semibold uppercase text-showroom-950">Reset filters</button>
          </div>
        )}
      </main>

      {activeModalFrame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onClick={() => setActiveModalFrame(null)}>
          <section className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-showroom-750 bg-showroom-900 p-6 shadow-2xl sm:p-8" onClick={(event) => event.stopPropagation()}>
            <button onClick={() => setActiveModalFrame(null)} aria-label="Close details" className="absolute right-5 top-5 rounded-full border border-showroom-700 p-2 text-showroom-muted hover:text-white"><X className="h-4 w-4" /></button>
            <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-2">
              <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-showroom-800 bg-showroom-950 p-4">
                <img src={activeModalFrame.image} alt={activeModalFrame.name} className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-showroom-cream">{activeModalFrame.style} · {activeModalFrame.shape}</p>
                <h2 className="mb-3 font-display text-2xl font-bold text-white">{activeModalFrame.name}</h2>
                <p className="mb-4 text-2xl font-extrabold text-showroom-cream">{formatPrice(activeModalFrame.price)}</p>
                <p className="mb-4 text-sm leading-relaxed text-showroom-muted">{activeModalFrame.description}</p>
                <div className="mb-6 space-y-2 border-t border-showroom-800 pt-3 text-xs">
                  <div className="flex justify-between"><span className="text-showroom-muted">Colour</span><span>{activeModalFrame.color}</span></div>
                  <div className="flex justify-between"><span className="text-showroom-muted">Material</span><span>{activeModalFrame.material}</span></div>
                  <div className="flex justify-between"><span className="text-showroom-muted">Size fit</span><span>{activeModalFrame.size}</span></div>
                  {activeModalFrame.dimensions && <div className="flex justify-between gap-3"><span className="text-showroom-muted">Dimensions</span><span className="text-right">{activeModalFrame.dimensions.lensWidth} · {activeModalFrame.dimensions.bridgeWidth} · {activeModalFrame.dimensions.templeLength} mm</span></div>}
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => { const frame = activeModalFrame; setActiveModalFrame(null); handleTryOn(frame); }} className="flex items-center justify-center gap-2 rounded-full bg-showroom-cream px-4 py-3 text-xs font-bold text-showroom-950"><Camera className="h-4 w-4" /> TRY ON IN STUDIO</button>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { handleAddToCart(activeModalFrame, 1); setActiveModalFrame(null); setIsCartOpen(true); }} className="flex items-center justify-center gap-2 rounded-full border border-showroom-700 px-3 py-3 text-xs font-semibold"><ShoppingBag className="h-4 w-4" /> ADD TO BAG</button>
                    <button onClick={() => { const frame = activeModalFrame; setActiveModalFrame(null); handleBuyNow(frame); }} className="flex items-center justify-center gap-2 rounded-full border border-showroom-700 px-3 py-3 text-xs font-semibold text-showroom-cream"><CreditCard className="h-4 w-4" /> BUY NOW</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      <Footer />
    </div>
  );
};
