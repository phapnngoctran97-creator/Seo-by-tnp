import React, { useState, useEffect } from 'react';
import { X, Key, Save, ExternalLink, Bot, Cpu, Zap } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Provider = 'gemini' | 'openai' | 'deepseek';

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Provider>('gemini');
  const [keys, setKeys] = useState({
    gemini: '',
    openai: '',
    deepseek: ''
  });

  useEffect(() => {
    if (isOpen) {
      setKeys({
        gemini: localStorage.getItem('gemini_api_key') || '',
        openai: localStorage.getItem('openai_api_key') || '',
        deepseek: localStorage.getItem('deepseek_api_key') || ''
      });
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', keys.gemini.trim());
    localStorage.setItem('openai_api_key', keys.openai.trim());
    localStorage.setItem('deepseek_api_key', keys.deepseek.trim());
    
    onClose();
    alert('Đã lưu cấu hình API Keys thành công!');
  };

  const handleClear = (provider: Provider) => {
    if (confirm(`Bạn có chắc muốn xóa Key của ${provider.toUpperCase()}?`)) {
      setKeys(prev => ({ ...prev, [provider]: '' }));
      localStorage.removeItem(`${provider}_api_key`);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'gemini', label: 'Google Gemini', icon: Bot, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'openai', label: 'OpenAI (GPT)', icon: Zap, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'deepseek', label: 'DeepSeek', icon: Cpu, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
           <h3 className="font-bold text-gray-800 flex items-center gap-2">
             <Key className="w-5 h-5 text-indigo-600" /> Quản Lý API Keys
           </h3>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Provider)}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all border-b-2 ${
                  isActive 
                    ? `border-indigo-600 ${tab.bg} ${tab.color}` 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
           <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 leading-relaxed">
             <strong>Lưu ý:</strong> API Key chỉ được sử dụng cho các tính năng AI (Tạo Meta, Dàn ý, Check đạo văn). <br/>
             Các công cụ như <em>Nén ảnh, Resize, Đếm từ...</em> hoạt động offline trên trình duyệt, không cần Key.
           </div>

           {activeTab === 'gemini' && (
             <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Gemini API Key (Khuyên dùng)</label>
               <input 
                 type="password" 
                 value={keys.gemini}
                 onChange={(e) => setKeys({...keys, gemini: e.target.value})}
                 placeholder="AIzaSy..."
                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-sm mb-2"
               />
               <div className="flex justify-between items-center text-xs">
                 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                   Lấy Key miễn phí <ExternalLink className="w-3 h-3" />
                 </a>
                 {keys.gemini && <button onClick={() => handleClear('gemini')} className="text-red-500 hover:text-red-700">Xóa</button>}
               </div>
             </div>
           )}

           {activeTab === 'openai' && (
             <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <label className="block text-xs font-bold text-gray-700 uppercase mb-2">OpenAI API Key (GPT-4o/Mini)</label>
               <input 
                 type="password" 
                 value={keys.openai}
                 onChange={(e) => setKeys({...keys, openai: e.target.value})}
                 placeholder="sk-..."
                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none font-mono text-sm mb-2"
               />
               <div className="flex justify-between items-center text-xs">
                 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-green-600 hover:underline flex items-center gap-1">
                   Lấy Key OpenAI <ExternalLink className="w-3 h-3" />
                 </a>
                 {keys.openai && <button onClick={() => handleClear('openai')} className="text-red-500 hover:text-red-700">Xóa</button>}
               </div>
               <p className="mt-3 text-xs text-gray-500 italic">Hiện tại hệ thống đang ưu tiên Gemini. Key OpenAI sẽ được tích hợp trong bản cập nhật sau.</p>
             </div>
           )}

           {activeTab === 'deepseek' && (
             <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <label className="block text-xs font-bold text-gray-700 uppercase mb-2">DeepSeek API Key</label>
               <input 
                 type="password" 
                 value={keys.deepseek}
                 onChange={(e) => setKeys({...keys, deepseek: e.target.value})}
                 placeholder="ds-..."
                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm mb-2"
               />
               <div className="flex justify-between items-center text-xs">
                 <a href="https://platform.deepseek.com/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                   Dashboard DeepSeek <ExternalLink className="w-3 h-3" />
                 </a>
                 {keys.deepseek && <button onClick={() => handleClear('deepseek')} className="text-red-500 hover:text-red-700">Xóa</button>}
               </div>
               <p className="mt-3 text-xs text-gray-500 italic">Dành cho các tác vụ Code & Logic phức tạp (Coming soon).</p>
             </div>
           )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
           <button 
             onClick={handleSave}
             className="w-full py-3 rounded-lg font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5"
           >
             <Save className="w-4 h-4" /> Lưu Cấu Hình
           </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;