/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useSession } from 'next-auth/react';
import { Camera, Upload, Check, AlertCircle, RefreshCw, MessageCircle, HelpCircle, Sliders, Flame, X } from 'lucide-react';
import { loadScript } from '@/lib/loadScript';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { buildWhatsAppUrl, WHATSAPP_STORE } from '@/utils/whatsapp';

// Feature flags for try-on fitting engine A/B testing and local calibration debugging
const USE_NEW_FITTING_ENGINE = true;
const ENABLE_DEBUG_HUD = false; // Set to true to render nose bridge (168), nose tip (1), and pitch stats on canvas in local dev

interface Product {
  id: string;
  name: string;
  category: 'glasses' | 'sunglasses' | 'watches';
  price: number;
  description: string;
  image_url: string;
  overlay_image_url: string;
  lens_image_url?: string;
  reflection_image_url?: string;
  overlay_scale?: number | null;
  overlay_x_offset?: number | null;
  overlay_y_offset?: number | null;
  overlay_rotation_offset?: number | null;
  stock: number;
}

interface GlassesTryOnCanvasProps {
  product: Product;
}

export default function GlassesTryOnCanvas({ product }: GlassesTryOnCanvasProps) {
  
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderFrameId = useRef<number | null>(null);
  const faceMeshRef = useRef<any>(null);
  const overlayImageRef = useRef<HTMLImageElement | null>(null);
  const overlayCropRef = useRef<{ shiftX: number; shiftY: number } | null>(null);
  const lensImageRef = useRef<HTMLImageElement | null>(null);
  const reflectionImageRef = useRef<HTMLImageElement | null>(null);
  const uploadedImageRef = useRef<HTMLImageElement | null>(null);
  
  // Decoupled Landmark Ref (WebGL engine style)
  const latestLandmarks = useRef<any>(null);

  // App States
  const [cameraState, setCameraState] = useState<'loading' | 'active' | 'denied' | 'fallback'>('loading');
  const [loadingMessage, setLoadingMessage] = useState('Initializing virtual mirror...');
  const [faceDetected, setFaceDetected] = useState(false);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string>('default');
  const [showAdjustPanel, setShowAdjustPanel] = useState(false);



  // Camera Selection States
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Fallback Manual Overlay States (if no face detected / static upload)
  const [manualScale, setManualScale] = useState(1.0);
  const [manualPosition, setManualPosition] = useState({ x: 0, y: 0 });
  const [manualRotation, setManualRotation] = useState(0); // in degrees
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Refs to prevent stale closure bugs in requestAnimationFrame loops
  const cameraStateRef = useRef(cameraState);
  const manualScaleRef = useRef(manualScale);
  const manualPositionRef = useRef(manualPosition);
  const manualRotationRef = useRef(manualRotation);

  // Diagnostic Refs
  const detectionFrameCount = useRef(0);
  const detectionError = useRef<string | null>(null);

  useEffect(() => { cameraStateRef.current = cameraState; }, [cameraState]);
  useEffect(() => { manualScaleRef.current = manualScale; }, [manualScale]);
  useEffect(() => { manualPositionRef.current = manualPosition; }, [manualPosition]);
  useEffect(() => { manualRotationRef.current = manualRotation; }, [manualRotation]);

  // Conversion Boosting Widgets
  const [liveViewers, setLiveViewers] = useState<number>(55);

  // Initialize and update live viewers
  useEffect(() => {
    setLiveViewers(Math.floor(Math.random() * (95 - 45 + 1)) + 45);
    const interval = setInterval(() => {
      setLiveViewers((prev) => {
        const delta = Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : -(Math.floor(Math.random() * 3) + 1);
        const next = prev + delta;
        return next >= 40 && next <= 100 ? next : prev;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Deterministic count based on product ID character codes
  const salesCount = (product.id.charCodeAt(0) % 12) + 4;
  const salesHours = (product.id.charCodeAt(1) % 18) + 6;

  // Session details for Admin Live Calibration Mode
  const { data: session } = useSession();
  const [showCalibrator, setShowCalibrator] = useState(false);

  useEffect(() => {
    setShowCalibrator(!!session);
  }, [session]);

  // Live calibration override states
  const [liveScale, setLiveScale] = useState<number>(product.overlay_scale !== null && product.overlay_scale !== undefined ? Number(product.overlay_scale) : 1.0);
  const [liveXOffset, setLiveXOffset] = useState<number>(product.overlay_x_offset !== null && product.overlay_x_offset !== undefined ? Number(product.overlay_x_offset) : 0.0);
  const [liveYOffset, setLiveYOffset] = useState<number>(product.overlay_y_offset !== null && product.overlay_y_offset !== undefined ? Number(product.overlay_y_offset) : 0.0);
  const [liveRotationOffset, setLiveRotationOffset] = useState<number>(product.overlay_rotation_offset !== null && product.overlay_rotation_offset !== undefined ? Number(product.overlay_rotation_offset) : 0.0);

  const liveScaleRef = useRef(liveScale);
  const liveXOffsetRef = useRef(liveXOffset);
  const liveYOffsetRef = useRef(liveYOffset);
  const liveRotationOffsetRef = useRef(liveRotationOffset);

  useEffect(() => { liveScaleRef.current = liveScale; }, [liveScale]);
  useEffect(() => { liveXOffsetRef.current = liveXOffset; }, [liveXOffset]);
  useEffect(() => { liveYOffsetRef.current = liveYOffset; }, [liveYOffset]);
  useEffect(() => { liveRotationOffsetRef.current = liveRotationOffset; }, [liveRotationOffset]);

  useEffect(() => {
    setLiveScale(product.overlay_scale !== null && product.overlay_scale !== undefined ? Number(product.overlay_scale) : 1.0);
    setLiveXOffset(product.overlay_x_offset !== null && product.overlay_x_offset !== undefined ? Number(product.overlay_x_offset) : 0.0);
    setLiveYOffset(product.overlay_y_offset !== null && product.overlay_y_offset !== undefined ? Number(product.overlay_y_offset) : 0.0);
    setLiveRotationOffset(product.overlay_rotation_offset !== null && product.overlay_rotation_offset !== undefined ? Number(product.overlay_rotation_offset) : 0.0);
    setSelectedOverlayId('default');
  }, [product]);

  // Load try-on assets (overlay frame, lens, reflection) dynamically
  useEffect(() => {
    const activeUrl = selectedOverlayId === 'default'
      ? product.overlay_image_url
      : selectedOverlayId === 'style_1'
        ? '/images/overlays/first_1.png'
        : selectedOverlayId === 'style_2'
          ? '/images/overlays/first_2.png'
          : '/images/overlays/first_3.png';
    const cb = `cb=${Date.now()}`;

    // Load overlay image with cache-busting to prevent cached non-CORS response errors
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeUrl.includes('?')
      ? `${activeUrl}&${cb}`
      : `${activeUrl}?${cb}`;
    img.onload = () => {
      overlayImageRef.current = img;
      
      // Auto-trim transparent padding to center the actual frame correctly
      try {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.naturalWidth;
        tempCanvas.height = img.naturalHeight;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(img, 0, 0);
          const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const data = imgData.data;
          
          let minX = tempCanvas.width;
          let maxX = 0;
          let minY = tempCanvas.height;
          let maxY = 0;
          let hasPixels = false;
          
          for (let y = 0; y < tempCanvas.height; y++) {
            for (let x = 0; x < tempCanvas.width; x++) {
              const alpha = data[(y * tempCanvas.width + x) * 4 + 3];
              // Use alpha > 30 to be robust against noise/semi-transparent compression artifacts
              if (alpha > 30) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                hasPixels = true;
              }
            }
          }
          
          if (hasPixels) {
            const w = maxX - minX + 1;
            const h = maxY - minY + 1;
            const actualCenterX = minX + w / 2;
            const actualCenterY = minY + h / 2;
            const dx = actualCenterX - img.naturalWidth / 2;
            const dy = actualCenterY - img.naturalHeight / 2;
            
            overlayCropRef.current = {
              shiftX: -dx / img.naturalWidth,
              shiftY: -dy / img.naturalHeight
            };
          } else {
            overlayCropRef.current = { shiftX: 0, shiftY: 0 };
          }
        }
      } catch (e) {
        console.warn('Auto-trim failed (possibly CORS restrictions):', e);
        overlayCropRef.current = { shiftX: 0, shiftY: 0 };
      }
    };
    img.onerror = () => {
      console.error('Failed to load overlay image, using fallbacks.');
    };

    // Load optional lens image with cache-busting
    if (product.lens_image_url) {
      const lensImg = new Image();
      lensImg.crossOrigin = 'anonymous';
      lensImg.src = product.lens_image_url.includes('?')
        ? `${product.lens_image_url}&${cb}`
        : `${product.lens_image_url}?${cb}`;
      lensImg.onload = () => {
        lensImageRef.current = lensImg;
      };
      lensImg.onerror = () => {
        console.error('Failed to load lens image.');
      };
    } else {
      lensImageRef.current = null;
    }

    // Load optional reflection image with cache-busting
    if (product.reflection_image_url) {
      const reflImg = new Image();
      reflImg.crossOrigin = 'anonymous';
      reflImg.src = product.reflection_image_url.includes('?')
        ? `${product.reflection_image_url}&${cb}`
        : `${product.reflection_image_url}?${cb}`;
      reflImg.onload = () => {
        reflectionImageRef.current = reflImg;
      };
      reflImg.onerror = () => {
        console.error('Failed to load reflection image.');
      };
    } else {
      reflectionImageRef.current = null;
    }
  }, [product, selectedOverlayId]);

  // Initialize and load dependencies once on mount
  useEffect(() => {
    let active = true;

    async function init() {
      try {
        setLoadingMessage('Loading Face Tracking engine...');
        // Load MediaPipe FaceMesh locally
        await loadScript('/libs/mediapipe/camera_utils.js');
        await loadScript('/libs/mediapipe/face_mesh.js');

        if (!active) return;

        // Configure FaceMesh
        const FaceMeshClass = (window as any).FaceMesh;
        if (!FaceMeshClass) {
          throw new Error('FaceMesh library not loaded.');
        }

        const faceMesh = new FaceMeshClass({
          locateFile: (file: string) => `/libs/mediapipe/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults(handleFaceResults);
        faceMeshRef.current = faceMesh;

        // Start default webcam stream
        startWebcam();
      } catch (err) {
        console.error('Error initializing try-on canvas:', err);
        if (active) {
          setCameraState('denied');
          setLoadingMessage('');
        }
      }
    }

    init();

    // Clean up
    return () => {
      active = false;
      stopAllStreams();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop video streams and cancel animation loops
  const stopAllStreams = () => {
    if (renderFrameId.current) {
      cancelAnimationFrame(renderFrameId.current);
      renderFrameId.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Start the camera
  const startWebcam = async (deviceId?: string) => {
    stopAllStreams();
    setCameraState('loading');
    setLoadingMessage('Accessing camera, please allow permissions...');
    latestLandmarks.current = null;
    setFaceDetected(false);

    try {
      const constraints: any = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: deviceId ? undefined : 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Enumerate device options for multi-camera selectors after permission grant
      navigator.mediaDevices.enumerateDevices().then((devicesList) => {
        const videoDevices = devicesList.filter((d) => d.kind === 'videoinput');
        setDevices(videoDevices);
        if (!deviceId && videoDevices.length > 0) {
          // Sync default selected id
          const defaultDevice = videoDevices.find((d) => d.label.toLowerCase().includes('front') || d.label.toLowerCase().includes('integrated')) || videoDevices[0];
          setSelectedDeviceId(defaultDevice.deviceId);
        }
      }).catch((e) => console.warn('Could not enumerate media devices:', e));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        videoRef.current.muted = true;
        
        videoRef.current.onloadedmetadata = async () => {
          setCameraState('active');
          
          try {
            if (videoRef.current) {
              await videoRef.current.play();
            }
          } catch (playErr) {
            console.error('Autoplay blocked or failed:', playErr);
          }

          // Start the decoupled fast rendering loop (60fps)
          if (renderFrameId.current) cancelAnimationFrame(renderFrameId.current);
          renderFrameId.current = requestAnimationFrame(drawLoop);

          // Start the decoupled detection loop
          startDetectionLoop();
        };
      }
    } catch (error) {
      console.warn('Camera access denied or unavailable:', error);
      setCameraState('denied');
    }
  };

  // Asynchronous detection loop (decoupled from rendering loop)
  const startDetectionLoop = () => {
    let isDetecting = false;
    let logCounter = 0;
    
    const runDetection = async () => {
      const currentCameraState = cameraStateRef.current;
      logCounter++;
      if (logCounter % 100 === 0) {
        console.log('runDetection tick:', {
          currentCameraState,
          videoExists: !!videoRef.current,
          videoReadyState: videoRef.current?.readyState,
          videoWidth: videoRef.current?.videoWidth,
          videoHeight: videoRef.current?.videoHeight,
          faceMeshExists: !!faceMeshRef.current,
          isDetecting
        });
      }

      if (currentCameraState === 'active' && videoRef.current && faceMeshRef.current && !isDetecting) {
        if (videoRef.current.readyState >= 2) { // HAVE_CURRENT_DATA or higher
          isDetecting = true;
          try {
            if (logCounter % 100 === 0) {
              console.log('Sending frame to FaceMesh...');
            }
            await faceMeshRef.current.send({ image: videoRef.current });
            detectionFrameCount.current += 1;
            detectionError.current = null;
          } catch (err: any) {
            console.error('FaceMesh frame processing error:', err);
            detectionError.current = err?.message || String(err);
          } finally {
            isDetecting = false;
          }
        } else {
          if (logCounter % 100 === 0) {
            console.warn('Video not ready, readyState:', videoRef.current.readyState);
          }
        }
      }
      
      // Schedule next check in 10ms (maximizes tracking throughput on available CPU)
      if (cameraStateRef.current === 'active' || cameraStateRef.current === 'loading') {
        setTimeout(runDetection, 10);
      }
    };

    runDetection();
  };

  // Callback when FaceMesh yields results
  const handleFaceResults = (results: any) => {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      latestLandmarks.current = results.multiFaceLandmarks[0];
      setFaceDetected(true);
    } else {
      latestLandmarks.current = null;
      setFaceDetected(false);
    }
  };

  // High-performance decoupled draw loop (runs at 60fps)
  const drawLoop = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      const currentCameraState = cameraStateRef.current;

      // 1. Draw webcam feed or uploaded photo (mirrored, cover-fill)
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      
      if (currentCameraState === 'active' && videoRef.current && videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
        const vw = videoRef.current.videoWidth;
        const vh = videoRef.current.videoHeight;
        const scale = Math.max(width / vw, height / vh);
        const drawW = vw * scale;
        const drawH = vh * scale;
        const drawX = (width - drawW) / 2;
        const drawY = (height - drawH) / 2;
        ctx.drawImage(videoRef.current, drawX, drawY, drawW, drawH);
      } else if (currentCameraState === 'fallback' && uploadedImageRef.current) {
        const img = uploadedImageRef.current;
        const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
        const drawW = img.naturalWidth * scale;
        const drawH = img.naturalHeight * scale;
        const drawX = (width - drawW) / 2;
        const drawY = (height - drawH) / 2;
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      } else {
        // Background fallback
        ctx.fillStyle = '#0F1B30';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();

      // 2. Draw overlay based on landmarks or manual sliders
      if ((currentCameraState === 'active' || currentCameraState === 'fallback') && latestLandmarks.current) {
        const landmarks = latestLandmarks.current;
        
        const getX = (lm: any) => (1 - lm.x) * width; // Mirrored coordinate mapping
        const getY = (lm: any) => lm.y * height;

        const x_left_eye = getX(landmarks[33]);
        const y_left_eye = getY(landmarks[33]);
        const x_right_eye = getX(landmarks[263]);
        const y_right_eye = getY(landmarks[263]);

        const dx_eyes = x_left_eye - x_right_eye;
        const dy_eyes = y_left_eye - y_right_eye;
        const eyeDistance = Math.sqrt(dx_eyes * dx_eyes + dy_eyes * dy_eyes);

        // Center computed from eye outer corners (33 and 263)
        const x_center = (x_left_eye + x_right_eye) / 2;
        const y_center = (y_left_eye + y_right_eye) / 2;

        const x_left = getX(landmarks[234]);
        const x_right = getX(landmarks[454]);

        const dx = x_left - x_right;
        const dy = (currentCameraState === 'active' ? getY(landmarks[234]) : getY(landmarks[234])) - (currentCameraState === 'active' ? getY(landmarks[454]) : getY(landmarks[454]));
        const baseDistance = Math.sqrt(dx * dx + dy * dy);
        
        // Retrieve live try-on alignment scaling and positioning overrides
        const overlayScale = liveScaleRef.current;
        const overlayXOffset = liveXOffsetRef.current;
        const overlayYOffset = liveYOffsetRef.current;
        const overlayRotationOffset = liveRotationOffsetRef.current;

        // Yaw/Perspective correction
        const dist_to_left = Math.abs(x_center - x_left);
        const dist_to_right = Math.abs(x_right - x_center);
        const symmetry_ratio = Math.min(dist_to_left, dist_to_right) / Math.max(dist_to_left, dist_to_right);
        const yaw = (dist_to_left - dist_to_right) / (dist_to_left + dist_to_right || 1);

        // Rotation angle based strictly on eyes (extremely stable, no perspective distortion)
        const rollAngle = Math.atan2(y_left_eye - y_right_eye, x_left_eye - x_right_eye);

        let glassesWidth = 0;
        let x_center_shifted = 0;
        let y_center_shifted = 0;

        if (USE_NEW_FITTING_ENGINE) {
          const x_168 = getX(landmarks[168]);
          const y_168 = getY(landmarks[168]);
          const x_tip = getX(landmarks[1]);
          const y_tip = getY(landmarks[1]);

          // Tighter scaling: use mostly eye distance, less cheekbone for natural fit
          glassesWidth = (baseDistance * 0.42 + eyeDistance * 0.95) * 0.85 * overlayScale;
          if (symmetry_ratio < 0.95) {
            glassesWidth = glassesWidth * (0.88 + 0.12 * symmetry_ratio);
          }

          // Pitch compensation: detect up/down tilt using normalized nose-tip relative position
          const pitch = (y_tip - y_168) / eyeDistance;
          const pitchCompensation = -(pitch - 0.35) * eyeDistance * 0.30;

          // Composite positioning: anchor to landmark 168 + vertical lens shift + tilt correction
          x_center_shifted = x_168 + overlayXOffset;
          y_center_shifted = y_168 + eyeDistance * 0.14 + pitchCompensation + overlayYOffset;

          // Render temporary debug visuals if enabled locally
          if (ENABLE_DEBUG_HUD) {
            ctx.save();
            // Draw landmark 168 (Nose bridge) in blue
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            ctx.arc(x_168, y_168, 4, 0, 2 * Math.PI);
            ctx.fill();

            // Draw landmark 1 (Nose tip) in red
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(x_tip, y_tip, 4, 0, 2 * Math.PI);
            ctx.fill();

            // Draw final calculated anchor position in gold
            ctx.fillStyle = 'gold';
            ctx.beginPath();
            ctx.arc(x_center_shifted, y_center_shifted, 5, 0, 2 * Math.PI);
            ctx.fill();

            // Render overlay text details
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, 40, 220, 60);
            ctx.fillStyle = '#C9A84C';
            ctx.font = 'bold 11px monospace';
            ctx.fillText(`Pitch: ${pitch.toFixed(3)}`, 20, 58);
            ctx.fillText(`Comp: ${pitchCompensation.toFixed(1)}px`, 20, 74);
            ctx.fillText(`Width: ${glassesWidth.toFixed(1)}px`, 20, 90);
            ctx.restore();
          }
        } else {
          // Old engine math:
          glassesWidth = baseDistance * 1.53 * overlayScale;
          if (symmetry_ratio < 0.95) {
            glassesWidth = glassesWidth * (0.88 + 0.12 * symmetry_ratio);
          }
          x_center_shifted = x_center + overlayXOffset;
          y_center_shifted = y_center + eyeDistance * 0.16 + overlayYOffset;
        }

        if (overlayImageRef.current) {
          const img = overlayImageRef.current;
          const aspectRatio = img.naturalHeight / img.naturalWidth;
          const glassesHeight = glassesWidth * aspectRatio;

          ctx.save();
          ctx.translate(x_center_shifted, y_center_shifted);
          ctx.rotate(rollAngle + (overlayRotationOffset * Math.PI) / 180);
          
          // Apply 3D perspective skew based on head yaw
          ctx.transform(1, 0, yaw * 0.22, 1, 0, 0);

          let shiftX = 0;
          let shiftY = 0;
          if (overlayCropRef.current) {
            shiftX = overlayCropRef.current.shiftX * glassesWidth;
            shiftY = overlayCropRef.current.shiftY * glassesHeight;
          }

          // 1. Draw Lens Layer (Behind the Frame)
          if (lensImageRef.current || product.category === 'glasses') {
            ctx.save();
            if (lensImageRef.current) {
              ctx.globalAlpha = 0.65; // G-15 Green Lens opacity = 65%
              // Custom Lens Layer PNG (aligned with shifted frame center)
              ctx.drawImage(lensImageRef.current, -glassesWidth / 2 + shiftX, -glassesHeight / 2 + shiftY, glassesWidth, glassesHeight);
            } else if (product.category === 'glasses') {
              ctx.globalAlpha = 0.15; // Clear glass blue-light tint
              // Programmatic Lens Tint Layer (Locked to center to align with trimmed frame center)
              const radiusX = glassesWidth * 0.165; 
              const radiusY = glassesHeight * 0.32;
 
              ctx.beginPath();
              ctx.ellipse(-glassesWidth * 0.21 + shiftX, shiftY, radiusX, radiusY, 0, 0, 2 * Math.PI);
              ctx.ellipse(glassesWidth * 0.21 + shiftX, shiftY, radiusX, radiusY, 0, 0, 2 * Math.PI);
 
              ctx.fillStyle = 'rgba(215, 230, 255, 0.15)'; // Blue-light clear tint
              ctx.fill();
            }
            ctx.restore();
          }

          // 2. Draw Frame Layer (Full Opacity, shifted dynamically based on padding)
          ctx.save();
          ctx.globalAlpha = 1.0;
          ctx.drawImage(img, -glassesWidth / 2 + shiftX, -glassesHeight / 2 + shiftY, glassesWidth, glassesHeight);
          ctx.restore();

          // 3. Draw Reflection Layer (On Top)
          if (reflectionImageRef.current) {
            ctx.save();
            ctx.globalAlpha = 0.25;
            ctx.drawImage(reflectionImageRef.current, -glassesWidth / 2 + shiftX, -glassesHeight / 2 + shiftY, glassesWidth, glassesHeight);
            ctx.restore();
          }

          ctx.restore();
        } else {
          ctx.save();
          ctx.translate(x_center_shifted, y_center_shifted);
          ctx.rotate(rollAngle + (overlayRotationOffset * Math.PI) / 180);
          ctx.strokeStyle = '#C9A84C';
          ctx.lineWidth = 4;
          ctx.strokeRect(-glassesWidth / 2, -10, glassesWidth, 20);
          ctx.restore();
        }

        // Calibration debug landmarks removed for production launch readiness
      } else {
        // Manual dragging mode (fallback / denied / no face found)
        const x = manualPositionRef.current.x === 0 ? width / 2 : manualPositionRef.current.x;
        const y = manualPositionRef.current.y === 0 ? height / 2.3 : manualPositionRef.current.y;

        if (overlayImageRef.current) {
          const img = overlayImageRef.current;
          const aspectRatio = img.naturalHeight / img.naturalWidth;
          const w = 180 * manualScaleRef.current;
          const h = w * aspectRatio;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((manualRotationRef.current * Math.PI) / 180);
          
          // 1. Draw Lenses (Behind Frame)
          if (lensImageRef.current || product.category === 'glasses') {
            ctx.save();
            if (lensImageRef.current) {
              ctx.globalAlpha = 0.65;
              ctx.drawImage(lensImageRef.current, -w / 2, -h / 2, w, h);
            } else if (product.category === 'glasses') {
              ctx.globalAlpha = 0.15; // Clear glass blue-light tint
              const radiusX = w * 0.15;
              const radiusY = h * 0.28;
              
              ctx.beginPath();
              ctx.ellipse(-w * 0.22, 0, radiusX, radiusY, 0, 0, 2 * Math.PI);
              ctx.ellipse(w * 0.22, 0, radiusX, radiusY, 0, 0, 2 * Math.PI);
              
              ctx.fillStyle = 'rgba(215, 230, 255, 0.15)'; // Blue-light clear tint
              ctx.fill();
            }
            ctx.restore();
          }
          
          // 2. Draw Frame (Full Opacity)
          ctx.save();
          ctx.globalAlpha = 1.0;
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
          ctx.restore();

          // 3. Draw Reflections (On Top)
          if (reflectionImageRef.current) {
            ctx.save();
            ctx.globalAlpha = 0.25;
            ctx.drawImage(reflectionImageRef.current, -w / 2, -h / 2, w, h);
            ctx.restore();
          }
          
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8);
          ctx.restore();
        }
      }


    } catch (e) {
      console.error('Error in canvas drawLoop:', e);
    } finally {
      const currentCameraState = cameraStateRef.current;
      // Continue drawing loop at 60fps
      if (currentCameraState === 'active' || currentCameraState === 'fallback') {
        renderFrameId.current = requestAnimationFrame(drawLoop);
      }
    }
  };

  // Camera Selector Handler
  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const devId = e.target.value;
    setSelectedDeviceId(devId);
    startWebcam(devId);
  };

  // File Upload Handlers (Fallback)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo is too large. Max size is 5MB.');
      return;
    }

    setCameraState('loading');
    setLoadingMessage('Loading uploaded image...');
    stopAllStreams();
    latestLandmarks.current = null;
    setFaceDetected(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        uploadedImageRef.current = img;
        setCameraState('fallback');
        
        // Reset manual position to center of canvas
        const canvas = canvasRef.current;
        if (canvas) {
          setManualPosition({ x: canvas.width / 2, y: canvas.height / 2.3 });
          setManualScale(1.0);
          setManualRotation(0);
        }

        // Start render loop for static image
        if (renderFrameId.current) cancelAnimationFrame(renderFrameId.current);
        renderFrameId.current = requestAnimationFrame(drawLoop);

        // Run face-mesh on uploaded static image
        setTimeout(async () => {
          if (faceMeshRef.current) {
            try {
              await faceMeshRef.current.send({ image: img });
            } catch (err) {
              console.error('Error running facemesh on static image:', err);
            }
          }
        }, 300);
      };
    };
    reader.readAsDataURL(file);
  };

  // Drag-and-drop mechanics for manual adjustments
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (cameraState !== 'fallback' && cameraState !== 'denied' && !faceDetected) return;
    // Allow dragging in fallback/denied modes
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({
      x: x - (manualPosition.x === 0 ? canvas.width / 2 : manualPosition.x),
      y: y - (manualPosition.y === 0 ? canvas.height / 2.3 : manualPosition.y),
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setManualPosition({
      x: x - dragStart.x,
      y: y - dragStart.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (cameraState !== 'fallback' && cameraState !== 'denied') return;
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    setIsDragging(true);
    setDragStart({
      x: x - (manualPosition.x === 0 ? canvas.width / 2 : manualPosition.x),
      y: y - (manualPosition.y === 0 ? canvas.height / 2.3 : manualPosition.y),
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    setManualPosition({
      x: x - dragStart.x,
      y: y - dragStart.y,
    });
  };

  // WhatsApp Inquiry
  const handleInquiry = () => {
    const msg = `Hi Hariyana Watch & Opticals! 👋\n\nI'm interested in purchasing:\n\n*${product.name}*\nPrice: ₹${product.price.toLocaleString('en-IN')}\n\nPlease share availability and more details. Thank you!`;
    const url = buildWhatsAppUrl(msg, WHATSAPP_STORE);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Back to catalog */}
      <div className="mb-4">
        <Link href="/products" className="text-sm text-gray-400 hover:text-[#C9A84C] transition-colors flex items-center gap-1.5">
          ← Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-start">
        {/* Try-on Mirror Container (Left column) */}
        <div className="lg:col-span-8 space-y-3">
          
          {/* Camera Device Selector — only show on desktop or when multiple cameras exist */}
          {cameraState === 'active' && devices.length > 1 && (
            <div className="hidden sm:flex items-center justify-between bg-[#0F1B30]/80 p-2.5 rounded-lg border border-[#C9A84C]/20 text-xs">
              <span className="text-gray-300 font-semibold uppercase tracking-wider flex items-center">
                <Camera className="w-3.5 h-3.5 text-[#C9A84C] mr-1.5" /> Camera:
              </span>
              <select
                value={selectedDeviceId}
                onChange={handleDeviceChange}
                className="bg-[#1A2742] border border-gray-700 text-white rounded px-2 py-1 focus:outline-none focus:border-[#C9A84C] text-xs"
              >
                {devices.map((device, idx) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Canvas Wrapper — portrait on mobile, landscape on desktop */}
          <div className="relative w-full bg-[#0F1B30] rounded-xl overflow-hidden shadow-2xl border border-white/5 aspect-[3/4] sm:aspect-[4/3]">
            {/* Loading Cover */}
            {cameraState === 'loading' && (
              <div className="absolute inset-0 z-30 bg-[#0B1422] flex flex-col items-center justify-center p-6 text-center space-y-4">
                <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 text-[#C9A84C] animate-spin" />
                <p className="text-xs sm:text-sm font-semibold text-gray-300">{loadingMessage}</p>
                <p className="text-[10px] text-gray-500 max-w-xs">Face the camera and stay still for best results</p>
              </div>
            )}

            {/* Permission Denied UI */}
            {cameraState === 'denied' && (
              <div className="absolute inset-0 z-30 bg-[#0F1B30] flex flex-col items-center justify-center p-6 sm:p-8 text-center space-y-4">
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full">
                  <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm sm:text-base uppercase font-luxury">Camera Blocked</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mt-2 leading-relaxed">
                    Camera permissions were denied. Allow camera in browser settings, or upload a selfie below.
                  </p>
                </div>
                <label className="flex items-center space-x-2 px-4 py-2 bg-[#C9A84C] text-[#0B1422] hover:bg-[#C9A84C]/90 rounded-md text-xs font-bold cursor-pointer transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Upload Selfie to Try On</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                <button onClick={() => startWebcam(selectedDeviceId)} className="text-[#C9A84C] text-xs font-semibold underline hover:text-[#E8D9A0] transition-colors">
                  Try again
                </button>
              </div>
            )}


            {/* Hidden video element */}
            <video
              ref={videoRef}
              width={640}
              height={480}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                opacity: 0.01,
                zIndex: -10,
                pointerEvents: 'none'
              }}
              playsInline
              muted
            />

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUpOrLeave}
              style={{ width: '100%', height: '100%', display: 'block' }}
              className={`select-none object-cover ${cameraState === 'fallback' || cameraState === 'denied' ? 'cursor-move' : ''}`}
            />

            {/* Status HUD */}
            {cameraState === 'active' && (
              <div className="absolute top-3 left-3 z-20 bg-black/65 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/10 text-[10px] uppercase font-bold tracking-wider text-white flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                <span>{faceDetected ? 'Face Locked ✓' : 'Show your face...'}</span>
              </div>
            )}

            {/* Adjust button overlay */}
            {cameraState !== 'loading' && cameraState !== 'denied' && (
              <button
                onClick={() => setShowAdjustPanel(!showAdjustPanel)}
                className="absolute bottom-3 right-3 z-20 bg-black/70 backdrop-blur-sm border border-[#C9A84C]/40 text-[#C9A84C] px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-black/90 transition-all"
              >
                <Sliders className="w-3 h-3" />
                Adjust
              </button>
            )}

            {/* Upload overlay */}
            {cameraState === 'active' && (
              <label className="absolute bottom-3 left-3 z-20 bg-black/65 backdrop-blur-sm border border-white/10 text-gray-300 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:border-[#C9A84C]/40 hover:text-[#C9A84C] transition-all cursor-pointer">
                <Upload className="w-3 h-3" />
                Upload Selfie
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>



          {/* Tip bar */}
          <div className="p-3 sm:p-4 bg-[#0F1B30]/60 rounded-lg border border-white/5 flex items-start sm:items-center gap-3">
            <HelpCircle className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="text-white font-semibold">Tip:</span> Face the camera directly for automatic detection. Use the <span className="text-[#C9A84C]">Adjust</span> button to fine-tune the fit.
            </p>
          </div>

          {/* Adjustment Panel (collapsible) */}
          {showAdjustPanel && cameraState !== 'loading' && (
            <div className="p-4 sm:p-5 bg-[#0F1B30]/90 backdrop-blur-md rounded-xl border border-[#C9A84C]/20 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h4 className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider flex items-center">
                  <Sliders className="w-3.5 h-3.5 mr-2" />
                  {faceDetected ? 'Fine-tune Glasses Fit' : 'Manual Placement'}
                </h4>
                <button onClick={() => setShowAdjustPanel(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {faceDetected ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-white">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Glasses Size</span>
                      <div className="flex items-center space-x-1.5">
                        <button type="button" onClick={() => setLiveScale(prev => Math.max(0.3, Number((prev - 0.05).toFixed(2))))} className="w-6 h-6 bg-[#1A2742] border border-gray-700 hover:border-[#C9A84C] rounded flex items-center justify-center font-bold text-[10px]">-</button>
                        <span className="text-[#C9A84C] font-mono min-w-[32px] text-center text-[11px]">{liveScale.toFixed(2)}</span>
                        <button type="button" onClick={() => setLiveScale(prev => Math.min(2.0, Number((prev + 0.05).toFixed(2))))} className="w-6 h-6 bg-[#1A2742] border border-gray-700 hover:border-[#C9A84C] rounded flex items-center justify-center font-bold text-[10px]">+</button>
                      </div>
                    </div>
                    <input type="range" min="0.3" max="2.0" step="0.05" value={liveScale} onChange={(e) => setLiveScale(parseFloat(e.target.value))} className="w-full accent-[#C9A84C] h-1.5 rounded cursor-pointer" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Rotation</span>
                      <span className="text-[#C9A84C] font-mono text-[11px]">{liveRotationOffset}°</span>
                    </div>
                    <input type="range" min="-45" max="45" step="1" value={liveRotationOffset} onChange={(e) => setLiveRotationOffset(parseInt(e.target.value))} className="w-full accent-[#C9A84C] h-1.5 rounded cursor-pointer" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Horizontal Shift</span>
                      <span className="text-[#C9A84C] font-mono text-[11px]">{liveXOffset}px</span>
                    </div>
                    <input type="range" min="-100" max="100" step="1" value={liveXOffset} onChange={(e) => setLiveXOffset(parseInt(e.target.value))} className="w-full accent-[#C9A84C] h-1.5 rounded cursor-pointer" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Vertical Shift</span>
                      <span className="text-[#C9A84C] font-mono text-[11px]">{liveYOffset}px</span>
                    </div>
                    <input type="range" min="-100" max="100" step="1" value={liveYOffset} onChange={(e) => setLiveYOffset(parseInt(e.target.value))} className="w-full accent-[#C9A84C] h-1.5 rounded cursor-pointer" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-gray-400">Glasses Size</span><span className="text-[#C9A84C] font-mono">{(manualScale * 100).toFixed(0)}%</span></div>
                    <input type="range" min="0.3" max="2.0" step="0.05" value={manualScale} onChange={(e) => setManualScale(parseFloat(e.target.value))} className="w-full accent-[#C9A84C] h-1.5 rounded cursor-pointer" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-gray-400">Rotation</span><span className="text-[#C9A84C] font-mono">{manualRotation}°</span></div>
                    <input type="range" min="-45" max="45" step="1" value={manualRotation} onChange={(e) => setManualRotation(parseInt(e.target.value))} className="w-full accent-[#C9A84C] h-1.5 rounded cursor-pointer" />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                <button onClick={() => { setLiveScale(product.overlay_scale !== null && product.overlay_scale !== undefined ? Number(product.overlay_scale) : 1.0); setLiveXOffset(0); setLiveYOffset(0); setLiveRotationOffset(0); setManualScale(1.0); setManualRotation(0); }} className="text-xs text-gray-400 hover:text-white transition-colors underline">Reset to defaults</button>
                {showCalibrator && (
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/products/${product.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: product.name, category: product.category, price: product.price, description: product.description, image_url: product.image_url, overlay_image_url: product.overlay_image_url, lens_image_url: product.lens_image_url, reflection_image_url: product.reflection_image_url, stock: product.stock, overlay_scale: liveScale, overlay_x_offset: liveXOffset, overlay_y_offset: liveYOffset, overlay_rotation_offset: liveRotationOffset }) });
                        if (!res.ok) throw new Error('Save failed');
                        alert('Calibration saved!');
                      } catch (err: any) { alert(err.message || 'Error saving.'); }
                    }}
                    className="text-xs px-3 py-1.5 bg-[#C9A84C] text-[#0B1422] rounded font-bold hover:bg-[#C9A84C]/90 transition-all"
                  >
                    Save (Admin)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Product Details Panel (Right column) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-gray-800 bg-[#0F1B30]/50">
            <CardContent className="p-4 sm:p-6 space-y-5">
              <div>
                <span className="px-2 py-0.5 bg-[#1A2742] border border-[#C9A84C]/20 text-[#C9A84C] text-[10px] font-bold uppercase tracking-widest rounded">
                  {product.category}
                </span>
                <h2 className="font-luxury text-xl sm:text-2xl font-bold text-white mt-3 leading-snug">
                  {product.name}
                </h2>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-[#C9A84C]">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-gray-500">incl. taxes</span>
                </div>
              </div>

              {/* Conversion Widgets */}
              <div className="space-y-2.5 pt-1 border-t border-gray-800/65">
                {/* Live Viewers count */}
                <div className="flex items-center space-x-2 text-xs text-gray-300">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <p><span className="text-[#E8D9A0] font-bold">{liveViewers}</span> people viewing now</p>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-300">
                  <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <p><span className="text-[#C9A84C] font-bold">{salesCount} orders</span> in the last {salesHours}hrs</p>
                </div>

                {/* Visual Urgency Stock Progress Bar */}
                {product.stock > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-amber-500">
                        {product.stock <= 15 ? `Hurry! Only ${product.stock} items left` : 'Stock Availability'}
                      </span>
                      <span className="text-gray-400">
                        {product.stock <= 15 ? `${Math.round((product.stock / 15) * 100)}% remaining` : 'Selling fast'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-850 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          product.stock <= 5 
                            ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                            : product.stock <= 15 
                            ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${product.stock <= 15 ? Math.max(10, (product.stock / 15) * 100) : 85}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h4 className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1.5">About this frame</h4>
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-4">
                  {product.description || 'Premium designer eyewear crafted with precision.'}
                </p>
              </div>

              <div className="border-t border-gray-800 pt-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Availability</span>
                  {product.stock > 0 ? (
                    <span className="text-emerald-400 font-semibold flex items-center">
                      <Check className="w-3.5 h-3.5 mr-1" /> In Stock ({product.stock} left)
                    </span>
                  ) : (
                    <span className="text-red-400 font-semibold flex items-center">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" /> Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Product image preview */}
              <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-white/5 bg-black/20">
                <NextImage src={product.image_url} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 300px" className="object-contain p-2" />
              </div>

              <div className="pt-1 space-y-2">
                <Button
                  onClick={handleInquiry}
                  className="w-full flex items-center justify-center gap-2 py-3 font-bold uppercase tracking-wider text-xs bg-[#25D366] hover:bg-[#20bd5a] text-white border-transparent"
                >
                  <MessageCircle className="w-4 h-4" />
                  Inquire on WhatsApp
                </Button>
                <p className="text-[10px] text-gray-500 text-center">Click to chat directly on WhatsApp</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
