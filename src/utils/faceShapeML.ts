import { NormalizedLandmark } from '../types';

// ============================================================
// EXACT FACE OVAL USED DURING COLAB TRAINING
// ============================================================

const FACE_OVAL = [
    10, 338, 297, 332, 284, 251, 389, 356,
    454, 323, 361, 288, 397, 365, 379, 378,
    400, 377, 152, 148, 176, 149, 150, 136,
    172, 58, 132, 93, 234, 127, 162, 21,
    54, 103, 67, 109
];

// ============================================================
// EXACT LANDMARK PAIRS USED DURING COLAB TRAINING
// ============================================================

const LANDMARK_PAIRS = {
    forehead_width: [103, 332],
    cheekbone_width: [234, 454],
    jaw_width: [172, 397],
    eye_width: [33, 263]
} as const;

// ============================================================
// NORMALIZE LANDMARKS
//
// Same procedure used in Colab:
// 1. Center around eye midpoint
// 2. Rotate so eyes are horizontal
// 3. Divide by eye distance
// ============================================================

export function normalizeFaceLandmarks(
    landmarks: NormalizedLandmark[]
): number[][] {

    const points = landmarks.map((lm) => [
        lm.x,
        lm.y
    ]);

    const leftEye = points[33];
    const rightEye = points[263];

    const eyeCenter = [
        (leftEye[0] + rightEye[0]) / 2,
        (leftEye[1] + rightEye[1]) / 2
    ];

    // Center around eyes
    const centered = points.map(([x, y]) => [
        x - eyeCenter[0],
        y - eyeCenter[1]
    ]);

    // Eye angle
    const dx = rightEye[0] - leftEye[0];
    const dy = rightEye[1] - leftEye[1];

    const angle = Math.atan2(dy, dx);

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // Same rotation as:
    // normalized_points @ rotation_matrix.T
    const rotated = centered.map(([x, y]) => [
        x * cosA + y * sinA,
        -x * sinA + y * cosA
    ]);

    // Eye distance
    const eyeDistance = Math.sqrt(
        dx * dx +
        dy * dy
    );

    // Normalize by eye distance
    return rotated.map(([x, y]) => [
        x / (eyeDistance + 1e-8),
        y / (eyeDistance + 1e-8)
    ]);
}

// ============================================================
// DISTANCE BETWEEN TWO LANDMARKS
// ============================================================

function distance(
    points: number[][],
    indexA: number,
    indexB: number
): number {

    const a = points[indexA];
    const b = points[indexB];

    const dx = b[0] - a[0];
    const dy = b[1] - a[1];

    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}

// ============================================================
// EXACT 94-FEATURE PIPELINE FROM COLAB
// ============================================================

export function createImprovedFeatures(
    normalizedPoints: number[][]
): number[] {

    const oval = FACE_OVAL.map(
        (index) => normalizedPoints[index]
    );

    const x = oval.map((p) => p[0]);
    const y = oval.map((p) => p[1]);

    const faceWidth =
        Math.max(...x) -
        Math.min(...x);

    const faceHeight =
        Math.max(...y) -
        Math.min(...y);

    const aspectRatio =
        faceWidth /
        (faceHeight + 1e-8);

    // ----------------------------------------------------------
    // Normalize contour
    // ----------------------------------------------------------

    const contour: number[][] = oval.map(
        ([px, py]) => [
            px / (faceWidth + 1e-8),
            py / (faceHeight + 1e-8)
        ]
    );

    // Flatten 36 x 2 = 72 contour features
    const contourFeatures = contour.flat();

    // ----------------------------------------------------------
    // Landmark widths
    // ----------------------------------------------------------

    const foreheadWidth = distance(
        normalizedPoints,
        LANDMARK_PAIRS.forehead_width[0],
        LANDMARK_PAIRS.forehead_width[1]
    );

    const cheekboneWidth = distance(
        normalizedPoints,
        LANDMARK_PAIRS.cheekbone_width[0],
        LANDMARK_PAIRS.cheekbone_width[1]
    );

    const jawWidth = distance(
        normalizedPoints,
        LANDMARK_PAIRS.jaw_width[0],
        LANDMARK_PAIRS.jaw_width[1]
    );

    const eyeWidth = distance(
        normalizedPoints,
        LANDMARK_PAIRS.eye_width[0],
        LANDMARK_PAIRS.eye_width[1]
    );

    // ----------------------------------------------------------
    // Width ratios
    // ----------------------------------------------------------

    const cheekboneToForehead =
        cheekboneWidth /
        (foreheadWidth + 1e-8);

    const cheekboneToJaw =
        cheekboneWidth /
        (jawWidth + 1e-8);

    const foreheadToJaw =
        foreheadWidth /
        (jawWidth + 1e-8);

    const jawToFace =
        jawWidth /
        (faceWidth + 1e-8);

    const foreheadToFace =
        foreheadWidth /
        (faceWidth + 1e-8);

    const cheekboneToFace =
        cheekboneWidth /
        (faceWidth + 1e-8);

    // ----------------------------------------------------------
    // Vertical proportions
    // ----------------------------------------------------------

    const foreheadPoint =
        normalizedPoints[10];

    const chinPoint =
        normalizedPoints[152];

    const eyeCenter = [
        (normalizedPoints[33][0] +
            normalizedPoints[263][0]) / 2,

        (normalizedPoints[33][1] +
            normalizedPoints[263][1]) / 2
    ];

    const nosePoint =
        normalizedPoints[1];

    const faceVertical = distance(
        normalizedPoints,
        10,
        152
    );

    const upperFaceHeight =
        Math.sqrt(
            Math.pow(
                foreheadPoint[0] - eyeCenter[0],
                2
            ) +
            Math.pow(
                foreheadPoint[1] - eyeCenter[1],
                2
            )
        );

    const middleFaceHeight =
        Math.sqrt(
            Math.pow(
                eyeCenter[0] - nosePoint[0],
                2
            ) +
            Math.pow(
                eyeCenter[1] - nosePoint[1],
                2
            )
        );

    const lowerFaceHeight =
        Math.sqrt(
            Math.pow(
                nosePoint[0] - chinPoint[0],
                2
            ) +
            Math.pow(
                nosePoint[1] - chinPoint[1],
                2
            )
        );

    const upperRatio =
        upperFaceHeight /
        (faceVertical + 1e-8);

    const middleRatio =
        middleFaceHeight /
        (faceVertical + 1e-8);

    const lowerRatio =
        lowerFaceHeight /
        (faceVertical + 1e-8);

    const jawTaper =
        jawWidth /
        (cheekboneWidth + 1e-8);

    // ----------------------------------------------------------
    // Chin position
    // ----------------------------------------------------------

    const chinY = chinPoint[1];

    const contourMinY =
        Math.min(...oval.map((p) => p[1]));

    const contourMaxY =
        Math.max(...oval.map((p) => p[1]));

    const chinPosition =
        (chinY - contourMinY) /
        (
            contourMaxY -
            contourMinY +
            1e-8
        );

    // ----------------------------------------------------------
    // EXACT 22 geometric features
    // ----------------------------------------------------------

    const geometricFeatures = [
        faceWidth,
        faceHeight,
        aspectRatio,

        foreheadWidth,
        cheekboneWidth,
        jawWidth,
        eyeWidth,

        cheekboneToForehead,
        cheekboneToJaw,
        foreheadToJaw,

        jawToFace,
        foreheadToFace,
        cheekboneToFace,

        faceVertical,

        upperFaceHeight,
        middleFaceHeight,
        lowerFaceHeight,

        upperRatio,
        middleRatio,
        lowerRatio,

        jawTaper,
        chinPosition
    ];

    // 22 + 72 = 94
    return [
        ...geometricFeatures,
        ...contourFeatures
    ];
}

// ============================================================
// EXACT 18 WIDTH-PROFILE FEATURES FROM COLAB
// ============================================================

export function createWidthProfileFeatures(
    normalizedPoints: number[][]
): number[] {

    const oval = FACE_OVAL.map(
        (index) => normalizedPoints[index]
    );

    const x = oval.map((p) => p[0]);
    const y = oval.map((p) => p[1]);

    const minY = Math.min(...y);
    const maxY = Math.max(...y);

    const faceHeight =
        maxY - minY;

    const faceWidth =
        Math.max(...x) -
        Math.min(...x);

    // np.linspace(0.10, 0.90, 9)
    const levels = [
        0.10,
        0.20,
        0.30,
        0.40,
        0.50,
        0.60,
        0.70,
        0.80,
        0.90
    ];

    const widths: number[] = [];

    for (const level of levels) {

        const targetY =
            minY +
            level * faceHeight;

        const tolerance =
            0.08 * faceHeight;

        const nearbyIndices: number[] = [];

        for (let i = 0; i < y.length; i++) {

            if (
                Math.abs(y[i] - targetY) <
                tolerance
            ) {
                nearbyIndices.push(i);
            }
        }

        let width: number;

        if (nearbyIndices.length >= 2) {

            const nearbyX =
                nearbyIndices.map(
                    (i) => x[i]
                );

            width =
                Math.max(...nearbyX) -
                Math.min(...nearbyX);

        } else {

            width = faceWidth;
        }

        widths.push(width);
    }

    const maxWidth =
        Math.max(...widths);

    const widthRatios =
        maxWidth > 0
            ? widths.map(
                (width) =>
                    width / maxWidth
            )
            : widths.map(() => 1);

    // 9 raw widths + 9 normalized widths = 18
    return [
        ...widths,
        ...widthRatios
    ];
}

// ============================================================
// COMPLETE 112-FEATURE PIPELINE
// ============================================================

export function create112Features(
    landmarks: NormalizedLandmark[]
): number[] {

    const normalized =
        normalizeFaceLandmarks(
            landmarks
        );

    const features94 =
        createImprovedFeatures(
            normalized
        );

    const features18 =
        createWidthProfileFeatures(
            normalized
        );

    const features112 = [
        ...features94,
        ...features18
    ];

    if (features112.length !== 112) {
        throw new Error(
            `OptiTry feature extraction error: expected 112 features, got ${features112.length}`
        );
    }

    return features112;
}