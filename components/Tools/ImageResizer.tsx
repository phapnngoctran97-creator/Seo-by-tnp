
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
  Move, Upload, Download, Lock, Unlock, RefreshCw, 
  Smartphone, Monitor, Layers, Image as ImageIcon, 
  Trash2, Play, Grid3X3, RotateCw, RotateCcw, 
  ZoomIn, MousePointer2, Settings, Crosshair, Maximize, ArrowRightLeft, FileImage, CheckCircle
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
  originalSize: number;
  originalDims: { w: number, h: number };
  status: 'pending' | 'processing' | 'done';
  resultUrl?: string;
  resultSize?: number;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const padding = 60; 
        const availableW = clientWidth - padding;
        const availableH = clientHeight - padding;

        const scaleW = availableW / outW;
        const scaleH = availableH / outH;
        
        setStageScale(Math.min(scaleW, scaleH, 1.2)); // Cap at 1.2x zoom
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [outW, outH, files.length, activeFile]);

  // --- 2. WATERMARK RENDER ENGINE ---
  const renderWatermarkToContext = (
      ctx: CanvasRenderingContext2D, 
      canvasW: number, 
      canvasH: number
  ) => {
      if (!wmSettings.enabled || !wmSettings.image) return;

      const wm = wmSettings.image;
      // FIX: Use natural dimensions to preserve aspect ratio
      const wmRatio = (wm.naturalWidth || wm.width) / (wm.naturalHeight || wm.height) || 1;
      
      let wmW = canvasW * (wmSettings.scale / 100);
      let wmH = wmW / wmRatio;

      ctx.save();
      ctx.globalAlpha = wmSettings.opacity;
      
      // Ensure high quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (wmSettings.mode === 'single') {
          const wx = (canvasW * (wmSettings.x / 100));
          const wy = (canvasH * (wmSettings.y / 100));

          ctx.translate(wx, wy);
          ctx.rotate((wmSettings.rotation * Math.PI) / 180);
          ctx.drawImage(wm, -wmW/2, -wmH/2, wmW, wmH);
      } else {
          const cols = Math.max(1, wmSettings.density);
          const cellW = canvasW / cols;
          const cellH = cellW; 
          const rows = Math.ceil(canvasH / cellH) + 2;
          const extraCols = 2; 

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
  const processFiles = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;
    
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
        originalSize: file.size,
        originalDims: { w: 0, h: 0 },
        status: 'pending',
        transform: { x: 0, y: 0, scale: 1 }
      };
    });

    // Detect Dims
    newImageFiles.forEach(imgFile => {
      const img = new Image();
      img.src = imgFile.preview;
      img.onload = () => {
        setFiles(prev => prev.map(p => p.id === imgFile.id ? { ...p, originalDims: { w: img.width, h: img.height } } : p));
        
        // Auto-set canvas size for first image
        if (files.length === 0 && imgFile === newImageFiles[0]) {
             setWidth(img.width);
             setHeight(img.height);
        }
      };
    });

    setFiles(prev => [...prev, ...newImageFiles]);
    if (!selectedFileId && newImageFiles.length > 0) setSelectedFileId(newImageFiles[0].id);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const setCanvasToOriginal = () => {
      if (activeFile && activeFile.originalDims.w > 0) {
          setWidth(activeFile.originalDims.w);
          setHeight(activeFile.originalDims.h);
          updateActiveTransform({ scale: 1, x: 0, y: 0 });
      }
  };

  const handleReset = () => {
      if(confirm('Bạn có chắc muốn xóa hết danh sách ảnh?')) {
          setFiles([]);
          setSelectedFileId(null);
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
      const realDeltaX = deltaX / stageScale;
      const realDeltaY = deltaY / stageScale;

      if (dragAction === 'move-image') {
          updateActiveTransform({
              x: initialTransform.x + realDeltaX,
              y: initialTransform.y + realDeltaY
          });
      } else if (dragAction === 'move-wm') {
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

            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, outW, outH);

            ctx.translate(outW / 2, outH / 2);
            ctx.translate(fileData.transform.x, fileData.transform.y);
            ctx.scale(fileData.transform.scale, fileData.transform.scale);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            ctx.setTransform(1, 0, 0, 1, 0, 0); 

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

  const downloadAll = () => {
      files.forEach(f => {
          if (f.status === 'done' && f.resultUrl) {
              const link = document.createElement('a');
              link.href = f.resultUrl;
              link.download = `processed_${f.file.name}`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
          }
      });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100 overflow-hidden">
        
        {/* LEFT SIDEBAR: CONTROLS */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-10 shadow-xl flex-shrink-0">
           
           <div className="p-4 border-b border-gray-100 flex items-center justify-between">
               <h3 className="font-bold text-gray-800 flex items-center gap-2">
                   <Settings size={18} className="text-gray-500" /> Cấu Hình
               </h3>
               {activeFile && (
                   <button onClick={setCanvasToOriginal} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100" title="Đặt kích thước bằng ảnh gốc">
                       Auto Size
                   </button>
               )}
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
               {/* 1. Dimensions */}
               <div className="space-y-3">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kích thước (Output)</label>
                   
                   <div className="grid grid-cols-2 gap-2">
                       {PRESETS.map((p, idx) => (
                           <button key={idx} onClick={() => { setWidth(p.w); setHeight(p.h); }} className={`flex items-center gap-2 px-2 py-2 text-xs border rounded transition-all truncate ${width === p.w && height === p.h ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 bg-white text-gray-600'}`}>
                               <p.icon size={12} /> {p.label}
                           </button>
                       ))}
                   </div>

                   <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                       <input type="number" value={width} onChange={e => setWidth(parseInt(e.target.value) || '')} className="flex-1 p-1.5 bg-transparent text-sm text-center font-bold focus:outline-none" placeholder="W" />
                       <span className="text-gray-400 text-xs">X</span>
                       <input type="number" value={height} onChange={e => setHeight(parseInt(e.target.value) || '')} className="flex-1 p-1.5 bg-transparent text-sm text-center font-bold focus:outline-none" placeholder="H" />
                       <div className="w-px h-4 bg-gray-300"></div>
                       <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none bg-transparent" />
                   </div>
               </div>

               {/* 2. Watermark */}
               <div className="space-y-3 pt-4 border-t border-dashed border-gray-200">
                   <div className="flex justify-between items-center">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                           <Layers size={14}/> Watermark
                       </label>
                       <div className="relative inline-block w-8 mr-1 align-middle select-none">
                            <input type="checkbox" checked={wmSettings.enabled} onChange={(e) => setWmSettings(p => ({...p, enabled: e.target.checked}))} className="absolute block w-4 h-4 rounded-full bg-white border-2 appearance-none cursor-pointer checked:right-0 right-4 top-0 bottom-0 m-auto transition-all duration-300 z-10 checked:border-blue-600"/>
                            <div className={`block overflow-hidden h-4 rounded-full cursor-pointer transition-colors ${wmSettings.enabled ? 'bg-blue-200' : 'bg-gray-300'}`}></div>
                       </div>
                   </div>

                   {wmSettings.enabled && (
                       <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                           {!wmSettings.imageUrl ? (
                               <label className="flex items-center justify-center p-4 border-2 border-dashed border-blue-200 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                                   <div className="text-center">
                                       <Upload size={16} className="mx-auto text-blue-500 mb-1"/> 
                                       <span className="text-xs text-blue-600 font-bold">Upload Logo</span>
                                   </div>
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
                                   <img src={wmSettings.imageUrl} className="w-8 h-8 object-contain bg-white border rounded" alt="logo"/>
                                   <div className="flex-1 min-w-0 text-xs font-medium text-gray-700 truncate">Logo.png</div>
                                   <button onClick={() => setWmSettings(p => ({...p, image: null, imageUrl: null}))} className="text-xs text-red-500 hover:bg-red-50 p-1 rounded">Xóa</button>
                               </div>
                           )}

                           <div className="flex bg-gray-100 p-1 rounded-lg">
                               <button onClick={() => setWmSettings(p => ({...p, mode: 'single'}))} className={`flex-1 text-[10px] font-bold py-1.5 rounded ${wmSettings.mode === 'single' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Single</button>
                               <button onClick={() => setWmSettings(p => ({...p, mode: 'tiled'}))} className={`flex-1 text-[10px] font-bold py-1.5 rounded ${wmSettings.mode === 'tiled' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Tiled</button>
                           </div>

                           <div className="space-y-3">
                               <div className="space-y-1">
                                   <div className="flex justify-between text-xs text-gray-500"><span>Size</span> <span>{wmSettings.scale}%</span></div>
                                   <input type="range" min="1" max="100" value={wmSettings.scale} onChange={e => setWmSettings(p => ({...p, scale: parseInt(e.target.value)}))} className="w-full h-1.5 bg-gray-200 rounded-lg accent-blue-600" />
                               </div>
                               <div className="space-y-1">
                                   <div className="flex justify-between text-xs text-gray-500"><span>Opacity</span> <span>{Math.round(wmSettings.opacity * 100)}%</span></div>
                                   <input type="range" min="0.1" max="1" step="0.1" value={wmSettings.opacity} onChange={e => setWmSettings(p => ({...p, opacity: parseFloat(e.target.value)}))} className="w-full h-1.5 bg-gray-200 rounded-lg accent-blue-600" />
                               </div>
                               <div className="space-y-1">
                                   <div className="flex justify-between text-xs text-gray-500"><span>Rotate</span> <span>{wmSettings.rotation}°</span></div>
                                   <input type="range" min="-180" max="180" value={wmSettings.rotation} onChange={e => setWmSettings(p => ({...p, rotation: parseInt(e.target.value)}))} className="w-full h-1.5 bg-gray-200 rounded-lg accent-blue-600" />
                               </div>
                               {wmSettings.mode === 'tiled' && (
                                   <div className="space-y-1 pt-2 border-t border-dashed border-gray-200">
                                       <div className="flex justify-between text-xs text-gray-500"><span>Density</span> <span>{wmSettings.density}x</span></div>
                                       <input type="range" min="1" max="10" value={wmSettings.density} onChange={e => setWmSettings(p => ({...p, density: parseInt(e.target.value)}))} className="w-full h-1.5 bg-gray-200 rounded-lg accent-blue-600" />
                                       <label className="flex items-center gap-2 text-xs text-gray-600 pt-1">
                                           <input type="checkbox" checked={wmSettings.stagger} onChange={e => setWmSettings(p => ({...p, stagger: e.target.checked}))} className="rounded text-blue-600"/> So le (Stagger)
                                       </label>
                                   </div>
                               )}
                           </div>
                       </div>
                   )}
               </div>
           </div>

           <div className="p-4 border-t border-gray-200 bg-gray-50">
               {files.some(f => f.status === 'done') ? (
                   <button 
                        onClick={downloadAll}
                        className="w-full py-3 rounded-lg font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all bg-green-600 hover:bg-green-700 hover:-translate-y-1"
                    >
                        <Download size={18}/> Tải Tất Cả
                    </button>
               ) : (
                   <button 
                        onClick={processBatch}
                        disabled={files.length === 0 || isProcessing}
                        className={`w-full py-3 rounded-lg font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${files.length===0 || isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1'}`}
                    >
                        {isProcessing ? <RefreshCw className="animate-spin" size={18}/> : <Play size={18}/>} Xử Lý Ảnh
                    </button>
               )}
           </div>
        </div>

        {/* CENTER: WORKSPACE */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#f0f2f5]">
            
            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-1 bg-white/90 backdrop-blur p-1.5 rounded-full shadow-lg border border-gray-200">
                <button onClick={() => setShowGrid(!showGrid)} className={`p-2 rounded-full transition-colors ${showGrid ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`} title="Lưới"><Grid3X3 size={18}/></button>
                <div className="w-px h-6 bg-gray-300 mx-1 my-auto"></div>
                <button onClick={() => fitImage('contain')} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-full" title="Vừa khung">Fit</button>
                <button onClick={() => fitImage('cover')} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-full" title="Lấp đầy">Fill</button>
                <div className="w-px h-6 bg-gray-300 mx-1 my-auto"></div>
                <div className="flex items-center gap-2 px-2">
                    <ZoomIn size={14} className="text-gray-400"/>
                    <input type="range" min="0.1" max="3" step="0.1" value={activeFile?.transform.scale || 1} onChange={e => updateActiveTransform({scale: parseFloat(e.target.value)})} className="w-20 h-1 bg-gray-300 rounded-lg accent-blue-600" />
                </div>
                
                {/* Download Button for Active File */}
                {activeFile?.status === 'done' && activeFile.resultUrl && (
                    <>
                        <div className="w-px h-6 bg-gray-300 mx-1 my-auto"></div>
                        <a 
                            href={activeFile.resultUrl}
                            download={`processed_${activeFile.file.name}`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-full text-xs font-bold hover:bg-green-700 shadow-sm"
                        >
                            <Download size={14} /> Tải Ảnh Này
                        </a>
                    </>
                )}
            </div>

            {/* Canvas Stage */}
            <div 
                ref={containerWrapperRef}
                className="flex-1 overflow-hidden flex items-center justify-center p-10 select-none cursor-grab active:cursor-grabbing bg-[url('https://media.istockphoto.com/id/1226505703/vector/transparent-background-seamless-pattern-vector-stock-illustration.jpg?s=612x612&w=0&k=20&c=J9_e3T_u6sYq5t0VqA-L9p9Z9y-j7Z5Z9y-j7Z5Z9y.jpg')] bg-repeat"
                onMouseMove={handleMouseMove}
                onMouseUp={() => { setDragAction(null); setDragStart(null); }}
                onMouseLeave={() => { setDragAction(null); setDragStart(null); }}
            >
                {!activeFile ? (
                    <div className="text-center bg-white p-8 rounded-2xl shadow-xl border-2 border-dashed border-gray-200 max-w-md">
                        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Bắt đầu thiết kế</h3>
                        <p className="text-gray-500 text-sm mb-6">Tải ảnh lên để resize, crop và đóng dấu logo hàng loạt.</p>
                        <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-all">
                            Tải Ảnh Lên
                        </button>
                    </div>
                ) : (
                    <div 
                        className="relative shadow-2xl origin-center bg-white transition-transform duration-75 ease-out ring-1 ring-black/5"
                        style={{
                            width: `${outW}px`,
                            height: `${outH}px`,
                            transform: `scale(${stageScale})`,
                        }}
                    >
                        <div className="absolute inset-0 z-0" style={{backgroundColor: bgColor}}></div>

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

                        {wmSettings.enabled && (
                            <canvas 
                                ref={wmCanvasRef}
                                className="absolute inset-0 z-20 pointer-events-none"
                                style={{ width: '100%', height: '100%' }}
                            />
                        )}

                        <div 
                            className="absolute inset-0 z-30"
                            onMouseDown={(e) => handleMouseDown(e, 'image')}
                        />

                        {wmSettings.enabled && wmSettings.mode === 'single' && (
                            <div 
                                className="absolute z-40 w-12 h-12 -ml-6 -mt-6 bg-blue-500/50 border-2 border-white rounded-full shadow-lg cursor-move flex items-center justify-center hover:bg-blue-600/80 transition-colors backdrop-blur-sm"
                                style={{
                                    left: `${wmSettings.x}%`,
                                    top: `${wmSettings.y}%`,
                                }}
                                onMouseDown={(e) => handleMouseDown(e, 'wm')}
                                title="Kéo Logo"
                            >
                                <Crosshair size={20} className="text-white" />
                            </div>
                        )}

                        {showGrid && (
                            <div className="absolute inset-0 z-50 pointer-events-none opacity-30">
                                <div className="absolute top-1/3 w-full h-px bg-cyan-400 border-t border-dashed"></div>
                                <div className="absolute top-2/3 w-full h-px bg-cyan-400 border-t border-dashed"></div>
                                <div className="absolute left-1/3 h-full w-px bg-cyan-400 border-l border-dashed"></div>
                                <div className="absolute left-2/3 h-full w-px bg-cyan-400 border-l border-dashed"></div>
                                <div className="absolute inset-4 border border-cyan-400/50 rounded"></div>
                            </div>
                        )}
                        
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-3 py-1 rounded-full font-mono">
                            {outW} x {outH}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom File List */}
            {files.length > 0 && (
                <div className="h-24 bg-white border-t border-gray-200 flex items-center px-4 gap-3 overflow-x-auto custom-scrollbar z-10">
                    <button onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                        <Upload size={20} />
                        <span className="text-[10px] font-bold mt-1">Thêm</span>
                    </button>
                    {files.map(f => (
                        <div 
                            key={f.id} 
                            onClick={() => setSelectedFileId(f.id)}
                            className={`flex-shrink-0 w-48 p-2 rounded-lg border cursor-pointer flex items-center gap-3 transition-all ${selectedFileId === f.id ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                        >
                            <img src={f.preview} className="w-10 h-10 object-cover rounded bg-gray-100" />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-gray-700 truncate">{f.file.name}</div>
                                <div className="text-[10px] text-gray-400">{Math.round(f.originalSize/1024)} KB</div>
                            </div>
                            
                            {/* Download Button in List */}
                            {f.status === 'done' && f.resultUrl && (
                                <a 
                                    href={f.resultUrl} 
                                    download={`processed_${f.file.name}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                    title="Tải về"
                                >
                                    <Download size={14} />
                                </a>
                            )}

                            {f.status === 'done' && !f.resultUrl && <div className="p-1"><CheckCircle size={14} className="text-green-500" /></div>}

                            <button onClick={(e) => { e.stopPropagation(); setFiles(files.filter(x => x.id !== f.id)); }} className="text-gray-300 hover:text-red-500 p-1">
                                <Trash2 size={14}/>
                            </button>
                        </div>
                    ))}
                    {files.length > 0 && (
                        <button onClick={handleReset} className="ml-2 text-xs text-red-400 hover:text-red-600 whitespace-nowrap">
                            Xóa hết
                        </button>
                    )}
                </div>
            )}
        </div>

        {/* Hidden Input */}
        <input 
            type="file" 
            ref={fileInputRef}
            multiple 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
        />
    </div>
  );
};

export default ImageResizer;
