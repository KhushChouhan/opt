/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, Upload, Check, AlertCircle, RefreshCw, ShoppingCart, HelpCircle } from 'lucide-react';
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
}

interface GlassesTryOnCanvasProps {
  product: Product;
}

export default function GlassesTryOnCanvas({ product }: GlassesTryOnCanvasProps) {
  const router = useRouter();
  
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const faceMeshRef = useRef<any>(null);
  const overlayImageRef = useRef<HTMLImageElement | null>(null);
  const uploadedImageRef = useRef<HTMLImageElement | null>(null);

  // App States
  const [cameraState, setCameraState] = useState<'loading' | 'active' | 'denied' | 'fallback'>('loading');
  const [loadingMessage, setLoadingMessage] = useState('Initializing virtual mirror...');
  const [faceDetected, setFaceDetected] = useState(false);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Fallback Manual Overlay States (if no face detected / static upload)
  const [manualScale, setManualScale] = useState(1.0);
  const [manualPosition, setManualPosition] = useState({ x: 0, y: 0 });
  const [manualRotation, setManualRotation] = useState(0); // in degrees
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Checkout Form States
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        // Load overlay image
        const img = new Image();
        img.src = product.overlay_image_url;
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          overlayImageRef.current = img;
        };
        img.onerror = () => {
          console.error('Failed to load overlay image, using fallbacks.');
        };

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

        // Start webcam stream
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
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Start the camera
  const startWebcam = async () => {
    stopAllStreams();
    setCameraState('loading');
    setLoadingMessage('Accessing camera, please allow permissions...');

    try {
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // iOS Safari compatibility requirements
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        videoRef.current.play();
        
        videoRef.current.onloadedmetadata = () => {
          setCameraState('active');
          // Start drawing loop
          animationFrameId.current = requestAnimationFrame(processingLoop);
        };
      }
    } catch (error) {
      console.warn('Camera access denied or unavailable:', error);
      setCameraState('denied');
    }
  };

  // Processing loop to feed video frames to MediaPipe
  const processingLoop = async () => {
    if (cameraState === 'active' && videoRef.current && faceMeshRef.current) {
      if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        try {
          await faceMeshRef.current.send({ image: videoRef.current });
        } catch (err) {
          console.error('Error sending frame to FaceMesh:', err);
        }
      }
      animationFrameId.current = requestAnimationFrame(processingLoop);
    }
  };

  // Callback when FaceMesh yields results
  const handleFaceResults = (results: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw camera feed (mirrored)
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    
    if (cameraState === 'active' && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, width, height);
    } else if (cameraState === 'fallback' && uploadedImageRef.current) {
      ctx.drawImage(uploadedImageRef.current, 0, 0, width, height);
    }
    ctx.restore();

    // 2. Draw overlay if face is detected
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      setFaceDetected(true);
      const landmarks = results.multiFaceLandmarks[0];

      // Anchor math:
      // Nose bridge centers (average of 168 and 6)
      // Landmarks are 0-1, so map to canvas dimensions
      // Note: Because video is mirrored, we also mirror the x coordinates to align with flipped draw!
      // In mirrored draw, x_coord = (1 - x) * width
      const getX = (lm: any) => (1 - lm.x) * width;
      const getY = (lm: any) => lm.y * height;

      const x_nose = (getX(landmarks[168]) + getX(landmarks[6])) / 2;
      const y_nose = (getY(landmarks[168]) + getY(landmarks[6])) / 2;

      // Temple edges (Left: 234, Right: 454)
      const x_left = getX(landmarks[234]);
      const y_left = getY(landmarks[234]);
      const x_right = getX(landmarks[454]);
      const y_right = getY(landmarks[454]);

      // Calculate width (distance between temples)
      const dx = x_right - x_left;
      const dy = y_right - y_left;
      const baseDistance = Math.sqrt(dx * dx + dy * dy);
      
      // Fine-tuned scaling factor for eyeglasses frames
      let glassesWidth = baseDistance * 1.12; 

      // Yaw/Perspective correction:
      // Compare distance from nose center to left vs right temple.
      // If head turns, one distance shortens. We scale the width to mimic perspective depth.
      const dist_to_left = Math.abs(x_nose - x_left);
      const dist_to_right = Math.abs(x_right - x_nose);
      const symmetry_ratio = Math.min(dist_to_left, dist_to_right) / Math.max(dist_to_left, dist_to_right);
      
      // Apply slight perspective compression
      if (symmetry_ratio < 0.95) {
        glassesWidth = glassesWidth * (0.88 + 0.12 * symmetry_ratio);
      }

      // Roll angle (rotation)
      const rollAngle = Math.atan2(dy, dx);

      // Draw the overlay
      if (overlayImageRef.current) {
        const img = overlayImageRef.current;
        const aspectRatio = img.naturalHeight / img.naturalWidth;
        const glassesHeight = glassesWidth * aspectRatio;

        ctx.save();
        ctx.translate(x_nose, y_nose);
        ctx.rotate(rollAngle);
        ctx.drawImage(img, -glassesWidth / 2, -glassesHeight / 2, glassesWidth, glassesHeight);
        ctx.restore();
      } else {
        // Safe vector fallback if image fails to load
        ctx.save();
        ctx.translate(x_nose, y_nose);
        ctx.rotate(rollAngle);
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 4;
        ctx.strokeRect(-glassesWidth / 2, -10, glassesWidth, 20);
        ctx.restore();
      }
    } else {
      setFaceDetected(false);
      // If no face is detected (e.g. static fallback upload) render manual overlay
      drawManualOverlay(ctx, width, height);
    }
  };

  // Draw overlay based on manual slider positioning
  const drawManualOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 1. Redraw static image if in fallback
    if (cameraState === 'fallback' && uploadedImageRef.current) {
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(uploadedImageRef.current, 0, 0, width, height);
      ctx.restore();
    }

    // Set default coordinates in center if not positioned yet
    const x = manualPosition.x === 0 ? width / 2 : manualPosition.x;
    const y = manualPosition.y === 0 ? height / 2.3 : manualPosition.y;

    if (overlayImageRef.current) {
      const img = overlayImageRef.current;
      const aspectRatio = img.naturalHeight / img.naturalWidth;
      const w = 180 * manualScale;
      const h = w * aspectRatio;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((manualRotation * Math.PI) / 180);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      
      // If in fallback manual state, show a subtle bounding box indicator
      if (cameraState === 'fallback' || cameraState === 'denied') {
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8);
      }
      ctx.restore();
    }
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

        // Run face-mesh on uploaded static image
        setTimeout(async () => {
          if (faceMeshRef.current) {
            try {
              await faceMeshRef.current.send({ image: img });
            } catch (err) {
              console.error('Error running facemesh on static image:', err);
              // Draw manual overlay directly as backup
              triggerManualDraw();
            }
          } else {
            triggerManualDraw();
          }
        }, 500);
      };
    };
    reader.readAsDataURL(file);
  };

  const triggerManualDraw = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawManualOverlay(ctx, canvas.width, canvas.height);
    }
  };

  // Drag-and-drop mechanics for manual adjustments
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (cameraState !== 'fallback' && cameraState !== 'denied') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    // Track offset
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

    triggerManualDraw();
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

    triggerManualDraw();
  };

  // Re-draw on slider updates
  useEffect(() => {
    if (cameraState === 'fallback' || cameraState === 'denied') {
      triggerManualDraw();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualScale, manualRotation, manualPosition, cameraState]);

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

    // Client-side validations
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

    // Generate client-side UUID before posting so redirects work reliably
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

      // Success redirects to order success page
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
          <div className="relative aspect-[4/3] w-full bg-[#0b132b] rounded-lg overflow-hidden border border-[#d4af37]/20 shadow-2xl">
            {/* Loading Cover */}
            {(cameraState === 'loading') && (
              <div className="absolute inset-0 z-30 bg-[#060b13] flex flex-col items-center justify-center p-6 text-center space-y-4">
                <RefreshCw className="w-10 h-10 text-[#d4af37] animate-spin" />
                <p className="text-sm font-semibold text-gray-300">{loadingMessage}</p>
              </div>
            )}

            {/* Scanline overlay for aesthetic mirror effect */}
            {cameraState === 'active' && <div className="scanline" />}

            {/* Video stream (hidden behind canvas) */}
            <video
              ref={videoRef}
              className="hidden"
              playsInline
              muted
            />

            {/* Canvas overlay (always visible) */}
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

            {/* Top Stats HUD overlay */}
            {cameraState === 'active' && (
              <div className="absolute top-4 left-4 z-20 bg-black/60 px-3 py-1.5 rounded border border-[#d4af37]/20 text-[10px] uppercase font-bold tracking-wider text-[#d4af37] flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                <span>{faceDetected ? 'Face Locked' : 'Searching Face...'}</span>
              </div>
            )}
          </div>

          {/* Fallback / Upload / Calibration panel */}
          <div className="p-5 glass-panel rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start">
                <HelpCircle className="w-4 h-4 text-[#d4af37] mr-1.5" />
                Camera problems?
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                If camera blocks or is unavailable, upload a selfie instead.
              </p>
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <label className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10 rounded-md text-xs font-semibold cursor-pointer transition-all">
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
                <Button variant="outline" className="text-xs flex-1 sm:flex-initial" onClick={startWebcam}>
                  <Camera className="w-4 h-4 mr-2" />
                  Try Web Cam
                </Button>
              )}
            </div>
          </div>

          {/* Manual adjustment HUD if camera denied/fallback */}
          {(cameraState === 'fallback' || cameraState === 'denied') && (
            <div className="p-6 glass-panel rounded-lg space-y-4">
              <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">
                Manual Calibration (Drag overlay on photo or use sliders)
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
