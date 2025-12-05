import React, { useState, useRef } from 'react';
import { Eraser, Upload, Download, MousePointer2 } from 'lucide-react';

const BgRemover: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState(30);
  const [targetColor, setTargetColor] = useState({ r: 255, g: 255, b: 255 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setProcessedImage(null);
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
      const canvas = canvasRef.current;
      if (!canvas || !image) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const p = ctx.getImageData(x, y, 1, 1).data;
      const color = { r: p[0], g: p[1], b: p[2] };
      setTargetColor(color);
      removeColor(color);
  };

  // Initial draw to allow clicking
  React.useEffect(() => {
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Eraser className="text-rose-600" /> Xóa Nền Đơn Giản (Magic Wand)
        </h2>
        <p className="text-gray-600 mt-2">Click vào màu nền bạn muốn xóa. Công cụ này hoạt động tốt nhất với nền đồng nhất (VD: nền trắng).</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          {!image ? (
               <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                  <input type="file" id="bg-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                  <label htmlFor="bg-upload" className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-12 h-12 text-rose-300 mb-3" />
                      <span className="text-gray-600 font-medium">Tải ảnh lên</span>
                  </label>
               </div>
          ) : (
              <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                     <div className="flex-1 relative border border-gray-200 rounded-lg overflow-hidden bg-[url('https://media.istockphoto.com/id/1226505703/vector/transparent-background-seamless-pattern-vector-stock-illustration.jpg?s=612x612&w=0&k=20&c=J9_e3T_u6sYq5t0VqA-L9p9Z9y-j7Z5Z9y-j7Z5Z9y.jpg')]">
                         <canvas 
                            ref={canvasRef} 
                            className="max-w-full h-auto cursor-crosshair mx-auto block"
                            onClick={handleCanvasClick}
                         />
                         <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none flex items-center gap-1">
                             <MousePointer2 size={12} /> Click vào nền để xóa
                         </div>
                     </div>
                     <div className="w-64 space-y-4">
                         <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Độ nhạy (Tolerance): {tolerance}</label>
                            <input 
                                type="range" 
                                min="1" 
                                max="100" 
                                value={tolerance} 
                                onChange={(e) => {
                                    setTolerance(parseInt(e.target.value));
                                }}
                                onMouseUp={() => removeColor()}
                                className="w-full accent-rose-600"
                            />
                         </div>
                         <div className="flex items-center gap-2">
                             <div 
                                className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                                style={{backgroundColor: `rgb(${targetColor.r},${targetColor.g},${targetColor.b})`}}
                             />
                             <span className="text-xs text-gray-500">Màu đang chọn</span>
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
                             className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center justify-center gap-2"
                         >
                             <Download size={16} /> Tải ảnh về
                         </button>
                         <button 
                             onClick={() => {
                                setImage(null);
                                setProcessedImage(null);
                             }}
                             className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg"
                         >
                             Chọn ảnh khác
                         </button>
                     </div>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default BgRemover;