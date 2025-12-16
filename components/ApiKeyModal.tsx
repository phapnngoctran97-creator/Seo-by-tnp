
import React, { useState, useEffect } from 'react';
import { X, Key, Save, ExternalLink, Bot, AlertTriangle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKey(localStorage.getItem('gemini_api_key') || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', apiKey.trim());
    window.location.reload(); // Reload to refresh Sidebar state and Service client
  };

  const handleClear = () => {
    if (confirm("Bạn có chắc muốn xóa API Key? Các tính năng AI sẽ bị vô hiệu hóa.")) {
      localStorage.removeItem('gemini_api_key');
      setApiKey('');
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-indigo-600 text-white">
           <h3 className="font-bold flex items-center gap-2">
             <Key className="w-5 h-5" /> Cấu Hình API Key
           </h3>
           <button onClick={onClose} className="text-indigo-200 hover:text-white p-1 rounded-full hover:bg-indigo-500 transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
           <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 flex gap-3">
             <AlertTriangle className="w-5 h-5 flex-shrink-0 text-yellow-600" />
             <div>
               <strong>Lưu ý quan trọng:</strong> <br/>
               Để sử dụng các tính năng AI (Viết bài, Tạo slide...), bạn cần có <strong>Google Gemini API Key</strong>. 
               Key sẽ được lưu vào trình duyệt (Local Storage) của bạn, không gửi đi đâu khác.
             </div>
           </div>

           <div className="space-y-4">
               <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Gemini API Key</label>
                   <input 
                     type="password" 
                     value={apiKey}
                     onChange={(e) => setApiKey(e.target.value)}
                     placeholder="AIzaSy..."
                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-sm"
                   />
               </div>

               <div className="flex justify-between items-center text-sm">
                 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 font-medium">
                   <ExternalLink className="w-3 h-3" /> Lấy Key miễn phí tại đây
                 </a>
                 {apiKey && <button onClick={handleClear} className="text-red-500 hover:text-red-700 text-xs">Xóa Key đã lưu</button>}
               </div>
           </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
           <button 
             onClick={onClose}
             className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-200 transition-all"
           >
             Đóng
           </button>
           <button 
             onClick={handleSave}
             className="px-6 py-2 rounded-lg font-bold text-white shadow-md flex items-center gap-2 transition-all bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5"
           >
             <Save className="w-4 h-4" /> Lưu & Áp Dụng
           </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
