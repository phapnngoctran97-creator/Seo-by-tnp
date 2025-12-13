
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
  Move, Upload, Download, Lock, Unlock, RefreshCw, 
  Smartphone, Monitor, Layers, Image as ImageIcon, 
  Trash2, Play, Grid3X3, RotateCw, RotateCcw, 
  ZoomIn, MousePointer2, Settings, Crosshair
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
  originalDims: { w: number, h: number };
  status: 'pending' | 'processing' | 'done';
  resultUrl?: string;
  resultSize?: number;
  resultDims?: { w: number, h: number };
  transform: ImageTransform;
}

interface WatermarkSettings {
  enabled: boolean;
  mode: 'single' | 'tiled'; // Chế độ: Đơn hoặc Lát gạch
  image: HTMLImageElement | null;
  imageUrl: string | null;
  opacity: number;
  scale: number; // percentage relative to canvas width
  rotation: number;
  x: number; // For single mode (percentage 0-100)
  y: number; // For single mode (percentage 0-100)
  density: number; // For tiled mode (number of cols)
  stagger: boolean; // So le
}

const ImageResizer: React.FC = () => {
  // Batch State
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Interaction State
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [initialTransform, setInitialTransform] = useState<{x: number, y: number} | null>(null);
  const [dragAction, setDragAction] = useState<'move-image' | 'move-wm' | null>(null);
  
  // Stage State
  const [stageScale, setStageScale] = useState(1); 
  
  const containerWrapperRef = useRef<HTMLDivElement>(null);
  const wmCanvasRef = useRef<HTMLCanvasElement>(null); // Canvas for Watermark Preview

  // Global Settings
  const [width, setWidth] = useState<number | ''>(1080);
  const [height, setHeight] = useState<number | ''>(1080);
  const [lockRatio, setLockRatio] = useState(false);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState(90);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showGrid, setShowGrid] = useState(true);

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
    { label: 'HD (1280px)', w: 1280, h: 720, icon: Monitor },
    { label: 'Square (1:1)', w: 1080, h: 1080, icon: Smartphone },
    { label: 'Story (9:16)', w: 1080, h: 1920, icon: Smartphone },
  ];

  // Helper to get active file
  const activeFile = files.find(f => f.id === selectedFileId) || files[0];
  const outW = Number(width) || 1080;
  const outH = Number(height) || 1080;

  // --- Calculate Stage Scale (Fit to Screen) ---
  useLayoutEffect(() => {
    const calculateScale = () => {
      if (containerWrapperRef.current) {
        const { clientWidth, clientHeight } = containerWrapperRef.current;
        const padding = 60; // More padding for cleaner look
        const availableW = clientWidth - padding;
        const availableH = clientHeight - padding;

        const scaleW = availableW / outW;
        const scaleH = availableH / outH;
        
        setStageScale(Math.min(scaleW, scaleH)); 
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [outW, outH, files.length, activeFile]);

  // --- Watermark Rendering Logic (Shared) ---
  const renderWatermarkToContext = (
      ctx: CanvasRenderingContext2D, 
      canvasW: number, 
      canvasH: number
  ) => {
      if (!wmSettings.enabled || !wmSettings.image) return;

      const wm = wmSettings.image;
      const wmRatio = wm.width / wm.height;
      
      // Calculate base size based on Scale % of Width
      // Note: In tiled mode, scale affects the size of *each* tile relative to canvas width
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
          
          // Draw Selection Border (Only for UI, not export - handled by passed flag or just redraw without it for export)
          // Ideally we separate "Preview Render" from "Export Render", but here we keep simple.
          // Since this function is used for Export too, we shouldn't draw selection border here.
          // Selection border is drawn by CSS in the UI.

      } else {
          // --- TILED MODE ---
          // Use density to determine grid size
          const cols = Math.max(1, wmSettings.density);
          const cellW = canvasW / cols;
          const cellH = cellW; // Make cells square-ish or proportional? Let's assume square grid for spacing
          const rows = Math.ceil(canvasH / cellH) + 1;

          // Adjust watermark size for tiled mode (usually smaller)
          // The 'scale' slider controls size relative to the *Cell*, not Canvas in this logic?
          // Or let's keep scale relative to Canvas for consistency, but user usually wants smaller.
          // Let's re-interpret scale in Tiled mode: Scale is % of Cell Width.
          // Actually, consistency is better. Scale is always % of Canvas Width. 
          
          // For nicer tiling, we rotate the whole pattern or individual items?
          // Professional tiling usually rotates individual items.
          
          for (let r = -1; r < rows; r++) {
              for (let c = -1; c <= cols; c++) {
                  let cx = c * cellW + cellW / 2;
                  let cy = r * cellH + cellH / 2;

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

  // --- Realtime Watermark Preview ---
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
  }, [wmSettings, outW, outH]); // Re-render when any WM setting changes

  // --- File Handling ---

  const processFiles = (newFiles: FileList | File[]) => {
    const currentCount = files.length;
    const incoming = Array.from(newFiles).slice(0, 20 - currentCount); 
    
    if (incoming.length === 0) {
      if (files.length >= 20) alert("Đã đạt giới hạn tối đa 20 file.");
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

    // Load dims
    newImageFiles.forEach(imgFile => {
      const img = new Image();
      img.src = imgFile.preview;
      img.onload = () => {
        setFiles(prev => prev.map(p => p.id === imgFile.id ? { ...p, originalDims: { w: img.width, h: img.height } } : p));
      };
    });

    setFiles(prev => [...prev, ...newImageFiles]);
    if (!selectedFileId && newImageFiles.length > 0) {
      setSelectedFileId(newImageFiles[0].id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  const handleWatermarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.src = evt.target?.result as string;
        img.onload = () => {
          setWmSettings(prev => ({ 
             ...prev, 
             image: img, 
             imageUrl: evt.target?.result as string, 
             enabled: true,
             mode: 'single', // Default to single on new upload
             scale: 20,
             opacity: 0.8
          }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (selectedFileId === id) setSelectedFileId(newFiles.length > 0 ? newFiles[0].id : null);
  };

  // --- Interaction / Editor Logic ---

  const updateActiveTransform = (partial: Partial<ImageTransform>) => {
      if (!activeFile) return;
      setFiles(prev => prev.map(f => f.id === activeFile.id ? { ...f, transform: { ...f.transform, ...partial }, status: 'pending' } : f));
  };

  const handleMouseDown = (e: React.MouseEvent, type: 'image' | 'wm') => {
      e.preventDefault();
      e.stopPropagation();
      setDragStart({ x: e.clientX, y: e.clientY });
      
      if (type === 'image') {
          if (!activeFile) return;
          setInitialTransform({ x: activeFile.transform.x, y: activeFile.transform.y });
          setDragAction('move-image');
      } else {
          // Only move watermark if Single Mode
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

  const handleMouseUp = () => {
      setDragAction(null);
      setDragStart(null);
      setInitialTransform(null);
  };

  // --- Processing ---

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

            // Background
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, outW, outH);

            // Main Image
            ctx.translate(outW / 2, outH / 2);
            ctx.translate(fileData.transform.x, fileData.transform.y);
            ctx.scale(fileData.transform.scale, fileData.transform.scale);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset

            // Watermark (Using shared render logic)
            renderWatermarkToContext(ctx, outW, outH);

            const resultUrl = canvas.toDataURL(format, quality / 100);
            const head = `data:${format};base64,`;
            const size = Math.round((resultUrl.length - head.length) * 3 / 4);

            resolve({
              ...fileData,
              status: 'done',
              resultUrl,
              resultSize: size,
              resultDims: { w: outW, h: outH }
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

  const rotate = (dir: 'cw' | 'ccw') => {
    if (!activeFile) return;
    const img = new Image();
    img.src = activeFile.preview;
    img.onload = () => {
       const canvas = document.createElement('canvas');
       canvas.width = img.height;
       canvas.height = img.width;
       const ctx = canvas.getContext('2d');
       if (ctx) {
         ctx.translate(canvas.width/2, canvas.height/2);
         ctx.rotate((dir === 'cw' ? 90 : -90) * Math.PI / 180);
         ctx.drawImage(img, -img.width/2, -img.height/2);
         const newUrl = canvas.toDataURL();
         setFiles(prev => prev.map(f => f.id === activeFile.id ? { ...f, preview: newUrl, status: 'pending' } : f));
       }
    };
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

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Move className="text-sky-600" /> Resize & Watermark Pro
        </h2>
        <p className="text-gray-600 mt-2">Chỉnh sửa kích thước, đóng dấu bản quyền (Single/Tiled Pattern) chuyên nghiệp.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-4 space-y-5 h-[calc(100vh-140px)] overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Upload */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-sky-50 transition-colors cursor-pointer relative">
                 <input type="file" multiple id="batch-upload" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileChange} />
                 <div className="flex flex-col items-center pointer-events-none">
                     <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mb-2">
                        <Upload className="w-6 h-6" />
                     </div>
                     <span className="font-bold text-gray-700">Thêm ảnh (Max 20)</span>
                     <span className="text-xs text-gray-500 mt-1">Dán Ctrl+V để thêm nhanh</span>
                 </div>
             </div>
             <div className="mt-3 flex justify-between text-xs text-gray-500">
               <span>{files.length} ảnh đã chọn</span>
               {files.length > 0 && <button onClick={() => setFiles([])} className="text-red-500 hover:underline">Xóa tất cả</button>}
             </div>
           </div>

           {/* 1. Canvas Settings */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                <Settings size={14}/> 1. Kích thước (Output)
             </h3>
             <div className="grid grid-cols-2 gap-2 mb-4">
                 {PRESETS.map((p, idx) => (
                     <button key={idx} onClick={() => { setWidth(p.w); setHeight(p.h); }} className="flex items-center gap-2 px-2 py-2 text-xs border border-gray-200 rounded hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 transition-all text-left truncate">
                         <p.icon size={12} /> {p.label}
                     </button>
                 ))}
             </div>
             <div className="flex items-end gap-2 mb-4">
                 <div className="flex-1">
                     <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Rộng</label>
                     <input type="number" value={width} onChange={(e) => setWidth(parseInt(e.target.value) || '')} className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-sky-500 outline-none font-mono" />
                 </div>
                 <button onClick={() => setLockRatio(!lockRatio)} className={`p-2 mb-0.5 rounded transition-colors ${lockRatio ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-400'}`} title="Khóa tỷ lệ">
                     {lockRatio ? <Lock size={16} /> : <Unlock size={16} />}
                 </button>
                 <div className="flex-1">
                     <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cao</label>
                     <input type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value) || '')} className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-sky-500 outline-none font-mono" />
                 </div>
             </div>
             <div className="flex items-center gap-2 mb-4">
                 <label className="text-xs text-gray-500">Màu nền:</label>
                 <div className="flex items-center gap-2 flex-1">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-6 w-8 border border-gray-300 rounded cursor-pointer p-0" />
                    <span className="text-xs font-mono text-gray-400">{bgColor}</span>
                 </div>
             </div>
           </div>

           {/* 2. Watermark Settings */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-4 border-b pb-2">
                   <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <Layers size={14}/> 2. Watermark (Logo)
                   </h3>
                   <div className="relative inline-block w-8 mr-1 align-middle select-none">
                        <input type="checkbox" checked={wmSettings.enabled} onChange={(e) => setWmSettings(p => ({...p, enabled: e.target.checked}))} className="absolute block w-4 h-4 rounded-full bg-white border-2 appearance-none cursor-pointer checked:right-0 right-4 top-0 bottom-0 m-auto transition-all duration-300 z-10 checked:border-sky-600"/>
                        <div className={`block overflow-hidden h-4 rounded-full cursor-pointer transition-colors ${wmSettings.enabled ? 'bg-sky-200' : 'bg-gray-300'}`}></div>
                   </div>
               </div>
               
               {wmSettings.enabled && (
                   <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                       {/* Upload WM */}
                       {!wmSettings.imageUrl ? (
                           <label className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                               <span className="text-xs text-sky-600 font-bold mb-1">Tải ảnh Logo (PNG)</span>
                               <span className="text-[10px] text-gray-400">Nên dùng ảnh nền trong suốt</span>
                               <input type="file" className="hidden" accept="image/*" onChange={handleWatermarkUpload} />
                           </label>
                       ) : (
                           <div className="flex items-center gap-3 bg-gray-50 p-2 rounded border border-gray-200">
                               <img src={wmSettings.imageUrl} className="w-10 h-10 object-contain bg-[url('https://media.istockphoto.com/id/1226505703/vector/transparent-background-seamless-pattern-vector-stock-illustration.jpg?s=612x612&w=0&k=20&c=J9_e3T_u6sYq5t0VqA-L9p9Z9y-j7Z5Z9y-j7Z5Z9y.jpg')] rounded border" alt="logo" />
                               <div className="flex-1 min-w-0">
                                   <div className="text-xs font-bold text-gray-700 truncate">Logo.png</div>
                                   <button onClick={() => setWmSettings(p => ({...p, image: null, imageUrl: null}))} className="text-[10px] text-red-500 hover:underline">Thay đổi</button>
                               </div>
                           </div>
                       )}

                       {/* Mode Switch */}
                       <div className="flex bg-gray-100 p-1 rounded-lg">
                           <button onClick={() => setWmSettings(p => ({...p, mode: 'single'}))} className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${wmSettings.mode === 'single' ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500'}`}>Single (Đơn)</button>
                           <button onClick={() => setWmSettings(p => ({...p, mode: 'tiled'}))} className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${wmSettings.mode === 'tiled' ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500'}`}>Tiled (Lưới)</button>
                       </div>

                       {/* Controls */}
                       <div className="space-y-3 pt-2">
                           <div className="flex items-center gap-2">
                               <span className="text-xs text-gray-500 w-16">Kích thước</span>
                               <input type="range" min="1" max="100" value={wmSettings.scale} onChange={(e) => setWmSettings(p => ({...p, scale: parseInt(e.target.value)}))} className="flex-1 h-1.5 bg-gray-200 rounded-lg accent-sky-600" />
                               <span className="text-[10px] w-6 text-right">{wmSettings.scale}%</span>
                           </div>
                           <div className="flex items-center gap-2">
                               <span className="text-xs text-gray-500 w-16">Độ mờ</span>
                               <input type="range" min="0.1" max="1" step="0.1" value={wmSettings.opacity} onChange={(e) => setWmSettings(p => ({...p, opacity: parseFloat(e.target.value)}))} className="flex-1 h-1.5 bg-gray-200 rounded-lg accent-sky-600" />
                           </div>
                           <div className="flex items-center gap-2">
                               <span className="text-xs text-gray-500 w-16">Xoay</span>
                               <input type="range" min="-180" max="180" value={wmSettings.rotation} onChange={(e) => setWmSettings(p => ({...p, rotation: parseInt(e.target.value)}))} className="flex-1 h-1.5 bg-gray-200 rounded-lg accent-sky-600" />
                           </div>

                           {/* Mode Specific */}
                           {wmSettings.mode === 'tiled' && (
                               <div className="bg-sky-50 p-3 rounded-lg space-y-2 mt-2 border border-sky-100">
                                   <div className="flex items-center gap-2">
                                       <span className="text-xs font-bold text-sky-700 w-16">Mật độ</span>
                                       <input type="range" min="1" max="10" step="1" value={wmSettings.density} onChange={(e) => setWmSettings(p => ({...p, density: parseInt(e.target.value)}))} className="flex-1 h-1.5 bg-sky-200 rounded-lg accent-sky-600" />
                                       <span className="text-xs font-bold text-sky-700 w-4">{wmSettings.density}</span>
                                   </div>
                                   <label className="flex items-center gap-2 text-xs text-sky-700 cursor-pointer pt-1">
                                       <input type="checkbox" checked={wmSettings.stagger} onChange={e => setWmSettings(p => ({...p, stagger: e.target.checked}))} className="rounded text-sky-600" />
                                       Xếp so le (Stagger)
                                   </label>
                               </div>
                           )}
                       </div>
                   </div>
               )}
           </div>
           
           <button 
                onClick={processBatch}
                disabled={files.length === 0 || isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                    files.length === 0 || isProcessing ? 'bg-gray-300 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700 hover:-translate-y-1'
                }`}
            >
                {isProcessing ? <RefreshCw className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                {isProcessing ? 'Đang xử lý...' : 'Xuất Ảnh & Tải Về'}
            </button>
        </div>

        {/* RIGHT COLUMN: PREVIEW STAGE */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[700px]">
            {/* Toolbar */}
            <div className="bg-white p-2 rounded-t-xl border border-gray-200 border-b-0 flex items-center justify-between gap-2 shadow-sm z-10">
                 <div className="flex gap-1">
                     <button onClick={() => rotate('ccw')} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Xoay trái"><RotateCcw size={18} /></button>
                     <button onClick={() => rotate('cw')} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Xoay phải"><RotateCw size={18} /></button>
                 </div>
                 <div className="flex items-center gap-3 flex-1 justify-center">
                     <ZoomIn size={14} className="text-gray-400" />
                     <input type="range" min="0.1" max="3" step="0.05" value={activeFile?.transform.scale || 1} onChange={(e) => updateActiveTransform({ scale: parseFloat(e.target.value) })} className="w-32 h-1.5 bg-gray-200 rounded-lg accent-sky-600" />
                     <div className="flex gap-1 text-xs">
                         <button onClick={() => fitImage('contain')} className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">Fit</button>
                         <button onClick={() => fitImage('cover')} className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">Fill</button>
                     </div>
                 </div>
                 <button onClick={() => setShowGrid(!showGrid)} className={`p-2 rounded ${showGrid ? 'bg-sky-100 text-sky-600' : 'text-gray-400'}`}><Grid3X3 size={18}/></button>
            </div>

            {/* STAGE AREA */}
            <div 
                ref={containerWrapperRef}
                className="bg-gray-100 border-x border-gray-200 flex-1 relative overflow-hidden flex items-center justify-center p-8 bg-[url('https://media.istockphoto.com/id/1226505703/vector/transparent-background-seamless-pattern-vector-stock-illustration.jpg?s=612x612&w=0&k=20&c=J9_e3T_u6sYq5t0VqA-L9p9Z9y-j7Z5Z9y-j7Z5Z9y.jpg')] select-none"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {!activeFile ? (
                    <div className="text-center text-gray-400">
                        <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-30" />
                        <p>Chọn ảnh để chỉnh sửa</p>
                    </div>
                ) : (
                    // VIRTUAL STAGE CONTAINER
                    <div 
                        className="relative shadow-2xl origin-center"
                        style={{
                            width: `${outW}px`,
                            height: `${outH}px`,
                            transform: `scale(${stageScale})`,
                            transition: dragAction ? 'none' : 'transform 0.2s ease-out',
                        }}
                    >
                        {/* 1. Background Color Layer (Transparency Checkerboard provided by parent, this is solid bg) */}
                        <div className="absolute inset-0 z-0" style={{backgroundColor: bgColor}}></div>

                        {/* 2. Main Image Layer */}
                        <div className="absolute inset-0 z-10 overflow-hidden">
                             {/* Position wrapper */}
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
                                    style={{ transform: 'translate(-50%, -50%)', width: 'auto', maxWidth: 'none' }}
                                />
                             </div>
                        </div>

                        {/* 3. Watermark Canvas Layer (Topmost for Visual) */}
                        {wmSettings.enabled && (
                            <canvas 
                                ref={wmCanvasRef}
                                className="absolute inset-0 z-20 pointer-events-none"
                                style={{ width: '100%', height: '100%' }}
                            />
                        )}

                        {/* 4. Interaction Overlay (Invisible but captures clicks) */}
                        <div 
                            className="absolute inset-0 z-30"
                            style={{ cursor: dragAction === 'move-wm' ? 'grabbing' : wmSettings.mode === 'single' && wmSettings.enabled ? 'default' : 'grab' }}
                            onMouseDown={(e) => handleMouseDown(e, 'image')}
                        />

                        {/* 5. Watermark Draggable Handle (Only for Single Mode) */}
                        {wmSettings.enabled && wmSettings.mode === 'single' && (
                            <div 
                                className="absolute z-40 w-8 h-8 bg-sky-500/50 border-2 border-white rounded-full shadow-lg cursor-move flex items-center justify-center hover:bg-sky-600 transition-colors"
                                style={{
                                    left: `${wmSettings.x}%`,
                                    top: `${wmSettings.y}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                                onMouseDown={(e) => handleMouseDown(e, 'wm')}
                                title="Kéo để di chuyển Watermark"
                            >
                                <Crosshair size={16} className="text-white" />
                            </div>
                        )}

                        {/* 6. Grid Overlay */}
                        {showGrid && (
                            <div className="absolute inset-0 z-50 pointer-events-none opacity-30">
                                <div className="w-full h-full border border-sky-400"></div>
                                <div className="absolute top-1/2 left-0 w-full h-px bg-sky-400"></div>
                                <div className="absolute left-1/2 top-0 h-full w-px bg-sky-400"></div>
                                <div className="absolute top-1/4 left-0 w-full h-px bg-sky-400 border-t border-dashed"></div>
                                <div className="absolute top-3/4 left-0 w-full h-px bg-sky-400 border-t border-dashed"></div>
                                <div className="absolute left-1/4 top-0 h-full w-px bg-sky-400 border-l border-dashed"></div>
                                <div className="absolute left-3/4 top-0 h-full w-px bg-sky-400 border-l border-dashed"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* FILE LIST */}
            <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 h-40 flex flex-col">
                 <div className="p-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 px-4 font-bold">
                    Hàng đợi ({files.length})
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {files.map((file) => (
                        <div key={file.id} onClick={() => setSelectedFileId(file.id)} className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer ${selectedFileId === file.id ? 'bg-sky-50 border-sky-300' : 'bg-white border-gray-100'}`}>
                           <img src={file.preview} className="w-8 h-8 object-cover rounded" alt="thumb" />
                           <div className="flex-1 min-w-0">
                               <p className="text-xs font-medium text-gray-800 truncate">{file.file.name}</p>
                               <span className="text-[10px] text-gray-400">{formatSize(file.originalSize)}</span>
                           </div>
                           {file.status === 'done' && file.resultUrl && (
                              <a href={file.resultUrl} download={`resized_${file.file.name}`} onClick={(e) => e.stopPropagation()} className="p-1.5 bg-green-100 text-green-700 rounded">
                                 <Download size={14} />
                              </a>
                           )}
                           <button onClick={(e) => removeFile(file.id, e)} className="p-1.5 text-gray-400 hover:text-red-500">
                               <Trash2 size={14} />
                           </button>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageResizer;
