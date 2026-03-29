import { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export default function GazeEngine({ faceDetected, onGazeUpdate }) {
  const videoRef = useRef(null);
  const requestRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [mediapipeReady, setMediapipeReady] = useState(false);
  
  // Real-time physical pupil coordinates from WebCam feed [0.0 to 1.0]
  const [eyes, setEyes] = useState(null);

  const predictWebcam = useCallback(() => {
    if (!videoRef.current || !videoRef.current.videoWidth || !faceLandmarkerRef.current) {
      requestRef.current = requestAnimationFrame(predictWebcam);
      return;
    }
    
    const startTimeMs = performance.now();
    const results = faceLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0];
      
      let minX = 1, minY = 1, maxX = 0, maxY = 0;
      for (let i = 0; i < landmarks.length; i++) {
        if (landmarks[i].x < minX) minX = landmarks[i].x;
        if (landmarks[i].x > maxX) maxX = landmarks[i].x;
        if (landmarks[i].y < minY) minY = landmarks[i].y;
        if (landmarks[i].y > maxY) maxY = landmarks[i].y;
      }

      // Landmarks for robust gaze estimation
      // Left Eye: 33 (outer), 133 (inner), 468 (iris center)
      // Right Eye: 362 (inner), 263 (outer), 473 (iris center)
      const lp = landmarks[468];
      const rp = landmarks[473];
      const l_out = landmarks[33];
      const l_in = landmarks[133];
      const r_in = landmarks[362];
      const r_out = landmarks[263];

      if (lp && rp && l_in && r_in) {
        // Calculate horizontal gaze ratio (0.5 = looking straight)
        // Note: we average both eyes for stability
        const leftRatio = (lp.x - l_out.x) / (l_in.x - l_out.x);
        const rightRatio = (rp.x - r_in.x) / (r_out.x - r_in.x);
        const gazeX = (leftRatio + rightRatio) / 2;

        // Calculate vertical gaze ratio (using inner corner height as reference)
        const gazeY = (lp.y + rp.y) / 2; // Simple Y for now

        setEyes({
          faceBox: { minX, minY, maxX, maxY },
          left: { x: lp.x, y: lp.y },
          right: { x: rp.x, y: rp.y },
          vector: { x: gazeX, y: gazeY }
        });

        // Pass the high-frequency iris stability data to parent
        onGazeUpdate?.({
          irisX: gazeX,
          irisY: gazeY,
          stability: results.faceBlendshapes?.[0]?.categories?.find(c => c.categoryName === 'eyeLookInLeft')?.score || 0.5
        });
      }
    } else {
      setEyes(null);
    }
    
    requestRef.current = requestAnimationFrame(predictWebcam);
  }, [onGazeUpdate]);

  useEffect(() => {
    let activeStream;
    let isActive = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false,
        });
        if (!isActive) { stream.getTracks().forEach((t) => t.stop()); return; }
        activeStream = stream;
        setCameraAvailable(true);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (error) {
        setCameraAvailable(false);
      }
    }

    async function loadMediaPipe() {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: 'GPU',
          },
          outputFaceBlendshapes: true, // Needed for stability tracking
          runningMode: 'VIDEO',
          numFaces: 1,
        });
        if (isActive) setMediapipeReady(true);
      } catch (err) {
        if (isActive) setMediapipeReady(false);
      }
    }

    if (navigator.mediaDevices?.getUserMedia) { startCamera(); loadMediaPipe(); }

    return () => {
      isActive = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      activeStream?.getTracks().forEach((track) => track.stop());
      if (faceLandmarkerRef.current) { try { faceLandmarkerRef.current.close(); } catch {} }
    };
  }, []);

  useEffect(() => {
    if (!cameraAvailable || !mediapipeReady) return;
    if (videoRef.current?.readyState >= 2) predictWebcam();
    else videoRef.current?.addEventListener('loadeddata', predictWebcam, { once: true });
    return () => videoRef.current?.removeEventListener('loadeddata', predictWebcam);
  }, [cameraAvailable, mediapipeReady, predictWebcam]);

  const getTargetStyle = (pos) => {
    if (!pos) return { display: 'none' };
    return {
      position: 'absolute',
      left: `${(1 - pos.x) * 100}%`,
      top: `${pos.y * 100}%`,
      width: '18px',
      height: '18px',
      transform: 'translate(-50%, -50%)',
      border: faceDetected ? '1px solid rgba(0, 255, 170, 0.6)' : '1px solid rgba(0, 212, 255, 0.4)',
      boxShadow: faceDetected ? 'inset 0 0 6px rgba(0, 255, 170, 0.2)' : 'inset 0 0 6px rgba(0, 212, 255, 0.2)',
      transition: 'opacity 0.1s',
      opacity: faceDetected ? 0.95 : 0.4,
    };
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '16px',
        width: '120px',
        height: '90px',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid rgba(0,212,255,0.35)',
        zIndex: 50,
        background: '#000',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.08)',
      }}
    >
      <video
        id="nayana-iris-video"
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)',
          opacity: 0.85,
          display: cameraAvailable ? 'block' : 'none',
        }}
      />

      {cameraAvailable && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
          {eyes?.faceBox && (
            <div style={{
              position: 'absolute',
              left: `${(1 - eyes.faceBox.maxX) * 100}%`,
              top: `${eyes.faceBox.minY * 100}%`,
              width: `${(eyes.faceBox.maxX - eyes.faceBox.minX) * 100}%`,
              height: `${(eyes.faceBox.maxY - eyes.faceBox.minY) * 100}%`,
              border: faceDetected ? '1px dashed rgba(0, 255, 170, 0.4)' : '1px dashed rgba(0, 212, 255, 0.3)',
              opacity: faceDetected ? 1 : 0.2,
            }} />
          )}
          <div style={getTargetStyle(eyes?.left)}>
             <div style={{ position: 'absolute', top: '50%', left: '50%', width: 2, height: 2, background: faceDetected ? '#00ffaa' : '#00d4ff', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
          </div>
          <div style={getTargetStyle(eyes?.right)}>
             <div style={{ position: 'absolute', top: '50%', left: '50%', width: 2, height: 2, background: faceDetected ? '#00ffaa' : '#00d4ff', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
          </div>
        </div>
      )}

      {!cameraAvailable && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '4px',
          color: 'rgba(255,255,255,0.35)', fontSize: '9px', fontFamily: 'DM Mono, monospace',
        }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid rgba(0,212,255,0.15)', borderTopColor: 'rgba(0,212,255,0.7)', animation: 'spin 0.9s linear infinite' }} />
          CAM…
        </div>
      )}

      <div style={{ position: 'absolute', top: '3px', left: '4px', display: 'flex', alignItems: 'center', gap: '3px', zIndex: 20 }}>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: faceDetected ? '#00ffaa' : '#ff3d5a', animation: 'pulseSoft 1.5s infinite' }} />
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '7px', color: faceDetected ? '#00ffaa' : '#ff3d5a' }}>
          {cameraAvailable ? (faceDetected ? 'LIVE' : 'NO FACE') : 'STARTING'}
        </span>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 3px)', pointerEvents: 'none', zIndex: 15 }} />
    </div>
  );
}

GazeEngine.propTypes = {
  faceDetected: PropTypes.bool.isRequired,
  onGazeUpdate: PropTypes.func,
};
