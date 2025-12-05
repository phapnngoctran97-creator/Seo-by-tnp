
import React, { useState, useRef, useEffect } from 'react';
import { 
  Facebook, Upload, Download, RefreshCw, Type, Image as ImageIcon, 
  Monitor, Layers, Sliders, UploadCloud, Move, ZoomIn, MousePointer2, 
  Check, Grid3X3, Maximize, RotateCw
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
];

const FacebookCreator: React.FC = () => {
  // --- STATE ---
  const [format, setFormat] = useState<Format>(FB_FORMATS[0]);
  
  // Background Image State
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imgPos, setImgPos] = useState({ x: 0, y: 0, scale: 1 });
  const [filters, setFilters] = useState({ brightness: 100, contrast: 100, saturate: 100 });

  // Watermark State
  const [wmType, setWmType] = useState<'none' | 'text' | 'image'>('none');
  const [wmMode, setWmMode] = useState<'single' | 'tiled'>('single'); // Single or Pattern
  const [wmText, setWmText] = useState('Bản quyền thuộc về tôi');
  const [wmImage, setWmImage] = useState<HTMLImageElement | null>(null);
  
  const [wmConfig, setWmConfig] = useState({ 
    x: 0, y: 0, // Coordinates relative to center (for Single mode)
    scale: 1,   // Size multiplier
    opacity: 0.5, 
    color: '#ffffff',
    fontSize: 40,
    rotation: 0, // Angle in degrees
    density: 3,  // For tiled mode (3x3, 4x4...)
    stagger: true // So le for tiled mode
  });

  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<'bg' | 'wm' | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [canvasScale, setCanvasScale] = useState(1); // Visual scale of canvas on screen

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- HANDLERS ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.src = evt.target?.result as string;
        img.onload = () => {
          setImage(img);
          setImgPos({ x: 0, y: 0, scale: 1 }); // Reset pos
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
          setWmConfig(prev => ({ ...prev, scale: 0.2, opacity: 0.8 })); // Reset defaults
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // --- DRAWING LOGIC ---
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Setup
    canvas.width = format.w;
    canvas.height = format.h;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Fill BG
    ctx.fillStyle = '#f0f2f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Background Image
    if (image) {
      ctx.save();
      ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%)`;
      
      ctx.translate(centerX + imgPos.x, centerY + imgPos.y);
      ctx.scale(imgPos.scale, imgPos.scale);
      ctx.drawImage(image, -image.width / 2, -image.height / 2);
      ctx.restore();
    } else {
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'center';
      ctx.font = 'bold 40px Inter, sans-serif';
      ctx.fillText("Kéo thả hoặc tải ảnh lên", centerX, centerY);
    }

    // 3. Draw Watermark
    if (wmType !== 'none') {
      ctx.save();
      ctx.globalAlpha = wmConfig.opacity;

      // Helper function to draw a single watermark item at (0,0)
      const drawItem = () => {
          // Apply individual rotation
          ctx.rotate((wmConfig.rotation * Math.PI) / 180);

          if (wmType === 'text') {
            ctx.fillStyle = wmConfig.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${wmConfig.fontSize * wmConfig.scale}px Inter, sans-serif`;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.fillText(wmText, 0, 0);
            
            // Draw Selection Box (Only if single mode and dragging)
            if (wmMode === 'single' && dragTarget === 'wm') {
                const metrics = ctx.measureText(wmText);
                const h = wmConfig.fontSize * wmConfig.scale; 
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#3b82f6';
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(-metrics.width/2 - 10, -h/2 - 10, metrics.width + 20, h + 20);
            }

          } else if (wmType === 'image' && wmImage) {
            const targetW = format.w * wmConfig.scale;
            const ratio = wmImage.width / wmImage.height;
            const targetH = targetW / ratio;
            
            ctx.drawImage(wmImage, -targetW/2, -targetH/2, targetW, targetH);

            if (wmMode === 'single' && dragTarget === 'wm') {
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#3b82f6';
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(-targetW/2 - 5, -targetH/2 - 5, targetW + 10, targetH + 10);
            }
          }
      };

      if (wmMode === 'single') {
          // SINGLE MODE: Draw at specific X, Y
          ctx.translate(centerX + wmConfig.x, centerY + wmConfig.y);
          drawItem();
      } else {
          // TILED MODE: Draw grid
          const density = Math.max(1, wmConfig.density);
          const stepX = canvas.width / density;
          const stepY = canvas.height / density;

          // Extend loop to cover rotation edges if needed, but keeping simple for now
          // Shift start to ensure coverage when rotated or staggered
          for (let row = -1; row <= density + 1; row++) {
              for (let col = -1; col <= density + 1; col++) {
                  ctx.save();
                  
                  let x = (col * stepX) + (stepX / 2); // Center alignment
                  let y = (row * stepY) + (stepY / 2);
                  
                  // Stagger effect (so le)
                  if (wmConfig.stagger && row % 2 !== 0) {
                      x += stepX / 2;
                  }

                  ctx.translate(x, y);
                  drawItem();
                  ctx.restore();
              }
          }
      }

      ctx.restore();
    }
  };

  // Trigger draw on any state change
  useEffect(() => {
    draw();
  }, [format, image, imgPos, filters, wmType, wmText, wmImage, wmConfig, dragTarget, wmMode]);

  // Fit canvas to screen
  useEffect(() => {
    const resize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const scale = Math.min((clientWidth - 40) / format.w, (clientHeight - 40) / format.h);
        setCanvasScale(scale);
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [format]);


  // --- INTERACTION ---

  const getCanvasCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // Hit detection only relevant for Single mode dragging
  const isHitWatermark = (cx: number, cy: number) => {
      if (wmType === 'none' || wmMode === 'tiled') return false; // Disable dragging in tiled mode
      
      const centerX = format.w / 2;
      const centerY = format.h / 2;
      const wx = centerX + wmConfig.x;
      const wy = centerY + wmConfig.y;
      
      // Simple bounding box approximation
      const boxSize = wmType === 'image' ? (format.w * wmConfig.scale) : (wmConfig.fontSize * wmConfig.scale * wmText.length * 0.6);
      const half = boxSize / 2;

      return (cx >= wx - half && cx <= wx + half && cy >= wy - half && cy <= wy + half);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCanvasCoords(e);
    
    // Check hit watermark first (layer on top)
    if (isHitWatermark(x, y)) {
        setDragTarget('wm');
        setStartPos({ x: x - wmConfig.x, y: y - wmConfig.y });
    } else {
        setDragTarget('bg');
        setStartPos({ x: x - imgPos.x, y: y - imgPos.y });
    }
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) {
        // Just hover effect
        const { x, y } = getCanvasCoords(e);
        if (canvasRef.current) {
            canvasRef.current.style.cursor = isHitWatermark(x, y) ? 'move' : 'default';
        }
        return;
    }

    const { x, y } = getCanvasCoords(e);

    if (dragTarget === 'wm') {
        setWmConfig(prev => ({ ...prev, x: x - startPos.x, y: y - startPos.y }));
    } else if (dragTarget === 'bg') {
        setImgPos(prev => ({ ...prev, x: x - startPos.x, y: y - startPos.y }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragTarget(null);
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `fb_post_${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL('image/png', 1.0);
      link.click();
    }
  };

  const handleConnectFB = () => {
      if (confirm("Hệ thống sẽ tải ảnh về máy và mở Meta Business Suite để bạn đăng bài.\n(Do chính sách bảo mật, trình duyệt không thể tự động đăng bài nếu không có Server Backend).")) {
          handleDownload();
          window.open('https://business.facebook.com/latest/home', '_blank');
      }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Facebook className="text-blue-600" /> Facebook Creator Studio (Pro)
        </h2>
        <p className="text-gray-600 mt-2">Thiết kế ảnh tương tác Live: Kéo thả logo, chỉnh màu và đóng dấu bản quyền.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: TOOLS */}
        <div className="lg:col-span-4 space-y-5 h-[calc(100vh-180px)] overflow-y-auto pr-2 custom-scrollbar">
            
            {/* 1. Format & Upload */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                    {FB_FORMATS.map((f, i) => (
                        <button 
                            key={i} 
                            onClick={() => setFormat(f)}
                            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${format.label === f.label ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                
                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                    <div className="text-center">
                        <Upload className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                        <span className="text-sm font-bold text-gray-600">Chọn ảnh nền</span>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
            </div>

            {/* 2. Image Adjustments */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Sliders size={14}/> Chỉnh ảnh nền
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <ZoomIn size={14} className="text-gray-400" />
                        <input type="range" min="0.1" max="3" step="0.1" value={imgPos.scale} onChange={e => setImgPos({...imgPos, scale: parseFloat(e.target.value)})} className="flex-1 h-1.5 bg-gray-200 rounded-lg accent-blue-600" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Độ sáng</span> <span>{filters.brightness}%</span></div>
                        <input type="range" min="0" max="200" value={filters.brightness} onChange={e => setFilters({...filters, brightness: parseInt(e.target.value)})} className="w-full h-1.5 bg-gray-200 rounded-lg accent-blue-600" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Tương phản</span> <span>{filters.contrast}%</span></div>
                        <input type="range" min="0" max="200" value={filters.contrast} onChange={e => setFilters({...filters, contrast: parseInt(e.target.value)})} className="w-full h-1.5 bg-gray-200 rounded-lg accent-blue-600" />
                    </div>
                </div>
            </div>

            {/* 3. Watermark */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Layers size={14}/> Logo / Watermark
                </h3>
                
                {/* Type Selection */}
                <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                    {['none', 'text', 'image'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setWmType(t as any)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${wmType === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            {t === 'none' ? 'Không' : t === 'text' ? 'Chữ' : 'Ảnh'}
                        </button>
                    ))}
                </div>

                {wmType !== 'none' && (
                    <div className="space-y-4 animate-in fade-in">
                        
                        {/* Mode Selection: Single vs Tiled */}
                        <div className="flex items-center gap-4 text-sm mb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="wmMode" checked={wmMode === 'single'} onChange={() => setWmMode('single')} className="text-blue-600 focus:ring-blue-500" />
                                <span>Đơn (1 cái)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="wmMode" checked={wmMode === 'tiled'} onChange={() => setWmMode('tiled')} className="text-blue-600 focus:ring-blue-500" />
                                <span>Lưới (Phủ kín)</span>
                            </label>
                        </div>

                        {/* Content Input */}
                        {wmType === 'text' && (
                            <div className="space-y-3">
                                <input type="text" value={wmText} onChange={e => setWmText(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Nhập nội dung..." />
                                <div className="flex items-center gap-2">
                                    <input type="color" value={wmConfig.color} onChange={e => setWmConfig({...wmConfig, color: e.target.value})} className="w-8 h-8 p-0 border rounded cursor-pointer" />
                                    <span className="text-xs text-gray-500">Size:</span>
                                    <input type="range" min="10" max="150" value={wmConfig.fontSize} onChange={e => setWmConfig({...wmConfig, fontSize: parseInt(e.target.value)})} className="flex-1 h-1.5 bg-gray-200 rounded-lg accent-blue-600" />
                                </div>
                            </div>
                        )}

                        {wmType === 'image' && (
                            <div className="space-y-3">
                                <label className="block w-full py-2 px-3 border border-dashed border-gray-300 rounded text-center text-xs text-gray-500 hover:bg-gray-50 cursor-pointer">
                                    {wmImage ? 'Đổi logo khác' : 'Tải logo lên (PNG)'}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleWmImageUpload} />
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 w-12">Size:</span>
                                    <input type="range" min="0.05" max="1" step="0.05" value={wmConfig.scale} onChange={e => setWmConfig({...wmConfig, scale: parseFloat(e.target.value)})} className="flex-1 h-1.5 bg-gray-200 rounded-lg accent-blue-600" />
                                </div>
                            </div>
                        )}

                        {/* Common Controls */}
                        <div className="space-y-3 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-16">Độ mờ:</span>
                                <input type="range" min="0.1" max="1" step="0.1" value={wmConfig.opacity} onChange={e => setWmConfig({...wmConfig, opacity: parseFloat(e.target.value)})} className="flex-1 h-1.5 bg-gray-200 rounded-lg accent-blue-600" />
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-16">Xoay:</span>
                                <input type="range" min="-180" max="180" value={wmConfig.rotation} onChange={e => setWmConfig({...wmConfig, rotation: parseInt(e.target.value)})} className="flex-1 h-1.5 bg-gray-200 rounded-lg accent-blue-600" />
                                <span className="text-[10px] w-6 text-right">{wmConfig.rotation}°</span>
                            </div>

                            {/* Tiled Specific Controls */}
                            {wmMode === 'tiled' && (
                                <div className="bg-blue-50 p-3 rounded-lg space-y-3 mt-2">
                                    <div className="flex items-center gap-2">
                                        <Grid3X3 size={14} className="text-blue-600" />
                                        <span className="text-xs font-bold text-blue-700">Mật độ lưới:</span>
                                        <input type="range" min="1" max="10" step="1" value={wmConfig.density} onChange={e => setWmConfig({...wmConfig, density: parseInt(e.target.value)})} className="flex-1 h-1.5 bg-blue-200 rounded-lg accent-blue-600" />
                                        <span className="text-xs font-bold text-blue-700">{wmConfig.density}x</span>
                                    </div>
                                    <label className="flex items-center gap-2 text-xs text-blue-700 cursor-pointer">
                                        <input type="checkbox" checked={wmConfig.stagger} onChange={e => setWmConfig({...wmConfig, stagger: e.target.checked})} className="rounded text-blue-600" />
                                        Sắp xếp so le (Sole)
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3">
                <button 
                    onClick={handleDownload}
                    className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                    <Download size={18} /> Tải Về Máy
                </button>
                <button 
                    onClick={handleConnectFB}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                    <UploadCloud size={18} /> Đăng Lên Facebook
                </button>
            </div>
        </div>

        {/* RIGHT: INTERACTIVE CANVAS */}
        <div className="lg:col-span-8 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center relative overflow-hidden h-[calc(100vh-180px)]" ref={containerRef}>
            
            {/* Toolbar Overlay */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm text-xs font-medium text-gray-600 flex items-center gap-4 z-10">
                <span className="flex items-center gap-1"><MousePointer2 size={12}/> Kéo thả nền</span>
                <div className="w-px h-3 bg-gray-300"></div>
                {wmMode === 'single' && wmType !== 'none' && (
                    <>
                        <span className="flex items-center gap-1"><Move size={12}/> Kéo Logo</span>
                        <div className="w-px h-3 bg-gray-300"></div>
                    </>
                )}
                <button onClick={() => { setImgPos({x:0, y:0, scale:1}); setWmConfig({...wmConfig, x:0, y:0, rotation: 0}); }} className="hover:text-blue-600 flex items-center gap-1">
                    <RefreshCw size={12}/> Reset
                </button>
            </div>

            <canvas 
                ref={canvasRef}
                style={{ 
                    width: `${format.w * canvasScale}px`, 
                    height: `${format.h * canvasScale}px`,
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    cursor: isDragging ? 'grabbing' : 'grab'
                }}
                className="bg-white"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />
        </div>

      </div>
    </div>
  );
};

export default FacebookCreator;
