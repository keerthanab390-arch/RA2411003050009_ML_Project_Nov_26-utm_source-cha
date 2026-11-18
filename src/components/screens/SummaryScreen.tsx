import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { FrameCard } from '../frames/FrameCard';
import { FRAMES_CATALOGUE } from '../../data/framesData';
import { getMLRecommendations, getModelMetadata } from '../../recommendation/recommendationEngine';
import { logFeedbackEvent, downloadFeedbackCSV, getFeedbackLogs } from '../../recommendation/feedbackLogger';
import { FrameItem } from '../../types';
import {
  RotateCcw,
  Sparkles,
  Camera,
  ArrowRight,
  SlidersHorizontal,
  Download,
  Info,
  CheckCircle2
} from 'lucide-react';

export const SummaryScreen: React.FC = () => {
  const {
    preferences,
    goToScreen,
    resetAll,
    capturedPhoto,
    setSelectedFrameId,
    toggleFavourite,
    isFavourite,
    selectedFrameId,
    addToCart,
    updatePreferences
  } = useApp();

  const [feedbackStatusMap, setFeedbackStatusMap] = useState<Record<string, 'explicit_like' | 'explicit_dislike'>>({});
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Machine Learning Recommendation Engine: predicts customer preference probability
  // based on explicit customer style, color, and budget constraints.
  const mlRecommendations = useMemo(() => {
    return getMLRecommendations({
      frames: FRAMES_CATALOGUE,
      stylePreference: preferences.style,
      colorPreference: preferences.color,
      budgetPreference: preferences.budget
    });
  }, [preferences.style, preferences.color, preferences.budget]);

  const modelMeta = useMemo(() => getModelMetadata(), []);

  // Handle Try On click from a recommended frame
  const handleTryOnFrame = (frame: FrameItem) => {
    setSelectedFrameId(frame.id);
    logFeedbackEvent({
      frame,
      feedbackType: 'try_on',
      prefStyle: preferences.style,
      prefColor: preferences.color,
      prefBudget: preferences.budget
    });
    goToScreen('try-on');
  };

  const handleAddToCartWithFeedback = (frame: FrameItem) => {
    addToCart(frame);
    logFeedbackEvent({
      frame,
      feedbackType: 'cart',
      prefStyle: preferences.style,
      prefColor: preferences.color,
      prefBudget: preferences.budget
    });
  };

  const handleToggleFavouriteWithFeedback = (frameId: string) => {
    const frame = FRAMES_CATALOGUE.find((f) => f.id === frameId);
    toggleFavourite(frameId);
    if (frame) {
      logFeedbackEvent({
        frame,
        feedbackType: 'favourite',
        prefStyle: preferences.style,
        prefColor: preferences.color,
        prefBudget: preferences.budget
      });
    }
  };

  const handleExplicitFeedback = (frame: FrameItem, type: 'explicit_like' | 'explicit_dislike') => {
    setFeedbackStatusMap((prev) => ({ ...prev, [frame.id]: type }));
    logFeedbackEvent({
      frame,
      feedbackType: type,
      prefStyle: preferences.style,
      prefColor: preferences.color,
      prefBudget: preferences.budget
    });
    setFeedbackNotice(type === 'explicit_like' ? `Liked ${frame.name}!` : `Recorded feedback for ${frame.name}.`);
    setTimeout(() => setFeedbackNotice(null), 2500);
  };

  const handleExportFeedback = () => {
    const count = getFeedbackLogs().length;
    if (count === 0) {
      alert('No interaction feedback records collected yet in this kiosk session.');
      return;
    }
    downloadFeedbackCSV();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-showroom-950 text-showroom-ivory">
      <Header
        title="YOUR RECOMMENDATIONS"
        subtitle="Top 3 personalized recommendations powered by your preference-trained ML model."
        showBack={true}
      />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-between">
        
        <div className="space-y-8">
          
          {/* Card 1: User Preferences Summary & Try-On Photo Status */}
          <div className="rounded-3xl bg-showroom-900 border border-showroom-750 shadow-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-showroom-800 pb-5 mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-showroom-cream font-semibold block mb-1">
                  PREFERENCES SUMMARY
                </span>
                <h2 className="font-display font-bold text-2xl text-white tracking-tight">
                  Curated For Your Taste
                </h2>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleExportFeedback}
                  title="Export live customer feedback dataset as CSV for retraining"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-xs font-semibold text-showroom-cream transition-colors touch-btn"
                >
                  <Download className="w-3.5 h-3.5 text-showroom-cream" />
                  <span>EXPORT FEEDBACK</span>
                </button>

                <button
                  onClick={() => goToScreen('pref-style')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-xs font-semibold text-showroom-cream transition-colors touch-btn"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>EDIT PREFERENCES</span>
                </button>
              </div>
            </div>

            {/* 5 Preferences Attribute Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
              <div className="flex flex-col p-4 rounded-2xl bg-showroom-950/60 border border-showroom-800">
                <span className="text-[11px] text-showroom-muted font-medium mb-1 uppercase tracking-wider">Style</span>
                <span className="font-display font-semibold text-base text-showroom-cream">{preferences.style}</span>
              </div>
              <div className="flex flex-col p-4 rounded-2xl bg-showroom-950/60 border border-showroom-800">
                <span className="text-[11px] text-showroom-muted font-medium mb-1 uppercase tracking-wider">Shape</span>
                <span className="font-display font-semibold text-base text-showroom-cream">{preferences.shape}</span>
              </div>
              <div className="flex flex-col p-4 rounded-2xl bg-showroom-950/60 border border-showroom-800">
                <span className="text-[11px] text-showroom-muted font-medium mb-1 uppercase tracking-wider">Color</span>
                <span className="font-display font-semibold text-base text-showroom-cream">{preferences.color}</span>
              </div>
              <div className="flex flex-col p-4 rounded-2xl bg-showroom-950/60 border border-showroom-800">
                <span className="text-[11px] text-showroom-muted font-medium mb-1 uppercase tracking-wider">Size</span>
                <span className="font-display font-semibold text-base text-showroom-cream">{preferences.size}</span>
              </div>
              <div className="flex flex-col p-4 rounded-2xl bg-showroom-950/60 border border-showroom-800 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-showroom-muted font-medium mb-1 uppercase tracking-wider">Budget</span>
                <span className="font-display font-semibold text-base text-showroom-cream">{preferences.budget || 'Any Budget'}</span>
              </div>
            </div>

            {/* Optional Photo Status Card */}
            {capturedPhoto ? (
              <div className="mt-6 p-4 rounded-2xl bg-showroom-950/80 border border-showroom-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-showroom-700 bg-showroom-900 shrink-0">
                    <img src={capturedPhoto} alt="Captured face" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">Photo Saved for Virtual Try-On</span>
                    <span className="text-[11px] text-emerald-400">Click "Try On" on any recommended frame to overlay it</span>
                  </div>
                </div>
                <button
                  onClick={() => goToScreen('try-on')}
                  className="px-4 py-2 rounded-full bg-showroom-cream text-showroom-950 text-xs font-semibold uppercase tracking-wider shadow-sm"
                >
                  Open Try-On
                </button>
              </div>
            ) : (
              <div className="mt-6 p-4 rounded-2xl bg-showroom-950/60 border border-showroom-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-showroom-muted">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-showroom-cream shrink-0" />
                  <span>No photo captured yet. You can browse recommendations or click "Try On" to snap a photo anytime.</span>
                </div>
                <button
                  onClick={() => goToScreen('try-on')}
                  className="px-4 py-1.5 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-showroom-cream text-xs font-semibold self-start sm:self-auto"
                >
                  Capture Photo
                </button>
              </div>
            )}
          </div>

          {/* Model Transparency & Feedback Notice Banner */}
          <div className="p-4 rounded-2xl bg-showroom-900/90 border border-showroom-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-showroom-muted">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-showroom-cream/10 text-showroom-cream border border-showroom-cream/20">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <span className="text-white font-semibold block">
                  Trained ML Recommendation Engine ({modelMeta?.algorithm || 'LogisticRegression'} v{modelMeta?.version || '1.0.0'})
                </span>
                <span className="text-[11px] text-showroom-muted">
                  Trained on customer interaction preferences (ROC-AUC: {modelMeta?.metrics?.roc_auc ?? '0.68'}, Accuracy: {modelMeta?.metrics ? `${Math.round(modelMeta.metrics.accuracy * 100)}%` : '64%'}).
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-showroom-subtle bg-showroom-950/70 py-1.5 px-3 rounded-xl border border-showroom-850">
              <Info className="w-3.5 h-3.5 text-showroom-cream shrink-0" />
              <span>Predictions are statistical preference estimates, not guaranteed outcomes.</span>
            </div>
          </div>

          {feedbackNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/80 text-emerald-300 text-xs flex items-center gap-2 transition-all">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{feedbackNotice}</span>
            </div>
          )}

          {/* Section 2: Top 3 ML Recommendations */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-showroom-cream" />
                <h2 className="font-display font-bold text-2xl text-white tracking-tight">
                  Top Recommended Frames
                </h2>
              </div>
              <span className="text-xs text-showroom-muted">
                Showing up to 3 highest predicted matches within your {preferences.budget} ceiling
              </span>
            </div>

            {/* Recommendations Grid or Empty State */}
            {mlRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mlRecommendations.map((rec) => (
                  <FrameCard
                    key={rec.frame.id}
                    frame={rec.frame}
                    isSelected={selectedFrameId === rec.frame.id}
                    onSelect={(f) => setSelectedFrameId(f.id)}
                    onTryOn={handleTryOnFrame}
                    onAddToCart={handleAddToCartWithFeedback}
                    onToggleFavourite={handleToggleFavouriteWithFeedback}
                    isFavourite={isFavourite(rec.frame.id)}
                    onFeedback={handleExplicitFeedback}
                    feedbackStatus={feedbackStatusMap[rec.frame.id]}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-showroom-900 border border-showroom-800 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-showroom-850 border border-showroom-700 flex items-center justify-center text-showroom-cream mb-4">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-2">
                  No Frames Found In {preferences.budget}
                </h3>
                <p className="text-xs text-showroom-muted max-w-md mb-6 leading-relaxed">
                  We could not find frames strictly meeting this budget ceiling along with your selected preferences. Try exploring all price tiers or adjusting your filters.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updatePreferences({ budget: 'Any Budget' })}
                    className="px-6 py-3 rounded-full bg-showroom-cream text-showroom-950 font-semibold text-xs uppercase tracking-wider"
                  >
                    SHOW ALL BUDGETS
                  </button>
                  <button
                    onClick={() => goToScreen('pref-style')}
                    className="px-6 py-3 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-showroom-ivory font-semibold text-xs uppercase tracking-wider"
                  >
                    CHANGE PREFERENCES
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Action Controls Bar */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-showroom-850">
          <button
            onClick={resetAll}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-showroom-ivory font-semibold text-xs uppercase tracking-wider transition-colors touch-btn"
          >
            <RotateCcw className="w-4 h-4" />
            <span>START OVER</span>
          </button>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => goToScreen('try-on')}
              id="summary-try-on-btn"
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-showroom-900 hover:bg-showroom-850 border border-showroom-700 text-showroom-cream font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all touch-btn"
            >
              <Camera className="w-4 h-4" />
              <span>VIRTUAL TRY-ON</span>
            </button>

            <button
              onClick={() => goToScreen('explore-frames')}
              id="summary-explore-catalog-btn"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 py-4 px-8 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-semibold text-xs sm:text-sm tracking-wider uppercase shadow-kiosk-button transition-all touch-btn"
            >
              <span>EXPLORE ALL 40 FRAMES</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
