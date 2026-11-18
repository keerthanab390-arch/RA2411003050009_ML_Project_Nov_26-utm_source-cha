import { NormalizedLandmark, HeadPose } from '../types';
import { calculateDistance, ANATOMICAL_CLUSTERS, calculateClusterCentroid } from './landmarkMeasurements';
import { POSTURE_CONFIG } from './postureConfig';

/**
 * Estimates 3D head orientation (Yaw, Pitch, Roll in degrees) from MediaPipe facial landmarks.
 */
export function estimateHeadPose(landmarks: NormalizedLandmark[]): HeadPose {
  if (!landmarks || landmarks.length < 468) {
    return { yaw: 0, pitch: 0, roll: 0, isAcceptable: false };
  }

  // Key landmark indices
  const noseTip = landmarks[1];
  const foreheadTop = landmarks[10];
  const chinBottom = landmarks[152];
  const leftCheek = landmarks[454];
  const rightCheek = landmarks[234];

  const leftEye = calculateClusterCentroid(landmarks, ANATOMICAL_CLUSTERS.LEFT_EYE);
  const rightEye = calculateClusterCentroid(landmarks, ANATOMICAL_CLUSTERS.RIGHT_EYE);

  if (!noseTip || !foreheadTop || !chinBottom || !leftCheek || !rightCheek || !leftEye || !rightEye) {
    return { yaw: 0, pitch: 0, roll: 0, isAcceptable: false };
  }

  // 1. Calculate Roll (Head tilt in degrees)
  const eyeDx = rightEye.x - leftEye.x;
  const eyeDy = rightEye.y - leftEye.y;
  const rawRollRad = Math.atan2(eyeDy, eyeDx);
  const rollDeg = (rawRollRad * 180) / Math.PI;

  // 2. Calculate Yaw (Left/Right rotation in degrees)
  const distLeft = calculateDistance(noseTip, leftCheek);
  const distRight = calculateDistance(noseTip, rightCheek);
  const totalCheekDist = distLeft + distRight;
  
  let yawDeg = 0;
  if (totalCheekDist > 0) {
    const yawAsymmetry = (distLeft - distRight) / totalCheekDist;
    // Normalized multiplier maps cheek asymmetry ratio directly to angular degrees
    yawDeg = yawAsymmetry * 85.0;
  }

  // 3. Calculate Pitch (Looking Up/Down in degrees)
  const distUpper = calculateDistance(foreheadTop, noseTip);
  const distLower = calculateDistance(noseTip, chinBottom);
  const totalHeight = distUpper + distLower;

  let pitchDeg = 0;
  if (totalHeight > 0) {
    // In neutral frontal posture, upper section occupies ~0.50 of vertical height
    const verticalRatio = distUpper / totalHeight;
    const pitchOffset = verticalRatio - 0.50;
    pitchDeg = pitchOffset * 110.0;
  }

  // 4. Verify whether pose is within acceptable tolerances
  const isAcceptable = 
    Math.abs(yawDeg) <= POSTURE_CONFIG.MAX_YAW_DEG &&
    Math.abs(pitchDeg) <= POSTURE_CONFIG.MAX_PITCH_DEG &&
    Math.abs(rollDeg) <= POSTURE_CONFIG.MAX_ROLL_DEG;

  return {
    yaw: yawDeg,
    pitch: pitchDeg,
    roll: rollDeg,
    isAcceptable
  };
}
