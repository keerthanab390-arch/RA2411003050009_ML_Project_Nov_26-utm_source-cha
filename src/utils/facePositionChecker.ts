import {
  NormalizedLandmark,
  FaceBoundingBox,
  PostureValidationResult,
  PostureIssue
} from '../types';
import { POSTURE_CONFIG } from './postureConfig';
import { estimateHeadPose } from './headPoseEstimator';
import { validateLandmarkQuality } from './landmarkMeasurements';

/**
 * Calculates the 2D bounding box and center coordinate of detected facial landmarks.
 */
export function calculateFaceBoundingBox(landmarks: NormalizedLandmark[]): FaceBoundingBox | null {
  if (!landmarks || landmarks.length < 468) return null;

  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;

  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    if (lm && typeof lm.x === 'number' && typeof lm.y === 'number') {
      if (lm.x < xMin) xMin = lm.x;
      if (lm.x > xMax) xMax = lm.x;
      if (lm.y < yMin) yMin = lm.y;
      if (lm.y > yMax) yMax = lm.y;
    }
  }

  if (xMin === Infinity || xMax === -Infinity || yMin === Infinity || yMax === -Infinity) {
    return null;
  }

  const width = xMax - xMin;
  const height = yMax - yMin;
  const centerX = (xMin + xMax) / 2;
  const centerY = (yMin + yMax) / 2;

  return {
    xMin,
    xMax,
    yMin,
    yMax,
    centerX,
    centerY,
    width,
    height
  };
}

/**
 * Evaluates face position, distance, head orientation, and quality to return prioritized posture guidance.
 * Note: isMirrored handles horizontal video mirroring for user movement directions (e.g. left vs right).
 */
export function validateFacePosture(
  landmarks: NormalizedLandmark[] | undefined | null,
  isMirrored: boolean = true
): PostureValidationResult {
  // Default empty state
  if (!landmarks || landmarks.length < 468) {
    return {
      isFullyReady: false,
      primaryIssue: 'no-face',
      instruction: 'Look straight at the camera',
      guideColorState: 'neutral',
      isCentered: false,
      isDistanceAcceptable: false,
      isPoseAcceptable: false,
      isLandmarkQualityGood: false,
      headPose: { yaw: 0, pitch: 0, roll: 0, isAcceptable: false },
      boundingBox: null
    };
  }

  // 1. Validate basic landmark quality and bounds
  const isLandmarkQualityGood = validateLandmarkQuality(landmarks);
  if (!isLandmarkQualityGood) {
    return {
      isFullyReady: false,
      primaryIssue: 'low-quality',
      instruction: 'Keep your face visible in good light',
      guideColorState: 'adjusting',
      isCentered: false,
      isDistanceAcceptable: false,
      isPoseAcceptable: false,
      isLandmarkQualityGood: false,
      headPose: { yaw: 0, pitch: 0, roll: 0, isAcceptable: false },
      boundingBox: null
    };
  }

  const bbox = calculateFaceBoundingBox(landmarks);
  if (!bbox) {
    return {
      isFullyReady: false,
      primaryIssue: 'no-face',
      instruction: 'Look straight at the camera',
      guideColorState: 'neutral',
      isCentered: false,
      isDistanceAcceptable: false,
      isPoseAcceptable: false,
      isLandmarkQualityGood: false,
      headPose: { yaw: 0, pitch: 0, roll: 0, isAcceptable: false },
      boundingBox: null
    };
  }

  // 2. Check Distance / Size
  const isDistanceAcceptable =
    bbox.height >= POSTURE_CONFIG.MIN_FACE_HEIGHT_RATIO &&
    bbox.height <= POSTURE_CONFIG.MAX_FACE_HEIGHT_RATIO;

  // 3. Check Centering
  const minX = POSTURE_CONFIG.CENTER_TARGET_X - POSTURE_CONFIG.CENTER_TOLERANCE_X;
  const maxX = POSTURE_CONFIG.CENTER_TARGET_X + POSTURE_CONFIG.CENTER_TOLERANCE_X;
  const minY = POSTURE_CONFIG.CENTER_TARGET_Y - POSTURE_CONFIG.CENTER_TOLERANCE_Y;
  const maxY = POSTURE_CONFIG.CENTER_TARGET_Y + POSTURE_CONFIG.CENTER_TOLERANCE_Y;

  const isCenteredX = bbox.centerX >= minX && bbox.centerX <= maxX;
  const isCenteredY = bbox.centerY >= minY && bbox.centerY <= maxY;
  const isCentered = isCenteredX && isCenteredY;

  // 4. Check Head Orientation (Pose)
  const headPose = estimateHeadPose(landmarks);
  const isPoseAcceptable = headPose.isAcceptable;

  // 5. Determine Single Prioritized Actionable Feedback
  let primaryIssue: PostureIssue = 'none';
  let instruction = 'Hold still';

  if (!isDistanceAcceptable) {
    if (bbox.height < POSTURE_CONFIG.MIN_FACE_HEIGHT_RATIO) {
      primaryIssue = 'too-far';
      instruction = 'Move a little closer';
    } else {
      primaryIssue = 'too-close';
      instruction = 'Move slightly back';
    }
  } else if (!isCentered) {
    if (!isCenteredX) {
      if (bbox.centerX < minX) {
        // When mirrored: physical user moving right moves landmark right (larger X)
        primaryIssue = isMirrored ? 'move-right' : 'move-left';
        instruction = isMirrored ? 'Move slightly right' : 'Move slightly left';
      } else {
        primaryIssue = isMirrored ? 'move-left' : 'move-right';
        instruction = isMirrored ? 'Move slightly left' : 'Move slightly right';
      }
    } else if (!isCenteredY) {
      if (bbox.centerY < minY) {
        primaryIssue = 'move-down';
        instruction = 'Move slightly down';
      } else {
        primaryIssue = 'move-up';
        instruction = 'Move slightly up';
      }
    }
  } else if (Math.abs(headPose.roll) > POSTURE_CONFIG.MAX_ROLL_DEG) {
    primaryIssue = 'tilt-head';
    instruction = 'Keep your head straight';
  } else if (Math.abs(headPose.yaw) > POSTURE_CONFIG.MAX_YAW_DEG) {
    primaryIssue = 'turn-face';
    instruction = 'Look straight at the camera';
  } else if (Math.abs(headPose.pitch) > POSTURE_CONFIG.MAX_PITCH_DEG) {
    primaryIssue = 'look-straight';
    instruction = 'Look straight at the camera';
  }

  const isFullyReady =
    isLandmarkQualityGood &&
    isDistanceAcceptable &&
    isCentered &&
    isPoseAcceptable &&
    primaryIssue === 'none';

  return {
    isFullyReady,
    primaryIssue,
    instruction,
    guideColorState: isFullyReady ? 'ready' : 'adjusting',
    isCentered,
    isDistanceAcceptable,
    isPoseAcceptable,
    isLandmarkQualityGood,
    headPose,
    boundingBox: bbox
  };
}
