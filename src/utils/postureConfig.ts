/**
 * OptiTry Facial Analysis Capture Configuration
 * Centralized tolerances and parameters for posture validation, stability, and multi-frame capture.
 */

export const POSTURE_CONFIG = {
  // 1. Centering Boundaries (Normalized [0, 1] relative to video frame)
  CENTER_TARGET_X: 0.50,
  CENTER_TOLERANCE_X: 0.09, // Acceptable X range: 0.41 to 0.59
  CENTER_TARGET_Y: 0.46,
  CENTER_TOLERANCE_Y: 0.10, // Acceptable Y range: 0.36 to 0.56

  // 2. Face Size / Distance (Fraction of video frame height occupied by face)
  MIN_FACE_HEIGHT_RATIO: 0.32, // Below this -> "Move closer"
  MAX_FACE_HEIGHT_RATIO: 0.72, // Above this -> "Move slightly farther away"

  // 3. Head Pose Tolerances (in Degrees)
  MAX_YAW_DEG: 13.0,    // Left/Right rotation tolerance (±13°)
  MAX_PITCH_DEG: 13.0,  // Looking Up/Down tilt tolerance (±13°)
  MAX_ROLL_DEG: 8.0,    // Head Tilt Left/Right tolerance (±8°)

  // 4. Stability Window Parameters
  REQUIRED_STABLE_FRAMES: 25, // ~0.8–1.0s of continuous stable posture before countdown
  MAX_STABILITY_VARIANCE: 0.015, // Maximum allowable standard deviation during holding window

  // 5. Multi-Frame Capture Parameters
  COUNTDOWN_DURATION_SEC: 3,
  CAPTURE_REQUIRED_FRAMES: 25, // Number of valid frames averaged for final calculation
  MAX_CAPTURE_RETRIES: 60      // Frame timeout if user breaks posture during active capture
};
