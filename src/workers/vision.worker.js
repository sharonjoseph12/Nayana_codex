/* eslint-disable no-restricted-globals */
importScripts('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest');

const { FaceLandmarker, FilesetResolver } = self.tasksVision;

let FaceLandmarkerInstance = null;

async function initDetector() {
  try {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    FaceLandmarkerInstance = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      outputFaceBlendshapes: true,
      runningMode: 'IMAGE', // Changed to IMAGE for offscreen processing
      numFaces: 1,
    });
    self.postMessage({ type: 'READY' });
  } catch (error) {
    self.postMessage({ type: 'ERROR', error: error.message });
  }
}

initDetector();

self.onmessage = async (event) => {
  const { type, imageBitmap, startTimeMs } = event.data;

  if (type === 'PROCESS_FRAME' && FaceLandmarkerInstance && imageBitmap) {
    try {
      const results = FaceLandmarkerInstance.detect(imageBitmap);
      
      // Close ImageBitmap immediately to free memory
      imageBitmap.close();

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        const blendshapes = results.faceBlendshapes?.[0]?.categories || [];
        
        // Calculate Bounding Box inside the worker
        let minX = 1, minY = 1, maxX = 0, maxY = 0;
        for (let i = 0; i < landmarks.length; i++) {
          const l = landmarks[i];
          if (l.x < minX) minX = l.x; if (l.x > maxX) maxX = l.x;
          if (l.y < minY) minY = l.y; if (l.y > maxY) maxY = l.y;
        }

        // Calculate Eye Regions
        const getEyeBox = (indices) => {
          let eMinX = 1, eMinY = 1, eMaxX = 0, eMaxY = 0;
          indices.forEach(idx => {
            const l = landmarks[idx];
            if (l.x < eMinX) eMinX = l.x; if (l.x > eMaxX) eMaxX = l.x;
            if (l.y < eMinY) eMinY = l.y; if (l.y > eMaxY) eMaxY = l.y;
          });
          return { minX: eMinX, minY: eMinY, maxX: eMaxX, maxY: eMaxY };
        };

        const leftEyeBox = getEyeBox([33, 133, 157, 158, 159, 160, 161]);
        const rightEyeBox = getEyeBox([362, 263, 384, 385, 386, 387, 388]);

        self.postMessage({
          type: 'RESULTS',
          landmarks,
          faceBox: { minX, minY, maxX, maxY },
          leftEyeBox,
          rightEyeBox,
          stability: blendshapes.find(c => c.categoryName === 'eyeLookInLeft')?.score || 0.5,
          startTimeMs
        });
      } else {
        self.postMessage({ type: 'RESULTS', landmarks: null, startTimeMs });
      }
    } catch (error) {
      self.postMessage({ type: 'ERROR', error: error.message });
      imageBitmap.close();
    }
  }
};
