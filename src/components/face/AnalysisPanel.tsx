import React from 'react';
import {
  RawFacialMeasurements,
  FacialFeatures,
  FaceShape,
  AnalysisStage,
  PostureValidationResult
} from '../../types';
import {
  Check,
  Circle,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Compass,
  ShieldCheck
} from 'lucide-react';

interface AnalysisPanelProps {
  isCameraActive: boolean;
  stage: AnalysisStage;
  postureResult: PostureValidationResult;
  countdownValue: number;
  captureProgress: number;
  landmarkCount: number;
  measurements?: RawFacialMeasurements | null;
  features?: FacialFeatures | null;
  estimatedShape?: FaceShape | null;
  onRestartAnalysis: () => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  isCameraActive,
  stage,
  postureResult,
  countdownValue,
  captureProgress,
  landmarkCount,
  onRestartAnalysis
}) => {
  const isComplete = stage === 'complete';

  const {
    isCentered,
    isDistanceAcceptable,
    isPoseAcceptable,
    isLandmarkQualityGood,
    headPose
  } = postureResult;

  return (
    <div className="flex flex-col gap-5 w-full">
      
      {/* 1. Analysis Pipeline Stages & Posture Verification Card */}
      <div className="p-6 rounded-3xl bg-showroom-900 border border-showroom-750 shadow-2xl">
        <div className="flex items-center justify-between border-b border-showroom-800 pb-3.5 mb-4">
          <span className="text-[10px] uppercase tracking-wider text-showroom-cream font-semibold block">
            {isComplete ? 'ALL SET' : 'CHECKING YOUR FIT'}
          </span>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${
            isComplete
              ? 'text-emerald-400'
              : stage === 'capturing'
              ? 'text-emerald-300 animate-pulse'
              : stage === 'countdown'
              ? 'text-showroom-cream'
              : stage === 'ready' || stage === 'holding-stable'
              ? 'text-showroom-cream'
              : isCameraActive
              ? 'text-amber-400'
              : 'text-showroom-muted'
          }`}>
            {isComplete
              ? 'ALL SET'
              : stage === 'capturing'
              ? `GETTING A CLEAR READ (${captureProgress}%)`
              : stage === 'countdown'
              ? `STARTING IN ${countdownValue}s`
              : stage === 'holding-stable'
              ? 'HOLD STILL'
              : stage === 'ready'
              ? 'READY'
              : isCameraActive
              ? 'GETTING READY'
              : 'OFFLINE'}
          </span>
        </div>

        {/* Multi-Step Pipeline Status */}
        <div className="space-y-2.5 text-xs">
          
          {/* Step 1: Face Detection */}
          <div className="flex items-center justify-between py-1 border-b border-showroom-850">
            <span className="text-showroom-ivory font-medium">1. Face in view</span>
            {landmarkCount > 0 && isLandmarkQualityGood ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>We can see you</span>
              </div>
            ) : isCameraActive ? (
              <div className="flex items-center gap-1.5 text-xs text-showroom-muted">
                <Loader2 className="w-3 h-3 animate-spin text-showroom-cream" />
                <span>Detecting</span>
              </div>
            ) : (
              <Circle className="w-3 h-3 text-showroom-subtle" />
            )}
          </div>

          {/* Step 2: Position & Distance */}
          <div className="flex items-center justify-between py-1 border-b border-showroom-850">
            <span className="text-showroom-ivory font-medium">2. Your position</span>
            {isCentered && isDistanceAcceptable ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Centered</span>
              </div>
            ) : landmarkCount > 0 ? (
              <span className="text-[11px] text-amber-400 font-medium">
                {!isDistanceAcceptable ? 'Move a little closer' : 'Center face'}
              </span>
            ) : (
              <Circle className="w-3 h-3 text-showroom-subtle" />
            )}
          </div>

          {/* Step 3: Head Orientation */}
          <div className="flex items-center justify-between py-1 border-b border-showroom-850">
            <span className="text-showroom-ivory font-medium">3. Head position</span>
            {isPoseAcceptable ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Centered</span>
              </div>
            ) : landmarkCount > 0 ? (
              <span className="text-[11px] text-amber-400 font-medium">
                {Math.abs(headPose.roll) > 7.5 ? 'Keep your head straight' : Math.abs(headPose.yaw) > 12 ? 'Look straight at the camera' : 'Keep your head straight'}
              </span>
            ) : (
              <Circle className="w-3 h-3 text-showroom-subtle" />
            )}
          </div>

          {/* Step 4: Multi-Frame Capture */}
          <div className="flex items-center justify-between py-1 border-b border-showroom-850">
            <span className="text-showroom-ivory font-medium">4. Face details</span>
            {isComplete ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Complete</span>
              </div>
            ) : stage === 'capturing' ? (
              <div className="flex items-center gap-1 text-xs text-emerald-300 font-semibold animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                <span>{captureProgress}%</span>
              </div>
            ) : stage === 'countdown' ? (
              <span className="text-[11px] text-showroom-cream font-semibold">
                Starting in {countdownValue}s
              </span>
            ) : (
              <Circle className="w-3 h-3 text-showroom-subtle" />
            )}
          </div>

          {/* Step 5: Face Shape Estimation */}
          <div className="flex items-center justify-between py-1">
            <span className="text-showroom-ivory font-medium">5. Face shape</span>
            {isComplete ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Complete</span>
              </div>
            ) : (
              <Circle className="w-3 h-3 text-showroom-subtle" />
            )}
          </div>

        </div>

        {/* Live Head Pose Angles Telemetry Box (Active during alignment) */}
        {!isComplete && isCameraActive && landmarkCount > 0 && (
          <div className="mt-4 pt-3 border-t border-showroom-800 bg-showroom-950/60 p-3 rounded-2xl border border-showroom-800">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-showroom-muted font-medium mb-2">
              <div className="flex items-center gap-1.5 text-showroom-cream">
                <Compass className="w-3 h-3" />
                <span>YOUR POSITION</span>
              </div>
              <span className={headPose.isAcceptable ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                {headPose.isAcceptable ? 'CENTERED' : 'ALMOST THERE'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-1.5 rounded-xl bg-showroom-900 border border-showroom-800">
                <span className="text-[9px] text-showroom-muted block font-sans">TURN</span>
                <span className={`font-bold ${Math.abs(headPose.yaw) <= 12 ? 'text-white' : 'text-amber-400'}`}>
                  {headPose.yaw >= 0 ? `+${headPose.yaw.toFixed(1)}°` : `${headPose.yaw.toFixed(1)}°`}
                </span>
              </div>

              <div className="p-1.5 rounded-xl bg-showroom-900 border border-showroom-800">
                <span className="text-[9px] text-showroom-muted block font-sans">TILT</span>
                <span className={`font-bold ${Math.abs(headPose.pitch) <= 12 ? 'text-white' : 'text-amber-400'}`}>
                  {headPose.pitch >= 0 ? `+${headPose.pitch.toFixed(1)}°` : `${headPose.pitch.toFixed(1)}°`}
                </span>
              </div>

              <div className="p-1.5 rounded-xl bg-showroom-900 border border-showroom-800">
                <span className="text-[9px] text-showroom-muted block font-sans">LEVEL</span>
                <span className={`font-bold ${Math.abs(headPose.roll) <= 7.5 ? 'text-white' : 'text-amber-400'}`}>
                  {headPose.roll >= 0 ? `+${headPose.roll.toFixed(1)}°` : `${headPose.roll.toFixed(1)}°`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Real Completion Confirmation Banner */}
        {isComplete && (
          <div className="mt-4 pt-3 border-t border-showroom-800 bg-emerald-950/30 p-3 rounded-2xl border border-emerald-800/60 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-display font-bold block uppercase tracking-wide">ALL SET</span>
                <span className="text-[11px] text-emerald-200/80">We've got what we need.</span>
              </div>
            </div>

            <button
              onClick={onRestartAnalysis}
              id="reanalyze-btn"
              title="Reset analysis and re-capture"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-[11px] font-semibold text-showroom-cream uppercase tracking-wider transition-colors touch-btn"
            >
              <RotateCcw className="w-3 h-3" />
              <span>START OVER</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Photo & Alignment Status Card */}
      <div className="p-6 rounded-3xl bg-showroom-900 border border-showroom-750 shadow-2xl">
        <div className="flex items-center justify-between border-b border-showroom-800 pb-3 mb-4">
          <span className="text-[10px] uppercase tracking-wider text-showroom-cream font-semibold block">
            VIRTUAL TRY-ON FIT
          </span>
          <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
            {isComplete ? 'READY' : isCameraActive ? 'DETECTING' : 'STANDBY'}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-showroom-850">
            <span className="text-showroom-muted">Eye Landmarks</span>
            <span className={isComplete ? "text-emerald-400 font-medium" : "text-showroom-ivory"}>
              {isComplete ? "Aligned" : isCameraActive ? "Tracking" : "Awaiting Camera"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-showroom-850">
            <span className="text-showroom-muted">Scale Calibration</span>
            <span className={isComplete ? "text-emerald-400 font-medium" : "text-showroom-ivory"}>
              {isComplete ? "Calibrated" : "Auto"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-showroom-muted">Available Frames</span>
            <span className="text-showroom-cream font-medium">
              40 Styles Ready
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-showroom-800 flex items-start gap-2 text-[10px] text-showroom-subtle">
          <ShieldCheck className="w-3.5 h-3.5 text-showroom-cream shrink-0 mt-0.5" />
          <span>Facial landmarks are processed locally in your browser for real-time virtual frame positioning.</span>
        </div>
      </div>

    </div>
  );
};
