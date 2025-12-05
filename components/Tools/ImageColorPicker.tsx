
import React, { useState, useRef, useEffect } from 'react';
import { Palette, Upload, Clipboard, Image as ImageIcon, Crosshair, ZoomIn, Copy, Check } from 'lucide-react';

interface Color {
  r: number;
  g: number;
  b: number;
  hex: string;
  count?: number; // for palette analysis
}

const ImageColorPicker: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [hoverColor, setHoverColor] = useState<Color | null>(null);
  const [palette, setPalette] = useState<Color[]>([]);
  const [zoomLevel, setZoomLevel] = useState(2);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
       setImage(evt.target?.result as string);
       setPalette([]); 
       setHoverColor(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // Paste Support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) processFile(file);
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Initialize Canvas & Extract Palette
  useEffect(() => {
    if (image) {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.drawImage(img, 0, 0);
             extractPalette(ctx, img.width, img.height);
          }
        }
      };
    }
  }, [image]);

  const rgbToHex = (r: number, g: number, b: number) => {
     return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  const extractPalette = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
     // Simplified Palette Extraction:
     // Downscale to 100x100 to analyze fast
     const smallCanvas = document.createElement('canvas');
     smallCanvas.width = 100;
     smallCanvas.height = 100;
     const sCtx = smallCanvas.getContext('2d');
     if (!sCtx) return;

     sCtx.drawImage(canvasRef.current!, 0, 0, 100, 100);
     const imageData = sCtx.getImageData(0, 0, 100, 100).data;
     
     const colorCounts: Record<string, number> = {};
     
     // Quantize colors (round to nearest 32) to group similar shades
     const step = 32;
     
     for (let i = 0; i < imageData.length; i += 4) {
        const r = Math.round(imageData[i] / step) * step;
        const g = Math.round(imageData[i + 1] / step) * step;
        const b = Math.round(imageData[i + 2] / step) * step;
        const alpha = imageData[i + 3];

        if (alpha < 10) continue; // Skip transparent

        const key = `${r},${g},${b}`;
        colorCounts[key] = (colorCounts[key] || 0) + 1;
     }

     // Sort by frequency
     const sorted = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8); // Top 8 colors
     
     const result = sorted.map(([key]) => {
         const [r, g, b] = key.split(',').map(Number);
         return { r, g, b, hex: rgbToHex(r, g, b) };
     });

     setPalette(result);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get mouse pos relative to canvas
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    
    // Limit within bounds
    if(x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
       const p = ctx.getImageData(x, y, 1, 1).data;
       setHoverColor({ r: p[0], g: p[1], b: p[2], hex: rgbToHex(p[0], p[1], p[2]) });
    }
  };

  const copyToClipboard = (hex: string) => {
     navigator.clipboard.writeText(hex);
     setCopiedHex(hex);
     setTimeout(() => setCopiedHex(null), 1500);
  };

  // Helper to get text color based on background (W3C standard)
  const getContrastYIQ = (hexcolor: string) => {
    const r = parseInt(hexcolor.substring(1,3),16);
    const g = parseInt(hexcolor.substring(3,5),16);
    const b = parseInt(hexcolor.substring(5,7),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col pb-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Palette className="text-fuchsia-600" /> Phân Tích Màu Sắc Hình Ảnh
        </h2>
        <p className="text-gray-600 mt-1">Lấy bảng màu (Palette) và xem mã màu từng điểm ảnh (Pixel Picker).</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT COLUMN: UPLOAD & PALETTE */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               {!image ? (
                   <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-fuchsia-50 transition-colors group">
                       <Upload className="w-10 h-10 text-gray-400 mb-2 group-hover:scale-110 transition-transform" />
                       <span className="font-bold text-gray-600">Tải ảnh lên</span>
                       <span className="text-xs text-gray-400 mt-1">Hỗ trợ dán (Ctrl+V)</span>
                       <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                   </label>
               ) : (
                   <div className="flex gap-4">
                       <button onClick={() => setImage(null)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 text-sm font-medium">Chọn ảnh khác</button>
                   </div>
               )}
           </div>
           
           {image && (
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1 overflow-y-auto">
                   <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Palette size={18} /> Bảng màu chủ đạo
                   </h3>
                   <div className="space-y-3">
                       {palette.map((color, idx) => (
                           <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                               <div 
                                  className="w-12 h-12 rounded-lg shadow-sm border border-gray-200"
                                  style={{backgroundColor: color.hex}}
                               />
                               <div className="flex-1">
                                   <div className="flex items-center gap-2">
                                       <span className="font-mono font-bold text-gray-800">{color.hex}</span>
                                       <button onClick={() => copyToClipboard(color.hex)} className="p-1 text-gray-400 hover:text-fuchsia-600" title="Copy">
                                           {copiedHex === color.hex ? <Check size={14} className="text-green-500"/> : <Copy size={14} />}
                                       </button>
                                   </div>
                                   <div className="text-xs text-gray-500 font-mono">
                                       RGB: {color.r}, {color.g}, {color.b}
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           )}
        </div>

        {/* RIGHT COLUMN: CANVAS & INSPECTOR */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
            {!image ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                    <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                    <p>Chọn ảnh để bắt đầu phân tích màu sắc</p>
                </div>
            ) : (
                <div className="flex-1 relative flex bg-[#1e1e1e] overflow-hidden" ref={containerRef}>
                    <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
                        <canvas 
                            ref={canvasRef} 
                            className="max-w-full max-h-full object-contain cursor-crosshair shadow-2xl" 
                            onMouseMove={handleMouseMove}
                            onMouseLeave={() => setHoverColor(null)}
                            style={{imageRendering: 'pixelated'}} // Keep pixels sharp
                        />
                    </div>
                    
                    {/* Floating Info Panel */}
                    <div className="absolute top-4 right-4 w-64 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 p-4 transition-all">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                            <Crosshair size={14} /> Điểm Đang Chọn
                        </h4>
                        
                        {hoverColor ? (
                            <div className="animate-in fade-in duration-200">
                                <div 
                                    className="w-full h-16 rounded-lg mb-3 shadow-inner flex items-center justify-center text-sm font-bold border border-black/10 transition-colors"
                                    style={{
                                        backgroundColor: hoverColor.hex, 
                                        color: getContrastYIQ(hoverColor.hex)
                                    }}
                                >
                                    {hoverColor.hex}
                                </div>
                                <div className="space-y-2 font-mono text-sm text-gray-600">
                                    <div className="flex justify-between border-b pb-1">
                                        <span>HEX</span>
                                        <span className="text-gray-900 select-all">{hoverColor.hex}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <span>RGB</span>
                                        <span className="text-gray-900 select-all">{hoverColor.r}, {hoverColor.g}, {hoverColor.b}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>CSS</span>
                                        <span className="text-gray-900 text-xs truncate ml-2 select-all">rgb({hoverColor.r}, {hoverColor.g}, {hoverColor.b})</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(hoverColor.hex)} 
                                    className="w-full mt-3 py-2 bg-gray-900 text-white rounded text-xs font-bold hover:bg-black transition-colors"
                                >
                                    {copiedHex === hoverColor.hex ? 'Đã Copy!' : 'Copy Mã Màu'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400 py-4 text-center italic">
                                Di chuột lên ảnh...
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default ImageColorPicker;
