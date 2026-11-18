import React, { useState } from 'react';
import { FrameItem } from '../../types';
import { Check, Camera, Heart, Sparkles, ShoppingBag, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';

interface FrameCardProps {
  frame: FrameItem;
  isSelected?: boolean;
  onSelect?: (frame: FrameItem) => void;
  onTryOn?: (frame: FrameItem) => void;
  onAddToCart?: (frame: FrameItem) => void;
  onBuyNow?: (frame: FrameItem) => void;
  onToggleFavourite?: (frameId: string) => void;
  isFavourite?: boolean;
  onFeedback?: (frame: FrameItem, type: 'explicit_like' | 'explicit_dislike') => void;
  feedbackStatus?: 'explicit_like' | 'explicit_dislike' | null;
}

const formatPrice = (price: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

export const FrameCard: React.FC<FrameCardProps> = ({
  frame,
  isSelected = false,
  onSelect,
  onTryOn,
  onAddToCart,
  onToggleFavourite,
  isFavourite = false,
  onFeedback,
  feedbackStatus,
}) => {
  const matchScore = frame.recommendationScore;
  const [justAdded, setJustAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(frame.image);
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    setImgSrc(frame.image);
    setHasError(false);
  }, [frame.image]);

  const handleImageError = () => {
    if (imgSrc.endsWith('.jpg')) {
      setImgSrc(imgSrc.replace('.jpg', '.png'));
    } else if (!imgSrc.includes('/tryon/')) {
      const match = imgSrc.match(/frame(\d+)/i);
      if (match) {
        setImgSrc(`/images/frames/tryon/frame${match[1]}.png`);
      } else {
        setHasError(true);
      }
    } else {
      setHasError(true);
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (onAddToCart) {
      onAddToCart(frame);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1200);
    }
  };

  return (
    <div
      onClick={() => onSelect?.(frame)}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      className={`group relative flex flex-col justify-between rounded-2xl bg-showroom-900 border transition-all duration-300 touch-btn cursor-pointer ${isSelected
        ? 'border-showroom-cream ring-1 ring-showroom-cream shadow-kiosk-selected'
        : 'border-showroom-750 hover:border-showroom-cream/60 hover:shadow-card-hover'
        }`}
    >
      {/* Top Meta Header */}
      <div className="flex items-center justify-between p-4 pb-2 z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-showroom-muted group-hover:text-showroom-cream transition-colors duration-300">
            {frame.style}
          </span>

          {matchScore?.isRecommended && (
            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-showroom-cream/15 text-showroom-cream border border-showroom-cream/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>RECOMMENDED</span>
            </span>
          )}
        </div>

        {/* Favourite and Selection */}
        <div className="flex items-center gap-1.5">
          {onToggleFavourite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavourite(frame.id);
              }}
              title={
                isFavourite
                  ? 'Remove from favourites'
                  : 'Add to favourites'
              }
              aria-label={
                isFavourite
                  ? 'Remove from favourites'
                  : 'Add to favourites'
              }
              className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${isFavourite
                ? 'bg-rose-950/80 border-rose-700 text-rose-400'
                : 'bg-showroom-850/80 hover:bg-showroom-800 border-showroom-700 text-showroom-muted hover:text-white'
                }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${isFavourite ? 'fill-current text-rose-400' : ''
                  }`}
              />
            </button>
          )}

          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300 ${isSelected
              ? 'bg-showroom-cream border-showroom-cream text-showroom-950 scale-100 opacity-100'
              : 'border-showroom-700 bg-showroom-850/60 opacity-0 group-hover:opacity-100 text-transparent'
              }`}
          >
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        </div>
      </div>

      {/* Frame Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-showroom-950/70 flex items-center justify-center p-3">
        {hasError ? (
          <div className="flex flex-col items-center justify-center text-showroom-muted p-4">
            <Eye className="w-8 h-8 stroke-1 text-showroom-cream/60 mb-1" />
            <span className="text-[10px] tracking-wide uppercase font-semibold">{frame.name}</span>
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={`${frame.name} — ${frame.style}`}
            decoding="async"
            onError={handleImageError}
            className="w-full h-full object-contain filter contrast-105 transition-transform duration-300 ease-out transform scale-100 group-hover:scale-105"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-showroom-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Frame Information */}
      <div className="p-5 pt-3 flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display font-bold text-lg text-white group-hover:text-showroom-cream transition-colors duration-300 tracking-tight">
            {frame.name}
          </h3>

          {/* INR Price */}
          <div className="text-right shrink-0">
            <span className="font-display font-bold text-base text-showroom-cream">
              {formatPrice(frame.price)}
            </span>
          </div>
        </div>

        {frame.description && (
          <p className="text-[11px] text-showroom-muted line-clamp-2 leading-relaxed">
            {frame.description}
          </p>
        )}

        {/* Recommendation Match */}
        {matchScore && (
          <div className="p-2.5 rounded-xl bg-showroom-950/80 border border-showroom-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-showroom-cream tracking-wide">
                Preference Match
              </span>

              <span className="font-display font-extrabold text-sm text-showroom-cream">
                {Math.round(matchScore.totalScore * 100)}%
              </span>
            </div>

            {matchScore.matchReason && (
              <span className="text-[10px] text-showroom-muted block mt-0.5 line-clamp-2">
                {matchScore.matchReason}
              </span>
            )}
          </div>
        )}

        {/* Frame Specifications */}
        <div className="flex items-center justify-between text-xs text-showroom-muted pt-2 border-t border-showroom-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-showroom-ivory">
              {frame.shape}
            </span>
            <span>•</span>
            <span>{frame.color}</span>
            <span>•</span>
            <span>{frame.size}</span>
          </div>

          <span className="text-[11px] font-medium text-showroom-subtle group-hover:text-showroom-muted transition-colors">
            {frame.material}
          </span>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center gap-2">
          {onTryOn && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTryOn(frame);
              }}
              id={`try-on-${frame.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-showroom-850 hover:bg-showroom-cream hover:text-showroom-950 border border-showroom-700 hover:border-showroom-cream text-showroom-cream text-xs font-semibold uppercase tracking-wider transition-all duration-200 touch-btn"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>TRY ON</span>
            </button>
          )}

          {onAddToCart && (
            <button
              onClick={handleAddClick}
              id={`add-to-cart-${frame.id}`}
              title="Add frame to cart"
              aria-label={`Add ${frame.name} to cart`}
              className={`p-2.5 rounded-full border transition-all duration-200 touch-btn ${justAdded
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-showroom-850 hover:bg-showroom-800 border-showroom-700 text-showroom-ivory hover:text-showroom-cream'
                }`}
            >
              {justAdded ? (
                <Check className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Customer Feedback Interaction (Likes / Dislikes) */}
        {onFeedback && (
          <div className="pt-2.5 mt-1 border-t border-showroom-800/80 flex items-center justify-between text-[11px] text-showroom-muted">
            <span className="text-[10px] tracking-wide text-showroom-subtle">Helpful match?</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFeedback(frame, 'explicit_like');
                }}
                title="Like this recommendation"
                aria-label={`Like recommendation for ${frame.name}`}
                className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-semibold transition-all ${
                  feedbackStatus === 'explicit_like'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-showroom-850 hover:bg-showroom-800 border-showroom-700 text-showroom-muted hover:text-showroom-ivory'
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
                <span>Like</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFeedback(frame, 'explicit_dislike');
                }}
                title="Dislike this recommendation"
                aria-label={`Dislike recommendation for ${frame.name}`}
                className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-semibold transition-all ${
                  feedbackStatus === 'explicit_dislike'
                    ? 'bg-rose-950 border-rose-500 text-rose-300'
                    : 'bg-showroom-850 hover:bg-showroom-800 border-showroom-700 text-showroom-muted hover:text-showroom-ivory'
                }`}
              >
                <ThumbsDown className="w-3 h-3" />
                <span>Dislike</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};