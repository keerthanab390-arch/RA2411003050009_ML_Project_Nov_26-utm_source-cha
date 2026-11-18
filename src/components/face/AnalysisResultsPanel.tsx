import React from 'react';
import { useApp } from '../../context/AppContext';
import { FaceShapeOvalGraphic } from '../common/EyewearIcons';
import { getFaceShapeMetadata } from '../../utils/faceShapeEstimator';
import { Info } from 'lucide-react';

export const AnalysisResultsPanel: React.FC = () => {
  const { analysisData, goToScreen } = useApp();
  const { faceShape = 'Oval', measurements } = analysisData;
  const shapeMeta = getFaceShapeMetadata(faceShape);

  const measurementRows = [
    { label: 'Face Width', value: measurements?.faceWidth ?? '—' },
    { label: 'Face Height', value: measurements?.faceHeight ?? '—' },
    { label: 'Face Ratio', value: measurements?.faceRatio ?? '—' },
    { label: 'Forehead Width', value: measurements?.foreheadWidth ?? '—' },
    { label: 'Cheekbone Width', value: measurements?.cheekboneWidth ?? '—' },
    { label: 'Jaw Width', value: measurements?.jawWidth ?? '—' },
    { label: 'Eye Distance', value: measurements?.eyeDistance ?? '—' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-between px-4 sm:px-8 py-4 max-w-lg mx-auto w-full">
      
      {/* Header Info */}
      <div className="text-center mt-2 mb-6">
        <h1 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight uppercase">
          YOUR PROFILE
        </h1>
        <p className="text-xs sm:text-sm text-showroom-muted font-normal mt-0.5">
          Here's what we found
        </p>
      </div>

      {/* Main Analysis Card */}
      <div className="w-full rounded-3xl bg-showroom-900 border border-showroom-750/90 shadow-2xl p-6 sm:p-7 flex flex-col gap-6">
        
        {/* Face Shape Highlight Header */}
        <div className="flex items-center justify-between border-b border-showroom-800 pb-5">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-showroom-muted font-semibold block mb-1">
              YOUR FACE SHAPE
            </span>
            <span className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight uppercase">
              {faceShape}
            </span>
            <p className="text-xs text-showroom-muted mt-1 max-w-xs leading-relaxed">
              {shapeMeta.description}
            </p>
          </div>

          {/* Wireframe Contour Graphic */}
          <div className="w-20 h-24 sm:w-24 sm:h-28 flex items-center justify-center p-1 bg-showroom-950/60 rounded-2xl border border-showroom-800 shrink-0">
            <FaceShapeOvalGraphic className="w-full h-full text-showroom-cream" />
          </div>
        </div>

        {/* Measurements Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-showroom-cream font-semibold">
              FACE DETAILS
            </span>
            <span className="text-[10px] uppercase tracking-wider text-showroom-subtle font-medium">
              READY
            </span>
          </div>

          <p className="text-[11px] text-showroom-muted mb-3 italic">
            A few measurements that help us find the right fit
          </p>

          <div className="space-y-2.5">
            {measurementRows.map((row, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-showroom-850 last:border-0"
              >
                <span className="text-showroom-muted font-medium">
                  {row.label}
                </span>
                <span className="font-display font-semibold text-showroom-ivory tracking-wide">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-showroom-800/80 flex items-start gap-2 text-[10px] text-showroom-subtle">
          <Info className="w-3.5 h-3.5 text-showroom-cream shrink-0 mt-0.5" />
          <span>Your measurements help us narrow down frames that complement your features.</span>
        </div>

      </div>

      {/* Bottom Action: CONTINUE Button */}
      <div className="w-full mt-8 mb-4">
        <button
          onClick={() => goToScreen('pref-style')}
          id="kiosk-continue-to-preferences-btn"
          className="w-full flex items-center justify-center py-4 px-8 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-semibold text-sm sm:text-base tracking-wider uppercase shadow-kiosk-button transition-all touch-btn"
        >
          <span>CONTINUE</span>
        </button>
      </div>

    </div>
  );
};
