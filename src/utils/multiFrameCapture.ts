import { NormalizedLandmark } from '../types';

export class MultiFrameCaptureBuffer {
  private frames: NormalizedLandmark[][] = [];
  private readonly targetCount: number;

  constructor(targetCount: number = 25) {
    this.targetCount = targetCount;
  }

  /**
   * Adds a valid landmark frame to the multi-frame capture buffer.
   * Returns true if target count is reached.
   */
  public addFrame(landmarks: NormalizedLandmark[]): boolean {
    if (!landmarks || landmarks.length < 468) return false;

    // Clone landmarks to prevent mutations
    const frameClone: NormalizedLandmark[] = landmarks.map(lm => ({
      x: lm.x,
      y: lm.y,
      z: lm.z
    }));

    this.frames.push(frameClone);
    return this.frames.length >= this.targetCount;
  }

  /**
   * Returns current captured frame count and target.
   */
  public getProgress(): { current: number; target: number; percentage: number } {
    const current = this.frames.length;
    const percentage = Math.min(100, Math.round((current / this.targetCount) * 100));
    return { current, target: this.targetCount, percentage };
  }

  /**
   * Checks if buffer is full and ready for landmark averaging.
   */
  public isComplete(): boolean {
    return this.frames.length >= this.targetCount;
  }

  /**
   * Computes the stabilized, robust averaged 3D landmark set across all captured frames.
   * Uses trimmed mean (discarding top/bottom 10% outlier frames per coordinate) when sufficient frames are present.
   */
  public getAveragedLandmarks(): NormalizedLandmark[] | null {
    if (this.frames.length === 0) return null;

    const numFrames = this.frames.length;
    const landmarkCount = this.frames[0].length;
    const averaged: NormalizedLandmark[] = new Array(landmarkCount);

    // Number of extreme values to trim from top & bottom if N >= 10
    const trimCount = numFrames >= 10 ? Math.floor(numFrames * 0.10) : 0;
    const effectiveCount = numFrames - (2 * trimCount);

    for (let i = 0; i < landmarkCount; i++) {
      const xVals: number[] = [];
      const yVals: number[] = [];
      const zVals: number[] = [];

      for (let f = 0; f < numFrames; f++) {
        const lm = this.frames[f][i];
        if (lm) {
          xVals.push(lm.x);
          yVals.push(lm.y);
          if (typeof lm.z === 'number') {
            zVals.push(lm.z);
          }
        }
      }

      // Sort for robust trimmed mean
      xVals.sort((a, b) => a - b);
      yVals.sort((a, b) => a - b);
      zVals.sort((a, b) => a - b);

      let sumX = 0;
      let sumY = 0;
      for (let k = trimCount; k < numFrames - trimCount; k++) {
        sumX += xVals[k];
        sumY += yVals[k];
      }

      let sumZ = 0;
      let countZ = 0;
      if (zVals.length > 0) {
        const zTrim = zVals.length >= 10 ? Math.floor(zVals.length * 0.10) : 0;
        for (let k = zTrim; k < zVals.length - zTrim; k++) {
          sumZ += zVals[k];
          countZ++;
        }
      }

      averaged[i] = {
        x: sumX / effectiveCount,
        y: sumY / effectiveCount,
        z: countZ > 0 ? sumZ / countZ : undefined
      };
    }

    return averaged;
  }

  /**
   * Clears the capture buffer.
   */
  public reset(): void {
    this.frames = [];
  }
}
