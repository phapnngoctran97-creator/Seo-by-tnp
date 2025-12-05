import React, { useState, useRef, useEffect } from 'react';
import { Palette, Download, Type, Image as ImageIcon } from 'lucide-react';

const BannerCreator: React.FC = () => {
  const [platform, setPlatform] = useState<'facebook' | 'youtube'>('facebook');
  const [text, setText] = useState('Tiêu đề của bạn');
  const [subText, setSubText] = useState('Mô tả ngắn ở đây');
  const [bgColor, setBgColor] = useState('#1e293b');
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dimensions
  const DIMS = {
      facebook: { w: 820, h: 312, label: 'Facebook Cover (820x312)' },
      youtube: { w: 1280, h: 720, label: 'YouTube Thumbnail/Cover (1280x720)' } // Scaled down YT Cover for simplicity
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
              const img = new Image();
              img.src = evt.target?.result as string;
              img.onload = () => setBgImage(img);
          };
          reader.readAsDataURL(file);
      }
  };

  useEffect(() => {
      draw();
  }, [platform, text, subText, bgColor, bgImage]);

  const draw = () => {
      const canvas = canvasRef.current;
      if(!canvas) return;
      const ctx = canvas.getContext('2d');
      if(!ctx) return;
      
      const { w, h } = DIMS[platform];
      canvas.width = w;
      canvas.height = h;

      // Draw BG
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
      
      if(bgImage) {
          // Cover fit
          const scale = Math.max(w / bgImage.width, h / bgImage.height);
          const x = (w / 2) - (bgImage.width / 2) * scale;
          const y = (h / 2) - (bgImage.height / 2) * scale;
          ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);
          
          // Overlay to make text readable
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.fillRect(0, 0, w, h);
      }

      // Draw Text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Main Title
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${platform === 'youtube' ? '80px' : '48px'} Inter, sans-serif`;
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 10;
      ctx.fillText(text, w / 2, h / 2 - (platform === 'youtube' ? 30 : 20));

      // Subtitle
      ctx.font = `${platform === 'youtube' ? '40px' : '24px'} Inter, sans-serif`;
      ctx.fillText(subText, w / 2, h / 2 + (platform === 'youtube' ? 50 : 30));
  };

  const handleDownload = () => {
      const canvas = canvasRef.current;
      if(canvas) {
          const link = document.createElement('a');
          link.download = `${platform}_banner.png`;
          link.href = canvas.toDataURL();
          link.click();
      }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Palette className="text-amber-600" /> Tạo Banner Nhanh
        </h2>
        <p className="text-gray-600 mt-2">Tạo ảnh bìa Facebook, YouTube Thumbnail đơn giản.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4 bg-white p-5 rounded-xl border border-gray-100">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại Banner</label>
                  <div className="flex gap-2">
                      <button 
                        onClick={() => setPlatform('facebook')}
                        className={`flex-1 py-2 text-sm rounded ${platform === 'facebook' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                          Facebook
                      </button>
                      <button 
                        onClick={() => setPlatform('youtube')}
                        className={`flex-1 py-2 text-sm rounded ${platform === 'youtube' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                          YouTube
                      </button>
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
                  <input 
                    type="text" 
                    value={text} 
                    onChange={(e) => setText(e.target.value)} 
                    className="w-full p-2 mb-2 border rounded" 
                    placeholder="Tiêu đề chính"
                  />
                  <input 
                    type="text" 
                    value={subText} 
                    onChange={(e) => setSubText(e.target.value)} 
                    className="w-full p-2 border rounded" 
                    placeholder="Phụ đề"
                  />
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nền</label>
                  <div className="flex gap-2 mb-2">
                      <input 
                        type="color" 
                        value={bgColor} 
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-10 w-10 p-0 border-0 rounded cursor-pointer"
                      />
                      <label className="flex-1 flex items-center justify-center bg-gray-100 rounded cursor-pointer hover:bg-gray-200 text-sm text-gray-600">
                          <ImageIcon size={16} className="mr-2" /> Ảnh nền
                          <input type="file" className="hidden" accept="image/*" onChange={handleBgUpload} />
                      </label>
                  </div>
                  {bgImage && <button onClick={() => setBgImage(null)} className="text-xs text-red-500 underline">Xóa ảnh nền</button>}
              </div>
          </div>

          <div className="lg:col-span-2 bg-gray-200 rounded-xl p-4 flex flex-col items-center justify-center overflow-hidden">
              <div className="shadow-2xl mb-4 max-w-full overflow-auto">
                 <canvas ref={canvasRef} className="max-w-full h-auto bg-white" />
              </div>
              <button 
                onClick={handleDownload}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-2 rounded-full font-medium flex items-center gap-2 shadow-lg"
              >
                  <Download size={18} /> Tải Banner
              </button>
          </div>
      </div>
    </div>
  );
};

export default BannerCreator;