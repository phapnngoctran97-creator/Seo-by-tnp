
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
  Move, Upload, Download, Lock, Unlock, RefreshCw, 
  Smartphone, Monitor, Layers, Image as ImageIcon, 
  Trash2, Play, Grid3X3, RotateCw, RotateCcw, 
  ZoomIn, MousePointer2, Settings, Crosshair, Maximize, ArrowRightLeft
} from 'lucide-react';

interface Preset {
  label: string;
  w: number;
  h: number;
  icon: any;
}

interface ImageTransform {
  x: number;
  y: number;
  scale: number;
}

interface ImageFile {
  id: string;
  file: File;
  preview: string; 
  originalUrl: string; 
  originalSize: number;
  originalDims: { w: number, h: number }; // Dimensions loaded from Image
  status: 'pending' | 'processing' | 'done';
  resultUrl?: string;
  resultSize?: number;
  resultDims?: { w: number, h: number };
  transform: ImageTransform;
}

interface WatermarkSettings {
  enabled: boolean;
  mode: 'single' | 'tiled';
  image: HTMLImageElement | null;
  imageUrl: string | null;
  opacity: number;
  scale: number; // percentage relative to canvas width
  rotation: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  density: number; // number of cols for tiled
  stagger: boolean; // so le
}

const ImageResizer: React.FC = () => {
  // Batch State
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Canvas State
  const [width, setWidth] = useState<number | ''>(1080);
  const [height, setHeight] = useState<number | ''>(1080);
  const [lockRatio, setLockRatio] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showGrid, setShowGrid] = useState(true);
  
  // Preview Stage State
  const [stageScale, setStageScale] = useState(1);
  const containerWrapperRef = useRef<HTMLDivElement>(null);
  const wmCanvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction State
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [initialTransform, setInitialTransform] = useState<{x: number, y: number} | null>(null);
  const [dragAction, setDragAction] = useState<'move-image' | 'move-wm' | null>(null);

  // Watermark State
  const [wmSettings, setWmSettings] = useState<WatermarkSettings>({
    enabled: false,
    mode: 'single',
    image: null,
    imageUrl: null,
    opacity: 0.5,
    scale: 20, 
    rotation: 0,
    x: 50, 
    y: 50,
    density: 3,
    stagger: true
  });

  const PRESETS: Preset[] = [
    { label: 'FHD (1920px)', w: 1920, h: 1080, icon: Monitor },
    { label: 'Square (1:1)', w: 1080, h: 1080, icon: Smartphone },
    { label: 'Story (9:16)', w: 1080, h: 1920, icon: Smartphone },
    { label: 'Post (4:5)', w: 1080, h: 1350, icon: Smartphone },
  ];

  const activeFile = files.find(f => f.id === selectedFileId) || files[0];
  const outW = Number(width) || 1080;
  const outH = Number(height) || 1080;

  // --- 1. CALCULATE STAGE SCALE (Auto Fit Screen) ---
  useLayoutEffect(() => {
    const calculateScale = () => {
      if (containerWrapperRef.current) {
        const { clientWidth, clientHeight } = containerWrapperRef.current;
        const padding = 40; 
        const availableW = clientWidth - padding;
        const availableH = clientHeight - padding;

        const scaleW = availableW / outW;
        const scaleH = availableH / outH;
        
        // Fit contain logic
        setStageScale(Math.min(scaleW, scaleH)); 
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [outW, outH, files.length, activeFile]); // Recalc when output dims change

  // --- 2. WATERMARK RENDER ENGINE (Shared for Preview & Export) ---
  const renderWatermarkToContext = (
      ctx: CanvasRenderingContext2D, 
      canvasW: number, 
      canvasH: number
  ) => {
      if (!wmSettings.enabled || !wmSettings.image) return;

      const wm = wmSettings.image;
      const wmRatio = wm.width / wm.height;
      
      // Calculate base size relative to canvas width
      let wmW = canvasW * (wmSettings.scale / 100);
      let wmH = wmW / wmRatio;

      ctx.save();
      ctx.globalAlpha = wmSettings.opacity;

      if (wmSettings.mode === 'single') {
          // --- SINGLE MODE ---
          const wx = (canvasW * (wmSettings.x / 100));
          const wy = (canvasH * (wmSettings.y / 100));

          ctx.translate(wx, wy);
          ctx.rotate((wmSettings.rotation * Math.PI) / 180);
          ctx.drawImage(wm, -wmW/2, -wmH/2, wmW, wmH);

      } else {
          // --- TILED MODE (Pattern) ---
          const cols = Math.max(1, wmSettings.density);
          // Scale determines size relative to grid cell in tiled mode? 
          // Or keep consistent? Let's use scale as % of canvas still, but user usually sets it smaller.
          
          const cellW = canvasW / cols;
          const cellH = cellW; // Square grid for uniform spacing
          const rows = Math.ceil(canvasH / cellH) + 2;
          const extraCols = 2; // Extra buffer for rotation coverage

          for (let r = -1; r < rows; r++) {
              for (let c = -1; c <= cols + extraCols; c++) {
                  let cx = c * cellW;
                  let cy = r * cellH;

                  if (wmSettings.stagger && r % 2 !== 0) {
                      cx += cellW / 2;
                  }

                  ctx.save();
                  ctx.translate(cx, cy);
                  ctx.rotate((wmSettings.rotation * Math.PI) / 180);
                  ctx.drawImage(wm, -wmW/2, -wmH/2, wmW, wmH);
                  ctx.restore();
              }
          }
      }
      ctx.restore();
  };

  // Live Watermark Preview on Canvas Layer
  useEffect(() => {
      const canvas = wmCanvasRef.current;
      if (canvas) {
          canvas.width = outW;
          canvas.height = outH;
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.clearRect(0, 0, outW, outH);
              renderWatermarkToContext(ctx, outW, outH);
          }
      }
  }, [wmSettings, outW, outH]);

  // --- 3. FILE HANDLING ---

  const processFiles = (newFiles: FileList | File[]) => {
    const incoming = Array.from(newFiles);
    if (files.length + incoming.length > 20) {
        alert("Tối đa 20 file.");
        return;
    }

    const newImageFiles: ImageFile[] = incoming.map(file => {
      const url = URL.createObjectURL(file);
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: url,
        originalUrl: url,
        originalSize: file.size,
        originalDims: { w: 0, h: 0 },
        status: 'pending',
        transform: { x: 0, y: 0, scale: 1 }
      };
    });

    // Detect Dimensions asynchronously
    newImageFiles.forEach(imgFile => {
      const img = new Image();
      img.src = imgFile.preview;
      img.onload = () => {
        setFiles(prev => {
            const updated = prev.map(p => p.id === imgFile.id ? { ...p, originalDims: { w: img.width, h: img.height } } : p);
            // Auto set canvas size to first image if it's the first upload
            if (prev.length === 0 && imgFile === newImageFiles[0]) {
                setWidth(img.width);
                setHeight(img.height);
            }
            return updated;
        });
      };
    });

    setFiles(prev => [...prev, ...newImageFiles]);
    if (!selectedFileId && newImageFiles.length > 0) setSelectedFileId(newImageFiles[0].id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  const setCanvasToOriginal = () => {
      if (activeFile && activeFile.originalDims.w > 0) {
          setWidth(activeFile.originalDims.w);
          setHeight(activeFile.originalDims.h);
      }
  };

  // --- 4. INTERACTION ---

  const updateActiveTransform = (partial: Partial<ImageTransform>) => {
      if (!activeFile) return;
      setFiles(prev => prev.map(f => f.id === activeFile.id ? { ...f, transform: { ...f.transform, ...partial }, status: 'pending' } : f));
  };

  const fitImage = (type: 'contain' | 'cover') => {
      if(!activeFile || !outW || !outH) return;
      const imgW = activeFile.originalDims.w || 1000;
      const imgH = activeFile.originalDims.h || 1000;
      const scaleW = outW / imgW;
      const scaleH = outH / imgH;
      let newScale = 1;
      if (type === 'contain') newScale = Math.min(scaleW, scaleH);
      else newScale = Math.max(scaleW, scaleH);
      updateActiveTransform({ scale: newScale, x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent, type: 'image' | 'wm') => {
      e.preventDefault(); e.stopPropagation();
      setDragStart({ x: e.clientX, y: e.clientY });
      
      if (type === 'image') {
          if (!activeFile) return;
          setInitialTransform({ x: activeFile.transform.x, y: activeFile.transform.y });
          setDragAction('move-image');
      } else {
          if (wmSettings.mode === 'single') {
              setInitialTransform({ x: wmSettings.x, y: wmSettings.y });
              setDragAction('move-wm');
          }
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!dragAction || !dragStart || !initialTransform) return;
      
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      // Calculate delta relative to the SCALED canvas
      const realDeltaX = deltaX / stageScale;
      const realDeltaY = deltaY / stageScale;

      if (dragAction === 'move-image') {
          updateActiveTransform({
              x: initialTransform.x + realDeltaX,
              y: initialTransform.y + realDeltaY
          });
      } else if (dragAction === 'move-wm') {
          // Convert pixels to percentage for Watermark position
          const deltaPctX = (realDeltaX / outW) * 100;
          const deltaPctY = (realDeltaY / outH) * 100;
          setWmSettings(prev => ({ 
              ...prev, 
              x: Math.max(0, Math.min(100, initialTransform.x + deltaPctX)), 
              y: Math.max(0, Math.min(100, initialTransform.y + deltaPctY)) 
          }));
      }
  };

  const processBatch = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const processed = await Promise.all(files.map(async (fileData) => {
      return new Promise<ImageFile>((resolve) => {
        const img = new Image();
        img.src = fileData.preview;
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = outW;
          canvas.height = outH;

          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw Background
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, outW, outH);

            // Draw Image
            ctx.translate(outW / 2, outH / 2);
            ctx.translate(fileData.transform.x, fileData.transform.y);
            ctx.scale(fileData.transform.scale, fileData.transform.scale);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform

            // Draw Watermark
            renderWatermarkToContext(ctx, outW, outH);

            const resultUrl = canvas.toDataURL('image/jpeg', 0.9);
            const head = `data:image/jpeg;base64,`;
            const size = Math.round((resultUrl.length - head.length) * 3 / 4);

            resolve({
              ...fileData,
              status: 'done',
              resultUrl,
              resultSize: size
            });
          } else {
             resolve(fileData);
          }
        };
      });
    }));

    setFiles(processed);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Move className="text-sky-600" /> Resize & Watermark Pro
        </h2>
        <p className="text-gray-600 mt-1">Chỉnh sửa kích thước, đóng dấu bản quyền hàng loạt với độ chính xác cao.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT: CONTROLS */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden h-full">
           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
               
               {/* 1. Dimensions */}
               <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                   <h3 className="text-xs font-bold text-gray-900 uppercase mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2"><Settings size={14}/> Kích thước (Output)</span>
                      {activeFile?.originalDims?.w > 0 && (
                          <button onClick={setCanvasToOriginal} className="text-[10px] text-sky-600 bg-sky-50 px-2 py-1 rounded hover:bg-sky-100 flex items-center gap-1">
                              <Maximize size={10} /> Lấy theo ảnh gốc ({activeFile.originalDims.w}x{activeFile.originalDims.h})
                          </button>
                      )}
                   </h3>
                   
                   <div className="grid grid-cols-3 gap-2 mb-3">
                       {PRESETS.map((p, idx) => (
                           <button key={idx} onClick={() => { setWidth(p.w); setHeight(p.h); }} className="text-[10px] border border-gray-200 rounded py-1.5 hover:border-sky-300 hover:text-sky-600 transition-colors bg-gray-50 text-gray-600">
                               {p.label}
                           </button>
                       ))}
                   </div>

                   <div className="flex items-center gap-2">
                       <input type="number" value={width} onChange={e => setWidth(parseInt(e.target.value) || '')} className="flex-1 p-2 border rounded text-sm text-center font-mono focus:border-sky-500 outline-none" placeholder="W" />
                       <span className="text-gray-400">x</span>
                       <input type="number" value={height} onChange={e => setHeight(parseInt(e.target.value) || '')} className="flex-1 p-2 border rounded text-sm text-center font-mono focus:border-sky-500 outline-none" placeholder="H" />
                       <div className="w-8 h-8 rounded border flex items-center justify-center cursor-pointer" style={{backgroundColor: bgColor}}>
                           <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="opacity-0 w-full h-full cursor-pointer" />
                       </div>
                   </div>
               </div>

               {/* 2. Watermark */}
               <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                   <div className="flex justify-between items-center mb-4 border-b pb-2">
                       <h3 className="text-xs font-bold text-gray-900 uppercase flex items-center gap-2"><Layers size={14}/> Watermark</h3>
                       <div className="relative inline-block w-8 mr-1 align-middle select-none">
                            <input type="checkbox" checked={wmSettings.enabled} onChange={(e) => setWmSettings(p => ({...p, enabled: e.target.checked}))} className="absolute block w-4 h-4 rounded-full bg-white border-2 appearance-none cursor-pointer checked:right-0 right-4 top-0 bottom-0 m-auto transition-all duration-300 z-10 checked:border-sky-600"/>
                            <div className={`block overflow-hidden h-4 rounded-full cursor-pointer transition-colors ${wmSettings.enabled ? 'bg-sky-200' : 'bg-gray-300'}`}></div>
                       </div>
                   </div>

                   {wmSettings.enabled && (
                       <div className="space-y-4 animate-in fade-in">
                           {/* Upload WM */}
                           {!wmSettings.imageUrl ? (
                               <label className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-xs text-gray-500">
                                   <Upload size={14} className="mr-2"/> Tải Logo (PNG)
                                   <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                       const f = e.target.files?.[0];
                                       if(f) {
                                           const r = new FileReader();
                                           r.onload = evt => {
                                               const i = new Image();
                                               i.src = evt.target?.result as string;
                                               i.onload = () => setWmSettings(p => ({...p, image: i, imageUrl: i.src}));
                                           };
                                           r.readAsDataURL(f);
                                       }
                                   }} />
                               </label>
                           ) : (
                               <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                                   <img src={wmSettings.imageUrl} className="w-8 h-8 object-contain" alt="logo"/>
                                   <button onClick={() => setWmSettings(p => ({...p, image: null, imageUrl: null}))} className="text-[10px] text-red-500 underline ml-auto">Đổi</button>
                               </div>
                           )}

                           <div className="flex bg-gray-100 p-1 rounded">
                               <button onClick={() => setWmSettings(p => ({...p, mode: 'single'}))} className={`flex-1 text-[10px] font-bold py-1.5 rounded ${wmSettings.mode === 'single' ? 'bg-white shadow text-sky-600' : 'text-gray-500'}`}>Single</button>
                               <button onClick={() => setWmSettings(p => ({...p, mode: 'tiled'}))} className={`flex-1 text-[10px] font-bold py-1.5 rounded ${wmSettings.mode === 'tiled' ? 'bg-white shadow text-sky-600' : 'text-gray-500'}`}>Tiled</button>
                           </div>

                           <div className="space-y-3">
                               <div className="flex items-center gap-2 text-xs text-gray-500">
                                   <span className="w-12">Size</span>
                                   <input type="range" min="1" max="100" value={wmSettings.scale} onChange={e => setWmSettings(p => ({...p, scale: parseInt(e.target.value)}))} className="flex-1 h-1.5 bg-gray-200 rounded-lg accent-sky-600" />
                               </div>
                               <div className="flex items-center gap-2 text-xs text-gray-500">
                                   <span className="w-12">Opacity</span>
                                   <input type="range" min="0.1" max="1" step="0.1" value={wmSettings.opacity} onChange={e => setWmSettings(p => ({...p, opacity: parseFloat(e.target.value)}))} className="flex-1 h-1.5 bg-gray-200 rounded-lg accent-sky-600" />
                               </div>
                               {wmSettings.mode === 'tiled' && (
                                   <div className="flex items-center gap-2 text-xs text-gray-500">
                                       <span className="w-12">Density</span>
                                       <input type="range" min="1" max="10" value={wmSettings.density} onChange={e => setWmSettings(p => ({...p, density: parseInt(e.target.value)}))} className="flex-1 h-1.5 bg-gray-200 rounded-lg accent-sky-600" />
                                   </div>
                               )}
                           </div>
                       </div>
                   )}
               </div>

               {/* 3. File List */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                   <div className="p-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 flex justify-between items-center">
                       <span>Hàng đợi ({files.length})</span>
                       <label className="cursor-pointer text-sky-600 hover:underline">
                           + Thêm
                           <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileChange} />
                       </label>
                   </div>
                   <div className="max-h-40 overflow-y-auto p-2 space-y-1">
                       {files.map(f => (
                           <div key={f.id} onClick={() => setSelectedFileId(f.id)} className={`flex items-center gap-2 p-1.5 rounded cursor-pointer ${selectedFileId === f.id ? 'bg-sky-50 ring-1 ring-sky-300' : 'hover:bg-gray-50'}`}>
                               <img src={f.preview} className="w-8 h-8 rounded object-cover" />
                               <div className="flex-1 min-w-0">
                                   <div className="text-xs font-medium truncate">{f.file.name}</div>
                                   <div className="text-[10px] text-gray-400">{Math.round(f.originalSize/1024)} KB</div>
                               </div>
                               {f.status === 'done' && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                               <button onClick={(e) => { e.stopPropagation(); setFiles(files.filter(x => x.id !== f.id)); }} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={12}/></button>
                           </div>
                       ))}
                   </div>
               </div>
           </div>

           <button 
                onClick={processBatch}
                disabled={files.length === 0 || isProcessing}
                className={`w-full py-3 rounded-lg font-bold text-white shadow flex items-center justify-center gap-2 ${files.length===0 || isProcessing ? 'bg-gray-300' : 'bg-sky-600 hover:bg-sky-700'}`}
            >
                {isProcessing ? <RefreshCw className="animate-spin" size={18}/> : <Download size={18}/>} Xuất & Tải Về
            </button>
        </div>

        {/* RIGHT: PREVIEW STAGE */}
        <div className="lg:col-span-8 flex flex-col h-full bg-gray-100 rounded-xl border border-gray-200 overflow-hidden relative">
            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-white/90 backdrop-blur p-1.5 rounded-full shadow-sm border border-gray-200">
                <button onClick={() => setShowGrid(!showGrid)} className={`p-2 rounded-full transition-colors ${showGrid ? 'bg-sky-100 text-sky-600' : 'text-gray-500 hover:bg-gray-100'}`} title="Lưới"><Grid3X3 size={16}/></button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button onClick={() => fitImage('contain')} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-full">Fit</button>
                <button onClick={() => fitImage('cover')} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-full">Fill</button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <div className="flex items-center gap-2 px-2">
                    <ZoomIn size={14} className="text-gray-400"/>
                    <input type="range" min="0.1" max="3" step="0.1" value={activeFile?.transform.scale || 1} onChange={e => updateActiveTransform({scale: parseFloat(e.target.value)})} className="w-20 h-1 bg-gray-300 rounded-lg accent-sky-600" />
                </div>
            </div>

            {/* STAGE */}
            <div 
                ref={containerWrapperRef}
                className="flex-1 overflow-hidden flex items-center justify-center p-10 select-none cursor-grab active:cursor-grabbing bg-[url('https://media.istockphoto.com/id/1226505703/vector/transparent-background-seamless-pattern-vector-stock-illustration.jpg?s=612x612&w=0&k=20&c=J9_e3T_u6sYq5t0VqA-L9p9Z9y-j7Z5Z9y-j7Z5Z9y.jpg')]"
                onMouseMove={handleMouseMove}
                onMouseUp={() => { setDragAction(null); setDragStart(null); }}
                onMouseLeave={() => { setDragAction(null); setDragStart(null); }}
            >
                {!activeFile ? (
                    <div className="text-center text-gray-400 bg-white p-8 rounded-xl shadow-sm">
                        <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-30" />
                        <p>Chọn hoặc tải ảnh để bắt đầu</p>
                    </div>
                ) : (
                    <div 
                        className="relative shadow-2xl origin-center transition-transform duration-75 ease-out bg-white"
                        style={{
                            width: `${outW}px`,
                            height: `${outH}px`,
                            transform: `scale(${stageScale})`,
                        }}
                    >
                        {/* 1. Background Color */}
                        <div className="absolute inset-0 z-0" style={{backgroundColor: bgColor}}></div>

                        {/* 2. Main Image */}
                        <div className="absolute inset-0 z-10 overflow-hidden">
                             <div 
                                className="absolute top-1/2 left-1/2 w-0 h-0"
                                style={{
                                    transform: `translate(${activeFile.transform.x}px, ${activeFile.transform.y}px) scale(${activeFile.transform.scale})`
                                }}
                             >
                                <img 
                                    src={activeFile.preview} 
                                    alt="Main" 
                                    draggable={false}
                                    className="max-w-none"
                                    style={{ transform: 'translate(-50%, -50%)' }}
                                />
                             </div>
                        </div>

                        {/* 3. Watermark Canvas */}
                        {wmSettings.enabled && (
                            <canvas 
                                ref={wmCanvasRef}
                                className="absolute inset-0 z-20 pointer-events-none"
                                style={{ width: '100%', height: '100%' }}
                            />
                        )}

                        {/* 4. Interaction Layer */}
                        <div 
                            className="absolute inset-0 z-30"
                            onMouseDown={(e) => handleMouseDown(e, 'image')}
                        />

                        {/* 5. Watermark Draggable Handle (Single Mode) */}
                        {wmSettings.enabled && wmSettings.mode === 'single' && (
                            <div 
                                className="absolute z-40 w-8 h-8 bg-sky-500/80 border-2 border-white rounded-full shadow-lg cursor-move flex items-center justify-center hover:scale-110 transition-transform"
                                style={{
                                    left: `${wmSettings.x}%`,
                                    top: `${wmSettings.y}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                                onMouseDown={(e) => handleMouseDown(e, 'wm')}
                                title="Kéo Watermark"
                            >
                                <Crosshair size={16} className="text-white" />
                            </div>
                        )}

                        {/* 6. Grid Overlay */}
                        {showGrid && (
                            <div className="absolute inset-0 z-50 pointer-events-none opacity-40">
                                <div className="w-full h-full border border-sky-400"></div>
                                <div className="absolute top-1/3 w-full h-px bg-sky-400 border-t border-dashed"></div>
                                <div className="absolute top-2/3 w-full h-px bg-sky-400 border-t border-dashed"></div>
                                <div className="absolute left-1/3 h-full w-px bg-sky-400 border-l border-dashed"></div>
                                <div className="absolute left-2/3 h-full w-px bg-sky-400 border-l border-dashed"></div>
                            </div>
                        )}
                        
                        {/* Info Overlay */}
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded z-50 pointer-events-none">
                            {outW} x {outH}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageResizer;
