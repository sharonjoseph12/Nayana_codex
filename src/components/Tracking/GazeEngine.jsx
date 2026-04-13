import React, { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Camera, AlertCircle, Loader2 } from 'lucide-react';

// Using the same MediaPipe logic as the worker, but directly in the component for reliability
// Throttled to ensure UI smoothness
export default function GazeEngine({ faceDetected, onGazeUpdate, onError, isEnabled = true }) {
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const landmarkerRef = useRef(null);
  const eyesRef = useRef(null);
  const scanLinePos = useRef(0);
  
  const onGazeUpdateRef = useRef(onGazeUpdate);
  useEffect(() => { onGazeUpdateRef.current = onGazeUpdate; }, [onGazeUpdate]);

  // Unified Draw Function (60fps)
  const drawUI = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !video.videoWidth) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Scanning Laser Line
    scanLinePos.current = (scanLinePos.current + 2) % height;
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, scanLinePos.current);
    ctx.lineTo(width, scanLinePos.current);
    ctx.stroke();

    // 2. Draw Eye Indicators
    const eyes = eyesRef.current;
    if (eyes) {
      // Draw Face Box
      if (eyes.faceBox) {
        ctx.strokeStyle = faceDetected ? 'rgba(0, 255, 170, 0.8)' : 'rgba(0, 212, 255, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(
          (1 - eyes.faceBox.maxX) * width,
          eyes.faceBox.minY * height,
          (eyes.faceBox.maxX - eyes.faceBox.minX) * width,
          (eyes.faceBox.maxY - eyes.faceBox.minY) * height
        );
        ctx.setLineDash([]);
      }

      // Draw L / R Squares (Bold)
      const drawEyeSquare = (box, label) => {
        if (!box) return;
        const x = (1 - box.maxX) * width;
        const y = box.minY * height;
        const w = (box.maxX - box.minX) * width;
        const h = (box.maxY - box.minY) * height;
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00d4ff';
        ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
        
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 8px Inter, system-ui';
        ctx.fillText(label, x, y - 6);
      };

      drawEyeSquare(eyes.leftEyeBox, 'L');
      drawEyeSquare(eyes.rightEyeBox, 'R');
    } else {
      // Searching Text
      ctx.fillStyle = 'rgba(0, 212, 255, 0.6)';
      ctx.font = '10px DM Mono';
      ctx.fillText('VISION SEARCHING...', 10, 20);
    }
  }, [faceDetected]);

  // Main Detection Loop
  const runDetection = useCallback(async () => {
    if (!isEnabled || !videoRef.current || !landmarkerRef.current) {
      requestRef.current = requestAnimationFrame(runDetection);
      return;
    }

    if (videoRef.current.readyState >= 2) {
      try {
        const results = landmarkerRef.current.detect(videoRef.current);
        
        // --- Phase 19: Hardware & Environmental Diagnostics ---
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas?.getContext('2d', { willReadFrequently: true });
        let brightness = 0;
        
        // Throttled brightness check (every ~60 frames)
        if (canvas && scanLinePos.current < 2) {
           const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
           const data = imageData.data;
           let sum = 0;
           for(let i=0; i<data.length; i+=40) { // Sparse sampling for performance
             sum += (data[i] + data[i+1] + data[i+2]) / 3;
           }
           brightness = sum / (data.length / 40);
           
           // Notify Caregiver Hub if environment is subpar
           if (brightness < 40) {
             onGazeUpdateRef.current?.({ 
               type: 'HARDWARE_HEALTH', 
               status: 'LOW_LIGHT', 
               message: 'ICU lighting too low for precision tracking' 
             });
           }
        }

        if (results && results.faceLandmarks?.[0]) {
          const lms = results.faceLandmarks[0];
          
          // Calculate Bounding Boxes
          const getBox = (indices) => {
            let minX = 1, minY = 1, maxX = 0, maxY = 0;
            indices.forEach(i => {
              const p = lms[i];
              if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
              if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
            });
            return { minX, minY, maxX, maxY };
          };

          const faceBox = getBox([10, 152, 234, 454]);
          const leftEyeBox = getBox([33, 133, 157, 158, 159, 160, 161]);
          const rightEyeBox = getBox([362, 263, 384, 385, 386, 387, 388]);

          // Eye Ratios for Iris Tracking
          const l_out = lms[33], l_in = lms[133], r_in = lms[362], r_out = lms[263];
          const lp = lms[468], rp = lms[473];
          
          const denL = (l_in.x - l_out.x) || 0.001;
          const denR = (r_out.x - r_in.x) || 0.001;
          const leftRatio = (lp.x - l_out.x) / denL;
          const rightRatio = (rp.x - r_in.x) / denR;

          eyesRef.current = {
            faceBox, 
            leftEyeBox, 
            rightEyeBox,
            irisX: (leftRatio + rightRatio) / 2,
            irisY: (lp.y + rp.y) / 2
          };

          const ix = eyesRef.current.irisX;
          const iy = eyesRef.current.irisY;

          // Validate Signal Health (Avoid center-screen ghosting on initialization)
          if (typeof ix === 'number' && typeof iy === 'number' && !isNaN(ix) && !isNaN(iy)) {
            onGazeUpdateRef.current?.({ 
              gaze: {
                x: ix * window.innerWidth,
                y: iy * window.innerHeight
              },
              irisX: ix, 
              irisY: iy,
              stability: 0.95,
              health: brightness < 40 ? 'Fair' : 'Excellent',
              confidence: 0.95
            });
          }
        } else {
          eyesRef.current = null;
          // Notify Caregiver Hub of occlusion
          onGazeUpdateRef.current?.({ 
            type: 'HARDWARE_HEALTH', 
            status: 'OCCLUDED', 
            message: 'Patient face not visible' 
          });
        }
      } catch (err) {
        console.error('Vision processing error:', err);
      }
    }

    drawUI();
    requestRef.current = requestAnimationFrame(runDetection);
  }, [isEnabled, drawUI]);

  // Hardware Initialization
  useEffect(() => {
    let activeStream = null;
    let isActive = true;

    async function init() {
      if (!isEnabled) return;
      setIsInitializing(true);
      setError(null);

      try {
        // 1. Load MediaPipe
        const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest');
        const { FaceLandmarker, FilesetResolver } = vision;
        const filesetResolver = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');
        
        landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'IMAGE',
          numFaces: 1
        });

        // 2. Start Camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false
        });

        if (!isActive) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        activeStream = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraAvailable(true);
        setIsInitializing(false);
        
        // 3. Start Loop
        requestRef.current = requestAnimationFrame(runDetection);

      } catch (err) {
        console.error('Core Vision Init Failure:', err);
        setError(err.message);
        setIsInitializing(false);
        if (onError) onError(err);
      }
    }

    init();

    return () => {
      isActive = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      activeStream?.getTracks().forEach(t => t.stop());
      if (landmarkerRef.current) landmarkerRef.current.close();
    };
  }, [isEnabled, runDetection]);

  if (!isEnabled) return null;

  return (
    <div style={{
      position: 'fixed', top: '16px', left: '50%',
      transform: 'translateX(-50%)',
      width: '120px', height: '90px', borderRadius: '12px',
      overflow: 'hidden', border: '1px solid rgba(0,212,255,0.3)',
      zIndex: 50, background: '#080c10',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <video
        ref={videoRef}
        autoPlay playsInline muted
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transform: 'scaleX(-1)', opacity: 0.8,
          display: cameraAvailable ? 'block' : 'none',
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%', pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {(isInitializing || !cameraAvailable) && !error && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(8,12,16,0.9)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '8px', padding: '10px'
        }}>
          <Loader2 className="animate-spin text-medical" size={20} />
          <span style={{ fontSize: '10px', color: '#00d4ff', fontFamily: 'DM Mono' }}>ENGINE INIT...</span>
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(255,0,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '10px'
        }}>
          <AlertCircle className="text-emergency" size={20} />
        </div>
      )}
    </div>
  );
}

GazeEngine.propTypes = {
  faceDetected: PropTypes.bool.isRequired,
  onGazeUpdate: PropTypes.func.isRequired,
  onError: PropTypes.func,
  isEnabled: PropTypes.bool,
};
