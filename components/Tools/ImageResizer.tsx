import React, { useState, useEffect, useRef } from 'react';
import { 
  Move, Upload, Download, Lock, Unlock, RefreshCw, 
  Smartphone, Monitor, Clipboard, Layers, Image as ImageIcon, 
  Trash2, Play, CheckCircle, Plus, Grip
} from 'lucide-react';

interface Preset {
  label: string;
  w: number;
  h: number;
  icon: any;
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
  resultDims?: { w: number, h: number };
}

interface WatermarkSettings {
  enabled: boolean;
  image: HTMLImageElement | null;
  imageUrl: string | null;
  opacity: number;
  scale: number; // percentage of main image width
  position: 'tl' | 'tc' | 'tr' | 'cl' | 'cc' | 'cr' | 'bl' | 'bc' | 'br';
  padding: number;
}

const ImageResizer: React.FC = () => {
  // Batch State
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Global Settings
  const [width, setWidth] = useState<number | ''>(1920); // Default placeholder
  const [height, setHeight] = useState<number | ''>(1080);
  const [lockRatio, setLockRatio] = useState(true);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState(90);

  // Watermark State
  const [wmSettings, setWmSettings] = useState<WatermarkSettings>({
    enabled: false,
    image: null,
    imageUrl: null,
    opacity: 0.8,
    scale: 20, // 20% of image width
    position: 'br', // Bottom Right
    padding: 20
  });

  const PRESETS: Preset[] = [
    { label: 'FHD (1920px)', w: 1920, h: 1080, icon: Monitor },
    { label: 'HD (1280px)', w: 1280, h: 720, icon: Monitor },
    { label: 'Insta Square', w: 1080, h: 1080, icon: Smartphone },
    { label: 'Insta Story', w: 1080, h: 1920, icon: Smartphone },
  ];

  // Helper to get active file for preview
  const activeFile = files.find(f => f.id === selectedFileId) || files[0];

  const processFiles = (newFiles: FileList | File[]) => {
    const currentCount = files.length;
    const incoming = Array.from(newFiles).slice(0, 20 - currentCount); // Limit total to 20
    
    if (incoming.length === 0) {
      if (files.length >= 20) alert("Đã đạt giới hạn tối đa 20 file.");
      return;
    }

    const newImageFiles: ImageFile[] = incoming.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      originalSize: file.size,
      originalDims: { w: 0, h: 0 }, // Will be loaded async
      status: 'pending'
    }));

    // Load dimensions
    newImageFiles.forEach(imgFile => {
      const img = new Image();
      img.src = imgFile.preview;
      img.onload = () => {
        setFiles(prev => prev.map(p => 
          p.id === imgFile.id 
            ? { ...p, originalDims: { w: img.width, h: img.height } } 
            : p
        ));
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

  // Paste handler
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
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFileId === id) setSelectedFileId(null);
  };

  const applyPreset = (p: Preset) => {
    setWidth(p.w);
    // If lock ratio is on, we don't set fixed height immediately for batch, 
    // it will be calculated per image. But for UI feedback we set it.
    if (!lockRatio) setHeight(p.h); 
    else setHeight(''); // Indicate auto height
  };

  const getTargetDimensions = (imgW: number, imgH: number): { w: number, h: number } => {
    let targetW = Number(width);
    let targetH = Number(height);

    if (!targetW && !targetH) return { w: imgW, h: imgH }; // No change

    if (lockRatio) {
      if (targetW && !targetH) {
        targetH = Math.round(targetW * (imgH / imgW));
      } else if (!targetW && targetH) {
        targetW = Math.round(targetH * (imgW / imgH));
      } else if (targetW && targetH) {
        // Fit within box while maintaining ratio (optional logic, but let's prioritize Width if both set)
        targetH = Math.round(targetW * (imgH / imgW));
      }
    } else {
      if (!targetW) targetW = imgW;
      if (!targetH) targetH = imgH;
    }
    return { w: targetW, h: targetH };
  };

  const processBatch = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const processed = await Promise.all(files.map(async (fileData) => {
      // Don't re-process if already done unless forced (simplified here: re-process all)
      
      return new Promise<ImageFile>((resolve) => {
        const img = new Image();
        img.src = fileData.preview;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const { w, h } = getTargetDimensions(img.width, img.height);
          canvas.width = w;
          canvas.height = h;

          if (ctx) {
            // High quality scaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, w, h);

            // Watermark
            if (wmSettings.enabled && wmSettings.image) {
              const wm = wmSettings.image;
              const wmRatio = wm.width / wm.height;
              // Calculate width based on percentage of main image width
              const wmW = w * (wmSettings.scale / 100);
              const wmH = wmW / wmRatio;
              
              let wx = 0, wy = 0;
              const p = wmSettings.padding;

              switch (wmSettings.position) {
                case 'tl': wx = p; wy = p; break;
                case 'tc': wx = (w - wmW) / 2; wy = p; break;
                case 'tr': wx = w - wmW - p; wy = p; break;
                case 'cl': wx = p; wy = (h - wmH) / 2; break;
                case 'cc': wx = (w - wmW) / 2; wy = (h - wmH) / 2; break;
                case 'cr': wx = w - wmW - p; wy = (h - wmH) / 2; break;
                case 'bl': wx = p; wy = h - wmH - p; break;
                case 'bc': wx = (w - wmW) / 2; wy = h - wmH - p; break;
                case 'br': wx = w - wmW - p; wy = h - wmH - p; break;
              }

              ctx.globalAlpha = wmSettings.opacity;
              ctx.drawImage(wm, wx, wy, wmW, wmH);
              ctx.globalAlpha = 1.0;
            }

            const resultUrl = canvas.toDataURL(format, quality / 100);
            
            // Calculate size approx
            const head = `data:${format};base64,`;
            const size = Math.round((resultUrl.length - head.length) * 3 / 4);

            resolve({
              ...fileData,
              status: 'done',
              resultUrl,
              resultSize: size,
              resultDims: { w, h }
            });
          } else {
             resolve(fileData); // Fail safe
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

  const renderPositionGrid = () => {
    const positions = ['tl', 'tc', 'tr', 'cl', 'cc', 'cr', 'bl', 'bc', 'br'];
    return (
      <div className="grid grid-cols-3 gap-1 w-24 h-24 bg-gray-100 rounded border border-gray-200 p-1">
        {positions.map(pos => (
          <button
            key={pos}
            onClick={() => setWmSettings(p => ({ ...p, position: pos as any }))}
            className={`rounded-sm transition-colors ${
              wmSettings.position === pos 
                ? 'bg-sky-600' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Move className="text-sky-600" /> Resize Ảnh Hàng Loạt & Watermark
        </h2>
        <p className="text-gray-600 mt-2">Xử lý tối đa 20 ảnh cùng lúc, hỗ trợ chèn logo tự động.</p>
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

           {/* Resize Settings */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">1. Kích thước & Định dạng</h3>
             
             {/* Presets */}
             <div className="grid grid-cols-2 gap-2 mb-4">
                 {PRESETS.map((p, idx) => (
                     <button 
                        key={idx}
                        onClick={() => applyPreset(p)}
                        className="flex items-center gap-2 px-2 py-1.5 text-xs border border-gray-200 rounded hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 text-left truncate"
                     >
                         <p.icon size={12} /> {p.label}
                     </button>
                 ))}
             </div>

             {/* Inputs */}
             <div className="flex items-end gap-2 mb-4">
                 <div className="flex-1">
                     <label className="block text-xs font-semibold text-gray-500 mb-1">Rộng (px)</label>
                     <input 
                        type="number" 
                        value={width} 
                        onChange={(e) => setWidth(parseInt(e.target.value) || '')}
                        placeholder="Auto"
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
                        placeholder="Auto"
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        disabled={lockRatio && width !== ''}
                     />
                 </div>
             </div>

             {/* Format & Quality */}
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

           {/* Watermark Settings */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-4 border-b pb-2">
                 <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">2. Watermark / Logo</h3>
                 <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" checked={wmSettings.enabled} onChange={() => setWmSettings(p => ({...p, enabled: !p.enabled}))} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-sky-600"/>
                    <label className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${wmSettings.enabled ? 'bg-sky-600' : 'bg-gray-300'}`}></label>
                </div>
             </div>

             {wmSettings.enabled && (
               <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                  {/* Upload Logo */}
                  {!wmSettings.imageUrl ? (
                     <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                        <ImageIcon className="text-gray-400 w-6 h-6 mb-1" />
                        <span className="text-xs text-gray-600">Chọn ảnh Logo</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleWatermarkUpload} />
                     </label>
                  ) : (
                     <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <img src={wmSettings.imageUrl} alt="Logo" className="w-10 h-10 object-contain rounded bg-white border" />
                        <div className="flex-1 min-w-0">
                           <p className="text-xs text-gray-500 truncate">Logo đã chọn</p>
                           <button onClick={() => setWmSettings(p => ({...p, imageUrl: null, image: null}))} className="text-xs text-red-500 hover:underline">Thay đổi</button>
                        </div>
                     </div>
                  )}

                  {/* Controls */}
                  <div className="flex gap-4">
                     <div className="flex-1 space-y-3">
                        <div>
                           <label className="text-xs text-gray-500 block mb-1">Kích thước (%)</label>
                           <input type="range" min="5" max="80" value={wmSettings.scale} onChange={(e) => setWmSettings(p => ({...p, scale: parseInt(e.target.value)}))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600" />
                        </div>
                        <div>
                           <label className="text-xs text-gray-500 block mb-1">Độ mờ</label>
                           <input type="range" min="0.1" max="1" step="0.1" value={wmSettings.opacity} onChange={(e) => setWmSettings(p => ({...p, opacity: parseFloat(e.target.value)}))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600" />
                        </div>
                        <div>
                           <label className="text-xs text-gray-500 block mb-1">Cách lề (px)</label>
                           <input type="number" value={wmSettings.padding} onChange={(e) => setWmSettings(p => ({...p, padding: parseInt(e.target.value)}))} className="w-full p-1 text-xs border border-gray-300 rounded" />
                        </div>
                     </div>
                     <div className="flex flex-col items-center">
                        <label className="text-xs text-gray-500 mb-1">Vị trí</label>
                        {renderPositionGrid()}
                     </div>
                  </div>
               </div>
             )}
           </div>

           {/* Action Button */}
           <button 
              onClick={processBatch}
              disabled={files.length === 0 || isProcessing}
              className={`w-full py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                 files.length === 0 || isProcessing
                 ? 'bg-gray-300 cursor-not-allowed'
                 : 'bg-sky-600 hover:bg-sky-700 hover:-translate-y-1'
              }`}
           >
              {isProcessing ? <RefreshCw className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              {isProcessing ? 'Đang xử lý...' : 'Bắt Đầu Xử Lý'}
           </button>
        </div>

        {/* RIGHT COLUMN: Preview List */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
           {/* Main Preview Area */}
           <div className="bg-gray-100 rounded-xl border border-gray-200 p-4 flex-1 mb-4 flex items-center justify-center relative overflow-hidden bg-[url('https://media.istockphoto.com/id/1226505703/vector/transparent-background-seamless-pattern-vector-stock-illustration.jpg?s=612x612&w=0&k=20&c=J9_e3T_u6sYq5t0VqA-L9p9Z9y-j7Z5Z9y-j7Z5Z9y.jpg')]">
              {files.length === 0 ? (
                 <div className="text-center text-gray-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p>Chưa có ảnh nào được chọn</p>
                 </div>
              ) : (
                 <div className="relative max-w-full max-h-full">
                    {/* Simplified Preview: In a real app we would apply watermark to canvas for live preview. 
                        Here we show processed result if available, else original. 
                        Note: Live watermark preview on original image requires complexity, 
                        so we rely on "Process" to see final. */}
                    <img 
                       src={activeFile?.resultUrl || activeFile?.preview} 
                       alt="Preview" 
                       className="max-w-full max-h-[500px] object-contain shadow-lg"
                    />
                    {/* Overlay Watermark hint if not processed yet */}
                    {!activeFile?.resultUrl && wmSettings.enabled && wmSettings.imageUrl && (
                        <div className="absolute inset-0 pointer-events-none border-2 border-sky-400 border-dashed opacity-50 flex items-center justify-center bg-black/10">
                           <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">Preview Watermark (Sau khi bấm Xử Lý)</span>
                        </div>
                    )}
                 </div>
              )}
           </div>

           {/* File List */}
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-64">
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                 <h3 className="font-semibold text-gray-700 text-sm">Danh sách file ({files.length})</h3>
                 {files.some(f => f.status === 'done') && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                       <CheckCircle size={12} /> Đã xong
                    </span>
                 )}
              </div>
              <div className="overflow-y-auto p-2 space-y-2 flex-1">
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
                          <div className="flex justify-between">
                             <p className="text-sm font-medium text-gray-800 truncate">{file.file.name}</p>
                             <p className="text-xs text-gray-500 whitespace-nowrap">{formatSize(file.originalSize)}</p>
                          </div>
                          <div className="flex justify-between items-center mt-0.5">
                             {file.status === 'done' && file.resultDims ? (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                   <CheckCircle size={10} /> 
                                   {file.resultDims.w}x{file.resultDims.h} ({formatSize(file.resultSize || 0)})
                                </p>
                             ) : (
                                <p className="text-xs text-gray-400">
                                   Gốc: {file.originalDims.w}x{file.originalDims.h}
                                </p>
                             )}
                          </div>
                       </div>

                       {file.status === 'done' && file.resultUrl ? (
                          <a 
                             href={file.resultUrl} 
                             download={`resized_${file.file.name}`}
                             onClick={(e) => e.stopPropagation()}
                             className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                             title="Tải xuống"
                          >
                             <Download size={16} />
                          </a>
                       ) : (
                          <button 
                             onClick={(e) => removeFile(file.id, e)}
                             className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                             <Trash2 size={16} />
                          </button>
                       )}
                    </div>
                 ))}
                 {files.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                       Danh sách trống
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ImageResizer;