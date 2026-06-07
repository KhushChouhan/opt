/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Camera, Upload, Check, AlertCircle, RefreshCw, ShoppingCart, HelpCircle, Sliders } from 'lucide-react';
import { loadScript } from '@/lib/loadScript';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

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
  const router = useRouter();
  
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
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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

  // Checkout Form States
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }, [product]);

  // Initialize and load dependencies
  useEffect(() => {
    let active = true;

    async function init() {
      try {
        setLoadingMessage('Loading Face Tracking engine...');
        // Load MediaPipe FaceMesh from CDN
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');

        if (!active) return;

        // Load overlay image with cache-busting to prevent cached non-CORS response errors
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const cb = `cb=${Date.now()}`;
        img.src = product.overlay_image_url.includes('?')
          ? `${product.overlay_image_url}&${cb}`
          : `${product.overlay_image_url}?${cb}`;
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
                console.log('Auto-trim succeeded:', {
                  w, h, dx, dy,
                  shiftX: overlayCropRef.current.shiftX,
                  shiftY: overlayCropRef.current.shiftY
                });
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

        // Configure FaceMesh
        const FaceMeshClass = (window as any).FaceMesh;
        if (!FaceMeshClass) {
          throw new Error('FaceMesh library not loaded from CDN.');
        }

        const faceMesh = new FaceMeshClass({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
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
  }, [product]);

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
    
    const runDetection = async () => {
      const currentCameraState = cameraStateRef.current;
      if (currentCameraState === 'active' && videoRef.current && faceMeshRef.current && !isDetecting) {
        if (videoRef.current.readyState >= 2) { // HAVE_CURRENT_DATA or higher
          isDetecting = true;
          try {
            await faceMeshRef.current.send({ image: videoRef.current });
            detectionFrameCount.current += 1;
            detectionError.current = null;
          } catch (err: any) {
            console.error('FaceMesh frame processing error:', err);
            detectionError.current = err?.message || String(err);
          } finally {
            isDetecting = false;
          }
        }
      }
      
      // Schedule next check in 33ms (~30fps tracking)
      if (cameraStateRef.current === 'active' || cameraStateRef.current === 'loading') {
        setTimeout(runDetection, 33);
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

      // 1. Draw webcam feed or uploaded photo (mirrored)
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      
      if (currentCameraState === 'active' && videoRef.current && videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
        ctx.drawImage(videoRef.current, 0, 0, width, height);
      } else if (currentCameraState === 'fallback' && uploadedImageRef.current) {
        ctx.drawImage(uploadedImageRef.current, 0, 0, width, height);
      } else {
        // Background fallback
        ctx.fillStyle = '#0b132b';
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

          // Blended width scaling: blend cheekbone width and pupil distance for wide-face protection
          glassesWidth = (baseDistance * 0.6 + eyeDistance * 1.2) * 0.956 * overlayScale;
          if (symmetry_ratio < 0.95) {
            glassesWidth = glassesWidth * (0.88 + 0.12 * symmetry_ratio);
          }

          // Pitch compensation: detect up/down tilt using normalized nose-tip relative position
          const pitch = (y_tip - y_168) / eyeDistance;
          const pitchCompensation = -(pitch - 0.35) * eyeDistance * 0.30;

          // Composite positioning: anchor to landmark 168 + vertical lens shift + tilt correction
          x_center_shifted = x_168 + overlayXOffset;
          y_center_shifted = y_168 + eyeDistance * 0.08 + pitchCompensation + overlayYOffset;

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
            ctx.fillStyle = '#d4af37';
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
          if (product.category === 'glasses' || product.category === 'sunglasses') {
            ctx.save();
            if (reflectionImageRef.current) {
              ctx.globalAlpha = 0.25;
              ctx.drawImage(reflectionImageRef.current, -glassesWidth / 2 + shiftX, -glassesHeight / 2 + shiftY, glassesWidth, glassesHeight);
            } else {
              // Programmatic Reflection highlights using gradients (Drawn relative to trimmed frame center)
              ctx.globalAlpha = 0.30; 
              
              const radiusX = glassesWidth * 0.165;
              const radiusY = glassesHeight * 0.32;
 
              const lx = -glassesWidth * 0.21 + shiftX;
              const rx = glassesWidth * 0.21 + shiftX;
              const ly = shiftY;
              const ry = shiftY;
 
              // Draw left reflection highlight
              const leftGrad = ctx.createLinearGradient(lx - radiusX, ly - radiusY, lx + radiusX, ly + radiusY);
              leftGrad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
              leftGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.0)');
              leftGrad.addColorStop(0.40, 'rgba(255, 255, 255, 0.40)'); // bright diagonal streak
              leftGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.0)');
              leftGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.0)');
              leftGrad.addColorStop(0.60, 'rgba(255, 255, 255, 0.20)'); // softer streak
              leftGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.0)');
              leftGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
 
              ctx.fillStyle = leftGrad;
              ctx.beginPath();
              ctx.ellipse(lx, ly, radiusX, radiusY, 0, 0, 2 * Math.PI);
              ctx.fill();
 
              // Draw right reflection highlight
              const rightGrad = ctx.createLinearGradient(rx - radiusX, ry - radiusY, rx + radiusX, ry + radiusY);
              rightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
              rightGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.0)');
              rightGrad.addColorStop(0.40, 'rgba(255, 255, 255, 0.40)');
              rightGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.0)');
              rightGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.0)');
              rightGrad.addColorStop(0.60, 'rgba(255, 255, 255, 0.20)');
              rightGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.0)');
              rightGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
 
              ctx.fillStyle = rightGrad;
              ctx.beginPath();
              ctx.ellipse(rx, ry, radiusX, radiusY, 0, 0, 2 * Math.PI);
              ctx.fill();
            }
            ctx.restore();
          }

          ctx.restore();
        } else {
          ctx.save();
          ctx.translate(x_center_shifted, y_center_shifted);
          ctx.rotate(rollAngle + (overlayRotationOffset * Math.PI) / 180);
          ctx.strokeStyle = '#d4af37';
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
          if (product.category === 'glasses' || product.category === 'sunglasses') {
            ctx.save();
            if (reflectionImageRef.current) {
              ctx.globalAlpha = 0.25;
              ctx.drawImage(reflectionImageRef.current, -w / 2, -h / 2, w, h);
            } else {
              ctx.globalAlpha = 0.30;
              const radiusX = w * 0.15;
              const radiusY = h * 0.28;

              // Left lens reflection
              const leftGrad = ctx.createLinearGradient(-w * 0.22 - radiusX, -radiusY, -w * 0.22 + radiusX, radiusY);
              leftGrad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
              leftGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.0)');
              leftGrad.addColorStop(0.40, 'rgba(255, 255, 255, 0.40)');
              leftGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.0)');
              leftGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.0)');
              leftGrad.addColorStop(0.60, 'rgba(255, 255, 255, 0.20)');
              leftGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.0)');
              leftGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

              ctx.fillStyle = leftGrad;
              ctx.beginPath();
              ctx.ellipse(-w * 0.22, 0, radiusX, radiusY, 0, 0, 2 * Math.PI);
              ctx.fill();

              // Right lens reflection
              const rightGrad = ctx.createLinearGradient(w * 0.22 - radiusX, -radiusY, w * 0.22 + radiusX, radiusY);
              rightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
              rightGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.0)');
              rightGrad.addColorStop(0.40, 'rgba(255, 255, 255, 0.40)');
              rightGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.0)');
              rightGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.0)');
              rightGrad.addColorStop(0.60, 'rgba(255, 255, 255, 0.20)');
              rightGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.0)');
              rightGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

              ctx.fillStyle = rightGrad;
              ctx.beginPath();
              ctx.ellipse(w * 0.22, 0, radiusX, radiusY, 0, 0, 2 * Math.PI);
              ctx.fill();
            }
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

  // Capture image snapshot (keeps in-memory Base64)
  const takeSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setSnapshot(dataUrl);
    setIsCheckoutOpen(true);
  };

  // Form Submission
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (customerName.trim().length < 2) {
      setFormError('Please enter a valid name (at least 2 characters).');
      setIsSubmitting(false);
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      setFormError('Please enter a valid 10-digit Indian phone number.');
      setIsSubmitting(false);
      return;
    }

    if (address.trim().length < 10) {
      setFormError('Please enter a detailed physical delivery address (min 10 chars).');
      setIsSubmitting(false);
      return;
    }

    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(pincode.trim())) {
      setFormError('Please enter a valid 6-digit Indian PIN code.');
      setIsSubmitting(false);
      return;
    }

    const orderId = crypto.randomUUID();

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          product_id: product.id,
          customer_name: customerName,
          phone,
          address,
          pincode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      setIsCheckoutOpen(false);
      router.push(`/order-success?id=${orderId}&product=${encodeURIComponent(product.name)}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setFormError(err.message || 'An unexpected database error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back to catalog */}
      <div className="mb-6">
        <Link href="/products" className="text-sm text-gray-400 hover:text-[#d4af37] transition-colors">
          &larr; Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Try-on Mirror Container (Left column) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Active Camera Device Selector (Premium feature) */}
          {cameraState === 'active' && devices.length > 1 && (
            <div className="flex items-center justify-between bg-[#0b132b]/80 p-3 rounded-lg border border-[#d4af37]/20 text-xs">
              <span className="text-gray-300 font-semibold uppercase tracking-wider flex items-center">
                <Camera className="w-4 h-4 text-[#d4af37] mr-1.5" /> Select Camera:
              </span>
              <select
                value={selectedDeviceId}
                onChange={handleDeviceChange}
                className="bg-[#1c2541] border border-gray-700 text-white rounded px-2.5 py-1 focus:outline-none focus:border-[#d4af37]"
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${devices.indexOf(device) + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Canvas Wrapper */}
          <div className="relative aspect-[4/3] w-full bg-[#0b132b] rounded-lg overflow-hidden border border-[#d4af37]/20 shadow-2xl">
            {/* Loading Cover */}
            {cameraState === 'loading' && (
              <div className="absolute inset-0 z-30 bg-[#060b13] flex flex-col items-center justify-center p-6 text-center space-y-4">
                <RefreshCw className="w-10 h-10 text-[#d4af37] animate-spin" />
                <p className="text-sm font-semibold text-gray-300">{loadingMessage}</p>
              </div>
            )}

            {/* Permission Denied UI (Graceful degradation) */}
            {cameraState === 'denied' && (
              <div className="absolute inset-0 z-30 bg-[#0b132b] flex flex-col items-center justify-center p-8 text-center space-y-5">
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-base uppercase font-luxury">Camera Stream Blocked</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mt-2 leading-relaxed">
                    Camera permissions were denied or are currently in use by another application. 
                    Please click the camera icon in your browser&apos;s address bar to allow permission and reload, or upload a photo below to try on.
                  </p>
                </div>
                <label className="flex items-center space-x-2 px-4 py-2 bg-[#d4af37] text-[#060b13] hover:bg-[#d4af37]/95 rounded-md text-xs font-bold cursor-pointer transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo to Try On</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Scanline overlay for mirror effect */}
            {cameraState === 'active' && <div className="scanline" />}

            {/* Hidden video element */}
            <video
              ref={videoRef}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                zIndex: -10,
                pointerEvents: 'none'
              }}
              playsInline
              muted
            />

            {/* Canvas (active render) */}
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
              className={`w-full h-full object-cover select-none ${
                cameraState === 'fallback' || cameraState === 'denied' ? 'cursor-move' : ''
              }`}
            />

            {/* Top HUD overlay status */}
            {cameraState === 'active' && (
              <div className="absolute top-4 left-4 z-20 bg-black/60 px-3 py-1.5 rounded border border-[#d4af37]/20 text-[10px] uppercase font-bold tracking-wider text-[#d4af37] flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                <span>{faceDetected ? 'Face Locked' : 'Searching Face...'}</span>
              </div>
            )}
          </div>

          {/* Calibration / Upload Help panel */}
          <div className="p-5 glass-panel rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start">
                <HelpCircle className="w-4 h-4 text-[#d4af37] mr-1.5" />
                Need calibration?
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                Drag the overlay or upload a selfie. WebGL maps the glasses dynamically.
              </p>
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <label className="flex-grow sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10 rounded-md text-xs font-semibold cursor-pointer transition-all">
                <Upload className="w-4 h-4" />
                <span>Upload Selfie</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              {cameraState !== 'active' && (
                <Button variant="outline" className="text-xs flex-grow sm:flex-initial" onClick={() => startWebcam(selectedDeviceId)}>
                  <Camera className="w-4 h-4 mr-2" />
                  Try Web Cam
                </Button>
              )}
            </div>
          </div>

          {/* Admin Live Calibration HUD */}
          {showCalibrator && (
            <div className="p-6 glass-panel rounded-lg border border-[#d4af37]/45 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center">
                  <Sliders className="w-4 h-4 mr-2" />
                  Admin Live Calibration Panel
                </h4>
                <span className="text-[9px] px-2 py-0.5 bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] font-semibold rounded uppercase tracking-wider">
                  Live Mode
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-white">
                {/* Scale factor */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Scale factor (Width)</span>
                    <div className="flex items-center space-x-1.5">
                      <button 
                        type="button" 
                        onClick={() => setLiveScale(prev => Math.max(0.5, Number((prev - 0.01).toFixed(2))))}
                        className="w-5 h-5 bg-[#1c2541] border border-gray-700 hover:border-[#d4af37] rounded flex items-center justify-center font-bold text-[10px] text-white"
                      >
                        -
                      </button>
                      <span className="text-[#d4af37] font-mono min-w-[28px] text-center">{liveScale.toFixed(2)}</span>
                      <button 
                        type="button" 
                        onClick={() => setLiveScale(prev => Math.min(2.0, Number((prev + 0.01).toFixed(2))))}
                        className="w-5 h-5 bg-[#1c2541] border border-gray-700 hover:border-[#d4af37] rounded flex items-center justify-center font-bold text-[10px] text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.01"
                    value={liveScale}
                    onChange={(e) => setLiveScale(parseFloat(e.target.value))}
                    className="w-full accent-[#d4af37] bg-[#1c2541] h-1 rounded cursor-pointer"
                  />
                </div>

                {/* Rotation Bias */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Rotation Bias (degrees)</span>
                    <div className="flex items-center space-x-1.5">
                      <button 
                        type="button" 
                        onClick={() => setLiveRotationOffset(prev => Math.max(-45, prev - 1))}
                        className="w-5 h-5 bg-[#1c2541] border border-gray-700 hover:border-[#d4af37] rounded flex items-center justify-center font-bold text-[10px] text-white"
                      >
                        -
                      </button>
                      <span className="text-[#d4af37] font-mono min-w-[28px] text-center">{liveRotationOffset}°</span>
                      <button 
                        type="button" 
                        onClick={() => setLiveRotationOffset(prev => Math.min(45, prev + 1))}
                        className="w-5 h-5 bg-[#1c2541] border border-gray-700 hover:border-[#d4af37] rounded flex items-center justify-center font-bold text-[10px] text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={liveRotationOffset}
                    onChange={(e) => setLiveRotationOffset(parseInt(e.target.value))}
                    className="w-full accent-[#d4af37] bg-[#1c2541] h-1 rounded cursor-pointer"
                  />
                </div>

                {/* X Offset */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Horizontal Shift (X Axis)</span>
                    <div className="flex items-center space-x-1.5">
                      <button 
                        type="button" 
                        onClick={() => setLiveXOffset(prev => Math.max(-100, prev - 1))}
                        className="w-5 h-5 bg-[#1c2541] border border-gray-700 hover:border-[#d4af37] rounded flex items-center justify-center font-bold text-[10px] text-white"
                      >
                        -
                      </button>
                      <span className="text-[#d4af37] font-mono min-w-[28px] text-center">{liveXOffset}px</span>
                      <button 
                        type="button" 
                        onClick={() => setLiveXOffset(prev => Math.min(100, prev + 1))}
                        className="w-5 h-5 bg-[#1c2541] border border-gray-700 hover:border-[#d4af37] rounded flex items-center justify-center font-bold text-[10px] text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={liveXOffset}
                    onChange={(e) => setLiveXOffset(parseInt(e.target.value))}
                    className="w-full accent-[#d4af37] bg-[#1c2541] h-1 rounded cursor-pointer"
                  />
                </div>

                {/* Y Offset */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Vertical Shift (Y Axis)</span>
                    <div className="flex items-center space-x-1.5">
                      <button 
                        type="button" 
                        onClick={() => setLiveYOffset(prev => Math.max(-100, prev - 1))}
                        className="w-5 h-5 bg-[#1c2541] border border-gray-700 hover:border-[#d4af37] rounded flex items-center justify-center font-bold text-[10px] text-white"
                      >
                        -
                      </button>
                      <span className="text-[#d4af37] font-mono min-w-[28px] text-center">{liveYOffset}px</span>
                      <button 
                        type="button" 
                        onClick={() => setLiveYOffset(prev => Math.min(100, prev + 1))}
                        className="w-5 h-5 bg-[#1c2541] border border-gray-700 hover:border-[#d4af37] rounded flex items-center justify-center font-bold text-[10px] text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={liveYOffset}
                    onChange={(e) => setLiveYOffset(parseInt(e.target.value))}
                    className="w-full accent-[#d4af37] bg-[#1c2541] h-1 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setLiveScale(product.overlay_scale !== null && product.overlay_scale !== undefined ? Number(product.overlay_scale) : 1.0);
                    setLiveXOffset(product.overlay_x_offset !== null && product.overlay_x_offset !== undefined ? Number(product.overlay_x_offset) : 0.0);
                    setLiveYOffset(product.overlay_y_offset !== null && product.overlay_y_offset !== undefined ? Number(product.overlay_y_offset) : 0.0);
                    setLiveRotationOffset(product.overlay_rotation_offset !== null && product.overlay_rotation_offset !== undefined ? Number(product.overlay_rotation_offset) : 0.0);
                  }}
                  className="text-xs"
                >
                  Reset Settings
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/products/${product.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: product.name,
                          category: product.category,
                          price: product.price,
                          description: product.description,
                          image_url: product.image_url,
                          overlay_image_url: product.overlay_image_url,
                          lens_image_url: product.lens_image_url,
                          reflection_image_url: product.reflection_image_url,
                          stock: product.stock,
                          overlay_scale: liveScale,
                          overlay_x_offset: liveXOffset,
                          overlay_y_offset: liveYOffset,
                          overlay_rotation_offset: liveRotationOffset
                        })
                      });
                      if (!res.ok) {
                        const data = await res.json();
                        throw new Error(data.error || 'Failed to save calibration settings.');
                      }
                      alert('Calibration settings successfully saved to database!');
                    } catch (err: any) {
                      alert(err.message || 'Error saving calibration settings.');
                    }
                  }}
                  className="text-xs text-[#060b13] bg-[#d4af37] hover:bg-[#d4af37]/90"
                >
                  Save Settings
                </Button>
              </div>
            </div>
          )}

          {/* Manual adjustment HUD if camera denied/fallback/no face */}
          {(cameraState === 'fallback' || cameraState === 'denied' || !faceDetected) && (
            <div className="p-6 glass-panel rounded-lg space-y-4">
              <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center">
                <Sliders className="w-4 h-4 text-[#d4af37] mr-2" />
                Manual Adjustments (Drag frame on canvas or use sliders)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Scale slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Overlay Size</span>
                    <span className="text-[#d4af37] font-mono">{(manualScale * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={manualScale}
                    onChange={(e) => setManualScale(parseFloat(e.target.value))}
                    className="w-full accent-[#d4af37] bg-gray-700 h-1 rounded"
                  />
                </div>
                {/* Rotation slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Angle Rotation</span>
                    <span className="text-[#d4af37] font-mono">{manualRotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={manualRotation}
                    onChange={(e) => setManualRotation(parseInt(e.target.value))}
                    className="w-full accent-[#d4af37] bg-gray-700 h-1 rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Details Panel (Right column) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-gray-800 bg-[#0b132b]/50">
            <CardContent className="p-6 space-y-6">
              <div>
                <span className="px-2 py-0.5 bg-[#1c2541] border border-[#d4af37]/20 text-[#d4af37] text-[10px] font-bold uppercase tracking-widest rounded">
                  {product.category}
                </span>
                <h2 className="font-luxury text-2xl font-bold text-white mt-3 leading-snug">
                  {product.name}
                </h2>
                <div className="mt-3 flex items-baseline">
                  <span className="text-2xl font-bold text-[#d4af37]">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">incl. all taxes</span>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">Description</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {product.description || 'No description available for this designer piece.'}
                </p>
              </div>

              <div className="border-t border-gray-800 pt-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Availability</span>
                  {product.stock > 0 ? (
                    <span className="text-emerald-400 font-semibold flex items-center">
                      <Check className="w-3.5 h-3.5 mr-1" /> In Stock ({product.stock} items left)
                    </span>
                  ) : (
                    <span className="text-red-400 font-semibold flex items-center">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" /> Out of Stock
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={takeSnapshot}
                  className="w-full flex items-center justify-center"
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Order This Frame
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Checkout Modal (Checkout Form) */}
      <Modal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title="Order Request Details">
        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
          <div className="flex flex-col items-center justify-center p-4 bg-black/20 rounded border border-[#d4af37]/10 mb-2">
            {snapshot && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={snapshot}
                alt="Try-on snapshot preview"
                className="max-h-40 rounded border border-gray-800"
              />
            )}
            <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">Try-on Snapshot (In-Memory preview)</span>
          </div>

          {formError && (
            <div className="p-3 rounded bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-medium flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your name"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <Input
            label="Indian Phone Number"
            type="tel"
            placeholder="10-digit mobile number (e.g. 9828207999)"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Textarea
            label="Detailed Physical Address"
            placeholder="Street name, house number, landmarks..."
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Input
            label="6-Digit PIN Code"
            type="text"
            placeholder="e.g. 335513"
            required
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
          />

          <div className="pt-2 flex space-x-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsCheckoutOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              Submit Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
