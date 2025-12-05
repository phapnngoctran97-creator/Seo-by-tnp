import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Upload, Download, RefreshCw, Clipboard } from 'lucide-react';

const ImageCompressor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [fileName, setFileName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.match(/image.*/)) {
      alert("Vui lòng chọn file ảnh (JPG, PNG, WEBP)");
      return;
    }
    setFileName(file.name || "image.png");
    setOriginalSize(file.size);
    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      compressImage(event.target?.result as string, quality);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // Paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            e.preventDefault();
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [quality]); // Re-bind if quality changes (though processFile uses current state, closure might trap old quality if not careful, but here compressImage is called with current quality val passed in arg is better, but state is safer)

  const compressImage = (base64Str: string, q: number) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const newBase64 = canvas.toDataURL('image/jpeg', q / 100);
        setCompressedImage(newBase64);
        
        // Calculate size roughly
        const stringLength = newBase64.length - 'data:image/jpeg;base64,'.length;
        const sizeInBytes = 4 * Math.ceil((stringLength / 3)) * 0.5624896334383812;
        setCompressedSize(sizeInBytes);
      }
    };
  };

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuality = parseInt(e.target.value);
    setQuality(newQuality);
    if (originalImage) {
      compressImage(originalImage, newQuality);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    if (compressedImage) {
      const link = document.createElement('a');
      link.href = compressedImage;
      link.download = `compressed_${fileName.split('.')[0] || 'image'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ImageIcon className="text-pink-600" /> Nén Ảnh Online
        </h2>
        <p className="text-gray-600 mt-2">Giảm dung lượng ảnh JPG/PNG nhanh chóng mà vẫn giữ chất lượng tốt.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {!originalImage ? (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mb-4">
               <Upload className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium text-gray-700">Kéo thả, Click hoặc Dán (Ctrl+V) ảnh</p>
            <p className="text-sm text-gray-400 mt-1">Hỗ trợ JPG, PNG, WEBP</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
               <Clipboard size={12} /> Hỗ trợ dán trực tiếp
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button 
                  onClick={() => {
                    setOriginalImage(null);
                    setCompressedImage(null);
                    setFileName('');
                  }}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500"
                >
                    <RefreshCw size={16} /> Chọn ảnh khác
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Original */}
                <div className="flex flex-col items-center">
                    <h3 className="font-semibold text-gray-700 mb-2">Gốc ({formatSize(originalSize)})</h3>
                    <img src={originalImage} alt="Original" className="max-h-[300px] object-contain rounded-lg border border-gray-200" />
                </div>

                {/* Compressed */}
                <div className="flex flex-col items-center">
                    <h3 className="font-semibold text-green-600 mb-2">
                        Đã nén ({formatSize(compressedSize)}) 
                        <span className="text-xs ml-2 bg-green-100 px-2 py-0.5 rounded text-green-700">
                           -{originalSize > 0 ? Math.round(((originalSize - compressedSize) / originalSize) * 100) : 0}%
                        </span>
                    </h3>
                    {compressedImage && (
                        <img src={compressedImage} alt="Compressed" className="max-h-[300px] object-contain rounded-lg border border-green-200 shadow-sm" />
                    )}
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
               <div className="mb-4">
                 <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                    <span>Chất lượng ảnh: {quality}%</span>
                    <span>Thấp</span>
                 </label>
                 <input 
                   type="range" 
                   min="1" 
                   max="100" 
                   value={quality} 
                   onChange={handleQualityChange}
                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                 />
               </div>
               
               <button 
                 onClick={handleDownload}
                 className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg transition-transform hover:-translate-y-1"
               >
                 <Download size={20} /> Tải ảnh xuống
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCompressor;