import React, { useState, useRef, useEffect } from 'react';
import { Crop, Upload, Download, RotateCw, ZoomIn, Image as ImageIcon } from 'lucide-react';

const AvatarMaker: React.FC = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CANVAS_SIZE = 300;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
            setImage(img);
            setScale(1);
            setRotation(0);
            setPosition({ x: 0, y: 0 });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    draw();
  }, [image, scale, rotation, position]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Fill background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.save();
    
    // Create circle clip
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    // Move to center
    ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-CANVAS_SIZE / 2, -CANVAS_SIZE / 2);

    // Draw image centered
    const x = (CANVAS_SIZE - image.width) / 2 + position.x;
    const y = (CANVAS_SIZE - image.height) / 2 + position.y;
    ctx.drawImage(image, x, y);

    ctx.restore();
    
    // Draw border
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 2, 0, Math.PI * 2, true);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  };

  const handleDownload = () => {
    if (canvasRef.current) {
        const link = document.createElement('a');
        link.download = 'avatar.png';
        link.href = canvasRef.current.toDataURL();
        link.click();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Crop className="text-violet-600" /> Tạo Avatar Online
        </h2>
        <p className="text-gray-600 mt-2">Cắt ảnh đại diện hình tròn, zoom và xoay ảnh dễ dàng.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
            {!image ? (
                <div 
                    className="w-[300px] h-[300px] border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors bg-gray-50"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-gray-500 font-medium">Tải ảnh lên</span>
                </div>
            ) : (
                <div className="relative">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        className="cursor-move rounded-full shadow-lg border-4 border-white bg-white"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    />
                    <div className="absolute top-2 right-2">
                         <button onClick={() => setImage(null)} className="bg-white p-2 rounded-full shadow text-red-500 hover:bg-red-50">
                             <ImageIcon size={16} />
                         </button>
                    </div>
                </div>
            )}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
            />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <h3 className="font-semibold text-gray-800 mb-4">Điều chỉnh</h3>
            
            <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <ZoomIn size={16} /> Phóng to / Thu nhỏ
                </label>
                <input 
                    type="range" 
                    min="0.5" 
                    max="3" 
                    step="0.1" 
                    value={scale} 
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full accent-violet-600"
                    disabled={!image}
                />
            </div>

            <div className="mb-8">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <RotateCw size={16} /> Xoay ảnh
                </label>
                <input 
                    type="range" 
                    min="0" 
                    max="360" 
                    value={rotation} 
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full accent-violet-600"
                    disabled={!image}
                />
            </div>

            <button 
                onClick={handleDownload}
                disabled={!image}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                    !image ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700 text-white shadow-md hover:-translate-y-1'
                }`}
            >
                <Download size={20} /> Tải Avatar
            </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarMaker;