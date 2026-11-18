import React from 'react';
import { CameraStatus } from '../../hooks/useWebcam';
import { AnalysisStage, PostureValidationResult } from '../../types';
import {
  Camera,
  CameraOff,
  Video,
  AlertCircle,
  Loader2,
  RefreshCw,
  SwitchCamera,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface WebcamViewportProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  status: CameraStatus;
  errorMessage: string | null;
  isModelLoading: boolean;
  isModelReady: boolean;
  stage: AnalysisStage;
  postureResult: PostureValidationResult;
  guidanceText: string;
  countdownValue: number;
  captureProgress: number;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onSwitchCamera?: () => void;
  hasMultipleCameras?: boolean;
  onCapturePhoto?: () => void;
}

export const WebcamViewport: React.FC<WebcamViewportProps> = ({
  videoRef,
  canvasRef,
  status,
  errorMessage,
  isModelLoading,
  isModelReady,
  stage,
  postureResult,
  guidanceText,
  countdownValue,
  captureProgress,
  onStartCamera,
  onStopCamera,
  onSwitchCamera,
  hasMultipleCameras,
  onCapturePhoto
}) => {
  const isActive = status === 'active';
  const isRequesting = status === 'requesting';

  const { primaryIssue } = postureResult;

  const isCountingDown = stage === 'countdown';
  const isCapturing = stage === 'capturing';
  const isProcessing = stage === 'processing';
  const isComplete = stage === 'complete';
  const isReady = stage === 'ready' || stage === 'holding-stable';
  const isAdjusting = stage === 'adjusting-position';

  // Dynamic border styling for the designated face guide
  const getGuideBorderClass = () => {
    if (!isActive) return 'border-showroom-700/50 border-dashed';
    if (isComplete) return 'border-emerald-400/90 border-solid shadow-[0_0_25px_rgba(52,211,153,0.25)]';
    if (isCapturing || isProcessing) return 'border-emerald-400 border-solid animate-pulse shadow-[0_0_25px_rgba(52,211,153,0.35)]';
    if (isCountingDown) return 'border-showroom-cream border-solid shadow-[0_0_25px_rgba(232,215,195,0.30)]';
    if (isReady) return 'border-showroom-cream border-solid shadow-[0_0_20px_rgba(232,215,195,0.20)]';
    if (isAdjusting) return 'border-amber-400/80 border-dashed shadow-[0_0_15px_rgba(251,191,36,0.15)]';
    return 'border-showroom-cream/60 border-dashed';
  };

  // Dynamic corner bracket styling
  const getBracketBorderColor = () => {
    if (isComplete || isCapturing || isProcessing) return 'border-emerald-400/90';
    if (isReady || isCountingDown) return 'border-showroom-cream';
    if (isAdjusting) return 'border-amber-400/80';
    return 'border-showroom-cream/60';
  };

  // Dynamic status badge label
  const getStatusBadgeLabel = () => {
    if (isComplete) return 'ALL SET';
    if (isProcessing) return 'FINDING YOUR FIT';
    if (isCapturing) return `GETTING A CLEAR READ (${captureProgress}%)`;
    if (isCountingDown) return `STARTING IN ${countdownValue}...`;
    if (isReady) return 'HOLD STILL';
    if (isAdjusting) return 'ALMOST THERE';
    if (isActive) return 'CHECKING YOUR FIT';
    if (isRequesting) return 'CONNECTING...';
    if (status === 'denied') return 'ACCESS NEEDED';
    if (status === 'stopped') return 'PAUSED';
    return 'STANDBY';
  };

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/10] rounded-3xl overflow-hidden bg-showroom-950 border border-showroom-750 shadow-2xl flex flex-col justify-between p-4 sm:p-6 group">
      
      {/* Background Live Video Feed */}
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center bg-[#07080B]">
        {/* HTML5 Webcam Video Element */}
        <video
          ref={videoRef as React.RefObject<HTMLVideoElement>}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-500 ${
            isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Real-time MediaPipe Facial Landmark & Measurement Lines Canvas Overlay */}
        <canvas
          ref={canvasRef as React.RefObject<HTMLCanvasElement>}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none z-10 transition-opacity duration-300 ${
            isActive ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Shutter Flash Animation on multi-frame capture start */}
        {isCapturing && (
          <div className="absolute inset-0 bg-white/10 pointer-events-none z-15 animate-pulse" />
        )}

        {/* State 1: Idle (Not Started) */}
        {status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-showroom-950/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-full bg-showroom-900 border border-showroom-700/80 flex items-center justify-center text-showroom-cream mb-5 shadow-2xl">
              <Camera className="w-9 h-9 stroke-[1.8]" />
            </div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight mb-2">
              Camera Access Needed
            </h3>
            <p className="text-xs sm:text-sm text-showroom-muted max-w-sm mb-6 leading-relaxed">
              Allow camera access to begin your face analysis. Your video feed is processed privately on your device.
            </p>
            <button
              onClick={onStartCamera}
              id="webcam-start-permission-btn"
              className="flex items-center gap-2.5 py-3.5 px-8 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-semibold text-xs sm:text-sm tracking-wider uppercase shadow-kiosk-button transition-all touch-btn"
            >
              <Video className="w-4 h-4 stroke-[2.5]" />
              <span>Enable Camera</span>
            </button>
          </div>
        )}

        {/* State 2: Requesting Permission */}
        {isRequesting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-showroom-950/95 backdrop-blur-sm animate-in fade-in duration-200">
            <Loader2 className="w-12 h-12 text-showroom-cream animate-spin mb-4" />
            <h3 className="font-display font-semibold text-lg text-white mb-1">
              Starting Camera
            </h3>
            <p className="text-xs text-showroom-muted max-w-xs">
              Please click "Allow" in your browser prompt to activate your camera.
            </p>
          </div>
        )}

        {/* State 4: Permission Denied */}
        {status === 'denied' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-showroom-950/95 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-800/80 flex items-center justify-center text-red-400 mb-4">
              <CameraOff className="w-8 h-8" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-2">
              Camera Access Blocked
            </h3>
            <p className="text-xs text-showroom-muted max-w-md mb-6 leading-relaxed">
              {errorMessage || "We couldn't get a clear view. Please allow camera access in your browser settings and try again."}
            </p>
            <button
              onClick={onStartCamera}
              className="flex items-center gap-2 py-3 px-6 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-showroom-cream text-xs font-semibold uppercase tracking-wider transition-all touch-btn"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* State 5: Camera Unavailable / Hardware Error */}
        {status === 'unavailable' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-showroom-950/95 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-950/40 border border-amber-700/60 flex items-center justify-center text-showroom-cream mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-2">
              Camera Not Found
            </h3>
            <p className="text-xs text-showroom-muted max-w-sm mb-6 leading-relaxed">
              {errorMessage || "We couldn't detect a camera. Please ensure your camera is connected and not in use by another app."}
            </p>
            <button
              onClick={onStartCamera}
              className="flex items-center gap-2 py-3 px-6 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-showroom-cream text-xs font-semibold uppercase tracking-wider transition-all touch-btn"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* State 6: Stopped (User paused) */}
        {status === 'stopped' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-showroom-950/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-showroom-900 border border-showroom-750 flex items-center justify-center text-showroom-muted mb-4">
              <CameraOff className="w-8 h-8" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-1">
              Camera Paused
            </h3>
            <p className="text-xs text-showroom-muted max-w-xs mb-6">
              Camera has been turned off. Click below to resume.
            </p>
            <button
              onClick={onStartCamera}
              className="flex items-center gap-2 py-3 px-7 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 text-xs font-semibold uppercase tracking-wider shadow-kiosk-button transition-all touch-btn"
            >
              <Video className="w-4 h-4" />
              <span>Resume Camera</span>
            </button>
          </div>
        )}
      </div>

      {/* Subtle Corner Framing Brackets [ ] with reactive border colors */}
      <div className={`absolute top-5 left-5 w-7 h-7 border-t-2 border-l-2 ${getBracketBorderColor()} pointer-events-none z-10 transition-colors duration-300`} />
      <div className={`absolute top-5 right-5 w-7 h-7 border-t-2 border-r-2 ${getBracketBorderColor()} pointer-events-none z-10 transition-colors duration-300`} />
      <div className={`absolute bottom-5 left-5 w-7 h-7 border-b-2 border-l-2 ${getBracketBorderColor()} pointer-events-none z-10 transition-colors duration-300`} />
      <div className={`absolute bottom-5 right-5 w-7 h-7 border-b-2 border-r-2 ${getBracketBorderColor()} pointer-events-none z-10 transition-colors duration-300`} />

      {/* Designated Face-Positioning Guide / Oval with Real Countdown & Capture Overlays */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <div
          className={`relative w-52 h-72 sm:w-60 sm:h-84 md:w-64 md:h-88 rounded-[50%/60%_60%_40%_40%] border transition-all duration-300 flex items-center justify-center ${getGuideBorderClass()}`}
        >
          {/* Subtle Center Horizon Crossline */}
          <div className="w-12 h-[1px] bg-showroom-cream/20" />

          {/* Large Countdown Overlay (3, 2, 1) */}
          {isCountingDown && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-showroom-950/40 backdrop-blur-[2px] rounded-[50%/60%_60%_40%_40%] animate-in zoom-in duration-200">
              <span className="font-display font-extrabold text-6xl sm:text-7xl text-showroom-cream drop-shadow-2xl animate-pulse">
                {countdownValue}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-showroom-ivory font-semibold mt-2">
                Hold Still
              </span>
            </div>
          )}

          {/* Multi-Frame Capturing Indicator */}
          {(isCapturing || isProcessing) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-showroom-950/50 backdrop-blur-[2px] rounded-[50%/60%_60%_40%_40%] animate-in fade-in duration-150">
              <Sparkles className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
              <span className="font-semibold text-sm sm:text-base text-emerald-300 uppercase tracking-wide">
                {isProcessing ? 'FINDING YOUR FIT' : 'GETTING A CLEAR READ'}
              </span>
              <span className="text-[11px] font-display font-medium text-emerald-400/90 mt-1">
                {isProcessing ? 'Looking at your face shape and proportions...' : `${captureProgress}%`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Top Status Bar Over Video */}
      <div className="relative z-20 flex items-center justify-between w-full">
        {/* Status Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-showroom-950/85 backdrop-blur-md border border-showroom-700/80 text-xs font-medium text-showroom-ivory shadow-lg">
          <div
            className={`w-2 h-2 rounded-full ${
              isComplete
                ? 'bg-emerald-400'
                : isCapturing || isProcessing
                ? 'bg-emerald-400 animate-ping'
                : isCountingDown
                ? 'bg-showroom-cream animate-pulse'
                : isReady
                ? 'bg-showroom-cream'
                : isAdjusting
                ? 'bg-amber-400 animate-pulse'
                : isActive
                ? 'bg-emerald-400/80'
                : isRequesting
                ? 'bg-amber-400 animate-spin'
                : 'bg-showroom-muted'
            }`}
          />
          <span className="uppercase tracking-wide">
            {getStatusBadgeLabel()}
          </span>
        </div>

        {/* MediaPipe Vision Engine Badge */}
        <div className="flex items-center gap-2">
          {isActive && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-showroom-950/85 backdrop-blur-md border border-showroom-750 text-[11px] font-medium text-showroom-cream">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isModelLoading ? 'Preparing...' : isModelReady ? 'Ready' : 'Checking your fit'}</span>
            </div>
          )}

          {/* Switch Camera if multiple cameras exist */}
          {isActive && hasMultipleCameras && onSwitchCamera && (
            <button
              onClick={onSwitchCamera}
              title="Switch Camera"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-showroom-950/80 hover:bg-showroom-900 border border-showroom-700 text-xs text-showroom-muted hover:text-white transition-colors touch-btn"
            >
              <SwitchCamera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Switch</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Guidance Pill & Camera Quick Controls */}
      <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border text-xs sm:text-sm font-medium shadow-lg transition-all ${
          isComplete || isCapturing || isProcessing
            ? 'bg-emerald-950/90 border-emerald-700/80 text-emerald-300'
            : isCountingDown || isReady
            ? 'bg-showroom-900/95 border-showroom-cream text-showroom-cream font-semibold'
            : isAdjusting && primaryIssue !== 'none' && primaryIssue !== 'no-face'
            ? 'bg-amber-950/90 border-amber-700/80 text-amber-300'
            : 'bg-showroom-950/85 border-showroom-800 text-showroom-ivory'
        }`}>
          {isComplete || isCapturing || isProcessing ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : isCountingDown || isReady ? (
            <CheckCircle2 className="w-4 h-4 text-showroom-cream shrink-0" />
          ) : isAdjusting && primaryIssue !== 'none' && primaryIssue !== 'no-face' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-showroom-muted shrink-0" />
          )}
          <span>{guidanceText}</span>
        </div>

        <div className="flex items-center gap-2">
          {isActive && onCapturePhoto && (
            <button
              onClick={onCapturePhoto}
              id="webcam-capture-btn"
              className="flex items-center gap-2 py-2 px-5 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-semibold text-xs tracking-wider uppercase shadow-kiosk-button transition-all touch-btn"
            >
              <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Capture Photo</span>
            </button>
          )}

          {isActive && (
            <button
              onClick={onStopCamera}
              id="webcam-stop-btn"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-showroom-950/85 hover:bg-showroom-900 border border-showroom-700 text-xs font-semibold text-showroom-muted hover:text-red-300 transition-colors touch-btn"
            >
              <CameraOff className="w-3.5 h-3.5 text-red-400" />
              <span>Stop Camera</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
