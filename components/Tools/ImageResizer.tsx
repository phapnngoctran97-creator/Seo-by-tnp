import React, { useState, useEffect } from 'react';
import { Move, Upload, Download, Lock, Unlock, RefreshCw, FileImage, Smartphone, Monitor } from 'lucide-react';

interface Preset {
  label: string;
  w: number;
  h: number;
  icon: any;
}

const ImageResizer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 });
  const [originalSize, setOriginalSize] = useState(0);
  
  // Resize Settings
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);
  const [unit, setUnit] = useState<'px' | '%'>('px');
  
  // Output Settings
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState(90);
  
  // Preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [estimatedSize, setEstimatedSize] = useState(0);

  const PRESETS: Preset[] = [
    { label: 'FHD (1920x1080)', w: 1920, h: 1080, icon: Monitor },
    { label: 'HD (1280x720)', w: 1280, h: 720, icon: Monitor },
    { label: 'Instagram Square', w: 1080, h: 1080, icon: Smartphone },
    { label: 'Instagram Story', w: 1080, h: 1920, icon: Smartphone },
    { label: 'Facebook Cover', w: 820, h: 312, icon: Monitor },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalSize(file.size);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
            setImage(event.target?.result as string);
            setOriginalDims({ w: img.width, h: img.height });
            setWidth(img.width);
            setHeight(img.height);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate preview when settings change
  useEffect(() => {
    if (!image || width <= 0 || height <= 0) return;

    const timer = setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = image;
        img.onload = () => {
            // High quality scaling
            if (ctx) {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                
                const dataUrl = canvas.toDataURL(format, quality / 100);
                setPreviewUrl(dataUrl);
                
                // Estimate size base64 padding calculation
                const stringLength = dataUrl.length - `data:${format};base64,`.length;
                const sizeInBytes = 4 * Math.ceil((stringLength / 3)) * 0.5624896334383812;
                setEstimatedSize(sizeInBytes);
            }
        };
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [image, width, height, format, quality]);

  const handleWidthChange = (val: number) => {
      setWidth(val);
      if (lockRatio && originalDims.w > 0) {
          setHeight(Math.round(val * (originalDims.h / originalDims.w)));
      }
  };

  const handleHeightChange = (val: number) => {
      setHeight(val);
      if (lockRatio && originalDims.h > 0) {
          setWidth(Math.round(val * (originalDims.w / originalDims.h)));
      }
  };

  const applyPreset = (p: Preset) => {
      setWidth(p.w);
      setHeight(p.h);
      // Presets usually break aspect ratio, so we might want to warn or auto-fit. 
      // For simplicity, we disable lock ratio when picking a preset or let user decide.
      // Here we just apply dimensions.
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
      if (previewUrl) {
          const ext = format.split('/')[1];
          const link = document.createElement('a');
          link.download = `resized_${width}x${height}.${ext}`;
          link.href = previewUrl;
          link.click();
      }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Move className="text-sky-600" /> Resize Ảnh Đa Năng
        </h2>
        <p className="text-gray-600 mt-2">Thay đổi kích thước, chuyển đổi định dạng và nén ảnh trong một bước.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
         {!image ? (
             <div className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center hover:bg-sky-50 transition-colors">
                 <input type="file" id="resize-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                 <label htmlFor="resize-upload" className="cursor-pointer flex flex-col items-center">
                     <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8" />
                     </div>
                     <span className="text-xl font-medium text-gray-700">Tải ảnh lên để bắt đầu</span>
                     <span className="text-sm text-gray-400 mt-1">Hỗ trợ JPG, PNG, WEBP</span>
                 </label>
             </div>
         ) : (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 {/* LEFT COLUMN: Controls */}
                 <div className="lg:col-span-4 space-y-6 border-r border-gray-100 pr-0 lg:pr-6">
                     {/* 1. Dimensions */}
                     <div>
                         <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">1. Kích thước</h3>
                         <div className="grid grid-cols-2 gap-2 mb-3">
                             {PRESETS.map((p, idx) => (
                                 <button 
                                    key={idx}
                                    onClick={() => applyPreset(p)}
                                    className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-200 rounded hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 transition-all text-left"
                                 >
                                     <p.icon size={14} /> {p.label}
                                 </button>
                             ))}
                         </div>

                         <div className="flex items-end gap-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <div className="flex-1">
                                 <label className="block text-xs font-semibold text-gray-500 mb-1">Rộng (W)</label>
                                 <input 
                                    type="number" 
                                    value={width} 
                                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
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
                                 <label className="block text-xs font-semibold text-gray-500 mb-1">Cao (H)</label>
                                 <input 
                                    type="number" 
                                    value={height} 
                                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                                 />
                             </div>
                         </div>
                     </div>

                     {/* 2. Output Settings */}
                     <div>
                         <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">2. Xuất file</h3>
                         <div className="space-y-4">
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">Định dạng</label>
                                 <div className="grid grid-cols-3 gap-2">
                                     {['jpeg', 'png', 'webp'].map((fmt) => (
                                         <button
                                            key={fmt}
                                            onClick={() => setFormat(`image/${fmt}` as any)}
                                            className={`py-2 text-sm rounded border ${
                                                format === `image/${fmt}` 
                                                ? 'bg-sky-600 text-white border-sky-600' 
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                            }`}
                                         >
                                             {fmt.toUpperCase()}
                                         </button>
                                     ))}
                                 </div>
                             </div>

                             <div>
                                 <div className="flex justify-between mb-2">
                                     <label className="block text-sm font-medium text-gray-700">Chất lượng</label>
                                     <span className="text-sm text-sky-600 font-bold">{quality}%</span>
                                 </div>
                                 <input 
                                    type="range" 
                                    min="10" 
                                    max="100" 
                                    value={quality}
                                    onChange={(e) => setQuality(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                                 />
                             </div>
                         </div>
                     </div>

                     <div className="pt-4 border-t border-gray-100">
                         <button 
                            onClick={handleDownload}
                            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg transition-transform hover:-translate-y-1"
                         >
                             <Download size={20} /> Tải Ảnh Về
                         </button>
                         <button 
                            onClick={() => setImage(null)}
                            className="w-full mt-3 py-2 text-gray-500 hover:text-red-500 flex items-center justify-center gap-2 text-sm"
                         >
                             <RefreshCw size={14} /> Làm lại từ đầu
                         </button>
                     </div>
                 </div>

                 {/* RIGHT COLUMN: Preview */}
                 <div className="lg:col-span-8 bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center min-h-[500px]">
                     <div className="w-full flex justify-between items-center mb-4">
                         <div className="text-sm text-gray-500">
                             Gốc: <span className="font-semibold text-gray-900">{originalDims.w}x{originalDims.h}</span> ({formatSize(originalSize)})
                         </div>
                         <div className="text-sm text-sky-600 bg-sky-100 px-3 py-1 rounded-full">
                             Kết quả: <span className="font-bold">{width}x{height}</span> (~{formatSize(estimatedSize)})
                         </div>
                     </div>
                     
                     <div className="relative w-full h-full flex items-center justify-center bg-[url('https://media.istockphoto.com/id/1226505703/vector/transparent-background-seamless-pattern-vector-stock-illustration.jpg?s=612x612&w=0&k=20&c=J9_e3T_u6sYq5t0VqA-L9p9Z9y-j7Z5Z9y-j7Z5Z9y.jpg')] rounded-lg border border-gray-200 overflow-hidden shadow-inner">
                         {previewUrl ? (
                             <img src={previewUrl} alt="Preview" className="max-w-full max-h-[500px] object-contain" />
                         ) : (
                             <div className="text-gray-400">Đang tạo bản xem trước...</div>
                         )}
                     </div>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};

export default ImageResizer;