import { RawFacialMeasurements } from '../types';

export class MeasurementSmoother {
  private buffer: RawFacialMeasurements[] = [];
  private readonly maxBufferSize: number;
  private consecutiveValidFrames: number = 0;
  private readonly requiredStableFrames: number;

  constructor(maxBufferSize: number = 12, requiredStableFrames: number = 40) {
    this.maxBufferSize = maxBufferSize;
    this.requiredStableFrames = requiredStableFrames;
  }

  /**
   * Adds a new raw frame measurement and returns the smoothed moving average.
   */
  public smooth(raw: RawFacialMeasurements): RawFacialMeasurements {
    this.buffer.push(raw);
    this.consecutiveValidFrames++;

    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift();
    }

    const n = this.buffer.length;
    if (n === 1) return raw;

    let sumFaceWidth = 0;
    let sumFaceHeight = 0;
    let sumForeheadWidth = 0;
    let sumCheekboneWidth = 0;
    let sumJawWidth = 0;
    let sumChinWidth = 0;
    let sumEyeDistance = 0;

    for (let i = 0; i < n; i++) {
      const item = this.buffer[i];
      sumFaceWidth += item.faceWidth;
      sumFaceHeight += item.faceHeight;
      sumForeheadWidth += item.foreheadWidth;
      sumCheekboneWidth += item.cheekboneWidth;
      sumJawWidth += item.jawWidth;
      sumChinWidth += item.chinWidth || (item.jawWidth * 0.50);
      sumEyeDistance += item.eyeDistance;
    }

    const smoothedFaceWidth = sumFaceWidth / n;
    const smoothedFaceHeight = sumFaceHeight / n;
    const smoothedFaceRatio = smoothedFaceHeight > 0 ? smoothedFaceWidth / smoothedFaceHeight : 0;

    return {
      faceWidth: smoothedFaceWidth,
      faceHeight: smoothedFaceHeight,
      foreheadWidth: sumForeheadWidth / n,
      cheekboneWidth: sumCheekboneWidth / n,
      jawWidth: sumJawWidth / n,
      chinWidth: sumChinWidth / n,
      eyeDistance: sumEyeDistance / n,
      faceRatio: smoothedFaceRatio
    };
  }

  /**
   * Returns calibration / stability progress percentage (0 to 100).
   */
  public getStabilityProgress(): number {
    const progress = Math.min(100, Math.round((this.consecutiveValidFrames / this.requiredStableFrames) * 100));
    return progress;
  }

  /**
   * Checks if measurements have remained sufficiently stable over the sliding window.
   */
  public isStable(): boolean {
    if (this.consecutiveValidFrames < this.requiredStableFrames || this.buffer.length < this.maxBufferSize) {
      return false;
    }

    // Compute standard deviation of faceRatio across the buffer
    const ratios = this.buffer.map(m => m.faceRatio);
    const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    const variance = ratios.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratios.length;
    const stdDev = Math.sqrt(variance);

    // Face is considered stable if variance is within acceptable threshold (<= 0.02)
    return stdDev <= 0.02;
  }

  /**
   * Resets the smoothing and stability tracking (e.g. when face tracking is lost).
   */
  public reset(): void {
    this.buffer = [];
    this.consecutiveValidFrames = 0;
  }
}
