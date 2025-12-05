
import React, { useState, useRef, useEffect } from 'react';
import { 
  Facebook, Upload, Download, RefreshCw, Type, Image as ImageIcon, 
  Smartphone, Monitor, Layers, Sliders, Share2, UploadCloud, X 
} from 'lucide-react';

interface Format {
  label: string;
  w: number;
  h: number;
  type: 'post' | 'story' | 'cover';
}

const FB_FORMATS: Format[] = [
  { label: 'Post Vuông (1:1)', w: 1080, h: 1080, type: 'post' },
  { label: 'Post Dọc (4:5)', w: 1080, h: 1350, type: 'post' },
  { label: 'Post Ngang (1.91:1)', w: 1200, h: 630, type: 'post' },
  { label: 'Story / Reel (9:16)', w: 1080, h: 1920, type: 'story' },
  { label: 'Ảnh Bìa (Cover)', w: 820, h: 312, type: 'cover' },
  { label: 'Ảnh Bìa Group', w: 1640, h: 856, type: 'cover' },
  { label: 'Quảng Cáo Carousel', w: 1080, h: 1080, type: 'post' },
];

const FacebookCreator: React.FC = () => {
  // Main State
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [format, setFormat] = useState<Format>(FB_FORMATS[0]);
  
  // Adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // Watermark
  const [wmText, setWmText] = useState('');
  const [wmImage, setWmImage] = useState<HTMLImageElement | null>(null);
  const [wmType, setWmType] = useState<'none' | 'text' | 'image'>('none');
  const [wmOpacity, setWmOpacity] = useState(0.8);
  const [wmSize, setWmSize] = useState(20); // Font size or Image scale
  const [wmX, setWmX] = useState(50); // %
  const [wmY, setWmY] = useState(50); // %
  const [wmColor, setWmColor] = useState('#ffffff');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // File Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.src = evt.target?.result as string;
        img.onload = () => {
          setImage(img);
          setScale(1);
          setOffsetX(0);
          setOffsetY(0);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWmImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.src = evt.target?.result as string;
        img.onload = () => {
          setWmImage(img);
          setWmType('image');
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Setup Canvas
    canvas.width = format.w;
    canvas.height = format.h;

    // Fill background
    ctx.fillStyle = '#f0f2f5'; // FB Light Grey
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Image
    if (image) {
      ctx.save();
      // Apply filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      
      // Calculate centering & fitting
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.translate(centerX + offsetX, centerY + offsetY);
      ctx.scale(scale, scale);
      
      // Draw centered
      ctx.drawImage(image, -image.width / 2, -image.height / 2);
      
      ctx.restore();
    } else {
      // Placeholder text
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'center';
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText("Tải ảnh lên", canvas.width / 2, canvas.height / 2);
    }

    // 3. Draw Watermark
    if (wmType === 'text' && wmText) {
      ctx.save();
      ctx.globalAlpha = wmOpacity;
      ctx.fillStyle = wmColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fontSize = (canvas.width * wmSize) / 100; // Relative font size
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      
      const x = (canvas.width * wmX) / 100;
      const y = (canvas.height * wmY) / 100;
      
      ctx.fillText(wmText, x, y);
      ctx.restore();
    } else if (wmType === 'image' && wmImage) {
      ctx.save();
      ctx.globalAlpha = wmOpacity;
      
      // Calculate size relative to canvas width
      const targetW = (canvas.width * wmSize) / 100; 
      const ratio = wmImage.width / wmImage.height;
      const targetH = targetW / ratio;
      
      const x = (canvas.width * wmX) / 100 - (targetW / 2);
      const y = (canvas.height * wmY) / 100 - (targetH / 2);
      
      ctx.drawImage(wmImage, x, y, targetW, targetH);
      ctx.restore();
    }

  }, [image, format, brightness, contrast, saturation, scale, offsetX, offsetY, wmText, wmImage, wmType, wmOpacity, wmSize, wmX, wmY, wmColor]);

  // Actions
  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `fb_creator_${format.type}_${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL('image/png', 1.0);
      link.click();
    }
  };

  const handleUploadToFB = () => {
    // Simulated upload - open Creator Studio
    if (confirm("Ảnh của bạn đã sẵn sàng! \n\nHệ thống sẽ tải ảnh xuống máy của bạn, sau đó mở Facebook Creator Studio để bạn đăng tải. \n(Kết nối API trực tiếp yêu cầu quyền Doanh nghiệp).")) {
      handleDownload();
      window.open('https://business.facebook.com/creatorstudio', '_blank');
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Facebook className="text-blue-600" /> Facebook Creator Studio (Image Editor)
        </h2>
        <p className="text-gray-600 mt-2">Tạo ảnh chuẩn kích thước Facebook, Instagram Post/Story, đóng dấu bản quyền và tải lên.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CONTROLS */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Upload */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-blue-50 transition-colors cursor-pointer relative group">
                 <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
                 <Upload className="w-10 h-10 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                 <span className="font-bold text-gray-700 block">Tải ảnh gốc</span>
                 <span className="text-xs text-gray-400">JPG, PNG (Max 10MB)</span>
             </div>
          </div>

          {/* Formats */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                <Monitor size={14}/> Chọn định dạng
             </h3>
             <div className="grid grid-cols-2 gap-2">
                {FB_FORMATS.map((f, i) => (
                   <button 
                      key={i}
                      onClick={() => setFormat(f)}
                      className={`text-xs p-2 rounded border text-left transition-colors flex flex-col ${format.label === f.label ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                   >
                      <span className="font-bold">{f.label}</span>
                      <span className={`text-[10px] ${format.label === f.label ? 'text-blue-200' : 'text-gray-400'}`}>{f.w} x {f.h} px</span>
                   </button>
                ))}
             </div>
          </div>

          {/* Adjustments */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                <Sliders size={14}/> Chỉnh màu & Bố cục
             </h3>
             <div className="space-y-4">
                <div>
                   <div className="flex justify-between text-xs mb-1"><span>Zoom</span> <span>{scale.toFixed(1)}x</span></div>
                   <input type="range" min="0.1" max="3" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg accent-blue-600" />
                </div>
                <div>
                   <div className="flex justify-between text-xs mb-1"><span>Độ sáng</span> <span>{brightness}%</span></div>
                   <input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg accent-blue-600" />
                </div>
                <div>
                   <div className="flex justify-between text-xs mb-1"><span>Tương phản</span> <span>{contrast}%</span></div>
                   <input type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg accent-blue-600" />
                </div>
             </div>
          </div>

          {/* Watermark */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                <Layers size={14}/> Watermark / Logo
             </h3>
             
             <div className="flex gap-2 mb-4 text-xs">
                <button onClick={() => setWmType('none')} className={`flex-1 py-1.5 rounded border ${wmType === 'none' ? 'bg-gray-800 text-white' : 'bg-white'}`}>Không</button>
                <button onClick={() => setWmType('text')} className={`flex-1 py-1.5 rounded border ${wmType === 'text' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Chữ (Text)</button>
                <button onClick={() => setWmType('image')} className={`flex-1 py-1.5 rounded border ${wmType === 'image' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Logo (Ảnh)</button>
             </div>

             {wmType === 'text' && (
                <div className="space-y-3 animate-in fade-in">
                   <input type="text" value={wmText} onChange={(e) => setWmText(e.target.value)} placeholder="Nhập nội dung..." className="w-full p-2 border rounded text-sm" />
                   <div className="flex gap-2 items-center">
                      <input type="color" value={wmColor} onChange={(e) => setWmColor(e.target.value)} className="h-8 w-8 p-0 border rounded cursor-pointer" />
                      <span className="text-xs text-gray-500">Màu chữ</span>
                   </div>
                </div>
             )}

             {wmType === 'image' && (
                <div className="animate-in fade-in">
                   {!wmImage ? (
                      <label className="block p-3 border border-dashed rounded text-center cursor-pointer hover:bg-gray-50 text-xs text-gray-500">
                         Click tải logo lên
                         <input type="file" className="hidden" accept="image/*" onChange={handleWmImageUpload} />
                      </label>
                   ) : (
                      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                         <img src={wmImage.src} className="w-8 h-8 object-contain" alt="logo" />
                         <button onClick={() => setWmImage(null)} className="text-xs text-red-500 underline ml-auto">Xóa</button>
                      </div>
                   )}
                </div>
             )}

             {wmType !== 'none' && (
                <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
                   <div>
                      <div className="flex justify-between text-xs mb-1"><span>Kích thước</span> <span>{wmSize}%</span></div>
                      <input type="range" min="5" max="100" value={wmSize} onChange={(e) => setWmSize(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg accent-blue-600" />
                   </div>
                   <div>
                      <div className="flex justify-between text-xs mb-1"><span>Độ mờ (Opacity)</span> <span>{wmOpacity}</span></div>
                      <input type="range" min="0" max="1" step="0.1" value={wmOpacity} onChange={(e) => setWmOpacity(parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg accent-blue-600" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-xs text-gray-500">Vị trí X (%)</label>
                         <input type="number" min="0" max="100" value={wmX} onChange={(e) => setWmX(parseInt(e.target.value))} className="w-full p-1 border rounded text-xs" />
                      </div>
                      <div>
                         <label className="text-xs text-gray-500">Vị trí Y (%)</label>
                         <input type="number" min="0" max="100" value={wmY} onChange={(e) => setWmY(parseInt(e.target.value))} className="w-full p-1 border rounded text-xs" />
                      </div>
                   </div>
                </div>
             )}
          </div>

        </div>

        {/* RIGHT COLUMN: PREVIEW & EXPORT */}
        <div className="lg:col-span-8 flex flex-col h-full">
           <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex-1 flex items-center justify-center p-8 relative min-h-[500px] border border-gray-700">
               <div className="relative shadow-2xl">
                  <canvas ref={canvasRef} className="max-w-full max-h-[70vh] object-contain bg-white" />
               </div>
               
               <div className="absolute top-4 right-4 flex gap-2">
                  <span className="px-3 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm border border-white/10">
                     Preview: {format.w}x{format.h}px
                  </span>
               </div>
           </div>

           <div className="mt-6 flex flex-col md:flex-row gap-4 justify-end">
               <button 
                  onClick={handleDownload}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-50 shadow-sm transition-all"
               >
                  <Download size={20} /> Tải Về Máy
               </button>
               <button 
                  onClick={handleUploadToFB}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg hover:-translate-y-1 transition-all"
               >
                  <UploadCloud size={20} /> Đăng Lên Facebook
               </button>
           </div>
           
           <p className="text-center text-xs text-gray-400 mt-4 italic">
              * Tính năng "Đăng Lên Facebook" sẽ tải ảnh về máy và chuyển hướng bạn đến Facebook Creator Studio để hoàn tất bài đăng (do giới hạn bảo mật trình duyệt).
           </p>
        </div>

      </div>
    </div>
  );
};

export default FacebookCreator;
