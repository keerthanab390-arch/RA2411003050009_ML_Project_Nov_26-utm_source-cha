export type KioskScreen =
  | 'home'
  | 'store'
  | 'try-on'
  | 'face-analysis'
  | 'find-frames'
  | 'recommendations'
  | 'pref-style'
  | 'pref-shape'
  | 'pref-color-size'
  | 'pref-budget'
  | 'pref-saved'
  | 'summary'
  | 'explore-frames'
  | 'favourites'
  | 'cart'
  | 'checkout'
  | 'order-confirmation';

export type FaceShape = 'Oval' | 'Square' | 'Round' | 'Heart' | 'Oblong';

export interface NormalizedLandmark {
  x: number;
  y: number;
  z?: number;
}

export interface HeadPose {
  yaw: number;     // Left (-) / Right (+) in degrees
  pitch: number;   // Down (-) / Up (+) in degrees
  roll: number;    // Tilt Left (-) / Right (+) in degrees
  isAcceptable: boolean;
}

export interface FaceBoundingBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export type PostureIssue =
  | 'none'
  | 'no-face'
  | 'too-far'
  | 'too-close'
  | 'move-left'
  | 'move-right'
  | 'move-up'
  | 'move-down'
  | 'turn-face'
  | 'tilt-head'
  | 'look-straight'
  | 'low-quality';

export interface PostureValidationResult {
  isFullyReady: boolean;
  primaryIssue: PostureIssue;
  instruction: string;
  guideColorState: 'neutral' | 'adjusting' | 'ready' | 'capturing' | 'complete';
  isCentered: boolean;
  isDistanceAcceptable: boolean;
  isPoseAcceptable: boolean;
  isLandmarkQualityGood: boolean;
  headPose: HeadPose;
  boundingBox: FaceBoundingBox | null;
}

export type AnalysisStage =
  | 'idle'                // Camera inactive / initial
  | 'detecting-face'      // Searching for face
  | 'adjusting-position'  // Checking position, distance & head pose
  | 'ready'               // All posture & alignment conditions satisfied
  | 'holding-stable'      // Verifying stability window
  | 'countdown'           // 3, 2, 1 countdown sequence
  | 'capturing'           // Multi-frame acquisition (25 frames)
  | 'processing'          // Averaging & computing proportions
  | 'complete'            // Analysis complete
  | 'error';              // Error state

export interface RawFacialMeasurements {
  faceWidth: number;
  faceHeight: number;
  foreheadWidth: number;
  cheekboneWidth: number;
  jawWidth: number;
  chinWidth: number;
  eyeDistance: number;
  faceRatio: number;
}

export interface FacialFeatures {
  // 1. Aspect & Vertical Ratios
  faceAspectRatio: number;          // faceWidth / faceHeight
  faceRatio: number;                // Alias for backwards compatibility

  // 2. Relative Silhouette Proportions
  upperFaceRatio: number;           // foreheadWidth / faceWidth
  foreheadToFaceRatio: number;      // foreheadWidth / faceWidth
  foreheadToCheekboneRatio: number; // foreheadWidth / cheekboneWidth
  foreheadRatio: number;            // Alias: foreheadWidth / cheekboneWidth
  cheekboneToFaceRatio: number;     // cheekboneWidth / faceWidth
  cheekboneRatio: number;           // Alias: cheekboneWidth / faceWidth
  jawToFaceRatio: number;           // jawWidth / faceWidth
  jawToCheekboneRatio: number;      // jawWidth / cheekboneWidth
  jawRatio: number;                 // Alias: jawWidth / cheekboneWidth

  // 3. Contour Taper & Balance
  upperToLowerFaceRatio: number;    // foreheadWidth / jawWidth
  foreheadToJawRatio: number;       // Alias: foreheadWidth / jawWidth
  chinTaper: number;                // chinWidth / jawWidth
  chinToCheekboneRatio: number;     // chinWidth / cheekboneWidth

  // 4. Normalized Relative Differences (normalized by cheekboneWidth)
  cheekboneToJawDifference: number;      // (cheekboneWidth - jawWidth) / cheekboneWidth
  foreheadToJawDifference: number;       // (foreheadWidth - jawWidth) / cheekboneWidth
  cheekboneToForeheadDifference: number; // (cheekboneWidth - foreheadWidth) / cheekboneWidth

  // 5. Optical Centers
  eyeDistanceRatio: number;         // eyeDistance / faceWidth
}

export type FacialProportions = FacialFeatures;

export interface FaceShapeScoreDetails {
  shape: FaceShape;
  score: number;
  normalizedPercentage: number;
}

export interface FaceShapeClassificationOutput {
  estimatedShape: FaceShape;
  scores: Record<FaceShape, number>;
  scoreList: FaceShapeScoreDetails[];
  features: FacialFeatures;
  description: string;
}

export interface FacialMeasurementsDisplay {
  faceWidth: string;
  faceHeight: string;
  faceRatio: string;
  foreheadWidth: string;
  cheekboneWidth: string;
  jawWidth: string;
  eyeDistance: string;
}

export interface GlassesFitData {
  centerX: number;                 // Horizontal eye midpoint percentage (0 - 100)
  centerY: number;                 // Vertical placement percentage (0 - 100)
  widthPercent: number;            // Width relative to image (0 - 100)
  rotationDeg: number;             // Head tilt rotation angle in degrees
  isDetected: boolean;             // Whether valid landmarks were detected
  eyeDistancePercent?: number;     // Normalized eye-to-eye distance percentage (0 - 100)
  outerEyeDistancePercent?: number;// Normalized outer-corner-to-outer-corner distance percentage (0 - 100)
  eyeMidpointX?: number;           // Normalized eye midpoint X percentage (0 - 100)
  eyeMidpointY?: number;           // Normalized eye midpoint Y percentage (0 - 100)
  noseBridgeY?: number;            // Normalized nose bridge Y percentage (0 - 100)
  faceAngleDeg?: number;           // Face roll tilt in degrees
}

export interface FaceAnalysisData {
  faceShape?: FaceShape;
  measurements?: FacialMeasurementsDisplay;
  features?: FacialFeatures;
  proportions?: FacialFeatures;
  isComplete: boolean;
  capturedPhoto?: string | null;
  glassesFit?: GlassesFitData | null;
}

export type StylePreference = 'Classic' | 'Modern' | 'Trendy' | 'Professional' | 'Casual';
export type ShapePreference = 'Round' | 'Square' | 'Rectangle' | 'Cat-Eye' | 'Wayfarer' | 'No Preference';
export type ColorPreference = 'Black' | 'Brown' | 'Gold' | 'Silver' | 'Transparent' | 'No Preference';
export type SizePreference = 'Small' | 'Medium' | 'Large' | 'No Preference';
export type BudgetPreference =
  | '₹1,000 - ₹1,200'
  | '₹1,201 - ₹1,500'
  | '₹1,501 - ₹1,800'
  | '₹1,801 - ₹2,000'
  | 'Any Budget';
export interface UserPreferencesState {
  style: StylePreference;
  shape: ShapePreference;
  color: ColorPreference;
  size: SizePreference;
  budget: BudgetPreference;
}

export interface FrameItem {
  id: string;
  name: string;
  style: StylePreference;
  shape: string;
  color: string;
  size: string;
  material: string;
  price: number;
  image: string;
  description?: string;
  isRecommended?: boolean;
  recommendationScore?: RecommendationScore;
  dimensions?: {
    lensWidth: number;
    bridgeWidth: number;
    templeLength: number;
  };
}

export type Frame = FrameItem;

export interface RecommendationScore {
  frameId: string;
  totalScore: number;
  styleScore: number;
  shapeScore?: number;
  colorScore?: number;
  sizeScore: number;
  budgetScore?: number;
  faceShapeScore?: number;
  isRecommended: boolean;
  matchReason?: string;
}

export type RecommendedFrame = FrameItem;

export interface CartItem {
  frame: FrameItem;
  quantity: number;
}

export interface OrderDetails {
  orderId: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  customerName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  createdAt: string;
}


