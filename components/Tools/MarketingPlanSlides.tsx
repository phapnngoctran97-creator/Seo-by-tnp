
import React, { useState } from 'react';
import { generateMarketingPlanSlides } from '../../services/geminiService';
import { Presentation, Download, Play, Check, Copy, Loader2, Monitor, Upload, FileBarChart, X } from 'lucide-react';

const MarketingPlanSlides: React.FC = () => {
  const [brandName, setBrandName] = useState('');
  const [period, setPeriod] = useState('');
  const [history, setHistory] = useState('');
  const [goals, setGoals] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  
  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string; data: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64String = evt.target?.result as string;
      // Remove data URL prefix for API
      const base64Data = base64String.split(',')[1];
      setUploadedFile({
        name: file.name,
        type: file.type,
        data: base64Data
      });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!brandName || !goals) return;
    setLoading(true);
    setViewMode('preview');
    try {
      const fileData = uploadedFile ? { mimeType: uploadedFile.type, data: uploadedFile.data } : null;
      const data = await generateMarketingPlanSlides(brandName, period, history, goals, fileData);
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
        <p className="text-gray-600 mt-1">AI tự động phân tích dữ liệu từ ảnh/text và tạo bộ slide kế hoạch hoàn chỉnh.</p>
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

             {/* File Upload Section */}
             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <label className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-2">
                   <FileBarChart size={18} /> Phân tích dữ liệu tự động
                </label>
                <p className="text-xs text-blue-600 mb-3 leading-relaxed">
                   Tải lên ảnh chụp màn hình Dashboard (FB Ads, Google Ads, GA4) hoặc file Excel/CSV dạng ảnh/text. AI sẽ tự động đọc số liệu để đưa vào slide.
                </p>
                
                {!uploadedFile ? (
                   <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors bg-white">
                      <Upload className="w-6 h-6 text-blue-400 mb-1" />
                      <span className="text-xs text-gray-500">Click hoặc kéo thả file ảnh/text</span>
                      <input type="file" className="hidden" accept="image/*,.txt,.csv" onChange={handleFileChange} />
                   </label>
                ) : (
                   <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                      <div className="flex items-center gap-2 overflow-hidden">
                         <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-bold text-xs">
                            {uploadedFile.type.includes('image') ? 'IMG' : 'TXT'}
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{uploadedFile.name}</p>
                            <p className="text-xs text-green-600">Đã sẵn sàng phân tích</p>
                         </div>
                      </div>
                      <button onClick={() => setUploadedFile(null)} className="text-gray-400 hover:text-red-500 p-1">
                         <X size={16} />
                      </button>
                   </div>
                )}
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm về lịch sử (Tùy chọn)</label>
               <textarea 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  rows={2}
                  placeholder="Bổ sung thông tin nếu không có trong file..."
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
               />
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
              {loading ? 'Đang phân tích & tạo Slide...' : 'Tạo Slide Ngay'}
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
                    <p>Nhập thông tin, tải ảnh báo cáo và nhấn nút tạo.</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingPlanSlides;
