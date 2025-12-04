import React, { useState, useEffect } from 'react';
import { X, Key, Save, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) setApiKey(storedKey);
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      onClose();
      // Optional: Force reload if needed, but the service reads from localStorage every call so it's fine.
      alert('Đã lưu API Key thành công!');
    }
  };

  const handleClear = () => {
    if (confirm('Bạn có chắc chắn muốn xóa API Key?')) {
      localStorage.removeItem('gemini_api_key');
      setApiKey('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
           <h3 className="font-semibold text-gray-800 flex items-center gap-2">
             <Key className="w-4 h-4 text-indigo-600" /> Cài đặt API Key
           </h3>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>
        
        <div className="p-6">
           <p className="text-sm text-gray-600 mb-4 leading-relaxed">
             Để sử dụng các tính năng AI (Tạo Meta, Tư vấn tốc độ...), bạn cần cung cấp <strong>Gemini API Key</strong>. Key sẽ được lưu an toàn trên trình duyệt của bạn.
           </p>
           
           <div className="mb-5">
             <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nhập API Key</label>
             <input 
               type="password" 
               value={apiKey}
               onChange={(e) => setApiKey(e.target.value)}
               placeholder="AIzaSy..."
               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-sm"
             />
           </div>
           
           <div className="flex justify-between items-center mb-6">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-medium"
              >
                Lấy API Key miễn phí <ExternalLink className="w-3 h-3" />
              </a>
              {apiKey && (
                  <button onClick={handleClear} className="text-xs text-red-500 hover:text-red-700 font-medium">
                      Xóa Key
                  </button>
              )}
           </div>
           
           <button 
             onClick={handleSave}
             disabled={!apiKey.trim()}
             className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                !apiKey.trim() 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
             }`}
           >
             <Save className="w-4 h-4" /> Lưu Cấu Hình
           </button>
        </div>
      </div>
    </div>
  );
};
export default ApiKeyModal;