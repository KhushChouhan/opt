/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useSession } from 'next-auth/react';
import { Camera, Upload, AlertCircle, RefreshCw, MessageCircle, HelpCircle, Sliders, Flame, X } from 'lucide-react';
import { loadScript } from '@/lib/loadScript';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { buildWhatsAppUrl, WHATSAPP_STORE } from '@/utils/whatsapp';

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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderFrameId = useRef<number | null>(null);
  const handsRef = useRef<any>(null);
  const overlayImageRef = useRef<HTMLImageElement | null>(null);
  const uploadedImageRef = useRef<HTMLImageElement | null>(null);
  const assetBBoxRef = useRef<BBox | null>(null);
  const latestHandResults = useRef<any>(null);

  // Device detection — used for adaptive resolution / model complexity
  const isMobile = typeof navigator !== 'undefined' && (
    /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth < 768
  );

  // Session
  const { data: session } = useSession();
  const [showCalibrator, setShowCalibrator] = useState(false);

  useEffect(() => {
    setShowCalibrator(!!session);
  }, [session]);

  // Live overrides
  const [liveScale, setLiveScale] = useState<number>(
    product.overlay_scale !== null && product.overlay_scale !== undefined ? Number(product.overlay_scale) : 1.0
  );
  const [liveXOffset, setLiveXOffset] = useState<number>(
    product.overlay_x_offset !== null && product.overlay_x_offset !== undefined ? Number(product.overlay_x_offset) : 0.0
  );
  const [liveYOffset, setLiveYOffset] = useState<number>(
    product.overlay_y_offset !== null && product.overlay_y_offset !== undefined ? Number(product.overlay_y_offset) : 0.0
  );
  const [liveRotationOffset, setLiveRotationOffset] = useState<number>(
    product.overlay_rotation_offset !== null && product.overlay_rotation_offset !== undefined ? Number(product.overlay_rotation_offset) : 0.0
  );

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

  // Temporal smoothing refs
  const smoothedPositionRef = useRef<{ x: number; y: number } | null>(null);
  const smoothedAngleRef = useRef<number | null>(null);
  const smoothedWidthRef = useRef<number | null>(null);
  const consecutiveLostFramesRef = useRef<number>(0);
  const lastKnownTrackedStateRef = useRef<{
    drawX: number;
    drawY: number;
    drawAngle: number;
    watchWidth: number;
    baseCompress: number;
    isRightHand: boolean;
  } | null>(null);

  // App States
  const [cameraState, setCameraState] = useState<'loading' | 'active' | 'denied' | 'fallback'>('loading');
  const [loadingMessage, setLoadingMessage] = useState('Initializing virtual mirror...');
  const [handDetected, setHandDetected] = useState(false);
  const [showAdjustPanel, setShowAdjustPanel] = useState(false);
  const [isMirror, setIsMirror] = useState(false);

  const isMirrorRef = useRef(isMirror);
  useEffect(() => {
    isMirrorRef.current = isMirror;
  }, [isMirror]);

  // Camera Selection States
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Fallback Manual Overlay States
  const [manualScale, setManualScale] = useState(1.0);
  const [manualPosition, setManualPosition] = useState({ x: 0, y: 0 });
  const [manualRotation, setManualRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Refs to prevent stale closure bugs in requestAnimationFrame loops
  const cameraStateRef = useRef(cameraState);
  const manualScaleRef = useRef(manualScale);
  const manualPositionRef = useRef(manualPosition);
  const manualRotationRef = useRef(manualRotation);

  useEffect(() => { cameraStateRef.current = cameraState; }, [cameraState]);
  useEffect(() => { manualScaleRef.current = manualScale; }, [manualScale]);
  useEffect(() => { manualPositionRef.current = manualPosition; }, [manualPosition]);
  useEffect(() => { manualRotationRef.current = manualRotation; }, [manualRotation]);

  // Live viewers
  const [liveViewers, setLiveViewers] = useState<number>(55);
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

  const salesCount = (product.id.charCodeAt(0) % 12) + 4;
  const salesHours = (product.id.charCodeAt(1) % 18) + 6;

  // Stop video streams
  const stopAllStreams = useCallback(() => {
    if (renderFrameId.current) {
      cancelAnimationFrame(renderFrameId.current);
      renderFrameId.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  // Callback when Hands yields results
  const handleHandResults = useCallback((results: any) => {
    latestHandResults.current = results;
  }, []);


  // High-performance decoupled draw loop
  const drawLoop = useCallback(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const currentCameraState = cameraStateRef.current;

      // Dynamically resize canvas to match video or fallback image dimensions
      if (currentCameraState === 'active' && videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
        const vw = videoRef.current.videoWidth;
        const vh = videoRef.current.videoHeight;
        if (canvas.width !== vw || canvas.height !== vh) {
          canvas.width = vw;
          canvas.height = vh;
          console.log('Canvas resized dynamically in drawLoop:', vw, vh);
        }
      } else if (currentCameraState === 'fallback' && uploadedImageRef.current) {
        const img = uploadedImageRef.current;
        const maxDim = 1280;
        let targetW = img.naturalWidth;
        let targetH = img.naturalHeight;
        if (img.naturalWidth > maxDim || img.naturalHeight > maxDim) {
          if (img.naturalWidth > img.naturalHeight) {
            targetW = maxDim;
            targetH = Math.round((img.naturalHeight * maxDim) / img.naturalWidth);
          } else {
            targetH = maxDim;
            targetW = Math.round((img.naturalWidth * maxDim) / img.naturalHeight);
          }
        }
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
          console.log('Canvas resized dynamically to scaled uploaded image:', targetW, targetH);
        }
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw fallback uploaded photo or clear canvas for transparent overlay mode
      let drawW = width;
      let drawH = height;
      let offsetX = 0;
      let offsetY = 0;

      if (currentCameraState === 'active' && videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
        const vw = videoRef.current.videoWidth;
        const vh = videoRef.current.videoHeight;
        const scale = Math.max(width / vw, height / vh);
        drawW = vw * scale;
        drawH = vh * scale;
        offsetX = (width - drawW) / 2;
        offsetY = (height - drawH) / 2;
        
        ctx.clearRect(0, 0, width, height);
      } else if (currentCameraState === 'fallback' && uploadedImageRef.current) {
        const img = uploadedImageRef.current;
        const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
        drawW = img.naturalWidth * scale;
        drawH = img.naturalHeight * scale;
        offsetX = (width - drawW) / 2;
        offsetY = (height - drawH) / 2;
        
        ctx.save();
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        ctx.restore();
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      // Draw overlay based on landmarks or manual sliders
      const results = latestHandResults.current;
      const hasHandTracking =
        (currentCameraState === 'active' || currentCameraState === 'fallback') &&
        results && results.multiHandLandmarks && results.multiHandLandmarks.length > 0;

      let drawX = 0;
      let drawY = 0;
      let drawAngle = 0;
      let watchWidth = 0;
      let baseCompress = 1.0;
      let isRightHand = false;
      let drawTrackingActive = false;
      let handWidth = 0;
      let watchHeight = 0;

      if (hasHandTracking) {
        consecutiveLostFramesRef.current = 0;
        drawTrackingActive = true;

        const landmarks = results.multiHandLandmarks[0];
        const handedness = results.multiHandedness[0];
        isRightHand = handedness.label === 'Right';

        // Coordinate mapping helpers
        // IMPORTANT: MediaPipe hand landmarks are always in the original (un-mirrored) video space.
        // When the video is CSS-mirrored (scaleX(-1)), landmark x=0 appears on the RIGHT of the screen.
        // So for mirrored mode: canvas x = width - (offsetX + lm.x * drawW)
        // For non-mirrored mode: canvas x = offsetX + lm.x * drawW
        const getX = (lm: any) => {
          if (currentCameraState === 'fallback') {
            // Uploaded image: no mirroring applied
            return lm.x * width;
          }
          // Live camera: account for CSS mirror transform
          if (isMirrorRef.current) {
            return width - (offsetX + lm.x * drawW);
          } else {
            return offsetX + lm.x * drawW;
          }
        };
        const getY = (lm: any) => {
          if (currentCameraState === 'fallback') {
            return lm.y * height;
          }
          return offsetY + lm.y * drawH;
        };

        // ── Key landmarks ──────────────────────────────────────────────────────
        // Landmark 0  = wrist bone (base of palm)
        // Landmarks 5,9,13,17 = MCP knuckles (index→pinky)
        const wristPt    = { x: getX(landmarks[0]),  y: getY(landmarks[0])  };
        const indexMCP   = { x: getX(landmarks[5]),  y: getY(landmarks[5])  };
        const middleMCP  = { x: getX(landmarks[9]),  y: getY(landmarks[9])  };
        const ringMCP    = { x: getX(landmarks[13]), y: getY(landmarks[13]) };
        const pinkyMCP   = { x: getX(landmarks[17]), y: getY(landmarks[17]) };

        // Palm center = average of 4 MCP knuckles
        const palmCenter = {
          x: (indexMCP.x + middleMCP.x + ringMCP.x + pinkyMCP.x) / 4,
          y: (indexMCP.y + middleMCP.y + ringMCP.y + pinkyMCP.y) / 4,
        };

        // ── Geometry measurements ──────────────────────────────────────────────
        // Hand width = distance across knuckles (index → pinky).
        // This is the most stable 2-D measure and scales perfectly with camera distance.
        const dx_k = indexMCP.x - pinkyMCP.x;
        const dy_k = indexMCP.y - pinkyMCP.y;
        handWidth = Math.sqrt(dx_k * dx_k + dy_k * dy_k);

        // Hand depth = wrist-to-palm-center distance
        const dx_d = palmCenter.x - wristPt.x;
        const dy_d = palmCenter.y - wristPt.y;
        const handDepth = Math.sqrt(dx_d * dx_d + dy_d * dy_d) || 1;

        // ── Forearm axis (unit vector pointing from palm → wrist, i.e. toward elbow) ──
        const forearmDirX = dx_d === 0 && dy_d === 0 ? 0 : (wristPt.x - palmCenter.x) / handDepth;
        const forearmDirY = dx_d === 0 && dy_d === 0 ? 1 : (wristPt.y - palmCenter.y) / handDepth;

        // ── WATCH ANCHOR POINT ──────────────────────────────────────────────────
        // MediaPipe landmark 0 sits at the very base of the palm / wrist joint.
        // A real watch sits ~25% of the way from the wrist landmark TOWARD the
        // palm center (i.e., just above the wrist bone, on the wrist crease).
        // Moving in the palm direction (negative forearm direction) places it correctly.
        const wristCreaseOffset = handDepth * 0.25;  // 25% toward palm = wrist crease
        const anchorX = wristPt.x - forearmDirX * wristCreaseOffset;
        const anchorY = wristPt.y - forearmDirY * wristCreaseOffset;

        // ── WATCH SIZING ──────────────────────────────────────────────────────
        // A watch face naturally spans ~90% of the wrist width.
        // handWidth (knuckle span) ≈ 1.2× wrist width for an average hand,
        // so 0.75 × handWidth gives a natural-looking case diameter.
        const naturalWidth = Math.max(handWidth * 0.78, 50);
        const targetWatchWidth = naturalWidth * liveScaleRef.current;

        if (smoothedWidthRef.current === null) {
          smoothedWidthRef.current = targetWatchWidth;
        } else {
          // 70% new, 30% old → fast size response
          smoothedWidthRef.current = smoothedWidthRef.current * 0.30 + targetWatchWidth * 0.70;
        }
        watchWidth = smoothedWidthRef.current;

        // ── POSITION WITH USER OFFSET (hand-relative, scales with distance) ──
        // Convert slider pixel values to hand-relative fractions so the
        // offset is the same visual size regardless of how close the hand is.
        // 100 px is the reference hand width at a comfortable close-up distance.
        const offsetScale = handWidth / 100;
        const targetX = anchorX + liveXOffsetRef.current * offsetScale;
        const targetY = anchorY + liveYOffsetRef.current * offsetScale;

        // ── ROTATION ──────────────────────────────────────────────────────────
        // Perpendicular to forearm direction.  Works for both hands automatically.
        // We subtract PI/2 to turn the "along forearm" angle into "across wrist".
        const rawAngle = Math.atan2(forearmDirY, forearmDirX) - Math.PI / 2;
        const rotOffsetRad = (liveRotationOffsetRef.current * Math.PI) / 180;
        const targetAngle = rawAngle + rotOffsetRad;

        // ── PERSPECTIVE COMPRESSION ───────────────────────────────────────────
        // When the wrist is side-on, handWidth shrinks relative to handDepth.
        const perspectiveRatio = handWidth / handDepth;
        baseCompress = clamp(perspectiveRatio, 0.60, 1.0);

        // ── SMOOTHING ─────────────────────────────────────────────────────────
        if (!smoothedPositionRef.current) {
          smoothedPositionRef.current = { x: targetX, y: targetY };
          smoothedAngleRef.current = targetAngle;
        } else {
          const prevPos = smoothedPositionRef.current;
          const prevAngle = smoothedAngleRef.current ?? targetAngle;

          // More responsive smoothing: 40% previous + 60% new
          const smoothedX = prevPos.x * 0.40 + targetX * 0.60;
          const smoothedY = prevPos.y * 0.40 + targetY * 0.60;

          let angleDiff = targetAngle - prevAngle;
          while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
          while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
          const smoothedAngle = prevAngle + angleDiff * 0.50;

          smoothedPositionRef.current = { x: smoothedX, y: smoothedY };
          smoothedAngleRef.current = smoothedAngle;
        }

        drawX = smoothedPositionRef.current.x;
        drawY = smoothedPositionRef.current.y;
        drawAngle = smoothedAngleRef.current!;

        lastKnownTrackedStateRef.current = {
          drawX, drawY, drawAngle, watchWidth, baseCompress, isRightHand
        };

        if (!handDetected) setHandDetected(true);

      } else if (
        (currentCameraState === 'active' || currentCameraState === 'fallback') &&
        lastKnownTrackedStateRef.current !== null &&
        consecutiveLostFramesRef.current < 40
      ) {
        consecutiveLostFramesRef.current += 1;
        drawTrackingActive = true;

        const state = lastKnownTrackedStateRef.current;
        drawX = state.drawX;
        drawY = state.drawY;
        drawAngle = state.drawAngle;
        watchWidth = state.watchWidth;
        baseCompress = state.baseCompress;
        isRightHand = state.isRightHand;

        if (!handDetected) setHandDetected(true);
      } else {
        if (handDetected) setHandDetected(false);
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

          // We do NOT horizontally mirror the watch overlay so the watch dial text is always readable (not backward).

          // Soft contact shadow centered under the watch case
          ctx.save();
          ctx.scale(baseCompress, 1);
          if (ctx.filter !== undefined) ctx.filter = 'blur(8px)';
          ctx.fillStyle = `rgba(0, 0, 0, ${0.22 * baseCompress})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, watchWidth * 0.45, watchWidth * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Apply subtle matching filter
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
            const brightnessRatio = Math.min(1.04, Math.max(0.96, avgBrightness / 128));
            ctx.filter = `blur(0.4px) brightness(${brightnessRatio})`;
          }

          ctx.save();
          ctx.scale(baseCompress, 1);
          ctx.drawImage(img, bbox.left, bbox.top, bbox.width, bbox.height, -watchWidth / 2, -watchHeight / 2, watchWidth, watchHeight);
          ctx.restore();

          ctx.restore();
        }
      } else {
        smoothedPositionRef.current = null;
        smoothedAngleRef.current = null;
        smoothedWidthRef.current = null;
        lastKnownTrackedStateRef.current = null;

        const x = manualPositionRef.current.x === 0 ? width / 2 : manualPositionRef.current.x;
        const y = manualPositionRef.current.y === 0 ? height * 0.65 : manualPositionRef.current.y;

        if (overlayImageRef.current) {
          const img = overlayImageRef.current;
          const aspectRatio = img.naturalHeight / img.naturalWidth;
          const w = 130 * manualScaleRef.current;
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
      if (currentCameraState === 'active' || currentCameraState === 'fallback') {
        renderFrameId.current = requestAnimationFrame(drawLoop);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handDetected]);

  // Asynchronous detection loop — runs at ~30fps independently of the draw loop
  const startDetectionLoop = useCallback(() => {
    let isDetecting = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const runDetection = async () => {
      const currentCameraState = cameraStateRef.current;

      if (
        currentCameraState === 'active' &&
        videoRef.current &&
        handsRef.current &&
        !isDetecting &&
        !videoRef.current.paused &&
        !videoRef.current.ended &&
        videoRef.current.readyState >= 3   // HAVE_FUTURE_DATA — reliable frame available
      ) {
        isDetecting = true;
        try {
          await handsRef.current.send({ image: videoRef.current });
        } catch (err) {
          console.error('Hands frame processing error:', err);
        } finally {
          isDetecting = false;
        }
      }

      if (cameraStateRef.current === 'active' || cameraStateRef.current === 'loading') {
        timeoutId = setTimeout(runDetection, 33); // ~30 fps
      }
    };

    runDetection();

    // Return cleanup so callers can stop the loop
    return () => {
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, []);

  // Start the camera
  const startWebcam = useCallback(async (deviceId?: string) => {
    stopAllStreams();
    setCameraState('loading');
    setLoadingMessage('Accessing camera...');
    latestHandResults.current = null;
    setHandDetected(false);

    try {
      // Watch try-on: prefer front/user-facing camera (wrist needs to face camera)
      // Lower resolution + frame rate on mobile for performance
      const constraints: any = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: deviceId ? undefined : { ideal: 'user' },
          width: { ideal: isMobile ? 640 : 1280 },
          height: { ideal: isMobile ? 480 : 720 },
          frameRate: { ideal: isMobile ? 15 : 30 }
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      navigator.mediaDevices.enumerateDevices().then((devicesList) => {
        const videoDevices = devicesList.filter((d) => d.kind === 'videoinput');
        setDevices(videoDevices);
        
        let activeDev = deviceId ? videoDevices.find((d) => d.deviceId === deviceId) : null;
        if (!activeDev && videoDevices.length > 0) {
          // Prefer front/selfie/integrated camera for wrist try-on
          activeDev = videoDevices.find(
            (d) => d.label.toLowerCase().includes('front') || d.label.toLowerCase().includes('integrated') || d.label.toLowerCase().includes('selfie') || d.label.toLowerCase().includes('user') || d.label.toLowerCase().includes('facetime')
          ) || videoDevices[0];
          setSelectedDeviceId(activeDev.deviceId);
        }
        
        if (activeDev) {
          const label = activeDev.label.toLowerCase();
          const isBackCamera = label.includes('back') || label.includes('rear') || label.includes('environment');
          // Front cameras should be mirrored visually; back cameras should NOT be
          setIsMirror(!isBackCamera);
        } else {
          // Default: assume front camera, mirror ON
          setIsMirror(true);
        }
      }).catch((e) => console.warn('Could not enumerate media devices:', e));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.muted = true;

        videoRef.current.onloadedmetadata = async () => {
          setCameraState('active');
          try {
            if (videoRef.current) await videoRef.current.play();
          } catch (playErr) {
            console.error('Autoplay blocked or failed:', playErr);
          }

          // Safari/WebKit keep-alive: periodically call play() to prevent video suspension
          const keepAliveInterval = setInterval(() => {
            if (videoRef.current && videoRef.current.paused && cameraStateRef.current === 'active') {
              videoRef.current.play().catch(() => {});
            }
            if (cameraStateRef.current !== 'active') {
              clearInterval(keepAliveInterval);
            }
          }, 2000);

          if (renderFrameId.current) cancelAnimationFrame(renderFrameId.current);
          renderFrameId.current = requestAnimationFrame(drawLoop);
          startDetectionLoop();
        };
      }
    } catch (error) {
      console.warn('Camera access denied or unavailable:', error);
      setCameraState('denied');
    }
  }, [stopAllStreams, drawLoop, startDetectionLoop, isMobile]);

  // Initialize and load dependencies
  useEffect(() => {
    let active = true;

    async function init() {
      try {
        setLoadingMessage('Loading Hand Tracking engine...');
        await loadScript('/libs/mediapipe/camera_utils.js');
        await loadScript('/libs/mediapipe/hands.js');

        if (!active) return;

        const img = new Image();
        img.src = product.overlay_image_url;
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          overlayImageRef.current = img;
          assetBBoxRef.current = computeAssetBBox(img);
        };
        img.onerror = () => {
          console.error('Failed to load watch overlay image.');
        };

        const HandsClass = (window as any).Hands;
        if (!HandsClass) throw new Error('MediaPipe Hands library not loaded.');

        const hands = new HandsClass({
          // Do NOT add query params (?v=1) here — MediaPipe's wasm loader passes
          // this exact path to fetch(), so query strings break .tflite/.data loading
          locateFile: (file: string) => `/libs/mediapipe/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: isMobile ? 0 : 1,
          minDetectionConfidence: 0.55,
          minTrackingConfidence: 0.50,
        });

        hands.onResults(handleHandResults);
        handsRef.current = hands;

        // Pre-initialize the model (downloads wasm + tflite once, warms up GPU)
        setLoadingMessage('Warming up hand detection...');
        try {
          await hands.initialize();
        } catch (initErr) {
          console.warn('hands.initialize() failed (non-fatal):', initErr);
        }

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

    return () => {
      active = false;
      stopAllStreams();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  // Camera Selector Handler
  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const devId = e.target.value;
    setSelectedDeviceId(devId);
    startWebcam(devId);
  };

  // File Upload Handler
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
    setIsMirror(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        uploadedImageRef.current = img;
        setCameraState('fallback');

        const canvas = canvasRef.current;
        if (canvas) {
          const width = canvas.width;
          const height = canvas.height;
          setManualPosition({ x: width * 0.5, y: height * 0.65 });
          setManualScale(1.0);
          setManualRotation(0);

          // Force draw photo immediately to canvas so it is ready before Hands runs
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
            const drawW = img.naturalWidth * scale;
            const drawH = img.naturalHeight * scale;
            const offsetX = (width - drawW) / 2;
            const offsetY = (height - drawH) / 2;
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
          }
        }

        if (renderFrameId.current) cancelAnimationFrame(renderFrameId.current);
        renderFrameId.current = requestAnimationFrame(drawLoop);

        // Run hands on uploaded static image (drawn onto the canvas at 640x480)
        setTimeout(async () => {
          const canvas = canvasRef.current;
          if (handsRef.current && canvas) {
            try {
              await handsRef.current.send({ image: canvas });
            } catch (err) {
              console.error('Error running hands on static image:', err);
            }
          }
        }, 150);
      };
    };
    reader.readAsDataURL(file);
  };

  // Drag mechanics
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (cameraState === 'active' && handDetected) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    setIsDragging(true);
    setDragStart({
      x: x - (manualPosition.x === 0 ? canvas.width / 2 : manualPosition.x),
      y: y - (manualPosition.y === 0 ? canvas.height * 0.65 : manualPosition.y),
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    setManualPosition({ x: x - dragStart.x, y: y - dragStart.y });
  };

  const handleMouseUpOrLeave = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (cameraState === 'active' && handDetected) return;
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.touches[0].clientX - rect.left) * scaleX;
    const y = (e.touches[0].clientY - rect.top) * scaleY;
    setIsDragging(true);
    setDragStart({
      x: x - (manualPosition.x === 0 ? canvas.width / 2 : manualPosition.x),
      y: y - (manualPosition.y === 0 ? canvas.height * 0.65 : manualPosition.y),
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.touches[0].clientX - rect.left) * scaleX;
    const y = (e.touches[0].clientY - rect.top) * scaleY;
    setManualPosition({ x: x - dragStart.x, y: y - dragStart.y });
  };

  // WhatsApp Inquiry
  const handleInquiry = () => {
    const msg = `Hi Hariyana Watch & Opticals! 👋\n\nI'm interested in purchasing:\n\n*${product.name}*\nPrice: ₹${product.price.toLocaleString('en-IN')}\n\nPlease share availability and more details. Thank you!`;
    const url = buildWhatsAppUrl(msg, WHATSAPP_STORE);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8" ref={containerRef}>
      {/* Back to catalog */}
      <div className="mb-4">
        <Link href="/products" className="text-sm text-gray-400 hover:text-[#C9A84C] transition-colors flex items-center gap-1.5">
          ← Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-start">
        {/* Try-on Mirror Container */}
        <div className="lg:col-span-8 space-y-3">

          {/* Camera Selector — only show when multiple cameras exist */}
          {cameraState === 'active' && devices.length > 1 && (
            <div className="flex items-center justify-between bg-[#0F1B30]/80 p-2.5 rounded-lg border border-[#C9A84C]/20 text-xs">
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
                <p className="text-[10px] text-gray-500 max-w-xs">Hold your wrist flat and open-palm toward the camera</p>
              </div>
            )}

            {/* Permission Denied */}
            {cameraState === 'denied' && (
              <div className="absolute inset-0 z-30 bg-[#0F1B30] flex flex-col items-center justify-center p-6 sm:p-8 text-center space-y-4">
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full">
                  <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm sm:text-base uppercase font-luxury">Camera Blocked</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mt-2 leading-relaxed">
                    Camera permissions were denied. Allow camera in browser settings, or upload a photo below.
                  </p>
                </div>
                <label className="flex items-center space-x-2 px-4 py-2 bg-[#C9A84C] text-[#0B1422] hover:bg-[#C9A84C]/90 rounded-md text-xs font-bold cursor-pointer transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Upload Wrist Photo</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                <button
                  onClick={() => startWebcam(selectedDeviceId)}
                  className="text-[#C9A84C] text-xs font-semibold underline hover:text-[#E8D9A0] transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Video element - visible but behind canvas to prevent browser suspension */}
            <video
              ref={videoRef}
              width={640}
              height={480}
              autoPlay
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 1,
                pointerEvents: 'none',
                transform: isMirror ? 'scaleX(-1)' : 'none'
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
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                position: 'relative',
                zIndex: 2,
                backgroundColor: cameraState === 'active' ? 'transparent' : '#0F1B30'
              }}
              className={`select-none ${cameraState === 'fallback' || cameraState === 'denied' || (cameraState === 'active' && !handDetected) ? 'cursor-move' : ''}`}
            />

            {/* Status HUD */}
            {cameraState === 'active' && (
              <div className="absolute top-3 left-3 z-20 bg-black/65 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/10 text-[10px] uppercase font-bold tracking-wider text-white flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${handDetected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                <span>{handDetected ? 'Wrist Locked ✓' : 'Hold wrist flat toward camera'}</span>
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

            {/* Fallback upload overlay */}
            {cameraState === 'active' && (
              <label className="absolute bottom-3 left-3 z-20 bg-black/65 backdrop-blur-sm border border-white/10 text-gray-300 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:border-[#C9A84C]/40 hover:text-[#C9A84C] transition-all cursor-pointer">
                <Upload className="w-3 h-3" />
                Upload Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Adjustment Panel (collapsible) */}
          {showAdjustPanel && cameraState !== 'loading' && (
            <div className="p-4 sm:p-5 bg-[#0F1B30]/90 backdrop-blur-md rounded-xl border border-[#C9A84C]/20 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h4 className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider flex items-center">
                  <Sliders className="w-3.5 h-3.5 mr-2" />
                  {handDetected ? 'Fine-tune Watch Fit' : 'Manual Placement'}
                </h4>
                <button
                  onClick={() => setShowAdjustPanel(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {handDetected ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-white">
                  {/* Size */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Watch Size</span>
                      <div className="flex items-center space-x-1.5">
                        <button type="button" onClick={() => setLiveScale(prev => Math.max(0.3, Number((prev - 0.05).toFixed(2))))}
                          className="w-6 h-6 bg-[#1A2742] border border-gray-700 hover:border-[#C9A84C] rounded flex items-center justify-center font-bold text-[10px]">-</button>
                        <span className="text-[#C9A84C] font-mono min-w-[32px] text-center text-[11px]">{liveScale.toFixed(2)}</span>
                        <button type="button" onClick={() => setLiveScale(prev => Math.min(2.0, Number((prev + 0.05).toFixed(2))))}
                          className="w-6 h-6 bg-[#1A2742] border border-gray-700 hover:border-[#C9A84C] rounded flex items-center justify-center font-bold text-[10px]">+</button>
                      </div>
                    </div>
                    <input type="range" min="0.3" max="2.0" step="0.05" value={liveScale}
                      onChange={(e) => setLiveScale(parseFloat(e.target.value))}
                      className="w-full accent-[#C9A84C] h-1.5 rounded cursor-pointer" />
                  </div>

                  {/* Rotation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Rotation</span>
                      <div className="flex items-center space-x-1.5">
                        <button type="button" onClick={() => setLiveRotationOffset(prev => Math.max(-180, prev - 5))}
                          className="w-6 h-6 bg-[#1A2742] border border-gray-700 hover:border-[#C9A84C] rounded flex items-center justify-center font-bold text-[10px]">-</button>
                        <span className="text-[#C9A84C] font-mono min-w-[32px] text-center text-[11px]">{liveRotationOffset}°</span>
                        <button type="button" onClick={() => setLiveRotationOffset(prev => Math.min(180, prev + 5))}
                          className="w-6 h-6 bg-[#1A2742] border border-gray-700 hover:border-[#C9A84C] rounded flex items-center justify-center font-bold text-[10px]">+</button>
                      </div>
                    </div>
                    <input type="range" min="-180" max="180" step="5" value={liveRotationOffset}
                      onChange={(e) => setLiveRotationOffset(parseInt(e.target.value))}
                      className="w-full accent-[#C9A84C] h-1.5 rounded cursor-pointer" />
                  </div>

                  {/* X Shift */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Horizontal Shift</span>
                      <span className="text-[#C9A84C] font-mono text-[11px]">{liveXOffset}px</span>
                    </div>
                    <input type="range" min="-100" max="100" step="1" value={liveXOffset}
                      onChange={(e) => setLiveXOffset(parseInt(e.target.value))}
                      className="w-full accent-[#C9A84C] h-1.5 rounded cursor-pointer" />
                  </div>

                  {/* Y Shift */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Vertical Shift</span>
                      <span className="text-[#C9A84C] font-mono text-[11px]">{liveYOffset}px</span>
                    </div>
                    <input type="range" min="-100" max="100" step="1" value={liveYOffset}
                      onChange={(e) => setLiveYOffset(parseInt(e.target.value))}
                      className="w-full accent-[#C9A84C] h-1.5 rounded cursor-pointer" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Watch Size</span>
                      <span className="text-[#C9A84C] font-mono">{(manualScale * 100).toFixed(0)}%</span>
                    </div>
                    <input type="range" min="0.3" max="2.0" step="0.05" value={manualScale}
                      onChange={(e) => setManualScale(parseFloat(e.target.value))}
                      className="w-full accent-[#C9A84C] h-1.5 rounded cursor-pointer" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rotation</span>
                      <span className="text-[#C9A84C] font-mono">{manualRotation}°</span>
                    </div>
                    <input type="range" min="-180" max="180" step="5" value={manualRotation}
                      onChange={(e) => setManualRotation(parseInt(e.target.value))}
                      className="w-full accent-[#C9A84C] h-1.5 rounded cursor-pointer" />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                <button
                  onClick={() => {
                    setLiveScale(product.overlay_scale !== null && product.overlay_scale !== undefined ? Number(product.overlay_scale) : 1.0);
                    setLiveXOffset(product.overlay_x_offset !== null && product.overlay_x_offset !== undefined ? Number(product.overlay_x_offset) : 0.0);
                    setLiveYOffset(product.overlay_y_offset !== null && product.overlay_y_offset !== undefined ? Number(product.overlay_y_offset) : 0.0);
                    setLiveRotationOffset(product.overlay_rotation_offset !== null && product.overlay_rotation_offset !== undefined ? Number(product.overlay_rotation_offset) : 0.0);
                    setManualScale(1.0);
                    setManualRotation(0);
                  }}
                  className="text-xs text-gray-400 hover:text-white transition-colors underline"
                >
                  Reset to defaults
                </button>

                {showCalibrator && (
                  <button
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
                        if (!res.ok) throw new Error('Save failed');
                        alert('Calibration saved!');
                      } catch (err: any) {
                        alert(err.message || 'Error saving.');
                      }
                    }}
                    className="text-xs px-3 py-1.5 bg-[#C9A84C] text-[#0B1422] rounded font-bold hover:bg-[#C9A84C]/90 transition-all"
                  >
                    Save (Admin)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tip bar */}
          <div className="p-3 sm:p-4 bg-[#0F1B30]/60 rounded-lg border border-white/5 flex items-start sm:items-center gap-3">
            <HelpCircle className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="text-white font-semibold">Tip:</span> Hold your wrist up to the camera for automatic detection. Use the <span className="text-[#C9A84C]">Adjust</span> button to fine-tune the fit.
            </p>
          </div>
        </div>

        {/* Product Details Panel */}
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
                <div className="flex items-center space-x-2 text-xs text-gray-300">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <p>
                    <span className="text-[#E8D9A0] font-bold">{liveViewers}</span> people viewing now
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-300">
                  <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <p>
                    <span className="text-[#C9A84C] font-bold">{salesCount} orders</span> in the last {salesHours}hrs
                  </p>
                </div>
                {product.stock > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-amber-500">
                        {product.stock <= 15 ? `Only ${product.stock} left!` : 'In Stock'}
                      </span>
                      <span className="text-gray-500">{product.stock <= 15 ? 'Limited' : 'Available'}</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${product.stock <= 5 ? 'bg-red-500' : product.stock <= 15 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${product.stock <= 15 ? Math.max(10, (product.stock / 15) * 100) : 85}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="border-t border-gray-800 pt-4">
                <h4 className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1.5">About this watch</h4>
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-4">
                  {product.description || 'Premium luxury timepiece crafted with precision and elegance.'}
                </p>
              </div>

              {/* Product image preview */}
              <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-white/5 bg-black/20">
                <NextImage
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 300px"
                  className="object-contain p-2"
                />
              </div>

              {/* CTA - WhatsApp Inquiry */}
              <div className="pt-1 space-y-2">
                <Button
                  onClick={handleInquiry}
                  className="w-full flex items-center justify-center gap-2 py-3 font-bold uppercase tracking-wider text-xs bg-[#25D366] hover:bg-[#20bd5a] text-white border-transparent"
                >
                  <MessageCircle className="w-4 h-4" />
                  Inquire on WhatsApp
                </Button>
                <p className="text-[10px] text-gray-500 text-center">
                  Click to chat directly on WhatsApp
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
