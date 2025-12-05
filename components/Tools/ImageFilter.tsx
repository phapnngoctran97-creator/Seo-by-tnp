import React, { useState, useRef, useEffect } from 'react';
import { Aperture, Upload, Download, Droplet } from 'lucide-react';

const ImageFilter: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [filter, setFilter] = useState('none');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const filters = [
      { id: 'none', label: 'Bình thường', css: 'none' },
      { id: 'grayscale', label: 'Trắng đen', css: 'grayscale(100%)' },
      { id: 'sepia', label: 'Cổ điển (Sepia)', css: 'sepia(100%)' },
      { id: 'vintage', label: 'Vintage', css: 'sepia(50%) contrast(120%) brightness(90%)' },
      { id: 'contrast', label: 'Tương phản cao', css: 'contrast(150%)' },
      { id: 'blur', label: 'Làm mờ', css: 'blur(2px)' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
              setImage(evt.target?.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  useEffect(() => {
      if(image && canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.src = image;
          img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              if(ctx) {
                  ctx.filter = filters.find(f => f.id === filter)?.css || 'none';
                  ctx.drawImage(img, 0, 0);
              }
          }
      }
  }, [image, filter]);

  const handleDownload = () => {
      if(canvasRef.current) {
          const link = document.createElement('a');
          link.download = `filtered_${filter}.png`;
          link.href = canvasRef.current.toDataURL();
          link.click();
      }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Aperture className="text-fuchsia-600" /> Bộ Lọc Màu Ảnh
        </h2>
        <p className="text-gray-600 mt-2">Chuyển đổi màu sắc ảnh sang trắng đen, vintage, sepia nhanh chóng.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
         {!image ? (
             <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                 <input type="file" id="filter-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                 <label htmlFor="filter-upload" className="cursor-pointer flex flex-col items-center">
                     <Upload className="w-12 h-12 text-fuchsia-300 mb-3" />
                     <span className="text-gray-600 font-medium">Tải ảnh lên</span>
                 </label>
             </div>
         ) : (
             <div className="space-y-6">
                 <div className="flex gap-4 overflow-x-auto pb-4">
                     {filters.map(f => (
                         <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg border transition-colors ${
                                filter === f.id 
                                ? 'bg-fuchsia-600 text-white border-fuchsia-600' 
                                : 'bg-white text-gray-700 border-gray-200 hover:border-fuchsia-300'
                            }`}
                         >
                             {f.label}
                         </button>
                     ))}
                 </div>
                 
                 <div className="relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 min-h-[300px] flex items-center justify-center">
                     <canvas ref={canvasRef} className="max-w-full max-h-[500px]" />
                 </div>

                 <div className="flex gap-4">
                     <button 
                        onClick={handleDownload}
                        className="flex-1 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg"
                     >
                         <Download size={20} /> Tải ảnh về
                     </button>
                     <button 
                        onClick={() => setImage(null)}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-medium"
                     >
                         Chọn ảnh khác
                     </button>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};

export default ImageFilter;