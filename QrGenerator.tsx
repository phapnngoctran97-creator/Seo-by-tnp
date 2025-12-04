import React, { useState } from 'react';
import { QrCode, Download, Link as LinkIcon } from 'lucide-react';

const QrGenerator: React.FC = () => {
  const [text, setText] = useState('https://example.com');
  const [size, setSize] = useState('250');
  const [color, setColor] = useState('000000');
  const [bgColor, setBgColor] = useState('ffffff');

  // Using goqr.me API for simplicity and no external npm dependency handling issues in runtime
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${color}&bgcolor=${bgColor}`;

  const handleDownload = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qrcode.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed", e);
      alert("Không thể tải ảnh trực tiếp. Vui lòng chuột phải vào ảnh và chọn 'Lưu ảnh'.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <QrCode className="text-purple-600" /> Tạo Mã QR Code
        </h2>
        <p className="text-gray-600 mt-2">Tạo mã QR liên kết cho Website, WiFi, hoặc Danh thiếp doanh nghiệp.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Đường dẫn hoặc nội dung</label>
          <div className="relative mb-4">
             <LinkIcon className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
             <input
              type="text"
              className="w-full pl-9 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="https://website-cua-ban.com"
              value={text}
              onChange={(e) => setText(e.target.value)}
             />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Màu QR</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-2">
                <input 
                  type="color" 
                  value={`#${color}`}
                  onChange={(e) => setColor(e.target.value.substring(1))}
                  className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                />
                <span className="text-sm text-gray-600 font-mono">#{color}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Màu nền</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-2">
                <input 
                  type="color" 
                  value={`#${bgColor}`}
                  onChange={(e) => setBgColor(e.target.value.substring(1))}
                  className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                />
                <span className="text-sm text-gray-600 font-mono">#{bgColor}</span>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
             <label className="block text-sm font-medium text-gray-700 mb-2">Kích thước: {size}px</label>
             <input 
               type="range" 
               min="150" 
               max="500" 
               step="50"
               value={size}
               onChange={(e) => setSize(e.target.value)}
               className="w-full accent-purple-600" 
             />
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
           <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
             {text ? (
                <img 
                  src={qrUrl} 
                  alt="QR Code" 
                  className="rounded-lg border border-gray-100"
                  style={{ width: `${Math.min(parseInt(size), 300)}px`, height: `${Math.min(parseInt(size), 300)}px` }}
                />
             ) : (
                <div className="w-[250px] h-[250px] bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg">
                  Nhập dữ liệu
                </div>
             )}
           </div>
           
           <button 
             onClick={handleDownload}
             disabled={!text}
             className="mt-6 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-medium shadow-lg transition-transform hover:-translate-y-1"
           >
             <Download className="w-4 h-4" /> Tải Xuống PNG
           </button>
        </div>
      </div>
    </div>
  );
};

export default QrGenerator;