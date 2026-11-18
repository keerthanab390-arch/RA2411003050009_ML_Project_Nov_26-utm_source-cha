import { useState, useRef, useCallback, useEffect } from 'react';

export type CameraStatus = 
  | 'idle'          // Camera not started
  | 'requesting'    // Requesting permission
  | 'active'        // Camera active and streaming
  | 'denied'        // Permission denied by user
  | 'unavailable'   // No camera found or device in use
  | 'stopped';      // User explicitly stopped camera

export interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  errorMessage: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  toggleCamera: () => Promise<void>;
  hasMultipleCameras: boolean;
  switchCamera: () => Promise<void>;
}

export function useWebcam(): UseWebcamReturn {
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if multiple video devices are connected
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      }).catch(err => {
        console.warn('Could not enumerate media devices:', err);
      });
    }
  }, []);

  /**
   * Stop active camera stream and release hardware tracks
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStatus('stopped');
  }, []);

  /**
   * Start webcam with MediaDevices API
   */
  const startCamera = useCallback(async () => {
    setErrorMessage(null);
    setStatus('requesting');

    // 1. Check if mediaDevices API is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('unavailable');
      setErrorMessage('Camera API is not supported on this browser or platform.');
      return;
    }

    // Stop any existing stream before starting a new one
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          aspectRatio: { ideal: 16 / 9 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video metadata to load and start playback
        await new Promise<void>((resolve) => {
          if (!videoRef.current) return resolve();
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => resolve()).catch(() => resolve());
          };
        });
      }

      setStatus('active');
    } catch (err: unknown) {
      console.error('Webcam access error:', err);

      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setStatus('denied');
          setErrorMessage('Camera access is required for face analysis. Please allow camera access in your browser settings.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setStatus('unavailable');
          setErrorMessage('No camera device detected. Please connect a webcam.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setStatus('unavailable');
          setErrorMessage('Camera is currently in use by another application or system process.');
        } else if (err.name === 'OverconstrainedError') {
          // Fallback to basic video constraint if overconstrained
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            streamRef.current = fallbackStream;
            if (videoRef.current) {
              videoRef.current.srcObject = fallbackStream;
              await videoRef.current.play();
            }
            setStatus('active');
            return;
          } catch {
            setStatus('unavailable');
            setErrorMessage('Unable to find a supported camera resolution.');
          }
        } else {
          setStatus('unavailable');
          setErrorMessage(err.message || 'Unable to access camera.');
        }
      } else {
        setStatus('unavailable');
        setErrorMessage('An unexpected error occurred while initializing the camera.');
      }
    }
  }, [facingMode]);

  /**
   * Toggle between active and stopped camera states
   */
  const toggleCamera = useCallback(async () => {
    if (status === 'active') {
      stopCamera();
    } else {
      await startCamera();
    }
  }, [status, startCamera, stopCamera]);

  /**
   * Switch between front and back camera (if available on tablet/mobile)
   */
  const switchCamera = useCallback(async () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
    stopCamera();
    // Start with new facing mode
    setTimeout(() => {
      startCamera();
    }, 100);
  }, [facingMode, stopCamera, startCamera]);

  // Clean up hardware camera tracks when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return {
    videoRef,
    status,
    errorMessage,
    startCamera,
    stopCamera,
    toggleCamera,
    hasMultipleCameras,
    switchCamera
  };
}
