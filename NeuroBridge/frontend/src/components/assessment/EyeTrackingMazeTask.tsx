import { useState, useEffect, useRef } from 'react';

export function EyeTrackingMazeTask({ onComplete }: { onComplete: (lookCount: number) => void }) {
  const [phase, setPhase] = useState<'initializing' | 'calibrating' | 'standby' | 'drawing' | 'result'>('initializing');
  const [lookLeftCount, setLookLeftCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [headDirection, setHeadDirection] = useState<'left' | 'center' | 'right'>('center');
  const [referencePath, setReferencePath] = useState<{x: number, y: number}[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceMeshRef = useRef<any>(null);
  const cameraHardwareRef = useRef<any>(null);
  
  const prevDirection = useRef<'left' | 'center' | 'right'>('center');
  const phaseRef = useRef(phase);
  
  const calibrationFrames = useRef<{iris: number}[]>([]);
  const baseCenter = useRef<{iris: number} | null>(null);

  // Drawing canvas ref
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<{x: number, y: number}[]>([]);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Generate random path
  useEffect(() => {
    // Generate a path on a 5x5 grid (0-100 coordinates, step 20)
    // Points will be at 10, 30, 50, 70, 90
    const points = [];
    let currentX = 10;
    let currentY = 90;
    points.push({x: currentX, y: currentY});
    
    const numSegments = 4 + Math.floor(Math.random() * 3); // 4 to 6 segments
    let lastDir = '';
    
    for (let i = 0; i < numSegments; i++) {
      const possibleMoves = [];
      if (currentX < 90 && lastDir !== 'left') possibleMoves.push({dx: 20, dy: 0, dir: 'right'});
      if (currentX > 10 && lastDir !== 'right') possibleMoves.push({dx: -20, dy: 0, dir: 'left'});
      if (currentY > 10 && lastDir !== 'down') possibleMoves.push({dx: 0, dy: -20, dir: 'up'});
      if (currentY < 90 && lastDir !== 'up') possibleMoves.push({dx: 0, dy: 20, dir: 'down'});
      
      if (possibleMoves.length === 0) break;
      
      const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      currentX += move.dx;
      currentY += move.dy;
      lastDir = move.dir;
      points.push({x: currentX, y: currentY});
    }
    
    // Ensure it doesn't end on the exact same spot it started if it was too short
    if (points.length < 3) {
      points.push({x: 90, y: 10});
    }
    setReferencePath(points);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    if (!(window as any).FaceMesh || !(window as any).Camera) {
      console.error("MediaPipe FaceMesh not loaded.");
      if (isMounted) setPhase('result');
      return;
    }

    const faceMesh = new (window as any).FaceMesh({locateFile: (file: string) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }});

    faceMeshRef.current = faceMesh;

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults((results: any) => {
      if (!isMounted) return;
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        const leftEyeCenter = landmarks[362]; // User's left eye (image right)
        const rightEyeCenter = landmarks[133]; // User's right eye (image left)
        const nose = landmarks[1];

        const dist = (p1: any, p2: any) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const leftEAR = dist(landmarks[386], landmarks[374]) / dist(landmarks[362], landmarks[263]);
        const rightEAR = dist(landmarks[159], landmarks[145]) / dist(landmarks[133], landmarks[33]);

        // If eyes are closed or occluded, ignore the frame completely!
        if (leftEAR < 0.18 || rightEAR < 0.18) {
          return;
        }

        // Extremely stable tracking: position of nose relative to the two eyes
        const eyeDist = leftEyeCenter.x - rightEyeCenter.x;
        if (eyeDist === 0) return; // Prevent division by zero
        
        // Value ~0.5 when looking straight.
        // >0.5 when turning physical left (towards reference map)
        // <0.5 when turning physical right (towards drawing canvas)
        const nosePos = (nose.x - rightEyeCenter.x) / eyeDist;

        if (phaseRef.current === 'calibrating') {
          calibrationFrames.current.push({ nose: nosePos });
          if (calibrationFrames.current.length > 30) {
             const avgNose = calibrationFrames.current.reduce((sum, f) => sum + f.nose, 0) / calibrationFrames.current.length;
             baseCenter.current = { nose: avgNose };
             setPhase('standby');
          }
          return;
        }

        // Only track actively during 'drawing' phase! 
        if (phaseRef.current === 'drawing' && baseCenter.current) {
          let currentDirection: 'left' | 'center' | 'right' = 'center';
          
          // Require a solid 8% shift in nose position to trigger. This prevents jitter from registering.
          const THRESH = 0.08;  

          if (nosePos > baseCenter.current.nose + THRESH) {
            currentDirection = 'left';
          } else if (nosePos < baseCenter.current.nose - THRESH) {
            currentDirection = 'right'; 
          }

          setHeadDirection(currentDirection);

          if (currentDirection === 'left' && prevDirection.current !== 'left') {
            setLookLeftCount(prev => prev + 1);
          }
          prevDirection.current = currentDirection;
        }
      }
    });

    if (videoRef.current) {
      const camera = new (window as any).Camera(videoRef.current, {
        onFrame: async () => {
          if (isMounted && faceMeshRef.current && (phaseRef.current === 'calibrating' || phaseRef.current === 'ready' || phaseRef.current === 'drawing')) {
            await faceMeshRef.current.send({image: videoRef.current});
          }
        },
        width: 320,
        height: 240
      });
      cameraHardwareRef.current = camera;
      camera.start().then(() => {
        if (isMounted) setPhase('calibrating');
      }).catch((e: any) => {
        console.error(e);
        if (isMounted) setPhase('result');
      });
    }

    return () => {
      isMounted = false;
      if (cameraHardwareRef.current) cameraHardwareRef.current.stop();
      if (faceMeshRef.current) faceMeshRef.current.close();
    };
  }, []);

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== 'drawing') return;
    
    const pos = getPos(e);
    if (!pos) return;
    
    pointsRef.current.push(pos);
    drawAll();
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingCanvasRef.current) return null;
    const rect = drawingCanvasRef.current.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const scaleX = drawingCanvasRef.current.width / rect.width;
    const scaleY = drawingCanvasRef.current.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const drawAll = () => {
    if (!drawingCanvasRef.current) return;
    const ctx = drawingCanvasRef.current.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
    
    if (pointsRef.current.length === 0) return;
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(pointsRef.current[0].x, pointsRef.current[0].y);
    for (let i = 1; i < pointsRef.current.length; i++) {
      ctx.lineTo(pointsRef.current[i].x, pointsRef.current[i].y);
    }
    ctx.stroke();

    ctx.fillStyle = '#1d4ed8';
    pointsRef.current.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const clearCanvas = () => {
    pointsRef.current = [];
    drawAll();
  };

  const handleFinish = () => {
    setPhase('result');
    if (cameraHardwareRef.current) cameraHardwareRef.current.stop();
    setTimeout(() => {
      onComplete(lookLeftCount);
    }, 2000);
  };

  // Much larger, easier-to-see grid
  const gridStyle = {
    backgroundImage: `linear-gradient(to right, #cbd5e1 2px, transparent 2px), linear-gradient(to bottom, #cbd5e1 2px, transparent 2px)`,
    backgroundSize: '25% 25%'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full h-full text-center bg-slate-50 border-b border-slate-100">
      <video ref={videoRef} style={{ display: 'none' }} muted playsInline />
      
      {phase === 'initializing' && (
        <div className="text-blue-500 animate-pulse text-lg font-medium flex flex-col items-center">
          <span className="text-4xl mb-4">📷</span>
          Accessing camera for eye tracking...
        </div>
      )}

      {phase === 'calibrating' && (
        <div className="text-purple-600 animate-pulse text-lg font-bold flex flex-col items-center">
          <span className="text-5xl mb-4">🎯</span>
          Look at the center of your screen to calibrate...
          <div className="w-48 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
            <div className="bg-purple-500 h-full transition-all duration-1000" style={{width: `${(calibrationFrames.current.length / 30) * 100}%`}}></div>
          </div>
        </div>
      )}
      
      {phase === 'standby' && (
        <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-blue-200 rounded-2xl shadow-lg z-20 w-full max-w-md my-auto">
          <span className="text-5xl mb-4">🎯</span>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Calibration Complete!</h3>
          <p className="text-slate-600 mb-6 text-sm">Take a moment to read the question. When you are ready to start drawing the path, click the button below. Your eye movements will be tracked once you start.</p>
          <button onClick={() => setPhase('drawing')} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full text-lg font-bold shadow-md hover:scale-105 transition-transform">
            Start Task
          </button>
        </div>
      )}
      
      {phase === 'drawing' && (
        <div className="flex flex-col w-full h-full">
          <div className="flex justify-between items-center mb-2 px-4">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${headDirection === 'left' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-xs font-semibold text-gray-500">Looking Left: {lookLeftCount}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={clearCanvas} className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-300">
                Clear
              </button>
              <button onClick={handleFinish} className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow hover:bg-blue-700">
                Finish Drawing
              </button>
            </div>
          </div>
          
          <div className="flex flex-1 gap-16 md:gap-24 w-full min-h-[300px] max-w-5xl mx-auto px-4">
            {/* Left Canvas: Reference */}
            <div className="flex-1 bg-white border-2 border-gray-300 rounded-xl overflow-hidden relative shadow-sm" style={gridStyle}>
              <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm z-10">Reference Map</div>
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {referencePath.length > 0 && (
                  <>
                    <path 
                      d={`M ${referencePath[0].x} ${referencePath[0].y} ${referencePath.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`} 
                      stroke="#f43f5e" 
                      strokeWidth="4" 
                      fill="none" 
                      strokeLinejoin="round" 
                      strokeLinecap="round" 
                    />
                    <circle cx={referencePath[0].x} cy={referencePath[0].y} r="5" fill="#f43f5e" />
                    <circle cx={referencePath[referencePath.length-1].x} cy={referencePath[referencePath.length-1].y} r="5" fill="#10b981" />
                  </>
                )}
              </svg>
            </div>
            
            {/* Right Canvas: User Drawing */}
            <div className="flex-1 bg-white border-2 border-blue-300 rounded-xl overflow-hidden relative shadow-inner cursor-crosshair" style={gridStyle}>
               <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-blue-700 shadow-sm z-10 pointer-events-none">Draw Here</div>
               <canvas 
                 ref={drawingCanvasRef}
                 className="w-full h-full block touch-none cursor-crosshair"
                 width={400}
                 height={300}
                 onClick={handleCanvasClick}
                 onTouchEnd={handleCanvasClick}
                 style={{ width: '100%', height: '100%' }}
               />
            </div>
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div className={`p-8 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col items-center justify-center space-y-4 shadow-sm transition-all scale-105`}>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-inner bg-blue-100`}>
            <span className="text-5xl">👀</span>
          </div>
          <h2 className={`text-2xl font-bold text-blue-700`}>
            You checked the map {lookLeftCount} times
          </h2>
          <p className="text-slate-600 font-medium">Proceeding to next question...</p>
        </div>
      )}
    </div>
  );
}
