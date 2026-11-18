import { useState, useRef, useEffect, useCallback } from 'react';

import {
  FilesetResolver,
  FaceLandmarker,
  FaceLandmarkerResult
} from '@mediapipe/tasks-vision';

import {
  NormalizedLandmark,
  RawFacialMeasurements,
  FacialFeatures,
  FaceShape,
  AnalysisStage,
  PostureValidationResult,
  GlassesFitData
} from '../types';

import { validateFacePosture } from '../utils/facePositionChecker';

import { MultiFrameCaptureBuffer } from '../utils/multiFrameCapture';

import {
  calculateAllRawMeasurements,
  ANATOMICAL_CLUSTERS,
  calculateClusterCentroid
} from '../utils/landmarkMeasurements';

import { calculateFacialProportions } from '../utils/facialProportions';

import { POSTURE_CONFIG } from '../utils/postureConfig';
import { computeGlassesFit } from '../utils/tryOnGeometry';


export interface UseMediaPipeLandmarkerReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;

  isModelLoading: boolean;
  isModelReady: boolean;

  stage: AnalysisStage;

  postureResult: PostureValidationResult;

  unifiedGuidanceText: string;

  countdownValue: number;

  captureProgress: number;

  landmarkCount: number;

  rawMeasurements: RawFacialMeasurements | null;

  proportions: FacialFeatures | null;

  estimatedShape: FaceShape | null;

  latestPhoto: string | null;

  latestFitData: GlassesFitData | null;

  captureSnapshot: () => { dataUrl: string; fitData: GlassesFitData } | null;

  error: string | null;

  restartAnalysis: () => void;
}


// --------------------------------------------------
// MediaPipe FaceLandmarker connection indices
// --------------------------------------------------

const FACE_OVAL_CONNECTIONS =
  FaceLandmarker.FACE_LANDMARKS_FACE_OVAL || [];

const LIPS_CONNECTIONS =
  FaceLandmarker.FACE_LANDMARKS_LIPS || [];

const LEFT_EYE_CONNECTIONS =
  FaceLandmarker.FACE_LANDMARKS_LEFT_EYE || [];

const RIGHT_EYE_CONNECTIONS =
  FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE || [];

const LEFT_EYEBROW_CONNECTIONS =
  FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW || [];

const RIGHT_EYEBROW_CONNECTIONS =
  FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW || [];


// --------------------------------------------------
// Main hook
// --------------------------------------------------

export function useMediaPipeLandmarker(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isCameraActive: boolean
): UseMediaPipeLandmarkerReturn {

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const landmarkerRef =
    useRef<FaceLandmarker | null>(null);

  const requestAnimationIdRef =
    useRef<number | null>(null);

  const lastVideoTimeRef =
    useRef<number>(-1);


  // --------------------------------------------------
  // Multi-frame buffer
  // --------------------------------------------------

  const captureBufferRef =
    useRef<MultiFrameCaptureBuffer>(
      new MultiFrameCaptureBuffer(
        POSTURE_CONFIG.CAPTURE_REQUIRED_FRAMES
      )
    );


  // --------------------------------------------------
  // State machine refs
  // --------------------------------------------------

  const stableFrameCountRef =
    useRef<number>(0);

  const stageRef =
    useRef<AnalysisStage>('idle');

  const countdownTimerRef =
    useRef<number | null>(null);


  // --------------------------------------------------
  // React state
  // --------------------------------------------------

  const [isModelLoading, setIsModelLoading] =
    useState<boolean>(false);

  const [isModelReady, setIsModelReady] =
    useState<boolean>(false);

  const [stage, setStage] =
    useState<AnalysisStage>('idle');

  const [countdownValue, setCountdownValue] =
    useState<number>(3);

  const [captureProgress, setCaptureProgress] =
    useState<number>(0);

  const [error, setError] =
    useState<string | null>(null);

  const [landmarkCount, setLandmarkCount] =
    useState<number>(0);


  const [postureResult, setPostureResult] =
    useState<PostureValidationResult>({
      isFullyReady: false,
      primaryIssue: 'no-face',
      instruction:
        'Position your face inside the frame',
      guideColorState: 'neutral',
      isCentered: false,
      isDistanceAcceptable: false,
      isPoseAcceptable: false,
      isLandmarkQualityGood: false,
      headPose: {
        yaw: 0,
        pitch: 0,
        roll: 0,
        isAcceptable: false
      },
      boundingBox: null
    });


  // --------------------------------------------------
  // Final analysis states
  // --------------------------------------------------

  const [rawMeasurements, setRawMeasurements] =
    useState<RawFacialMeasurements | null>(null);

  const [proportions, setProportions] =
    useState<FacialFeatures | null>(null);

  const [estimatedShape, setEstimatedShape] =
    useState<FaceShape | null>(null);

  const [latestPhoto, setLatestPhoto] =
    useState<string | null>(null);

  const [latestFitData, setLatestFitData] =
    useState<GlassesFitData | null>(null);

  const latestLandmarksRef =
    useRef<NormalizedLandmark[] | null>(null);


  // --------------------------------------------------
  // Stage updater
  // --------------------------------------------------

  const updateStage = useCallback(
    (newStage: AnalysisStage) => {
      stageRef.current = newStage;
      setStage(newStage);
    },
    []
  );

  // --------------------------------------------------
  // Manual snapshot capture for instant photo try-on
  // --------------------------------------------------

  const captureSnapshot = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Mirror horizontally to match what the user sees in the webcam preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const landmarks = latestLandmarksRef.current;
    const fitData = computeGlassesFit(landmarks, canvas.width, canvas.height);

    setLatestPhoto(dataUrl);
    setLatestFitData(fitData);
    updateStage('complete');

    return { dataUrl, fitData };
  }, [videoRef, updateStage]);


  // --------------------------------------------------
  // Guidance text
  // --------------------------------------------------

  const getUnifiedGuidanceText = (): string => {

    if (!isCameraActive || stage === 'idle') {
      return 'Look straight at the camera';
    }

    if (stage === 'complete') {
      return "All set — we've got what we need";
    }

    if (stage === 'processing') {
      return 'Looking at your face shape and proportions...';
    }

    if (stage === 'capturing') {
      return `Getting a clear read... ${captureProgress}% (hold still)`;
    }

    if (stage === 'countdown') {
      return `Starting in ${countdownValue}... hold still`;
    }

    if (
      stage === 'ready' ||
      stage === 'holding-stable'
    ) {
      return 'Hold still';
    }

    if (stage === 'detecting-face') {
      return 'Look straight at the camera';
    }

    return (
      postureResult.instruction ||
      'Look straight at the camera'
    );
  };


// --------------------------------------------------
// Singleton MediaPipe Landmarker Instance Cache
// --------------------------------------------------
let cachedLandmarker: FaceLandmarker | null = null;
let landmarkerPromise: Promise<FaceLandmarker> | null = null;

async function getOrCreateLandmarker(): Promise<FaceLandmarker> {
  if (cachedLandmarker) {
    return cachedLandmarker;
  }
  if (landmarkerPromise) {
    return landmarkerPromise;
  }

  landmarkerPromise = (async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    let landmarker: FaceLandmarker;
    try {
      landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
        runningMode: 'VIDEO',
        numFaces: 1
      });
    } catch (gpuErr) {
      console.warn(
        'MediaPipe GPU delegate failed (e.g. WebGL restriction on mobile/iPad Safari), falling back to CPU:',
        gpuErr
      );
      landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'CPU'
        },
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
        runningMode: 'VIDEO',
        numFaces: 1
      });
    }

    cachedLandmarker = landmarker;
    return landmarker;
  })();

  return landmarkerPromise;
}

  // --------------------------------------------------
  // Initialize MediaPipe (Single instance reuse)
  // --------------------------------------------------

  useEffect(() => {
    let isCancelled = false;

    async function initMediaPipe() {
      if (cachedLandmarker) {
        landmarkerRef.current = cachedLandmarker;
        setIsModelReady(true);
        setIsModelLoading(false);
        return;
      }

      setIsModelLoading(true);
      setError(null);

      try {
        const landmarker = await getOrCreateLandmarker();
        if (isCancelled) return;

        landmarkerRef.current = landmarker;
        setIsModelReady(true);
        setIsModelLoading(false);
      } catch (err: unknown) {
        console.error('Failed to initialize MediaPipe FaceLandmarker:', err);
        if (!isCancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load MediaPipe landmark detection model.'
          );
          setIsModelLoading(false);
        }
      }
    }

    initMediaPipe();

    return () => {
      isCancelled = true;
      // Do not close cachedLandmarker: reuse it across mounts and screens for maximum performance
    };
  }, []);


  // --------------------------------------------------
  // Restart / Re-analyze
  // --------------------------------------------------

  const restartAnalysis = useCallback(
    () => {

      if (countdownTimerRef.current) {

        window.clearInterval(
          countdownTimerRef.current
        );

        countdownTimerRef.current = null;
      }

      captureBufferRef.current.reset();

      stableFrameCountRef.current = 0;

      setCountdownValue(3);

      setCaptureProgress(0);

      setRawMeasurements(null);

      setProportions(null);

      setEstimatedShape(null);

      setLatestPhoto(null);

      setLatestFitData(null);

      latestLandmarksRef.current = null;

      updateStage('detecting-face');
    },
    [updateStage]
  );


  // --------------------------------------------------
  // Countdown
  // --------------------------------------------------

  const startCountdownSequence =
    useCallback(
      () => {

        if (countdownTimerRef.current) {
          return;
        }

        updateStage('countdown');

        setCountdownValue(3);

        let count = 3;

        const timer =
          window.setInterval(() => {

            count--;

            if (count > 0) {

              setCountdownValue(count);

            } else {

              window.clearInterval(timer);

              countdownTimerRef.current =
                null;

              captureBufferRef.current.reset();

              setCaptureProgress(0);

              updateStage('capturing');
            }

          }, 750);

        countdownTimerRef.current = timer;

      },
      [updateStage]
    );


  // --------------------------------------------------
  // Draw landmarks and guides
  // --------------------------------------------------

  const drawLandmarksAndGuides =
    useCallback(
      (
        ctx: CanvasRenderingContext2D,
        results: FaceLandmarkerResult,
        width: number,
        height: number,
        currentStage: AnalysisStage
      ) => {

        ctx.clearRect(
          0,
          0,
          width,
          height
        );

        if (
          !results.faceLandmarks ||
          results.faceLandmarks.length === 0
        ) {
          return;
        }

        const landmarks =
          results.faceLandmarks[0] as NormalizedLandmark[];

        if (
          !landmarks ||
          landmarks.length === 0
        ) {
          return;
        }


        // Mirror canvas
        ctx.save();

        ctx.translate(width, 0);

        ctx.scale(-1, 1);


        // --------------------------------------------------
        // Connection helper
        // --------------------------------------------------

        const drawConnections = (
          connections: Array<{
            start: number;
            end: number;
          }>,
          strokeStyle: string,
          lineWidth: number
        ) => {

          ctx.beginPath();

          ctx.strokeStyle =
            strokeStyle;

          ctx.lineWidth =
            lineWidth;

          for (
            const connection of connections
          ) {

            const start =
              landmarks[connection.start];

            const end =
              landmarks[connection.end];

            if (start && end) {

              ctx.moveTo(
                start.x * width,
                start.y * height
              );

              ctx.lineTo(
                end.x * width,
                end.y * height
              );
            }
          }

          ctx.stroke();
        };


        const isCompleteOrCapturing =
          currentStage === 'complete' ||
          currentStage === 'capturing' ||
          currentStage === 'processing';


        // --------------------------------------------------
        // Facial contours
        // --------------------------------------------------

        drawConnections(
          FACE_OVAL_CONNECTIONS,
          isCompleteOrCapturing
            ? 'rgba(52, 211, 153, 0.40)'
            : 'rgba(232, 215, 195, 0.28)',
          0.9
        );

        drawConnections(
          LEFT_EYE_CONNECTIONS,
          'rgba(247, 246, 242, 0.48)',
          1.0
        );

        drawConnections(
          RIGHT_EYE_CONNECTIONS,
          'rgba(247, 246, 242, 0.48)',
          1.0
        );

        drawConnections(
          LEFT_EYEBROW_CONNECTIONS,
          'rgba(232, 215, 195, 0.38)',
          0.9
        );

        drawConnections(
          RIGHT_EYEBROW_CONNECTIONS,
          'rgba(232, 215, 195, 0.38)',
          0.9
        );

        drawConnections(
          LIPS_CONNECTIONS,
          'rgba(232, 215, 195, 0.28)',
          0.9
        );


        // --------------------------------------------------
        // Landmark points
        // --------------------------------------------------

        ctx.fillStyle =
          'rgba(247, 246, 242, 0.70)';

        for (
          let i = 0;
          i < landmarks.length;
          i++
        ) {

          const lm =
            landmarks[i];

          const x =
            lm.x * width;

          const y =
            lm.y * height;


          if (
            i === 4 ||
            i === 1 ||
            i === 152 ||
            i === 10 ||
            i === 468 ||
            i === 473 ||
            i === 234 ||
            i === 454
          ) {

            ctx.beginPath();

            ctx.arc(
              x,
              y,
              2.2,
              0,
              2 * Math.PI
            );

            ctx.fillStyle =
              isCompleteOrCapturing
                ? '#34D399'
                : '#E8D7C3';

            ctx.fill();

            ctx.fillStyle =
              'rgba(247, 246, 242, 0.70)';

          } else if (i % 3 === 0) {

            ctx.beginPath();

            ctx.arc(
              x,
              y,
              1.1,
              0,
              2 * Math.PI
            );

            ctx.fill();
          }
        }


        // --------------------------------------------------
        // Measurement guides
        // --------------------------------------------------

        if (isCompleteOrCapturing) {

          const pFaceRight =
            calculateClusterCentroid(
              landmarks,
              ANATOMICAL_CLUSTERS.FACE_WIDTH_RIGHT
            );

          const pFaceLeft =
            calculateClusterCentroid(
              landmarks,
              ANATOMICAL_CLUSTERS.FACE_WIDTH_LEFT
            );

          const pJawRight =
            calculateClusterCentroid(
              landmarks,
              ANATOMICAL_CLUSTERS.JAW_RIGHT
            );

          const pJawLeft =
            calculateClusterCentroid(
              landmarks,
              ANATOMICAL_CLUSTERS.JAW_LEFT
            );


          const leftEyeCenter =
            landmarks.length >
              ANATOMICAL_CLUSTERS.RIGHT_PUPIL &&
              landmarks[
              ANATOMICAL_CLUSTERS.LEFT_PUPIL
              ]
              ? landmarks[
              ANATOMICAL_CLUSTERS.LEFT_PUPIL
              ]
              : calculateClusterCentroid(
                landmarks,
                ANATOMICAL_CLUSTERS.LEFT_EYE
              );


          const rightEyeCenter =
            landmarks.length >
              ANATOMICAL_CLUSTERS.RIGHT_PUPIL &&
              landmarks[
              ANATOMICAL_CLUSTERS.RIGHT_PUPIL
              ]
              ? landmarks[
              ANATOMICAL_CLUSTERS.RIGHT_PUPIL
              ]
              : calculateClusterCentroid(
                landmarks,
                ANATOMICAL_CLUSTERS.RIGHT_EYE
              );


          // Face width
          if (
            pFaceRight &&
            pFaceLeft
          ) {

            const yMid =
              (
                pFaceRight.y +
                pFaceLeft.y
              ) / 2 * height;

            ctx.beginPath();

            ctx.setLineDash([3, 4]);

            ctx.strokeStyle =
              'rgba(232, 215, 195, 0.65)';

            ctx.lineWidth = 1.0;

            ctx.moveTo(
              pFaceRight.x * width,
              yMid
            );

            ctx.lineTo(
              pFaceLeft.x * width,
              yMid
            );

            ctx.stroke();

            ctx.setLineDash([]);
          }


          // Eye distance
          if (
            leftEyeCenter &&
            rightEyeCenter
          ) {

            const yMid =
              (
                leftEyeCenter.y +
                rightEyeCenter.y
              ) / 2 * height;

            ctx.beginPath();

            ctx.setLineDash([2, 3]);

            ctx.strokeStyle =
              'rgba(247, 246, 242, 0.75)';

            ctx.lineWidth = 1.0;

            ctx.moveTo(
              leftEyeCenter.x * width,
              yMid
            );

            ctx.lineTo(
              rightEyeCenter.x * width,
              yMid
            );

            ctx.stroke();

            ctx.setLineDash([]);
          }


          // Jaw width
          if (
            pJawRight &&
            pJawLeft
          ) {

            const yMid =
              (
                pJawRight.y +
                pJawLeft.y
              ) / 2 * height;

            ctx.beginPath();

            ctx.setLineDash([3, 4]);

            ctx.strokeStyle =
              'rgba(232, 215, 195, 0.50)';

            ctx.lineWidth = 1.0;

            ctx.moveTo(
              pJawRight.x * width,
              yMid
            );

            ctx.lineTo(
              pJawLeft.x * width,
              yMid
            );

            ctx.stroke();

            ctx.setLineDash([]);
          }
        }

        ctx.restore();
      },
      []
    );


  // --------------------------------------------------
  // Real-time MediaPipe processing
  // --------------------------------------------------

  const processFrame =
    useCallback(
      async () => {

        const video =
          videoRef.current;

        const canvas =
          canvasRef.current;

        const landmarker =
          landmarkerRef.current;


        if (
          !isCameraActive ||
          !video ||
          !canvas ||
          !landmarker ||
          video.readyState < 2 ||
          video.paused ||
          video.ended
        ) {
          if (isCameraActive && video && video.readyState < 2 && !video.paused) {
            requestAnimationIdRef.current =
              requestAnimationFrame(
                processFrame
              );
          }
          return;
        }


        const videoWidth =
          video.videoWidth;

        const videoHeight =
          video.videoHeight;


        if (
          videoWidth > 0 &&
          videoHeight > 0
        ) {

          if (
            canvas.width !== videoWidth ||
            canvas.height !== videoHeight
          ) {

            canvas.width =
              videoWidth;

            canvas.height =
              videoHeight;
          }
        }


        const ctx =
          canvas.getContext('2d');


        if (
          ctx &&
          video.currentTime !==
          lastVideoTimeRef.current
        ) {

          lastVideoTimeRef.current =
            video.currentTime;

          const startTimeMs =
            performance.now();


          try {

            const results =
              landmarker.detectForVideo(
                video,
                startTimeMs
              );


            // ==================================================
            // FACE DETECTED
            // ==================================================

            if (
              results.faceLandmarks &&
              results.faceLandmarks.length > 0
            ) {

              const landmarks =
                results.faceLandmarks[0] as NormalizedLandmark[];

              latestLandmarksRef.current = landmarks;

              setLandmarkCount(
                landmarks.length
              );


              const currentStage =
                stageRef.current;


              // ------------------------------------------------
              // Keep completed state stable
              // ------------------------------------------------

              if (
                currentStage === 'complete'
              ) {

                drawLandmarksAndGuides(
                  ctx,
                  results,
                  canvas.width,
                  canvas.height,
                  'complete'
                );

                requestAnimationIdRef.current =
                  requestAnimationFrame(
                    processFrame
                  );

                return;
              }


              // ------------------------------------------------
              // Posture validation
              // ------------------------------------------------

              const validation =
                validateFacePosture(
                  landmarks,
                  true
                );

              setPostureResult(
                validation
              );


              // ==================================================
              // INVALID POSTURE
              // ==================================================

              if (
                !validation.isFullyReady
              ) {

                if (
                  currentStage ===
                  'countdown' ||
                  currentStage ===
                  'holding-stable' ||
                  currentStage ===
                  'ready'
                ) {

                  if (
                    countdownTimerRef.current
                  ) {

                    window.clearInterval(
                      countdownTimerRef.current
                    );

                    countdownTimerRef.current =
                      null;
                  }

                  stableFrameCountRef.current =
                    0;

                  setCountdownValue(3);

                  updateStage(
                    'adjusting-position'
                  );

                } else if (
                  currentStage ===
                  'capturing'
                ) {

                  captureBufferRef.current.reset();

                  setCaptureProgress(0);

                  stableFrameCountRef.current =
                    0;

                  updateStage(
                    'adjusting-position'
                  );

                } else if (
                  currentStage !==
                  'processing'
                ) {

                  updateStage(
                    'adjusting-position'
                  );
                }


                // ==================================================
                // VALID POSTURE
                // ==================================================

              } else {

                if (
                  currentStage ===
                  'idle' ||
                  currentStage ===
                  'detecting-face' ||
                  currentStage ===
                  'adjusting-position'
                ) {

                  updateStage('ready');

                  stableFrameCountRef.current =
                    0;


                } else if (
                  currentStage ===
                  'ready'
                ) {

                  stableFrameCountRef.current++;

                  if (
                    stableFrameCountRef.current >
                    8
                  ) {

                    updateStage(
                      'holding-stable'
                    );
                  }


                } else if (
                  currentStage ===
                  'holding-stable'
                ) {

                  stableFrameCountRef.current++;

                  if (
                    stableFrameCountRef.current >=
                    POSTURE_CONFIG.REQUIRED_STABLE_FRAMES
                  ) {

                    startCountdownSequence();
                  }


                } else if (
                  currentStage ===
                  'capturing'
                ) {

                  // --------------------------------------------
                  // Capture multi-frame dataset
                  // --------------------------------------------

                  const isFinished =
                    captureBufferRef.current.addFrame(
                      landmarks
                    );

                  const {
                    percentage
                  } =
                    captureBufferRef.current.getProgress();

                  setCaptureProgress(
                    percentage
                  );


                  // --------------------------------------------
                  // Capture complete
                  // --------------------------------------------

                  if (isFinished) {

                    updateStage(
                      'processing'
                    );


                    // ------------------------------------------
                    // Average captured landmarks
                    // ------------------------------------------

                    const averagedLandmarks =
                      captureBufferRef.current
                        .getAveragedLandmarks();


                    if (
                      averagedLandmarks
                    ) {

                      // ----------------------------------------
                      // Existing OptiTry measurements
                      // ----------------------------------------

                      const calculatedRaw =
                        calculateAllRawMeasurements(
                          averagedLandmarks,
                          videoWidth,
                          videoHeight
                        );


                      if (
                        calculatedRaw
                      ) {

                        const calculatedProportions =
                          calculateFacialProportions(
                            calculatedRaw
                          );


                        // --------------------------------------
                        // Keep existing measurements
                        // --------------------------------------

                        setRawMeasurements(
                          calculatedRaw
                        );

                        setProportions(
                          calculatedProportions
                        );


                        // ==================================================
                        // EFFICIENTNET FACE-SHAPE CLASSIFIER
                        // ==================================================

                        try {
                          const imageCanvas =
                            document.createElement(
                              'canvas'
                            );

                          imageCanvas.width =
                            videoWidth;

                          imageCanvas.height =
                            videoHeight;

                          const imageCtx =
                            imageCanvas.getContext(
                              '2d'
                            );

                          if (imageCtx) {
                            imageCtx.translate(videoWidth, 0);
                            imageCtx.scale(-1, 1);
                            imageCtx.drawImage(
                              video,
                              0,
                              0,
                              videoWidth,
                              videoHeight
                            );

                            const dataUrl =
                              imageCanvas.toDataURL(
                                'image/jpeg',
                                0.95
                              );

                            const fitData =
                              computeGlassesFit(
                                averagedLandmarks,
                                videoWidth,
                                videoHeight
                              );

                            setLatestPhoto(dataUrl);
                            setLatestFitData(fitData);
                          }

                          setEstimatedShape(null);
                        } catch (
                        err
                        ) {
                          console.error('Error processing captured frame:', err);
                        }


                        // ----------------------------------------
                        // Analysis complete
                        // ----------------------------------------

                        updateStage(
                          'complete'
                        );
                      }
                    }
                  }
                }
              }


              // ------------------------------------------------
              // Draw landmarks
              // ------------------------------------------------

              drawLandmarksAndGuides(
                ctx,
                results,
                canvas.width,
                canvas.height,
                stageRef.current
              );


              // ==================================================
              // NO FACE
              // ==================================================

            } else {

              setLandmarkCount(0);

              setPostureResult({
                isFullyReady: false,

                primaryIssue: 'no-face',

                instruction:
                  'Position your face inside the frame',

                guideColorState:
                  'neutral',

                isCentered: false,

                isDistanceAcceptable: false,

                isPoseAcceptable: false,

                isLandmarkQualityGood: false,

                headPose: {
                  yaw: 0,
                  pitch: 0,
                  roll: 0,
                  isAcceptable: false
                },

                boundingBox: null
              });


              if (
                stageRef.current !==
                'complete'
              ) {

                if (
                  countdownTimerRef.current
                ) {

                  window.clearInterval(
                    countdownTimerRef.current
                  );

                  countdownTimerRef.current =
                    null;
                }

                stableFrameCountRef.current =
                  0;

                captureBufferRef.current.reset();

                updateStage(
                  'detecting-face'
                );
              }


              ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
              );
            }


          } catch (
          detectErr
          ) {

            console.warn(
              'Frame detection skipped:',
              detectErr
            );
          }
        }


        // Continue animation loop.
        requestAnimationIdRef.current =
          requestAnimationFrame(
            processFrame
          );

      },
      [
        isCameraActive,
        videoRef,
        drawLandmarksAndGuides,
        updateStage,
        startCountdownSequence
      ]
    );


  // --------------------------------------------------
  // Detection loop lifecycle
  // --------------------------------------------------

  useEffect(() => {

    if (
      isCameraActive &&
      isModelReady
    ) {

      lastVideoTimeRef.current =
        -1;

      stableFrameCountRef.current =
        0;

      updateStage(
        'detecting-face'
      );

      requestAnimationIdRef.current =
        requestAnimationFrame(
          processFrame
        );


    } else {

      if (
        requestAnimationIdRef.current
      ) {

        cancelAnimationFrame(
          requestAnimationIdRef.current
        );

        requestAnimationIdRef.current =
          null;
      }


      if (
        countdownTimerRef.current
      ) {

        window.clearInterval(
          countdownTimerRef.current
        );

        countdownTimerRef.current =
          null;
      }


      captureBufferRef.current.reset();

      stableFrameCountRef.current =
        0;

      updateStage('idle');

      setLandmarkCount(0);


      const canvas =
        canvasRef.current;


      if (canvas) {

        const ctx =
          canvas.getContext('2d');

        if (ctx) {

          ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
          );
        }
      }
    }


    return () => {

      if (
        requestAnimationIdRef.current
      ) {

        cancelAnimationFrame(
          requestAnimationIdRef.current
        );

        requestAnimationIdRef.current =
          null;
      }


      if (
        countdownTimerRef.current
      ) {

        window.clearInterval(
          countdownTimerRef.current
        );

        countdownTimerRef.current =
          null;
      }
    };

  }, [
    isCameraActive,
    isModelReady,
    processFrame,
    updateStage
  ]);


  // --------------------------------------------------
  // Return
  // --------------------------------------------------

  return {

    canvasRef,

    isModelLoading,

    isModelReady,

    stage,

    postureResult,

    unifiedGuidanceText:
      getUnifiedGuidanceText(),

    countdownValue,

    captureProgress,

    landmarkCount,

    rawMeasurements,

    proportions,

    estimatedShape,

    latestPhoto,

    latestFitData,

    captureSnapshot,

    error,

    restartAnalysis
  };
}