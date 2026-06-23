/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Camera, Upload, Check, AlertCircle, RefreshCw, ShoppingCart, HelpCircle, Sliders, Flame } from 'lucide-react';
import { loadScript } from '@/lib/loadScript';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

interface Product {
  id: string;
  name: string;
  category: 'glasses' | 'sunglasses' | 'watches';
  price: number;
  description: string;
  image_url: string;
  overlay_image_url: string;
  stock: number;
  overlay_scale?: number | null;
  overlay_x_offset?: number | null;
  overlay_y_offset?: number | null;
  overlay_rotation_offset?: number | null;
  lens_image_url?: string | null;
  reflection_image_url?: string | null;
}

interface BBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

function computeAssetBBox(img: HTMLImageElement): BBox {
  if (typeof window === 'undefined') {
    return { left: 0, top: 0, width: img.naturalWidth || 1, height: img.naturalHeight || 1 };
  }
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = img.naturalWidth || 1;
  tempCanvas.height = img.naturalHeight || 1;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) {
    return { left: 0, top: 0, width: tempCanvas.width, height: tempCanvas.height };
  }
  
  tempCtx.drawImage(img, 0, 0);
  let imgData;
  try {
    imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  } catch {
    // CORS restriction fallback
    return { left: 0, top: 0, width: tempCanvas.width, height: tempCanvas.height };
  }
  
  const data = imgData.data;
  const W = tempCanvas.width;
  const H = tempCanvas.height;
  
  let minX = W;
  let maxX = 0;
  let minY = H;
  let maxY = 0;
  let hasPixels = false;
  
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const alpha = data[idx + 3];
      if (alpha > 15) {
        hasPixels = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  
  if (!hasPixels) {
    return { left: 0, top: 0, width: W, height: H };
  }
  
  return {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}

interface WatchTryOnCanvasProps {
  product: Product;
}


export default function WatchTryOnCanvas({ product }: WatchTryOnCanvasProps) {
  const router = useRouter();

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderFrameId = useRef<number | null>(null);
  const handsRef = useRef<any>(null);
  const overlayImageRef = useRef<HTMLImageElement | null>(null);
  const uploadedImageRef = useRef<HTMLImageElement | null>(null);
  const assetBBoxRef = useRef<BBox | null>(null);

  // Decoupled Landmark Ref (WebGL engine style)
  const latestHandResults = useRef<any>(null);


  // Session & Live Calibrator States
  const { data: session } = useSession();
  const [showCalibrator, setShowCalibrator] = useState(false);
  const [renderMode, setRenderMode] = useState<'original' | 'new' | 'segmentation'>('new');


  useEffect(() => {
    setShowCalibrator(!!session);
  }, [session]);

  // Live overrides
  const [liveScale, setLiveScale] = useState<number>(product.overlay_scale !== null && product.overlay_scale !== undefined ? Number(product.overlay_scale) : 1.0);
  const [liveXOffset, setLiveXOffset] = useState<number>(product.overlay_x_offset !== null && product.overlay_x_offset !== undefined ? Number(product.overlay_x_offset) : 0.0);
  const [liveYOffset, setLiveYOffset] = useState<number>(product.overlay_y_offset !== null && product.overlay_y_offset !== undefined ? Number(product.overlay_y_offset) : 0.0);
  const [liveRotationOffset, setLiveRotationOffset] = useState<number>(product.overlay_rotation_offset !== null && product.overlay_rotation_offset !== undefined ? Number(product.overlay_rotation_offset) : 0.0);

  // Decoupled refs for values to prevent closure staleness in loop
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

  // Temporal smoothing refs to prevent hand tracker jitter
  const smoothedPositionRef = useRef<{ x: number; y: number } | null>(null);
  const smoothedAngleRef = useRef<number | null>(null);
  const smoothedWidthRef = useRef<number | null>(null);

  // Tracking loss buffer refs to prevent watch from snapping back to center on brief frame drops
  const consecutiveLostFramesRef = useRef<number>(0);
  const lastKnownTrackedStateRef = useRef<{
    drawX: number;
    drawY: number;
    drawAngle: number;
    watchWidth: number;
    baseCompress: number;
    isRightHand: boolean;
    handednessLabel: string;
  } | null>(null);


  // App States
  const [cameraState, setCameraState] = useState<'loading' | 'active' | 'denied' | 'fallback'>('loading');
  const [loadingMessage, setLoadingMessage] = useState('Initializing virtual mirror...');
  const [handDetected, setHandDetected] = useState(false);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Camera Selection States
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Fallback Manual Overlay States
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

  // Conversion Boosting Widgets & Sticky Buy Bar States
  const [liveViewers, setLiveViewers] = useState<number>(55);
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false);

  // Initialize and update live viewers
  useEffect(() => {
    setLiveViewers(Math.floor(Math.random() * (95 - 45 + 1)) + 45);
    const interval = setInterval(() => {
      setLiveViewers((prev) => {
        const delta = Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : - (Math.floor(Math.random() * 3) + 1);
        const next = prev + delta;
        return next >= 40 && next <= 100 ? next : prev;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Monitor scroll for Sticky Bottom Buy Bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Deterministic count based on product ID character codes
  const salesCount = (product.id.charCodeAt(0) % 12) + 4;
  const salesHours = (product.id.charCodeAt(1) % 18) + 6;

  // Initialize and load dependencies
  useEffect(() => {
    let active = true;

    async function init() {
      try {
        setLoadingMessage('Loading Hand Tracking engine...');
        // Load MediaPipe Camera and Hands from CDN to prevent version mismatch crashes
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');

        if (!active) return;

        // Load watch overlay image
        const img = new Image();
        img.src = product.overlay_image_url;
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          overlayImageRef.current = img;
          assetBBoxRef.current = computeAssetBBox(img);
        };
        img.onerror = () => {
          console.error('Failed to load watch overlay image, using fallbacks.');
        };


        // Configure Hands detector
        const HandsClass = (window as any).Hands;
        if (!HandsClass) {
          throw new Error('MediaPipe Hands library not loaded.');
        }

        const hands = new HandsClass({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.4,
          minTrackingConfidence: 0.4,
        });

        hands.onResults(handleHandResults);
        handsRef.current = hands;

        // Start default webcam stream
        startWebcam();
      } catch (err) {
        console.error('Error initializing watch try-on canvas:', err);
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
    latestHandResults.current = null;
    setHandDetected(false);

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
        console.log('Watch runDetection tick:', {
          currentCameraState,
          videoExists: !!videoRef.current,
          videoReadyState: videoRef.current?.readyState,
          videoWidth: videoRef.current?.videoWidth,
          videoHeight: videoRef.current?.videoHeight,
          handsExists: !!handsRef.current,
          isDetecting
        });
      }

      if (currentCameraState === 'active' && videoRef.current && handsRef.current && !isDetecting) {
        if (videoRef.current.readyState >= 2) { // HAVE_CURRENT_DATA or higher
          isDetecting = true;
          try {
            if (logCounter % 100 === 0) {
              console.log('Sending frame to Hands...');
            }
            await handsRef.current.send({ image: videoRef.current });
            detectionFrameCount.current += 1;
            detectionError.current = null;
          } catch (err: any) {
            console.error('Hands frame processing error:', err);
            detectionError.current = err?.message || String(err);
          } finally {
            isDetecting = false;
          }
        } else {
          if (logCounter % 100 === 0) {
            console.warn('Watch video not ready, readyState:', videoRef.current?.readyState);
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

  // Callback when Hands yields results
  const handleHandResults = (results: any) => {
    console.log('handleHandResults callback triggered:', {
      hasLandmarks: !!results.multiHandLandmarks,
      landmarksCount: results.multiHandLandmarks?.length,
      hasHandedness: !!results.multiHandedness
    });
    
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      console.log('Hands detected!', {
        landmarksCount: results.multiHandLandmarks.length,
        handedness: results.multiHandedness?.[0]
      });
    }
    latestHandResults.current = results;
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
        ctx.fillStyle = '#0F1B30';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();

      // 2. Draw overlay based on landmarks or manual sliders
      const results = latestHandResults.current;
      const confidence = results && results.multiHandLandmarks ? results.multiHandedness?.[0]?.score || 0.8 : 0;

      const hasHandTracking = (currentCameraState === 'active' || currentCameraState === 'fallback') && 
        results && results.multiHandLandmarks && results.multiHandLandmarks.length > 0 && confidence >= 0.4;

      let drawX = 0;
      let drawY = 0;
      let drawAngle = 0;
      let watchWidth = 0;
      let baseCompress = 1.0;
      let isRightHand = false;
      let drawTrackingActive = false;
      let handWidth = 0; // Needed for segmentation clipping
      let watchHeight = 0;

      if (hasHandTracking) {
        consecutiveLostFramesRef.current = 0;
        drawTrackingActive = true;

        const landmarks = results.multiHandLandmarks[0];
        const handedness = results.multiHandedness[0]; // Left vs Right hand
        isRightHand = handedness.label === 'Right';

        const getX = (lm: any) => (1 - lm.x) * width; // Mirrored coordinate mapping
        const getY = (lm: any) => lm.y * height;

        if (renderMode === 'original') {
          const x_wrist = getX(landmarks[0]);
          const y_wrist = getY(landmarks[0]);
          const x_mcp = getX(landmarks[9]);
          const y_mcp = getY(landmarks[9]);

          const vx = x_wrist - x_mcp;
          const vy = y_wrist - y_mcp;
          const handLength = Math.sqrt(vx * vx + vy * vy);

          const ux = vx / handLength;
          const uy = vy / handLength;

          drawX = x_wrist + ux * (handLength * 0.18);
          drawY = y_wrist + uy * (handLength * 0.18);
          watchWidth = handLength * 0.42;
          drawAngle = Math.atan2(vy, vx) + Math.PI / 2;
          baseCompress = 1.0;
        } else {
          // New and Segmentation modes
          const wrist = { x: getX(landmarks[0]), y: getY(landmarks[0]) };
          const indexMCP = { x: getX(landmarks[5]), y: getY(landmarks[5]) };
          const pinkyMCP = { x: getX(landmarks[17]), y: getY(landmarks[17]) };

          const knuckleCenter = {
            x: (indexMCP.x + pinkyMCP.x) / 2,
            y: (indexMCP.y + pinkyMCP.y) / 2
          };

          const dx_width = indexMCP.x - pinkyMCP.x;
          const dy_width = indexMCP.y - pinkyMCP.y;
          handWidth = Math.sqrt(dx_width * dx_width + dy_width * dy_width);
          const dx_depth = knuckleCenter.x - wrist.x;
          const dy_depth = knuckleCenter.y - wrist.y;
          const handDepth = Math.sqrt(dx_depth * dx_depth + dy_depth * dy_depth);

          const wristWidth = handWidth * 0.85;
          const forearmWidth = handWidth * 0.90;
          const baseSize = wristWidth * 0.5 + forearmWidth * 0.2 + handDepth * 0.3;

          const watchScaleMultiplier = 0.95 * liveScaleRef.current;
          const targetWidth = baseSize * 1.12 * watchScaleMultiplier * 1.05;

          if (smoothedWidthRef.current === null) {
            smoothedWidthRef.current = targetWidth;
          } else {
            smoothedWidthRef.current = smoothedWidthRef.current * 0.88 + targetWidth * 0.12;
          }
          watchWidth = smoothedWidthRef.current;

          const forearmDirectionX = dx_depth / (handDepth || 1);
          const forearmDirectionY = dy_depth / (handDepth || 1);

          const targetX = wrist.x - forearmDirectionX * (watchWidth * 0.45) + liveXOffsetRef.current;
          const targetY = wrist.y - forearmDirectionY * (watchWidth * 0.45) + liveYOffsetRef.current;

          const knuckleVector = isRightHand
            ? { x: pinkyMCP.x - indexMCP.x, y: pinkyMCP.y - indexMCP.y }
            : { x: indexMCP.x - pinkyMCP.x, y: indexMCP.y - pinkyMCP.y };

          const targetAngle = Math.atan2(knuckleVector.y, knuckleVector.x) + (liveRotationOffsetRef.current * Math.PI) / 180;
          baseCompress = Math.min(1.0, Math.max(0.70, handWidth / (handDepth || 1)));

          if (!smoothedPositionRef.current) {
            smoothedPositionRef.current = { x: targetX, y: targetY };
            smoothedAngleRef.current = targetAngle;
          } else {
            const prevPos = smoothedPositionRef.current;
            const prevAngle = smoothedAngleRef.current ?? targetAngle;

            const smoothedX = prevPos.x * 0.85 + targetX * 0.15;
            const smoothedY = prevPos.y * 0.85 + targetY * 0.15;

            let angleDiff = targetAngle - prevAngle;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            const smoothedAngle = prevAngle + angleDiff * 0.12;

            smoothedPositionRef.current = { x: smoothedX, y: smoothedY };
            smoothedAngleRef.current = smoothedAngle;
          }

          drawX = smoothedPositionRef.current.x;
          drawY = smoothedPositionRef.current.y;
          drawAngle = smoothedAngleRef.current;
        }

        // Save last known state for buffer fallback
        lastKnownTrackedStateRef.current = {
          drawX,
          drawY,
          drawAngle,
          watchWidth,
          baseCompress,
          isRightHand,
          handednessLabel: handedness.label
        };

        if (!handDetected) {
          setHandDetected(true);
        }
      } else if (
        (currentCameraState === 'active' || currentCameraState === 'fallback') &&
        lastKnownTrackedStateRef.current !== null &&
        consecutiveLostFramesRef.current < 25
      ) {
        // Hand not detected this frame, but we have a recently tracked state
        consecutiveLostFramesRef.current += 1;
        drawTrackingActive = true;

        const state = lastKnownTrackedStateRef.current;
        drawX = state.drawX;
        drawY = state.drawY;
        drawAngle = state.drawAngle;
        watchWidth = state.watchWidth;
        baseCompress = state.baseCompress;
        isRightHand = state.isRightHand;

        if (!handDetected) {
          setHandDetected(true);
        }
      } else {
        // Clear tracked cache once loss buffer expires
        if (handDetected) {
          setHandDetected(false);
        }
        smoothedPositionRef.current = null;
        smoothedAngleRef.current = null;
        smoothedWidthRef.current = null;
        lastKnownTrackedStateRef.current = null;
      }

      if (drawTrackingActive) {
        if (overlayImageRef.current) {
          const img = overlayImageRef.current;
          const bbox = assetBBoxRef.current || { left: 0, top: 0, width: img.naturalWidth || 1, height: img.naturalHeight || 1 };
          watchHeight = watchWidth * (bbox.height / bbox.width);

          ctx.save();
          ctx.translate(drawX, drawY);
          ctx.rotate(drawAngle);
          
          if (isRightHand) {
            ctx.scale(-1, 1);
          }

          if (renderMode === 'segmentation') {
            const clipHandWidth = handWidth || (watchWidth / 0.8);
            const wristClipWidth = clipHandWidth * 0.88;
            const forearmClipWidth = clipHandWidth * 0.93;
            ctx.beginPath();
            ctx.moveTo(-wristClipWidth / 2, watchWidth * 0.45);
            ctx.lineTo(wristClipWidth / 2, watchWidth * 0.45);
            ctx.lineTo(forearmClipWidth / 2, -watchHeight * 4);
            ctx.lineTo(-forearmClipWidth / 2, -watchHeight * 4);
            ctx.closePath();
            ctx.clip();
          }

          if (renderMode !== 'original') {
            // Draw dynamic soft contact shadow (Soft Ambient Layer)
            ctx.save();
            ctx.scale(baseCompress, 1);
            if (ctx.filter !== undefined) {
              ctx.filter = 'blur(10px)';
            }
            ctx.fillStyle = `rgba(0, 0, 0, ${0.22 * baseCompress})`;
            ctx.beginPath();
            ctx.moveTo(-watchWidth / 2, -watchHeight * 0.25 + 3);
            ctx.lineTo(-watchWidth * 0.175, -watchHeight * 0.5 + 3);
            ctx.lineTo(watchWidth * 0.175, -watchHeight * 0.5 + 3);
            ctx.lineTo(watchWidth / 2, -watchHeight * 0.25 + 3);
            ctx.lineTo(watchWidth / 2, watchHeight * 0.25 + 3);
            ctx.lineTo(watchWidth * 0.175, watchHeight * 0.5 + 3);
            ctx.lineTo(-watchWidth * 0.175, watchHeight * 0.5 + 3);
            ctx.lineTo(-watchWidth / 2, watchHeight * 0.25 + 3);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Draw dynamic tight contact shadow (Anchoring Layer - prevents floating effect)
            ctx.save();
            ctx.scale(baseCompress, 1);
            if (ctx.filter !== undefined) {
              ctx.filter = 'blur(3px)';
            }
            ctx.fillStyle = `rgba(0, 0, 0, ${0.55 * baseCompress})`;
            ctx.beginPath();
            ctx.moveTo(-watchWidth / 2 + 1, -watchHeight * 0.25 + 1.5);
            ctx.lineTo(-watchWidth * 0.175 + 1, -watchHeight * 0.5 + 1.5);
            ctx.lineTo(watchWidth * 0.175 - 1, -watchHeight * 0.5 + 1.5);
            ctx.lineTo(watchWidth / 2 - 1, -watchHeight * 0.25 + 1.5);
            ctx.lineTo(watchWidth / 2 - 1, watchHeight * 0.25 + 1.5);
            ctx.lineTo(watchWidth * 0.175 - 1, watchHeight * 0.5 + 1.5);
            ctx.lineTo(-watchWidth * 0.175 + 1, watchHeight * 0.5 + 1.5);
            ctx.lineTo(-watchWidth / 2 + 1, watchHeight * 0.25 + 1.5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Apply blur and lighting matching filters to context (subtle blur matches soft webcam resolution)
            if (ctx.filter !== undefined) {
              const sampleX = Math.min(width - 5, Math.max(0, Math.round(drawX)));
              const sampleY = Math.min(height - 5, Math.max(0, Math.round(drawY)));
              let avgBrightness = 127;
              try {
                const imgData = ctx.getImageData(sampleX - 2, sampleY - 2, 5, 5);
                const data = imgData.data;
                let totalLuma = 0;
                for (let i = 0; i < data.length; i += 4) {
                  totalLuma += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                }
                avgBrightness = totalLuma / (data.length / 4);
              } catch {
                avgBrightness = 128;
              }
              const brightnessRatio = Math.min(1.05, Math.max(0.95, avgBrightness / 128));
              const contrastRatio = Math.min(1.03, Math.max(0.97, 0.98 + (avgBrightness / 128) * 0.02));
              ctx.filter = `blur(0.6px) brightness(${brightnessRatio}) contrast(${contrastRatio})`;
            }
          }

          // Draw the entire watch image as a single continuous piece
          ctx.save();
          if (renderMode !== 'original') {
            ctx.scale(baseCompress, 1);
          }
          ctx.drawImage(img, bbox.left, bbox.top, bbox.width, bbox.height, -watchWidth / 2, -watchHeight / 2, watchWidth, watchHeight);
          ctx.restore();

          ctx.restore();
        } else {
          ctx.save();
          ctx.translate(drawX, drawY);
          ctx.rotate(drawAngle);
          if (renderMode !== 'original') {
            ctx.scale(baseCompress, 1);
          }
          ctx.strokeStyle = '#C9A84C';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, watchWidth / 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      } else {
        // Reset smoothed tracking state when hand tracking is inactive
        smoothedPositionRef.current = null;
        smoothedAngleRef.current = null;
        smoothedWidthRef.current = null;
        lastKnownTrackedStateRef.current = null;

        // Manual dragging mode (fallback / denied / no hand found)
        const x = manualPositionRef.current.x === 0 ? width / 2 : manualPositionRef.current.x;
        const y = manualPositionRef.current.y === 0 ? height / 2 : manualPositionRef.current.y;

        if (overlayImageRef.current) {
          const img = overlayImageRef.current;
          const aspectRatio = img.naturalHeight / img.naturalWidth;
          const w = 150 * manualScaleRef.current;
          const h = w * aspectRatio;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((manualRotationRef.current * Math.PI) / 180);
          ctx.drawImage(img, -w / 2, -h / 2, w, h);

          if (currentCameraState === 'fallback' || currentCameraState === 'denied') {
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8);
          }
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
    latestHandResults.current = null;
    setHandDetected(false);

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
          setManualPosition({ x: canvas.width / 2, y: canvas.height / 2 });
          setManualScale(1.0);
          setManualRotation(0);
        }

        // Start render loop for static image
        if (renderFrameId.current) cancelAnimationFrame(renderFrameId.current);
        renderFrameId.current = requestAnimationFrame(drawLoop);

        // Run hand detector on static image
        setTimeout(async () => {
          if (handsRef.current) {
            try {
              await handsRef.current.send({ image: img });
            } catch (err) {
              console.error('Error running hands on static image:', err);
            }
          }
        }, 300);
      };
    };
    reader.readAsDataURL(file);
  };

  // Drag-and-drop mechanics for manual adjustments
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (cameraState === 'active' && handDetected) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({
      x: x - (manualPosition.x === 0 ? canvas.width / 2 : manualPosition.x),
      y: y - (manualPosition.y === 0 ? canvas.height / 2 : manualPosition.y),
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
    if (cameraState === 'active' && handDetected) return;
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    setIsDragging(true);
    setDragStart({
      x: x - (manualPosition.x === 0 ? canvas.width / 2 : manualPosition.x),
      y: y - (manualPosition.y === 0 ? canvas.height / 2 : manualPosition.y),
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
        <Link href="/products" className="text-sm text-gray-400 hover:text-[#C9A84C] transition-colors">
          &larr; Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Try-on Mirror Container (Left column) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Active Camera Device Selector (Premium feature) */}
          {cameraState === 'active' && devices.length > 1 && (
            <div className="flex items-center justify-between bg-[#0F1B30]/80 p-3 rounded-lg border border-[#C9A84C]/20 text-xs">
              <span className="text-gray-300 font-semibold uppercase tracking-wider flex items-center">
                <Camera className="w-4 h-4 text-[#C9A84C] mr-1.5" /> Select Camera:
              </span>
              <select
                value={selectedDeviceId}
                onChange={handleDeviceChange}
                className="bg-[#1A2742] border border-gray-700 text-white rounded px-2.5 py-1 focus:outline-none focus:border-[#C9A84C]"
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
          <div className="relative aspect-[4/3] w-full bg-[#0F1B30] rounded-lg overflow-hidden shadow-2xl">
            {/* Loading Cover */}
            {cameraState === 'loading' && (
              <div className="absolute inset-0 z-30 bg-[#0B1422] flex flex-col items-center justify-center p-6 text-center space-y-4">
                <RefreshCw className="w-10 h-10 text-[#C9A84C] animate-spin" />
                <p className="text-sm font-semibold text-gray-300">{loadingMessage}</p>
              </div>
            )}

            {/* Permission Denied UI (Graceful degradation) */}
            {cameraState === 'denied' && (
              <div className="absolute inset-0 z-30 bg-[#0F1B30] flex flex-col items-center justify-center p-8 text-center space-y-5">
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
                <label className="flex items-center space-x-2 px-4 py-2 bg-[#C9A84C] text-[#0B1422] hover:bg-[#C9A84C]/95 rounded-md text-xs font-bold cursor-pointer transition-all">
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
                cameraState === 'fallback' || cameraState === 'denied' || (cameraState === 'active' && !handDetected) ? 'cursor-move' : ''
              }`}
            />

            {/* Top HUD overlay status */}
            {cameraState === 'active' && (
              <div className="absolute top-4 left-4 z-20 bg-black/60 px-3 py-1.5 rounded border border-[#C9A84C]/20 text-[10px] uppercase font-bold tracking-wider text-[#C9A84C] flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${handDetected ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                <span>{handDetected ? 'Wrist Locked' : 'Searching Hand/Wrist...'}</span>
              </div>
            )}
          </div>

          {/* Calibration / Upload Help panel */}
          <div className="p-5 glass-panel rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start">
                <HelpCircle className="w-4 h-4 text-[#C9A84C] mr-1.5" />
                Need calibration?
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                Use the sliders below or drag the watch directly to calibrate its size and position on your wrist.
              </p>
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <label className="flex-grow sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/10 rounded-md text-xs font-semibold cursor-pointer transition-all">
                <Upload className="w-4 h-4" />
                <span>Upload Selfie/Hand</span>
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

          {/* Unified Adjustments Panel */}
          {cameraState !== 'loading' && (
            <div className="p-6 glass-panel rounded-lg border border-[#C9A84C]/25 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h4 className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider flex items-center">
                  <Sliders className="w-4 h-4 mr-2" />
                  {handDetected ? 'Fine-tune Watch Fit (Wrist Locked)' : 'Manual Adjustments (Drag watch or use sliders)'}
                </h4>
                {showCalibrator && (
                  <span className="text-[9px] px-2 py-0.5 bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[#C9A84C] font-semibold rounded uppercase tracking-wider">
                    Admin Mode
                  </span>
                )}
              </div>

              {handDetected ? (
                /* Auto-fitting calibration mode (live offsets) */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-white">
                    {/* Scale factor */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Watch Size</span>
                        <div className="flex items-center space-x-1.5">
                          <button 
                            type="button" 
                            onClick={() => setLiveScale(prev => Math.max(0.5, Number((prev - 0.01).toFixed(2))))}
                            className="w-5 h-5 bg-[#1A2742] border border-gray-700 hover:border-[#C9A84C] rounded flex items-center justify-center font-bold text-[10px] text-white"
                          >
                            -
                          </button>
                          <span className="text-[#C9A84C] font-mono min-w-[28px] text-center">{liveScale.toFixed(2)}</span>
                          <button 
                            type="button" 
                            onClick={() => setLiveScale(prev => Math.min(2.0, Number((prev + 0.01).toFixed(2))))}
                            className="w-5 h-5 bg-[#1A2742] border border-gray-700 hover:border-[#C9A84C] rounded flex items-center justify-center font-bold text-[10px] text-white"
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
                        className="w-full accent-[#C9A84C] bg-[#1A2742] h-1 rounded cursor-pointer"
                      />
                    </div>

                    {/* Rotation Bias */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Angle Rotation</span>
                        <div className="flex items-center space-x-1.5">
                          <button 
                            type="button" 
                            onClick={() => setLiveRotationOffset(prev => Math.max(-180, prev - 1))}
                            className="w-5 h-5 bg-[#1A2742] border border-gray-700 hover:border-[#C9A84C] rounded flex items-center justify-center font-bold text-[10px] text-white"
                          >
                            -
                          </button>
                          <span className="text-[#C9A84C] font-mono min-w-[28px] text-center">{liveRotationOffset}°</span>
                          <button 
                            type="button" 
                            onClick={() => setLiveRotationOffset(prev => Math.min(180, prev + 1))}
                            className="w-5 h-5 bg-[#1A2742] border border-gray-700 hover:border-[#C9A84C] rounded flex items-center justify-center font-bold text-[10px] text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="1"
                        value={liveRotationOffset}
                        onChange={(e) => setLiveRotationOffset(parseInt(e.target.value))}
                        className="w-full accent-[#C9A84C] bg-[#1A2742] h-1 rounded cursor-pointer"
                      />
                    </div>

                    {/* X Offset */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Horizontal Shift</span>
                        <div className="flex items-center space-x-1.5">
                          <button 
                            type="button" 
                            onClick={() => setLiveXOffset(prev => Math.max(-150, prev - 1))}
                            className="w-5 h-5 bg-[#1A2742] border border-gray-700 hover:border-[#C9A84C] rounded flex items-center justify-center font-bold text-[10px] text-white"
                          >
                            -
                          </button>
                          <span className="text-[#C9A84C] font-mono min-w-[28px] text-center">{liveXOffset}px</span>
                          <button 
                            type="button" 
                            onClick={() => setLiveXOffset(prev => Math.min(150, prev + 1))}
                            className="w-5 h-5 bg-[#1A2742] border border-gray-700 hover:border-[#C9A84C] rounded flex items-center justify-center font-bold text-[10px] text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="-150"
                        max="150"
                        step="1"
                        value={liveXOffset}
                        onChange={(e) => setLiveXOffset(parseInt(e.target.value))}
                        className="w-full accent-[#C9A84C] bg-[#1A2742] h-1 rounded cursor-pointer"
                      />
                    </div>

                    {/* Y Offset */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Vertical Shift</span>
                        <div className="flex items-center space-x-1.5">
                          <button 
                            type="button" 
                            onClick={() => setLiveYOffset(prev => Math.max(-150, prev - 1))}
                            className="w-5 h-5 bg-[#1A2742] border border-gray-700 hover:border-[#C9A84C] rounded flex items-center justify-center font-bold text-[10px] text-white"
                          >
                            -
                          </button>
                          <span className="text-[#C9A84C] font-mono min-w-[28px] text-center">{liveYOffset}px</span>
                          <button 
                            type="button" 
                            onClick={() => setLiveYOffset(prev => Math.min(150, prev + 1))}
                            className="w-5 h-5 bg-[#1A2742] border border-gray-700 hover:border-[#C9A84C] rounded flex items-center justify-center font-bold text-[10px] text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="-150"
                        max="150"
                        step="1"
                        value={liveYOffset}
                        onChange={(e) => setLiveYOffset(parseInt(e.target.value))}
                        className="w-full accent-[#C9A84C] bg-[#1A2742] h-1 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {showCalibrator && (
                    <div className="space-y-1.5 border-t border-gray-800 pt-3 mt-1 text-xs">
                      <span className="text-gray-400">AR Render Mode Comparison (Feature Flag)</span>
                      <div className="flex flex-wrap gap-2.5 mt-1.5">
                        {(['original', 'new', 'segmentation'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setRenderMode(mode)}
                            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all border ${
                              renderMode === mode
                                ? 'bg-[#C9A84C] text-[#0B1422] border-[#C9A84C]'
                                : 'bg-[#1A2742] text-gray-300 border-gray-700 hover:border-gray-500'
                            }`}
                          >
                            {mode === 'original' ? 'Original (Flat)' : mode === 'new' ? 'New (Curved & Smoothed)' : 'Segmentation (Occluded)'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2 space-x-3 border-t border-gray-850 mt-2">
                    <Button 
                      type="button"
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
                    {showCalibrator && (
                      <Button 
                        type="button"
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
                                stock: product.stock,
                                lens_image_url: product.lens_image_url || null,
                                reflection_image_url: product.reflection_image_url || null,
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
                        className="text-xs text-[#0B1422] bg-[#C9A84C] hover:bg-[#C9A84C]/90"
                      >
                        Save Settings
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                /* Manual adjustments fallback mode (drag-and-drop coordinates) */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Scale slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Watch Size</span>
                      <span className="text-[#C9A84C] font-mono">{(manualScale * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={manualScale}
                      onChange={(e) => setManualScale(parseFloat(e.target.value))}
                      className="w-full accent-[#C9A84C] bg-gray-700 h-1 rounded cursor-pointer"
                    />
                  </div>
                  {/* Rotation slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Angle Rotation</span>
                      <span className="text-[#C9A84C] font-mono">{manualRotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="5"
                      value={manualRotation}
                      onChange={(e) => setManualRotation(parseInt(e.target.value))}
                      className="w-full accent-[#C9A84C] bg-gray-700 h-1 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Product Details Panel (Right column) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-gray-800 bg-[#0F1B30]/50">
            <CardContent className="p-6 space-y-6">
              <div>
                <span className="px-2 py-0.5 bg-[#1A2742] border border-[#C9A84C]/20 text-[#C9A84C] text-[10px] font-bold uppercase tracking-widest rounded">
                  {product.category}
                </span>
                <h2 className="font-luxury text-2xl font-bold text-white mt-3 leading-snug">
                  {product.name}
                </h2>
                <div className="mt-3 flex items-baseline">
                  <span className="text-2xl font-bold text-[#C9A84C]">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">incl. all taxes</span>
                </div>
              </div>

              {/* Conversion-Boosting Widgets */}
              <div className="border-t border-gray-800/65 pt-4 space-y-3">
                {/* Live Viewers count */}
                <div className="flex items-center space-x-2 text-xs text-gray-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <p>
                    <span className="text-[#E8D9A0] font-bold">{liveViewers} fashion enthusiasts</span> are viewing this watch now
                  </p>
                </div>

                {/* Deterministic recent sales count */}
                <div className="flex items-center space-x-2 text-xs text-gray-300">
                  <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                  <p>
                    <span className="text-[#C9A84C] font-bold">{salesCount} orders</span> placed in the last {salesHours} hours
                  </p>
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
                <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">Description</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {product.description || 'No description available for this luxury watch.'}
                </p>
              </div>

              <div className="border-t border-gray-800 pt-4 space-y-3">
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

              <div className="pt-2">
                <Button
                  onClick={takeSnapshot}
                  className="w-full flex items-center justify-center py-2.5 font-bold uppercase tracking-wider text-xs"
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Order This Watch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title="Order Request Details">
        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
          <div className="flex flex-col items-center justify-center p-4 bg-black/20 rounded border border-[#C9A84C]/10 mb-2">
            {snapshot && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={snapshot}
                alt="Try-on snapshot preview"
                className="max-h-40 rounded border border-gray-800"
              />
            )}
            <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">Try-on Snapshot</span>
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
            placeholder="10-digit mobile number"
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

      {/* Sticky Bottom Buy Bar (Hongo conversion layout choice) */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-40 bg-[#0F1B30]/95 backdrop-blur-md border-t border-[#C9A84C]/35 shadow-[0_-10px_25px_rgba(0,0,0,0.6)] py-3 px-4 sm:px-6 transition-all duration-500 ease-in-out transform ${
          showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="relative w-10 h-10 rounded overflow-hidden border border-gray-800 bg-black/20 shrink-0">
              <NextImage 
                src={product.image_url} 
                alt={product.name} 
                fill 
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white line-clamp-1 font-luxury">{product.name}</h4>
              <p className="text-[10px] text-[#C9A84C] font-bold uppercase tracking-wider capitalize">{product.category}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500">Luxury price</p>
              <p className="text-sm font-bold text-[#C9A84C]">₹{product.price.toLocaleString('en-IN')}</p>
            </div>
            <Button
              onClick={takeSnapshot}
              disabled={product.stock <= 0}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#0B1422] bg-[#C9A84C] hover:bg-[#C9A84C]/90 shadow-[0_0_15px_rgba(212,175,55,0.25)] flex items-center"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              Instant Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
