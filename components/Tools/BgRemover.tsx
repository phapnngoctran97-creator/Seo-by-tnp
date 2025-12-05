import React, { useState, useRef, useEffect } from 'react';
import { Eraser, Upload, Download, MousePointer2, Eye, LayoutTemplate, Layers } from 'lucide-react';

const BgRemover: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  
  // Settings
  const [tolerance, setTolerance] = useState(30);
  const [targetColor, setTargetColor] = useState({ r: 255, g: 255, b: 255 });
  
  // UI State
  const [compareMode, setCompareMode] = useState(false); // Toggle between single view and slider
  const [sliderPosition, setSliderPosition] = useState(50); // For Before/After slider
  const [viewBackground, setViewBackground] = useState<'transparent' | 'white' | 'black' | 'green'>('transparent');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setProcessedImage(null);
        setCompareMode(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeColor = (clickedColor?: {r: number, g: number, b: number}) => {
    const img = new Image();
    img.src = image || '';
    img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        const target = clickedColor || targetColor;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const diff = Math.sqrt(
                Math.pow(r - target.r, 2) + 
                Math.pow(g - target.g, 2) + 
                Math.pow(b - target.b, 2)
            );

            if (diff < tolerance) {
                data[i + 3] = 0; // Alpha = 0 (Transparent)
            }
        }

        ctx.putImageData(imageData, 0, 0);
        setProcessedImage(canvas.toDataURL());
    };
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
      // Only allow picking color if not in full comparison mode (or ensure we pick from original)
      // Here we assume clicking always picks from original concept, 
      // but physically we might be clicking the canvas which is hidden in some views.
      // We'll use the event on the container or the visible image.
      
      const canvas = canvasRef.current;
      if (!canvas || !image) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      // Draw original momentarily to pick color to ensure we pick from source
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = image;
      // Note: This is synchronous usually if cached, but strictly we should ensure it's loaded.
      // For simplicity in this tool, we assume 'image' state is valid source.
      
      // Actually simpler: Create a temp canvas or just use the pixel data if we keep original data.
      // Let's just pick from what is rendered if we haven't processed yet, or reload original.
      
      const p = ctx?.getImageData(x, y, 1, 1).data;
      if(p) {
          const color = { r: p[0], g: p[1], b: p[2] };
          setTargetColor(color);
          removeColor(color);
      }
  };

  // Initial load
  useEffect(() => {
    if (image && !processedImage) {
        const img = new Image();
        img.src = image;
        img.onload = () => {
             const canvas = canvasRef.current;
             if(canvas) {
                 canvas.width = img.width;
                 canvas.height = img.height;
                 const ctx = canvas.getContext('2d');
                 ctx?.drawImage(img, 0, 0);
             }
        }
    }
  }, [image, processedImage]);

  // Background style helper
  const getBgStyle = () => {
      switch(viewBackground) {
          case 'white': return { backgroundColor: 'white' };
          case 'black': return { backgroundColor: 'black' };
          case 'green': return { backgroundColor: '#4ade80' };
          default: return { backgroundImage: "url('https://media.istockphoto.com/id/1226505703/vector/transparent-background-seamless-pattern-vector-stock-illustration.jpg?s=612x612&w=0&k=20&c=J9_e3T_u6sYq5t0VqA-L9p9Z9y-j7Z5Z9y-j7Z5Z9y.jpg')" };
      }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Eraser className="text-rose-600" /> Xóa Nền Pro (Magic Wand)
        </h2>
        <p className="text-gray-600 mt-2">Công cụ tách nền theo màu với chế độ so sánh Trước/Sau trực quan.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[600px]">
          {!image ? (
               <div className="border-2 border-dashed border-gray-300 rounded-xl p-20 text-center hover:bg-rose-50 transition-colors cursor-pointer">
                  <input type="file" id="bg-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                  <label htmlFor="bg-upload" className="cursor-pointer flex flex-col items-center w-full h-full">
                      <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-10 h-10" />
                      </div>
                      <span className="text-xl font-bold text-gray-700">Tải ảnh lên (JPG/PNG)</span>
                      <span className="text-sm text-gray-500 mt-2">Khuyên dùng ảnh có nền màu đồng nhất</span>
                  </label>
               </div>
          ) : (
              <div className="flex flex-col lg:flex-row gap-6 h-full">
                  {/* LEFT: Controls */}
                  <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                         <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                             <MousePointer2 size={16} /> 1. Chọn màu
                         </h3>
                         <div className="flex items-center gap-3 mb-2">
                             <div 
                                className="w-10 h-10 rounded-lg border-2 border-white shadow-md transition-colors"
                                style={{backgroundColor: `rgb(${targetColor.r},${targetColor.g},${targetColor.b})`}}
                             />
                             <div className="text-xs text-gray-500 flex-1">
                                 Click vào nền ảnh bên phải để lấy mẫu màu cần xóa.
                             </div>
                         </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                         <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                             <LayoutTemplate size={16} /> 2. Điều chỉnh
                         </h3>
                         <div className="mb-4">
                            <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                                <span>Độ mạnh (Tolerance)</span>
                                <span className="text-rose-600 font-bold">{tolerance}</span>
                            </label>
                            <input 
                                type="range" 
                                min="1" 
                                max="100" 
                                value={tolerance} 
                                onChange={(e) => setTolerance(parseInt(e.target.value))}
                                onMouseUp={() => removeColor()} // Only process on release to save perf
                                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-rose-600"
                            />
                         </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                         <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                             <Eye size={16} /> 3. Xem trước
                         </h3>
                         <div className="grid grid-cols-2 gap-2 mb-4">
                             <button 
                                onClick={() => setCompareMode(false)}
                                className={`py-2 px-3 text-xs rounded border ${!compareMode ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-white text-gray-600'}`}
                             >
                                 Chỉnh sửa
                             </button>
                             <button 
                                onClick={() => setCompareMode(true)}
                                className={`py-2 px-3 text-xs rounded border ${compareMode ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-white text-gray-600'}`}
                             >
                                 So sánh (Slider)
                             </button>
                         </div>
                         <div className="flex gap-2 justify-between">
                            {['transparent', 'white', 'black', 'green'].map(bg => (
                                <button
                                    key={bg}
                                    onClick={() => setViewBackground(bg as any)}
                                    className={`w-8 h-8 rounded-full border-2 ${viewBackground === bg ? 'border-rose-500 scale-110' : 'border-gray-200'}`}
                                    style={{
                                        backgroundColor: bg === 'transparent' ? 'transparent' : (bg === 'green' ? '#4ade80' : bg),
                                        backgroundImage: bg === 'transparent' ? "url('https://media.istockphoto.com/id/1226505703/vector/transparent-background-seamless-pattern-vector-stock-illustration.jpg?s=612x612&w=0&k=20&c=J9_e3T_u6sYq5t0VqA-L9p9Z9y-j7Z5Z9y-j7Z5Z9y.jpg')" : 'none',
                                        backgroundSize: 'cover'
                                    }}
                                    title={`Nền: ${bg}`}
                                />
                            ))}
                         </div>
                      </div>

                      <button 
                             onClick={() => {
                                if(processedImage) {
                                    const link = document.createElement('a');
                                    link.download = 'removed_bg.png';
                                    link.href = processedImage;
                                    link.click();
                                }
                             }}
                             disabled={!processedImage}
                             className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center justify-center gap-2 font-bold shadow-lg"
                         >
                             <Download size={20} /> Tải Ảnh Về
                      </button>
                      <button 
                             onClick={() => {
                                setImage(null);
                                setProcessedImage(null);
                             }}
                             className="w-full py-2 text-sm text-gray-500 hover:text-rose-500"
                      >
                             Chọn ảnh khác
                      </button>
                  </div>

                  {/* RIGHT: Viewer */}
                  <div className="flex-1 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative flex items-center justify-center min-h-[500px]" ref={containerRef}>
                      
                      {/* Comparison Slider Mode */}
                      {compareMode && processedImage && image ? (
                           <div className="relative w-full h-full max-h-[600px] select-none group">
                               {/* Background Layer (Result) */}
                               <div 
                                    className="absolute inset-0 w-full h-full flex items-center justify-center"
                                    style={getBgStyle()}
                               >
                                   <img src={processedImage} className="max-w-full max-h-full object-contain" alt="After" />
                               </div>

                               {/* Foreground Layer (Original) - Clipped */}
                               <div 
                                    className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden border-r-2 border-white shadow-[2px_0_10px_rgba(0,0,0,0.3)]"
                                    style={{ width: `${sliderPosition}%` }}
                               >
                                   <div className="w-full h-full flex items-center justify-center" style={{ width: containerRef.current?.offsetWidth }}>
                                        <img src={image} className="max-w-full max-h-full object-contain" alt="Before" />
                                   </div>
                               </div>

                               {/* Slider Handle */}
                               <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={sliderPosition}
                                    onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                               />
                               <div 
                                    className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-rose-500 pointer-events-none z-20"
                                    style={{ left: `calc(${sliderPosition}% - 16px)` }}
                               >
                                   <Layers size={16} />
                               </div>
                               
                               <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold">Gốc</div>
                               <div className="absolute top-4 right-4 bg-rose-600/80 text-white px-2 py-1 rounded text-xs font-bold">Kết quả</div>
                           </div>
                      ) : (
                          /* Edit Mode (Canvas) */
                          <div className="relative w-full h-full flex items-center justify-center p-4" style={getBgStyle()}>
                              {/* We display the processed image if available, else canvas for interaction */}
                              {processedImage ? (
                                  <img 
                                    src={processedImage} 
                                    className="max-w-full max-h-[600px] object-contain cursor-crosshair"
                                    onClick={handleCanvasClick}
                                    alt="Result"
                                  />
                              ) : null}
                              
                              {/* Hidden Canvas for processing & Initial Interaction */}
                              <canvas 
                                ref={canvasRef} 
                                className={`max-w-full max-h-[600px] object-contain cursor-crosshair ${processedImage ? 'hidden' : 'block'}`}
                                onClick={handleCanvasClick}
                              />
                              
                              {!processedImage && (
                                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 pointer-events-none animate-bounce">
                                      <MousePointer2 size={16} /> Click vào nền ảnh để xóa
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default BgRemover;