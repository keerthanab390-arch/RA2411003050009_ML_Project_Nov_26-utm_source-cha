import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassesFitData } from '../../types';
import { useWebcam } from '../../hooks/useWebcam';
import { useMediaPipeLandmarker } from '../../hooks/useMediaPipeLandmarker';
import { WebcamViewport } from '../face/WebcamViewport';
import { Header } from '../common/Header';
import { FRAMES_CATALOGUE } from '../../data/framesData';
import { getFrameAnchor } from '../../data/frameAnchors';
import { getRecommendedFrames } from '../../utils/frameRecommender';
import { isIPadOrTablet, DEFAULT_IPAD_SCALE_MULTIPLIER } from '../../utils/deviceDetection';
import { preloadAllTryOnFrames, preloadFrameImage, isFramePreloaded, checkImageReady } from '../../utils/framePreloader';
import {
  ArrowLeft,
  Camera,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  Heart,
  Check,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  ShoppingBag,
  CreditCard
} from 'lucide-react';

export const FaceAnalysisScreen: React.FC = () => {
  const {
    goToScreen,
    capturedPhoto,
    setCapturedPhoto,
    glassesFit,
    setGlassesFit,
    selectedFrameId,
    setSelectedFrameId,
    toggleFavourite,
    isFavourite,
    preferences,
    addToCart,
    buyNow
  } = useApp();

  const [isGlassesVisible, setIsGlassesVisible] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedNotice, setAddedNotice] = useState(false);
  const [verticalOffset, setVerticalOffset] = useState(0);
  const [overlayLoaded, setOverlayLoaded] = useState(false);
  const [imgSrcOverride, setImgSrcOverride] = useState<string | null>(null);

  // iPad / tablet scale multiplier (starting at 0.85 as requested)
  const isTablet = useMemo(() => isIPadOrTablet(), []);
  const [tabletScaleMultiplier, setTabletScaleMultiplier] = useState<number>(DEFAULT_IPAD_SCALE_MULTIPLIER);

  // Preload all try-on frame overlays in the background on mount
  useEffect(() => {
    preloadAllTryOnFrames();
  }, []);

  const {
    videoRef,
    status,
    errorMessage,
    startCamera,
    stopCamera,
    hasMultipleCameras,
    switchCamera
  } = useWebcam();

  const isCameraActive = status === 'active';

  const {
    canvasRef,
    isModelLoading,
    isModelReady,
    stage,
    postureResult,
    unifiedGuidanceText,
    countdownValue,
    captureProgress,
    latestPhoto,
    latestFitData,
    captureSnapshot,
    error: visionError,
    restartAnalysis
  } = useMediaPipeLandmarker(videoRef, isCameraActive && !capturedPhoto);

  useEffect(() => {
    if (!capturedPhoto) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [capturedPhoto, startCamera, stopCamera]);

  useEffect(() => {
    if (latestPhoto && !capturedPhoto) {
      setCapturedPhoto(latestPhoto);

      if (latestFitData) {
        setGlassesFit(latestFitData);
      }
    }
  }, [
    latestPhoto,
    latestFitData,
    capturedPhoto,
    setCapturedPhoto,
    setGlassesFit
  ]);

  const handleCapturePhoto = useCallback(() => {
    const snapshot = captureSnapshot();

    if (snapshot) {
      setCapturedPhoto(snapshot.dataUrl);
      setGlassesFit(snapshot.fitData);
    }
  }, [captureSnapshot, setCapturedPhoto, setGlassesFit]);

  const handleRetakePhoto = useCallback(() => {
    setCapturedPhoto(null);
    setGlassesFit(null);
    setOverlayLoaded(false);
    setVerticalOffset(0);
    restartAnalysis();
    startCamera();
  }, [
    setCapturedPhoto,
    setGlassesFit,
    restartAnalysis,
    startCamera
  ]);

  // Resolve the currently selected catalogue frame.
  const activeFrame = useMemo(() => {
    return (
      FRAMES_CATALOGUE.find(frame => frame.id === selectedFrameId) ??
      FRAMES_CATALOGUE[0]
    );
  }, [selectedFrameId]);

  // Determine the selected frame's catalogue position.
  const activeFrameIndex = useMemo(() => {
    if (!activeFrame) {
      return -1;
    }

    return FRAMES_CATALOGUE.findIndex(
      frame => frame.id === activeFrame.id
    );
  }, [activeFrame]);

  /*
   * Front-facing PNG mapping:
   * Catalogue item 1  -> frame01.png
   * Catalogue item 2  -> frame02.png
   * ...
   * Catalogue item 41 -> frame41.png
   *
   * The PNG numbering must match the order of FRAMES_CATALOGUE.
   */
  const tryOnPngSrc = useMemo(() => {
    if (!activeFrame) return null;
    const match = activeFrame.image?.match(/frame(\d+)/i) || activeFrame.id?.match(/frame-(\d+)/i);
    if (match) {
      const num = String(parseInt(match[1], 10)).padStart(2, '0');
      return `/images/frames/tryon/frame${num}.png`;
    }
    if (activeFrameIndex >= 0 && activeFrameIndex < 41) {
      const number = String(activeFrameIndex + 1).padStart(2, '0');
      return `/images/frames/tryon/frame${number}.png`;
    }
    return null;
  }, [activeFrame, activeFrameIndex]);

  // Reset fallback and display instantly if the frame is already cached/preloaded
  useEffect(() => {
    setImgSrcOverride(null);
    if (tryOnPngSrc && (isFramePreloaded(tryOnPngSrc) || checkImageReady(tryOnPngSrc))) {
      setOverlayLoaded(true);
    } else {
      setOverlayLoaded(false);
    }
  }, [tryOnPngSrc]);

  const effectivePngSrc = imgSrcOverride || tryOnPngSrc;

  // Use frame-specific anchors if defined in frameAnchors.ts.
  const tryOnAnchor = useMemo(() => {
    if (!tryOnPngSrc) {
      return {
        opticalCenterXPercent: 50,
        opticalCenterYPercent: 38,
        frontWidthRatio: 1,
        lensDistanceRatio: 0.5,
        intrinsicTiltDeg: 0
      };
    }

    return getFrameAnchor(tryOnPngSrc);
  }, [tryOnPngSrc]);

  // Safe fallback fitting values.
  const safeGlassesFit = useMemo<GlassesFitData>(() => {
    if (glassesFit && glassesFit.isDetected) {
      return glassesFit;
    }

    if (glassesFit) {
      return {
        centerX: Number.isFinite(glassesFit.centerX) ? glassesFit.centerX : 50,
        centerY: Number.isFinite(glassesFit.centerY) ? glassesFit.centerY : 40,
        widthPercent:
          Number.isFinite(glassesFit.widthPercent) && glassesFit.widthPercent > 0
            ? glassesFit.widthPercent
            : 48,
        rotationDeg: Number.isFinite(glassesFit.rotationDeg) ? glassesFit.rotationDeg : 0,
        isDetected: Boolean(glassesFit.isDetected)
      };
    }

    return {
      centerX: 50,
      centerY: 40,
      widthPercent: 48,
      rotationDeg: 0,
      isDetected: false
    };
  }, [glassesFit]);

  // Single consistent source of truth: use widthPercent directly from computeGlassesFit.
  // Laptop sizing is strictly unchanged (multiplier = 1.0).
  // iPad/tablet uses the adjustable tabletScaleMultiplier (default 0.85).
  const frameWidthPercent = useMemo(() => {
    const baseWidth = (Number.isFinite(safeGlassesFit.widthPercent) && safeGlassesFit.widthPercent > 0)
      ? safeGlassesFit.widthPercent
      : 48;

    const deviceMultiplier = isTablet ? tabletScaleMultiplier : 1.0;
    const finalWidth = baseWidth * deviceMultiplier;

    return Math.max(20, Math.min(95, Number(finalWidth.toFixed(2))));
  }, [safeGlassesFit, isTablet, tabletScaleMultiplier]);

  // Use the corrected rotationDeg returned by computeGlassesFit (intrinsic tilt already corrected once).
  const effectiveRotationDeg = useMemo(() => {
    const rotation = safeGlassesFit.rotationDeg ?? 0;
    return Number.isFinite(rotation)
      ? Math.max(-30, Math.min(30, Number(rotation.toFixed(2))))
      : 0;
  }, [safeGlassesFit]);

  // Use baseline centerY from computeGlassesFit (includes 1.5% vertical offset) plus manual user offset.
  const effectiveCenterY = useMemo(() => {
    const rawCenterY = (safeGlassesFit.centerY ?? 40) + verticalOffset;
    return Math.max(5, Math.min(95, Number(rawCenterY.toFixed(2))));
  }, [safeGlassesFit, verticalOffset]);

  const rankedCatalogue = useMemo(() => {
    return getRecommendedFrames({
      frames: FRAMES_CATALOGUE,
      stylePreference: preferences.style,
      shapePreference: preferences.shape,
      colorPreference: preferences.color,
      sizePreference: preferences.size
    });
  }, [
    preferences.style,
    preferences.shape,
    preferences.color,
    preferences.size
  ]);

  const categories = [
    'All',
    'Classic',
    'Modern',
    'Trendy',
    'Professional',
    'Casual'
  ];

  const filteredFrames = useMemo(() => {
    if (selectedCategory === 'All') {
      return rankedCatalogue;
    }

    return rankedCatalogue.filter(
      frame =>
        frame.style.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [rankedCatalogue, selectedCategory]);

  const activeFrameScore = useMemo(() => {
    return rankedCatalogue.find(
      frame => frame.id === activeFrame?.id
    )?.recommendationScore;
  }, [rankedCatalogue, activeFrame]);

  if (!activeFrame) {
    return (
      <div className="flex-1 min-h-screen bg-showroom-950 text-showroom-ivory flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-3">
            No frames available
          </h2>
          <button
            onClick={() => goToScreen('home')}
            className="px-6 py-3 rounded-full bg-showroom-cream text-showroom-950 font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-showroom-950 text-showroom-ivory">
      <Header
        title={capturedPhoto ? 'VIRTUAL TRY-ON STUDIO' : 'ALIGN & CAPTURE'}
        subtitle={
          capturedPhoto
            ? `Trying on ${activeFrame.name}. Browse the catalogue to change frames.`
            : `Align your face in the guide and capture a photo to try on ${activeFrame.name}.`
        }
        showBack={true}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col justify-between">
        {!capturedPhoto ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
            <div className="lg:col-span-8 flex flex-col items-center gap-4">
              <WebcamViewport
                videoRef={videoRef}
                canvasRef={canvasRef}
                status={status}
                errorMessage={errorMessage || visionError}
                isModelLoading={isModelLoading}
                isModelReady={isModelReady}
                stage={stage}
                postureResult={postureResult}
                guidanceText={unifiedGuidanceText}
                countdownValue={countdownValue}
                captureProgress={captureProgress}
                onStartCamera={startCamera}
                onStopCamera={stopCamera}
                onSwitchCamera={switchCamera}
                hasMultipleCameras={hasMultipleCameras}
                onCapturePhoto={handleCapturePhoto}
              />

              <div className="w-full p-4 rounded-2xl bg-showroom-900/70 border border-showroom-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-showroom-muted">
                  <Camera className="w-4 h-4 text-showroom-cream" />
                  <span>
                    Ready to try on{' '}
                    <strong className="text-white">
                      {activeFrame.name}
                    </strong>{' '}
                    ({activeFrame.style} • {activeFrame.shape})
                  </span>
                </div>

                <button
                  onClick={handleCapturePhoto}
                  disabled={!isCameraActive}
                  className={`flex items-center gap-2 py-2.5 px-6 rounded-full font-semibold uppercase tracking-wider text-xs transition-all touch-btn ${isCameraActive
                    ? 'bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 shadow-kiosk-button cursor-pointer'
                    : 'bg-showroom-800 text-showroom-subtle cursor-not-allowed opacity-50'
                    }`}
                >
                  <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>CAPTURE PHOTO</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-5">
              <div className="p-6 rounded-3xl bg-showroom-900 border border-showroom-750 shadow-2xl">
                <div className="flex items-center justify-between border-b border-showroom-800 pb-3 mb-4">
                  <span className="text-[10px] uppercase tracking-wider text-showroom-cream font-semibold">
                    SELECTED FOR TRY-ON
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-showroom-cream/15 text-showroom-cream border border-showroom-cream/30">
                    {activeFrame.style}
                  </span>
                </div>

                <div className="aspect-[16/10] w-full rounded-2xl bg-showroom-950/70 border border-showroom-800/80 p-4 flex items-center justify-center mb-4 overflow-hidden">
                  <img
                    src={activeFrame.image}
                    alt={activeFrame.name}
                    className="w-full h-full object-contain filter contrast-105"
                  />
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-display font-bold text-xl text-white tracking-tight">
                    {activeFrame.name}
                  </h3>
                  <span className="text-xs text-showroom-muted">
                    {activeFrame.shape}
                  </span>
                </div>

                <p className="text-xs text-showroom-muted mb-4 leading-relaxed">
                  {activeFrame.description}
                </p>

                <div className="space-y-2 text-xs border-t border-showroom-800 pt-3">
                  <div className="flex justify-between py-1 border-b border-showroom-850">
                    <span className="text-showroom-muted">Color</span>
                    <span className="text-showroom-ivory font-medium">
                      {activeFrame.color}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-showroom-850">
                    <span className="text-showroom-muted">Size Fit</span>
                    <span className="text-showroom-ivory font-medium">
                      {activeFrame.size}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-showroom-muted">Material</span>
                    <span className="text-showroom-ivory font-medium">
                      {activeFrame.material}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-showroom-900/60 border border-showroom-800 flex items-start gap-3 text-xs text-showroom-muted">
                <ShieldCheck className="w-4 h-4 text-showroom-cream shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Position your face in the oval guide. After capturing,
                  you can switch between frames without recapturing.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8 my-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 flex flex-col items-center gap-3">
                <div className="relative w-full rounded-3xl overflow-hidden bg-showroom-950 border border-showroom-750 shadow-2xl group flex items-center justify-center p-3 sm:p-4 min-h-[380px]">
                  <div
                    className="relative inline-block max-w-full max-h-[72vh] rounded-2xl overflow-hidden"
                    style={{
                      transform: glassesFit?.isDetected
                        ? `translateX(${Math.max(
                          -15,
                          Math.min(15, 50 - safeGlassesFit.centerX)
                        )}%)`
                        : 'translateX(0)',
                      transition: 'transform 200ms ease-out',
                    }}
                  >
                    <img
                      src={capturedPhoto}
                      alt="Captured face preview"
                      className="max-h-[72vh] w-auto max-w-full block select-none pointer-events-none rounded-2xl"
                    />

                    {isGlassesVisible && effectivePngSrc && (
                      <div
                        style={{
                          position: 'absolute',
                          left: `${safeGlassesFit.centerX}%`,
                          top: `${effectiveCenterY}%`,
                          width: `${frameWidthPercent}%`,
                          transform: `translate(-${tryOnAnchor.opticalCenterXPercent}%, -${tryOnAnchor.opticalCenterYPercent}%) rotate(${effectiveRotationDeg}deg)`,
                          transformOrigin: `${tryOnAnchor.opticalCenterXPercent}% ${tryOnAnchor.opticalCenterYPercent}%`,
                          pointerEvents: 'none',
                          zIndex: 20
                        }}
                        className="transition-all duration-150 ease-out"
                      >
                        <img
                          src={effectivePngSrc}
                          alt={`${activeFrame.name} virtual try-on`}
                          draggable={false}
                          ref={(imgNode) => {
                            if (imgNode && imgNode.complete && imgNode.naturalWidth > 0 && !overlayLoaded) {
                              setOverlayLoaded(true);
                            }
                          }}
                          onLoad={() => {
                            setOverlayLoaded(true);
                          }}
                          onError={() => {
                            if (effectivePngSrc && effectivePngSrc.includes('/tryon/')) {
                              const fallback = effectivePngSrc.replace('/tryon/', '/');
                              console.warn(`Try-on PNG failed (${effectivePngSrc}), attempting fallback: ${fallback}`);
                              setImgSrcOverride(fallback);
                            } else {
                              setOverlayLoaded(false);
                              console.error(
                                'Failed to load try-on image:',
                                effectivePngSrc
                              );
                            }
                          }}
                          style={{
                            opacity: overlayLoaded ? 1 : 0,
                            transition: overlayLoaded ? 'opacity 0.15s ease-out' : 'none',
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain',
                            background: 'transparent'
                          }}
                          className="select-none pointer-events-none filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.25)]"
                        />
                      </div>
                    )}

                    {isGlassesVisible && !effectivePngSrc && (
                      <div className="absolute bottom-4 left-4 right-4 z-30 rounded-xl border border-showroom-700 bg-showroom-950/90 p-3 text-center text-xs text-showroom-muted">
                        A front-facing try-on image is not available for this frame yet.
                      </div>
                    )}
                  </div>

                  <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-showroom-950/85 backdrop-blur-md border border-showroom-750 text-xs font-semibold text-showroom-cream shadow-lg pointer-events-auto">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{activeFrame.name}</span>
                      <span className="text-[10px] text-showroom-muted font-normal">
                        • {activeFrame.style}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-showroom-950/85 backdrop-blur-md border border-showroom-750 text-xs">
                        <span className="text-[10px] text-showroom-muted font-medium mr-0.5">
                          FIT
                        </span>

                        <button
                          onClick={() =>
                            setVerticalOffset(v =>
                              Number((v - 1).toFixed(1))
                            )
                          }
                          title="Raise frame slightly"
                          className="px-1.5 py-0.5 rounded bg-showroom-850 hover:bg-showroom-750 text-showroom-ivory text-[10px] font-bold"
                        >
                          ▲
                        </button>

                        <button
                          onClick={() =>
                            setVerticalOffset(v =>
                              Number((v + 1).toFixed(1))
                            )
                          }
                          title="Lower frame slightly"
                          className="px-1.5 py-0.5 rounded bg-showroom-850 hover:bg-showroom-750 text-showroom-ivory text-[10px] font-bold"
                        >
                          ▼
                        </button>

                        {verticalOffset !== 0 && (
                          <button
                            onClick={() => setVerticalOffset(0)}
                            title="Reset height offset"
                            className="text-[9px] text-showroom-cream hover:underline ml-1"
                          >
                            reset
                          </button>
                        )}
                      </div>

                      {/* Tablet/iPad Scale adjustment */}
                      {isTablet && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-showroom-950/85 backdrop-blur-md border border-showroom-750 text-xs">
                          <span className="text-[10px] text-showroom-muted font-medium mr-0.5">
                            SIZE
                          </span>
                          <button
                            onClick={() =>
                              setTabletScaleMultiplier(m =>
                                Number(Math.max(0.65, m - 0.03).toFixed(2))
                              )
                            }
                            title="Decrease glasses size on tablet"
                            className="px-1.5 py-0.5 rounded bg-showroom-850 hover:bg-showroom-750 text-showroom-ivory text-[10px] font-bold"
                          >
                            -
                          </button>
                          <span className="text-[10px] text-showroom-cream font-mono">
                            {Math.round(tabletScaleMultiplier * 100)}%
                          </span>
                          <button
                            onClick={() =>
                              setTabletScaleMultiplier(m =>
                                Number(Math.min(1.15, m + 0.03).toFixed(2))
                              )
                            }
                            title="Increase glasses size on tablet"
                            className="px-1.5 py-0.5 rounded bg-showroom-850 hover:bg-showroom-750 text-showroom-ivory text-[10px] font-bold"
                          >
                            +
                          </button>
                          {tabletScaleMultiplier !== DEFAULT_IPAD_SCALE_MULTIPLIER && (
                            <button
                              onClick={() => setTabletScaleMultiplier(DEFAULT_IPAD_SCALE_MULTIPLIER)}
                              title="Reset to default 85%"
                              className="text-[9px] text-showroom-cream hover:underline ml-1"
                            >
                              reset
                            </button>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() =>
                          setIsGlassesVisible(previous => !previous)
                        }
                        title={
                          isGlassesVisible
                            ? 'Hide spectacle overlay'
                            : 'Show spectacle overlay'
                        }
                        className="p-2.5 rounded-full bg-showroom-950/85 hover:bg-showroom-900 backdrop-blur-md border border-showroom-750 text-showroom-ivory hover:text-showroom-cream transition-colors touch-btn"
                      >
                        {isGlassesVisible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-showroom-muted" />
                        )}
                      </button>

                      <button
                        onClick={() =>
                          toggleFavourite(activeFrame.id)
                        }
                        title={
                          isFavourite(activeFrame.id)
                            ? 'Remove from favourites'
                            : 'Save to favourites'
                        }
                        className={`p-2.5 rounded-full backdrop-blur-md border transition-colors touch-btn ${isFavourite(activeFrame.id)
                          ? 'bg-rose-950/85 border-rose-600 text-rose-400'
                          : 'bg-showroom-950/85 hover:bg-showroom-900 border-showroom-750 text-showroom-ivory'
                          }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${isFavourite(activeFrame.id)
                            ? 'fill-current text-rose-400'
                            : ''
                            }`}
                        />
                      </button>

                      <button
                        onClick={handleRetakePhoto}
                        id="try-on-retake-btn"
                        title="Retake photo"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-showroom-950/85 hover:bg-showroom-900 backdrop-blur-md border border-showroom-750 text-xs font-medium text-showroom-ivory hover:text-showroom-cream transition-colors touch-btn"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          Retake
                        </span>
                      </button>
                    </div>
                  </div>

                  {glassesFit && !glassesFit.isDetected && (
                    <div className="absolute bottom-4 left-4 right-4 z-30 p-3 rounded-2xl bg-amber-950/85 backdrop-blur-md border border-amber-700/80 text-amber-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>
                          Facial landmarks were subtle; frame centered
                          automatically.
                        </span>
                      </div>

                      <button
                        onClick={handleRetakePhoto}
                        className="px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 font-medium text-[11px] uppercase tracking-wide"
                      >
                        Retake
                      </button>
                    </div>
                  )}
                </div>

                <div className="w-full p-3 rounded-2xl bg-showroom-900/60 border border-showroom-800 flex items-center justify-between text-xs text-showroom-muted">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                    <span>
                      Photo saved. Select a frame below to try it on.
                    </span>
                  </div>

                  <button
                    onClick={handleRetakePhoto}
                    className="text-showroom-cream hover:underline font-medium text-[11px] uppercase tracking-wider"
                  >
                    Retake Photo
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="p-6 rounded-3xl bg-showroom-900 border border-showroom-750 shadow-2xl flex flex-col justify-between">
                  <div>
                    {activeFrameScore && (
                      <div className="mb-4 p-3 rounded-2xl bg-showroom-950/70 border border-showroom-cream/30 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-showroom-cream block">
                            PREFERENCE MATCH
                          </span>
                          <span className="text-xs text-showroom-muted">
                            {activeFrameScore.matchReason ||
                              'Matches your style profile'}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="font-display font-extrabold text-xl text-showroom-cream">
                            {Math.round(
                              activeFrameScore.totalScore * 100
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-baseline justify-between mb-1">
                      <h2 className="font-display font-bold text-2xl text-white tracking-tight">
                        {activeFrame.name}
                      </h2>

                      <div className="text-right">
                        <span className="font-display font-bold text-lg text-showroom-cream">
                          ₹{activeFrame.price}
                        </span>
                        <span className="text-[9px] text-showroom-muted block">
                          Demo Price
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-showroom-muted mb-4 leading-relaxed">
                      {activeFrame.description}
                    </p>

                    <div className="space-y-2 text-xs border-t border-showroom-800 pt-3">
                      <div className="flex justify-between py-1 border-b border-showroom-850">
                        <span className="text-showroom-muted">Shape</span>
                        <span className="text-showroom-ivory font-medium">
                          {activeFrame.shape}
                        </span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-showroom-850">
                        <span className="text-showroom-muted">Color</span>
                        <span className="text-showroom-ivory font-medium">
                          {activeFrame.color}
                        </span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-showroom-850">
                        <span className="text-showroom-muted">
                          Size Fit
                        </span>
                        <span className="text-showroom-ivory font-medium">
                          {activeFrame.size}
                        </span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-showroom-850">
                        <span className="text-showroom-muted">
                          Material
                        </span>
                        <span className="text-showroom-ivory font-medium">
                          {activeFrame.material}
                        </span>
                      </div>

                      {activeFrame.dimensions && (
                        <div className="flex justify-between py-1">
                          <span className="text-showroom-muted">
                            Dimensions
                          </span>
                          <span className="text-showroom-ivory font-mono text-[11px]">
                            {activeFrame.dimensions.lensWidth} •{' '}
                            {activeFrame.dimensions.bridgeWidth} •{' '}
                            {activeFrame.dimensions.templeLength} mm
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-showroom-800 flex flex-col gap-2.5">
                    <button
                      onClick={() => {
                        addToCart(activeFrame, 1);
                        setAddedNotice(true);
                        window.setTimeout(
                          () => setAddedNotice(false),
                          2000
                        );
                      }}
                      id="try-on-add-to-cart-btn"
                      className="w-full py-3 px-4 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-kiosk-button transition-all touch-btn"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>
                        {addedNotice
                          ? 'ADDED TO CART!'
                          : 'ADD TO CART'}
                      </span>
                    </button>

                    <button
                      onClick={() => buyNow(activeFrame)}
                      id="try-on-buy-now-btn"
                      className="w-full py-3 px-4 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-showroom-cream font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all touch-btn"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>BUY NOW (CHECKOUT)</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() =>
                          toggleFavourite(activeFrame.id)
                        }
                        className={`py-2.5 px-3 rounded-full text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all touch-btn ${isFavourite(activeFrame.id)
                          ? 'bg-rose-950/60 border-rose-600 text-rose-300'
                          : 'bg-showroom-900 hover:bg-showroom-850 border-showroom-750 text-showroom-ivory'
                          }`}
                      >
                        <Heart
                          className={`w-3 h-3 ${isFavourite(activeFrame.id)
                            ? 'fill-current text-rose-400'
                            : ''
                            }`}
                        />
                        <span>
                          {isFavourite(activeFrame.id)
                            ? 'FAVOURITED'
                            : 'FAVOURITE'}
                        </span>
                      </button>

                      <button
                        onClick={() => goToScreen('pref-style')}
                        className="py-2.5 px-3 rounded-full bg-showroom-900 hover:bg-showroom-850 border border-showroom-750 text-showroom-muted hover:text-showroom-cream text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all touch-btn"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>FIND FRAMES</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-showroom-900 border border-showroom-750 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-showroom-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-showroom-cream" />
                    <span className="text-xs uppercase font-bold tracking-wider text-showroom-cream">
                      FRAME CATALOGUE ({filteredFrames.length} FRAMES)
                    </span>
                  </div>

                  <p className="text-[11px] text-showroom-muted mt-0.5">
                    Click any frame to preview it on your captured photo.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap transition-all touch-btn ${selectedCategory === category
                        ? 'bg-showroom-cream text-showroom-950 shadow-sm'
                        : 'bg-showroom-950/80 hover:bg-showroom-850 border border-showroom-800 text-showroom-muted hover:text-white'
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-80 overflow-y-auto pr-1">
                {filteredFrames.map(frame => {
                  const isSelected = selectedFrameId === frame.id;
                  const isFav = isFavourite(frame.id);

                  return (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrameId(frame.id)}
                      onMouseEnter={() => {
                        const match = frame.image?.match(/frame(\d+)/i) || frame.id?.match(/frame-(\d+)/i);
                        if (match) {
                          preloadFrameImage(`/images/frames/tryon/frame${String(parseInt(match[1], 10)).padStart(2, '0')}.png`);
                        }
                      }}
                      onTouchStart={() => {
                        const match = frame.image?.match(/frame(\d+)/i) || frame.id?.match(/frame-(\d+)/i);
                        if (match) {
                          preloadFrameImage(`/images/frames/tryon/frame${String(parseInt(match[1], 10)).padStart(2, '0')}.png`);
                        }
                      }}
                      className={`group relative flex flex-col p-2.5 rounded-2xl border text-left transition-all duration-200 touch-btn ${isSelected
                        ? 'bg-showroom-850 border-showroom-cream ring-2 ring-showroom-cream/50 shadow-kiosk-selected'
                        : 'bg-showroom-950/70 hover:bg-showroom-950 border-showroom-800 hover:border-showroom-700'
                        }`}
                    >
                      <div className="aspect-[16/10] w-full rounded-xl bg-showroom-900/60 p-1.5 flex items-center justify-center overflow-hidden mb-2">
                        <img
                          src={frame.image}
                          alt={frame.name}
                          decoding="async"
                          className="w-full h-full object-contain filter contrast-105 group-hover:scale-105 transition-transform"
                        />
                      </div>

                      <div className="flex items-baseline justify-between w-full">
                        <span
                          className={`font-display font-bold text-xs truncate ${isSelected
                            ? 'text-showroom-cream'
                            : 'text-white'
                            }`}
                        >
                          {frame.name}
                        </span>

                        {isFav && (
                          <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-showroom-muted mt-0.5">
                        <span className="truncate">{frame.shape}</span>
                        <span className="text-[9px] uppercase text-showroom-subtle">
                          {frame.color}
                        </span>
                      </div>

                      {frame.recommendationScore?.isRecommended && (
                        <div className="mt-1.5">
                          <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-showroom-cream/15 text-showroom-cream border border-showroom-cream/30 block text-center truncate">
                            {Math.round(
                              frame.recommendationScore.totalScore * 100
                            )}
                            % Match
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-showroom-850/80">
          <button
            onClick={() => goToScreen('home')}
            id="try-on-back-home-btn"
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-7 rounded-full bg-showroom-900 hover:bg-showroom-850 border border-showroom-700 text-showroom-ivory font-semibold text-xs uppercase tracking-wider transition-colors touch-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO HOME</span>
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => goToScreen('explore-frames')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-showroom-cream font-semibold text-xs uppercase tracking-wider transition-colors touch-btn"
            >
              <span>EXPLORE ALL 40 FRAMES</span>
            </button>

            <button
              onClick={() => goToScreen('pref-style')}
              id="try-on-find-frames-btn"
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-semibold text-xs uppercase tracking-wider shadow-kiosk-button transition-all touch-btn"
            >
              <span>FIND MY FRAMES</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};