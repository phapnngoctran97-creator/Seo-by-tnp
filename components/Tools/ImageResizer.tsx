import React, { useState, useEffect, useRef } from 'react';
import { 
  Move, Upload, Download, Lock, Unlock, RefreshCw, 
  Smartphone, Monitor, Clipboard, Layers, Image as ImageIcon, 
  Trash2, Play, CheckCircle, Plus, Crop, RotateCw, RotateCcw, 
  FlipHorizontal, FlipVertical, X, Check, Maximize, MousePointer2,
  ZoomIn, ArrowRight
} from 'lucide-react';

interface Preset {
  label: string;
  w: number;
  h: number;
  icon: any;
}

interface ImageTransform {
  x: number; // Offset X in pixels (relative to center)
  y: number; // Offset Y in pixels (relative to center)
  scale: number; // Zoom level (1 = fit/fill depending on logic, but here 1 = natural size relative to canvas?) 
  // Let's define scale: 1 = Image fits comfortably or is natural size. 
  // To keep it simple: scale 1 = original image width drawn at 100% size.
}

interface ImageFile {
  id: string;
  file: File;
  preview: string; // Current display url (potentially cropped/rotated)
  originalUrl: string; // Always keeps the original blob for revert
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
  image: HTMLImageElement | null;
  imageUrl: string | null;
  opacity: number;
  scale: number; // percentage of output width
  position: 'tl' | 'tc' | 'tr' | 'cl' | 'cc' | 'cr' | 'bl' | 'bc' | 'br';
  padding: number;
}

const ImageResizer: React.FC = () => {
  // Batch State
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Editor State
  const [isCropping, setIsCropping] = useState(false);
  const [cropRect, setCropRect] = useState<{x: number, y: number, w: number, h: number}>({ x: 10, y: 10, w: 80, h: 80 });
  
  // Interaction State
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [initialTransform, setInitialTransform] = useState<{x: number, y: number} | null>(null);
  const [dragAction, setDragAction] = useState<'move' | 'nw' | 'ne' | 'sw' | 'se' | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Global Settings
  const [width, setWidth] = useState<number | ''>(1080);
  const [height, setHeight] = useState<number | ''>(1080);
  const [lockRatio, setLockRatio] = useState(false); // Default to free aspect since we have a canvas now
  const [lockCropRatio, setLockCropRatio] = useState(false); 
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState(90);
  const [bgColor, setBgColor] = useState('#ffffff'); // Background for padding areas

  // Watermark State
  const [wmSettings, setWmSettings] = useState<WatermarkSettings>({
    enabled: false,
    image: null,
    imageUrl: null,
    opacity: 0.8,
    scale: 20, 
    position: 'br', 
    padding: 20
  });

  const PRESETS: Preset[] = [
    { label: 'FHD (1920px)', w: 1920, h: 1080, icon: Monitor },
    { label: 'HD (1280px)', w: 1280, h: 720, icon: Monitor },
    { label: 'Square (1:1)', w: 1080, h: 1080, icon: Smartphone },
    { label: 'Story (9:16)', w: 1080, h: 1920, icon: Smartphone },
  ];

  // Helper to get active file
  const activeFile = files.find(f => f.id === selectedFileId) || files[0];

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
        transform: { x: 0, y: 0, scale: 1 } // Initial transform
      };
    });

    // Load dimensions & Fit to canvas
    newImageFiles.forEach(imgFile => {
      const img = new Image();
      img.src = imgFile.preview;
      img.onload = () => {
        setFiles(prev => prev.map(p => {
            if (p.id !== imgFile.id) return p;
            
            // Auto fit logic: when loaded, scale image to cover or fit the current W/H settings?
            // Let's just set original dims first. The user adjusts scale manually or we default to 1.
            // Better UX: Calculate a scale that makes the image 'contain' within 1080x1080 if set.
            return { 
                ...p, 
                originalDims: { w: img.width, h: img.height },
                // Optional: Auto-calculate scale to fit? Leaving at 1 for now (actual size).
            };
        }));
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
          setWmSettings(prev => ({ ...prev, image: img, imageUrl: evt.target?.result as string, enabled: true }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
      }
      if (pastedFiles.length > 0) processFiles(pastedFiles);
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [files.length]);

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

  const handleMouseDown = (e: React.MouseEvent) => {
      if (isCropping) {
          // Crop mode handling (simplified for now to basic resize handles which use different events)
          // For moving crop box:
          setDragAction('move');
          return;
      }
      
      // Composition Mode (Pan)
      if (!activeFile) return;
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialTransform({ x: activeFile.transform.x, y: activeFile.transform.y });
      setDragAction('move');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!dragAction) return;

      if (isCropping && containerRef.current) {
          // ... Crop logic (Keep existing logic if needed, or simplified)
          // Re-using the simplified crop logic from previous version:
          const rect = containerRef.current.getBoundingClientRect();
          const xPct = ((e.clientX - rect.left) / rect.width) * 100;
          const yPct = ((e.clientY - rect.top) / rect.height) * 100;
          
          setCropRect(prev => {
             // Basic constraint logic...
             let newR = { ...prev };
             if (dragAction === 'move') { 
                // Skip drag move for crop rect for now to save space/complexity in this snippet
             } else {
                if (dragAction.includes('e')) newR.w = Math.max(1, Math.min(xPct - prev.x, 100 - prev.x));
                if (dragAction.includes('s')) newR.h = Math.max(1, Math.min(yPct - prev.y, 100 - prev.y));
             }
             return newR;
          });
          return;
      }

      // Pan Logic
      if (dragStart && initialTransform && activeFile) {
          // Calculate delta in SCREEN pixels
          const deltaX = e.clientX - dragStart.x;
          const deltaY = e.clientY - dragStart.y;
          
          // We need to map Screen Pixels to Canvas Pixels?
          // Visually, if the canvas is scaled down to fit the screen, dragging 1px on screen might mean dragging 2px on canvas.
          // However, we are using CSS transform on the image element relative to the container.
          // So dragging 1px on screen should move the element 1px in the container's coordinate space (if container is 1:1 with screen).
          // But our container is responsive.
          
          // Let's assume the visual container IS the reference frame.
          // We'll normalize later during processing.
          // Actually, for "WYSIWYG", if I drag 10px right, the image moves 10px right visually.
          
          // CRITICAL: The processing logic uses 'x' and 'y' as offsets from center.
          // If our visual representation scales the Output Frame (e.g. 1080p displayed as 500px), 
          // we need to scale the drag delta back up to Output Pixels.
          
          const visualFrame = containerRef.current?.getBoundingClientRect();
          const outputW = Number(width) || 1080;
          
          let scaleFactor = 1;
          if (visualFrame) {
              scaleFactor = outputW / visualFrame.width;
          }

          updateActiveTransform({
              x: initialTransform.x + (deltaX * scaleFactor),
              y: initialTransform.y + (deltaY * scaleFactor)
          });
      }
  };

  const handleMouseUp = () => {
      setDragAction(null);
      setDragStart(null);
      setInitialTransform(null);
  };

  // --- Processing ---

  const rotate = (dir: 'cw' | 'ccw') => {
    if (!activeFile) return;
    // Rotate works by modifying the 'preview' URL permanently for simplicity in this hybrid flow
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
      if(!activeFile || !width || !height) return;
      const imgW = activeFile.originalDims.w || 1000;
      const imgH = activeFile.originalDims.h || 1000;
      const outW = Number(width);
      const outH = Number(height);

      const scaleW = outW / imgW;
      const scaleH = outH / imgH;

      let newScale = 1;
      if (type === 'contain') newScale = Math.min(scaleW, scaleH);
      else newScale = Math.max(scaleW, scaleH);

      updateActiveTransform({ scale: newScale, x: 0, y: 0 });
  };

  const processBatch = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const outW = Number(width) || 1080;
    const outH = Number(height) || 1080;

    const processed = await Promise.all(files.map(async (fileData) => {
      return new Promise<ImageFile>((resolve) => {
        const img = new Image();
        img.src = fileData.preview;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = outW;
          canvas.height = outH;

          if (ctx) {
            // Fill Background
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, outW, outH);

            // Apply Transform
            // 1. Move to center of canvas
            ctx.translate(outW / 2, outH / 2);
            // 2. Apply user offset
            ctx.translate(fileData.transform.x, fileData.transform.y);
            // 3. Apply user scale
            ctx.scale(fileData.transform.scale, fileData.transform.scale);
            
            // 4. Draw Image centered at origin
            // Use image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            
            // Reset transform for Watermark
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            // Watermark Logic (Overlay on top of everything)
            if (wmSettings.enabled && wmSettings.image) {
              const wm = wmSettings.image;
              const wmRatio = wm.width / wm.height;
              const wmW = outW * (wmSettings.scale / 100);
              const wmH = wmW / wmRatio;
              
              let wx = 0, wy = 0;
              const p = wmSettings.padding;

              switch (wmSettings.position) {
                case 'tl': wx = p; wy = p; break;
                case 'tc': wx = (outW - wmW) / 2; wy = p; break;
                case 'tr': wx = outW - wmW - p; wy = p; break;
                case 'cl': wx = p; wy = (outH - wmH) / 2; break;
                case 'cc': wx = (outW - wmW) / 2; wy = (outH - wmH) / 2; break;
                case 'cr': wx = outW - wmW - p; wy = (outH - wmH) / 2; break;
                case 'bl': wx = p; wy = outH - wmH - p; break;
                case 'bc': wx = (outW - wmW) / 2; wy = outH - wmH - p; break;
                case 'br': wx = outW - wmW - p; wy = outH - wmH - p; break;
              }

              ctx.globalAlpha = wmSettings.opacity;
              ctx.drawImage(wm, wx, wy, wmW, wmH);
              ctx.globalAlpha = 1.0;
            }

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
          <Move className="text-sky-600" /> Resize & Bố Cục Ảnh Pro
        </h2>
        <p className="text-gray-600 mt-2">Kéo thả vị trí, zoom, xoay và resize hàng loạt trong khung hình chuẩn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-4 space-y-6">
           
           {/* Upload Box */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-sky-50 transition-colors cursor-pointer relative">
                 <input type="file" multiple id="batch-upload" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileChange} />
                 <div className="flex flex-col items-center pointer-events-none">
                     <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mb-2">
                        <Upload className="w-6 h-6" />
                     </div>
                     <span className="font-bold text-gray-700">Thêm ảnh (Tối đa 20)</span>
                     <span className="text-xs text-gray-500 mt-1">Hoặc dán Ctrl+V</span>
                 </div>
             </div>
             <div className="mt-3 flex justify-between text-xs text-gray-500">
               <span>Đã chọn: {files.length}/20</span>
               {files.length > 0 && (
                 <button onClick={() => setFiles([])} className="text-red-500 hover:underline">Xóa tất cả</button>
               )}
             </div>
           </div>

           {/* 1. Canvas Settings */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">1. Khung Hình (Canvas)</h3>
             
             <div className="grid grid-cols-2 gap-2 mb-4">
                 {PRESETS.map((p, idx) => (
                     <button 
                        key={idx}
                        onClick={() => { setWidth(p.w); setHeight(p.h); }}
                        className="flex items-center gap-2 px-2 py-1.5 text-xs border border-gray-200 rounded hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 text-left truncate"
                     >
                         <p.icon size={12} /> {p.label}
                     </button>
                 ))}
             </div>

             <div className="flex items-end gap-2 mb-4">
                 <div className="flex-1">
                     <label className="block text-xs font-semibold text-gray-500 mb-1">Rộng (px)</label>
                     <input 
                        type="number" 
                        value={width} 
                        onChange={(e) => setWidth(parseInt(e.target.value) || '')}
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                     />
                 </div>
                 <button 
                    onClick={() => setLockRatio(!lockRatio)}
                    className={`p-2 mb-0.5 rounded transition-colors ${lockRatio ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                    title="Khóa tỷ lệ khung hình"
                 >
                     {lockRatio ? <Lock size={16} /> : <Unlock size={16} />}
                 </button>
                 <div className="flex-1">
                     <label className="block text-xs font-semibold text-gray-500 mb-1">Cao (px)</label>
                     <input 
                        type="number" 
                        value={height} 
                        onChange={(e) => setHeight(parseInt(e.target.value) || '')}
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                     />
                 </div>
             </div>
             
             <div className="flex items-center gap-2 mb-4">
                 <label className="text-xs text-gray-500">Màu nền khung:</label>
                 <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-6 w-10 border border-gray-300 rounded cursor-pointer p-0" />
             </div>

             <div className="space-y-3">
                 <div className="flex justify-between items-center bg-gray-50 p-1 rounded-lg">
                    {['jpeg', 'png', 'webp'].map((fmt) => (
                         <button
                            key={fmt}
                            onClick={() => setFormat(`image/${fmt}` as any)}
                            className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-all ${
                                format === `image/${fmt}` 
                                ? 'bg-white text-sky-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                         >
                             {fmt.toUpperCase()}
                         </button>
                     ))}
                 </div>
                 <div>
                     <div className="flex justify-between mb-1">
                         <span className="text-xs text-gray-500">Chất lượng</span>
                         <span className="text-xs font-bold text-sky-600">{quality}%</span>
                     </div>
                     <input 
                        type="range" min="10" max="100" 
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                     />
                 </div>
             </div>
           </div>

           {/* 2. Watermark Settings */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-4 border-b pb-2">
                   <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">2. Đóng dấu (Logo)</h3>
                   <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="wm-toggle" checked={wmSettings.enabled} onChange={(e) => setWmSettings(p => ({...p, enabled: e.target.checked}))} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                        <label htmlFor="wm-toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${wmSettings.enabled ? 'bg-sky-600' : 'bg-gray-300'}`}></label>
                   </div>
               </div>
               
               {wmSettings.enabled && (
                   <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                       {!wmSettings.imageUrl ? (
                           <div className="border border-dashed border-gray-300 rounded p-4 text-center">
                               <label className="cursor-pointer block">
                                   <span className="text-xs text-sky-600 font-bold">Chọn ảnh Logo</span>
                                   <input type="file" className="hidden" accept="image/*" onChange={handleWatermarkUpload} />
                               </label>
                           </div>
                       ) : (
                           <div className="flex items-center gap-3 bg-gray-50 p-2 rounded">
                               <img src={wmSettings.imageUrl} className="w-10 h-10 object-contain bg-white rounded border" alt="logo" />
                               <button onClick={() => setWmSettings(p => ({...p, image: null, imageUrl: null}))} className="text-xs text-red-500 hover:underline">Thay đổi</button>
                           </div>
                       )}

                       <div className="flex gap-4">
                           <div className="flex-1 space-y-3">
                               <div>
                                   <label className="block text-xs text-gray-500 mb-1">Kích thước (%)</label>
                                   <input type="range" min="5" max="50" value={wmSettings.scale} onChange={(e) => setWmSettings(p => ({...p, scale: parseInt(e.target.value)}))} className="w-full h-1.5 bg-gray-200 rounded-lg accent-sky-600" />
                               </div>
                               <div>
                                   <label className="block text-xs text-gray-500 mb-1">Độ mờ</label>
                                   <input type="range" min="0.1" max="1" step="0.1" value={wmSettings.opacity} onChange={(e) => setWmSettings(p => ({...p, opacity: parseFloat(e.target.value)}))} className="w-full h-1.5 bg-gray-200 rounded-lg accent-sky-600" />
                               </div>
                           </div>
                           <div className="grid grid-cols-3 gap-1 w-24 h-24 bg-gray-100 rounded border border-gray-200 p-1">
                               {['tl', 'tc', 'tr', 'cl', 'cc', 'cr', 'bl', 'bc', 'br'].map(pos => (
                                 <button
                                   key={pos}
                                   onClick={() => setWmSettings(p => ({ ...p, position: pos as any }))}
                                   className={`rounded-sm transition-colors ${wmSettings.position === pos ? 'bg-sky-600' : 'bg-gray-300 hover:bg-gray-400'}`}
                                 />
                               ))}
                           </div>
                       </div>
                   </div>
               )}
           </div>
           
           <button 
                onClick={processBatch}
                disabled={files.length === 0 || isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                    files.length === 0 || isProcessing
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-sky-600 hover:bg-sky-700 hover:-translate-y-1'
                }`}
            >
                {isProcessing ? <RefreshCw className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                {isProcessing ? 'Đang xử lý...' : 'Xuất Ảnh (Tải Về)'}
            </button>
        </div>

        {/* RIGHT COLUMN: Interactive Editor */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[700px]">
            
            {/* 1. EDITOR TOOLBAR */}
            <div className="bg-white p-2 rounded-t-xl border border-gray-200 border-b-0 flex items-center justify-between gap-2 overflow-x-auto shadow-sm z-10">
                 <div className="flex gap-1">
                     <button onClick={() => rotate('ccw')} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Xoay trái"><RotateCcw size={18} /></button>
                     <button onClick={() => rotate('cw')} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Xoay phải"><RotateCw size={18} /></button>
                 </div>

                 <div className="flex items-center gap-4 flex-1 justify-center px-4">
                     <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><ZoomIn size={14} /> Zoom</span>
                     <input 
                        type="range" 
                        min="0.1" 
                        max="3" 
                        step="0.05" 
                        value={activeFile?.transform.scale || 1} 
                        onChange={(e) => updateActiveTransform({ scale: parseFloat(e.target.value) })}
                        className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                        title="Zoom ảnh"
                     />
                     <div className="flex gap-1 text-xs">
                         <button onClick={() => fitImage('contain')} className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">Fit</button>
                         <button onClick={() => fitImage('cover')} className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">Fill</button>
                     </div>
                 </div>

                 <div className="flex gap-2">
                     <button onClick={() => updateActiveTransform({x: 0, y: 0, scale: 1})} className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-sm transition-colors">
                         <RefreshCw size={14} /> Reset
                     </button>
                 </div>
            </div>

            {/* 2. MAIN INTERACTIVE CANVAS */}
            <div className="bg-gray-100 border-x border-gray-200 flex-1 relative overflow-hidden flex items-center justify-center p-8 bg-[url('https://media.istockphoto.com/id/1226505703/vector/transparent-background-seamless-pattern-vector-stock-illustration.jpg?s=612x612&w=0&k=20&c=J9_e3T_u6sYq5t0VqA-L9p9Z9y-j7Z5Z9y-j7Z5Z9y.jpg')] select-none"
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
                    // VISUAL OUTPUT FRAME (The "Window")
                    // Use ref to calculate dimensions for drag logic
                    <div 
                        ref={containerRef}
                        className="relative shadow-2xl overflow-hidden bg-white cursor-move group"
                        style={{
                            aspectRatio: `${width || 1080} / ${height || 1080}`,
                            width: 'auto',
                            height: 'auto',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            backgroundColor: bgColor
                        }}
                        onMouseDown={handleMouseDown}
                    >
                        {/* THE IMAGE LAYER */}
                        <div className="w-full h-full flex items-center justify-center pointer-events-none">
                            <img 
                                ref={imgRef}
                                src={activeFile.preview} 
                                alt="Editable" 
                                draggable={false}
                                style={{
                                    transform: `translate(${activeFile.transform.x}px, ${activeFile.transform.y}px) scale(${activeFile.transform.scale})`,
                                    transition: dragAction ? 'none' : 'transform 0.1s ease-out',
                                    transformOrigin: 'center center',
                                    maxWidth: 'none' // Allow image to overflow logic box, but parent overflows hidden
                                }}
                            />
                        </div>

                        {/* HOVER HINT */}
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pointer-events-none">
                            <MousePointer2 size={12} /> Kéo để di chuyển
                        </div>

                        {/* GRID OVERLAY (Optional assistance) */}
                        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity">
                             <div className="w-full h-full border border-sky-400"></div>
                             <div className="absolute top-1/2 left-0 w-full h-px bg-sky-400"></div>
                             <div className="absolute left-1/2 top-0 h-full w-px bg-sky-400"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. FILE LIST */}
            <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 h-48 flex flex-col">
                 <div className="p-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs text-gray-500 px-4">
                    <span>Hàng đợi: {files.length} ảnh</span>
                    <span>Click để chỉnh sửa từng ảnh</span>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {files.map((file) => (
                        <div 
                           key={file.id}
                           onClick={() => setSelectedFileId(file.id)}
                           className={`flex items-center gap-3 p-2 rounded-lg border transition-colors cursor-pointer ${
                              selectedFileId === file.id ? 'bg-sky-50 border-sky-300 ring-1 ring-sky-200' : 'bg-white border-gray-100 hover:border-gray-300'
                           }`}
                        >
                           <img src={file.preview} className="w-10 h-10 object-cover rounded bg-gray-100" alt="thumb" />
                           <div className="flex-1 min-w-0">
                               <p className="text-sm font-medium text-gray-800 truncate">{file.file.name}</p>
                               <div className="flex gap-2 text-xs text-gray-400">
                                   <span>{formatSize(file.originalSize)}</span>
                                   {file.status === 'done' && file.resultSize && (
                                       <span className="text-green-600 font-bold">➜ {formatSize(file.resultSize)}</span>
                                   )}
                               </div>
                           </div>
                           
                           {file.status === 'done' && file.resultUrl ? (
                              <a 
                                 href={file.resultUrl} 
                                 download={`resized_${file.file.name}`}
                                 onClick={(e) => e.stopPropagation()}
                                 className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                              >
                                 <Download size={16} />
                              </a>
                           ) : (
                              <button 
                                 onClick={(e) => removeFile(file.id, e)}
                                 className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                              >
                                 <Trash2 size={16} />
                              </button>
                           )}
                        </div>
                    ))}
                    {files.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                           <span>Chưa có ảnh nào</span>
                        </div>
                    )}
                 </div>
            </div>
        </div>
      </div>
      
      {/* CSS for custom toggle switch */}
      <style>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #0284c7;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #0284c7;
        }
      `}</style>
    </div>
  );
};

export default ImageResizer;