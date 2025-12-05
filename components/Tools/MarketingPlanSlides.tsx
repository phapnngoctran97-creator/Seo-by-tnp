
import React, { useState } from 'react';
import { generateMarketingPlanSlides } from '../../services/geminiService';
import { Presentation, Download, Play, Check, Copy, Loader2, Monitor } from 'lucide-react';

const MarketingPlanSlides: React.FC = () => {
  const [brandName, setBrandName] = useState('');
  const [period, setPeriod] = useState('');
  const [history, setHistory] = useState('');
  const [goals, setGoals] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');

  const handleGenerate = async () => {
    if (!brandName || !goals) return;
    setLoading(true);
    setViewMode('preview');
    try {
      const data = await generateMarketingPlanSlides(brandName, period, history, goals);
      setResult(data);
    } catch (err) {
      alert("Lỗi kết nối AI. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Marketing_Plan_${brandName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Presentation className="text-indigo-600" /> Tạo Slide Kế Hoạch Marketing (HTML Presentation)
        </h2>
        <p className="text-gray-600 mt-1">AI tự động tạo bộ slide kế hoạch tháng/năm bao gồm phân tích, forecast và đề xuất.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* INPUT COLUMN */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-y-auto">
           <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Thông tin đầu vào</h3>
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Tên Thương Hiệu / Dự Án</label>
               <input 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="VD: VinFast, Highlands Coffee..."
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Giai đoạn lập kế hoạch</label>
               <input 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="VD: Kế hoạch Q4/2024, Kế hoạch năm 2025..."
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Số liệu quá khứ (History & Review)</label>
               <textarea 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  rows={4}
                  placeholder="VD: Doanh thu tháng trước đạt 500tr (tăng 10%). Chi phí Ads 100tr. Lượng khách hàng mới giảm nhẹ..."
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
               />
               <p className="text-xs text-gray-500 mt-1">Nhập tóm tắt các chỉ số quan trọng đã đạt được.</p>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu & Đề xuất (Forecast & Proposal)</label>
               <textarea 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  rows={4}
                  placeholder="VD: Mục tiêu tăng trưởng 20%. Đẩy mạnh kênh TikTok. Ra mắt sản phẩm mới vào tháng 6..."
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
               />
             </div>

             <button
              onClick={handleGenerate}
              disabled={loading || !brandName || !goals}
              className={`w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-all shadow-lg ${
                loading ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Play size={20} fill="currentColor" />}
              {loading ? 'Đang soạn thảo Slide...' : 'Tạo Slide Ngay'}
            </button>
           </div>
        </div>

        {/* OUTPUT COLUMN */}
        <div className="lg:col-span-8 bg-gray-900 rounded-xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden relative">
           {/* Top Bar */}
           <div className="p-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center text-white">
              <div className="flex items-center gap-2 text-sm">
                 <Monitor size={16} className="text-indigo-400" />
                 <span className="font-mono">Live Preview</span>
              </div>
              
              <div className="flex gap-2">
                 <button 
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                 >
                    Slide View
                 </button>
                 <button 
                    onClick={() => setViewMode('code')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === 'code' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                 >
                    HTML Code
                 </button>
                 {result && (
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium bg-green-600 hover:bg-green-700 text-white transition-colors ml-2"
                    >
                        <Download size={14} /> Tải file HTML
                    </button>
                 )}
              </div>
           </div>

           {/* Content Area */}
           <div className="flex-1 bg-black relative flex items-center justify-center">
              {result ? (
                 viewMode === 'preview' ? (
                    <iframe 
                       srcDoc={result}
                       className="w-full h-full border-0 bg-white"
                       title="Slide Preview"
                    />
                 ) : (
                    <div className="w-full h-full overflow-auto p-4 bg-[#1e1e1e] text-green-400 font-mono text-xs">
                        {result}
                    </div>
                 )
              ) : (
                 <div className="text-center text-gray-500">
                    <Presentation className="w-20 h-20 mx-auto mb-4 opacity-20" />
                    <p>Nhập thông tin và nhấn nút tạo để xem bản trình bày.</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingPlanSlides;
