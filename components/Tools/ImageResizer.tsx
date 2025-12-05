import React, { useState } from 'react';
import { Move, Upload, Download, ArrowRight, Lock, Unlock } from 'lucide-react';

const ImageResizer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

  const handleDownload = () => {
      if (!image) return;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = image;
      img.onload = () => {
          ctx?.drawImage(img, 0, 0, width, height);
          const link = document.createElement('a');
          link.download = `resized_${width}x${height}.jpg`;
          link.href = canvas.toDataURL('image/jpeg', 0.9);
          link.click();
      };
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Move className="text-sky-600" /> Resize Ảnh Tự Động
        </h2>
        <p className="text-gray-600 mt-2">Thay đổi kích thước ảnh theo pixel chính xác.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
         {!image ? (
             <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                 <input type="file" id="resize-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                 <label htmlFor="resize-upload" className="cursor-pointer flex flex-col items-center">
                     <Upload className="w-12 h-12 text-sky-300 mb-3" />
                     <span className="text-gray-600 font-medium">Tải ảnh lên</span>
                 </label>
             </div>
         ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                 <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                     <img src={image} alt="Preview" className="max-h-[300px] object-contain shadow-sm" />
                     <p className="mt-2 text-sm text-gray-500">Gốc: {originalDims.w} x {originalDims.h} px</p>
                 </div>

                 <div className="space-y-6">
                     <h3 className="font-semibold text-gray-800 border-b pb-2">Cấu hình kích thước</h3>
                     
                     <div className="flex items-end gap-2">
                         <div className="flex-1">
                             <label className="block text-sm font-medium text-gray-700 mb-1">Chiều rộng (px)</label>
                             <input 
                                type="number" 
                                value={width} 
                                onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-sky-500 focus:outline-none"
                             />
                         </div>
                         <button 
                            onClick={() => setLockRatio(!lockRatio)}
                            className={`p-2 mb-0.5 rounded ${lockRatio ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-400'}`}
                            title="Khóa tỷ lệ"
                         >
                             {lockRatio ? <Lock size={20} /> : <Unlock size={20} />}
                         </button>
                         <div className="flex-1">
                             <label className="block text-sm font-medium text-gray-700 mb-1">Chiều cao (px)</label>
                             <input 
                                type="number" 
                                value={height} 
                                onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-sky-500 focus:outline-none"
                             />
                         </div>
                     </div>

                     <div className="flex flex-wrap gap-2">
                         {[0.25, 0.5, 0.75].map(ratio => (
                             <button 
                                key={ratio}
                                onClick={() => {
                                    setWidth(Math.round(originalDims.w * ratio));
                                    setHeight(Math.round(originalDims.h * ratio));
                                }}
                                className="text-xs px-3 py-1 bg-gray-100 hover:bg-sky-50 text-gray-600 hover:text-sky-600 rounded transition-colors"
                             >
                                 {ratio * 100}%
                             </button>
                         ))}
                     </div>

                     <button 
                        onClick={handleDownload}
                        className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 shadow-md hover:-translate-y-1 transition-all"
                     >
                         <Download size={20} /> Tải ảnh đã Resize
                     </button>

                     <button onClick={() => setImage(null)} className="w-full text-sm text-gray-500 hover:text-red-500">
                         Chọn ảnh khác
                     </button>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};

export default ImageResizer;