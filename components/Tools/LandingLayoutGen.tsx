
import React, { useState } from 'react';
import { generateLandingLayout } from '../../services/geminiService';
import { Layout, Copy, Check, Loader2, Code, Eye, Smartphone, Monitor } from 'lucide-react';

const LandingLayoutGen: React.FC = () => {
  const [product, setProduct] = useState('');
  const [industry, setIndustry] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');

  const handleGenerate = async () => {
    if (!product) return;
    setLoading(true);
    setResult('');
    // Switch to preview automatically when generating new content
    setViewMode('preview');
    try {
      const data = await generateLandingLayout(product, industry);
      setResult(data);
    } catch (err) {
      setResult("Lỗi kết nối AI. Vui lòng kiểm tra API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Layout className="text-purple-600" /> Tạo Layout Landing Page (HTML & Tailwind)
        </h2>
        <p className="text-gray-600 mt-1">AI thiết kế giao diện Landing Page hoàn chỉnh, có thể xem trước và copy code.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        
        {/* INPUT COLUMN */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-fit">
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm / Ưu đãi</label>
               <input 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="VD: Ebook hướng dẫn đầu tư..."
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Ngành hàng</label>
               <input 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="VD: Tài chính, Làm đẹp, Giáo dục..."
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
               />
             </div>

             <button
              onClick={handleGenerate}
              disabled={loading || !product}
              className={`w-full py-3 rounded-lg font-bold text-white flex justify-center items-center gap-2 transition-all ${
                loading ? 'bg-purple-300' : 'bg-purple-600 hover:bg-purple-700 shadow-md'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Layout size={20} />}
              {loading ? 'Đang thiết kế...' : 'Tạo Landing Page'}
            </button>
           </div>
           
           <div className="mt-6 p-4 bg-purple-50 text-purple-800 rounded-lg text-sm border border-purple-100">
              <strong>Mẹo:</strong> AI sẽ tạo ra một trang HTML5 đầy đủ sử dụng <b>Tailwind CSS</b>. Bạn có thể copy code này và chạy trực tiếp trên trình duyệt.
           </div>
        </div>

        {/* OUTPUT COLUMN */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
           <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              
              {/* Left Controls: View Mode */}
              <div className="flex gap-2">
                 <button 
                    onClick={() => setViewMode('preview')}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'preview' ? 'bg-purple-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-100'}`}
                 >
                    <Eye size={16} /> Xem Giao Diện
                 </button>
                 <button 
                    onClick={() => setViewMode('code')}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'code' ? 'bg-purple-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-100'}`}
                 >
                    <Code size={16} /> Xem Code
                 </button>
              </div>

              {/* Center Controls: Device Mode (Only for Preview) */}
              {viewMode === 'preview' && (
                 <div className="flex bg-gray-200 p-1 rounded-lg">
                    <button 
                      onClick={() => setDeviceMode('desktop')}
                      className={`p-1.5 rounded ${deviceMode === 'desktop' ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                      title="Desktop View"
                    >
                       <Monitor size={18} />
                    </button>
                    <button 
                      onClick={() => setDeviceMode('mobile')}
                      className={`p-1.5 rounded ${deviceMode === 'mobile' ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                      title="Mobile View"
                    >
                       <Smartphone size={18} />
                    </button>
                 </div>
              )}

              {/* Right Controls: Copy */}
              <div>
                {result && (
                  <button onClick={handleCopy} className="flex items-center gap-1 text-xs bg-white border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 font-medium text-gray-700">
                     {copied ? <Check size={14} className="text-green-600"/> : <Copy size={14}/>} {copied ? 'Đã copy' : 'Copy HTML'}
                  </button>
                )}
              </div>
           </div>

           <div className="flex-1 bg-gray-100 relative overflow-hidden flex justify-center">
              {result ? (
                 viewMode === 'preview' ? (
                    <div className={`h-full transition-all duration-300 py-4 ${deviceMode === 'mobile' ? 'w-[375px]' : 'w-full px-4'}`}>
                       <iframe 
                          srcDoc={result} 
                          title="Landing Page Preview"
                          className={`w-full h-full bg-white shadow-xl ${deviceMode === 'mobile' ? 'rounded-3xl border-8 border-gray-800' : 'rounded-lg border border-gray-200'}`}
                       />
                    </div>
                 ) : (
                    <div className="w-full h-full overflow-auto p-4 bg-[#1e1e1e] text-blue-300 font-mono text-sm">
                        {result}
                    </div>
                 )
              ) : (
                 <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Layout className="w-16 h-16 mb-4 opacity-20" />
                    <p>Nhập thông tin và nhấn "Tạo Landing Page"<br/>để xem kết quả tại đây.</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default LandingLayoutGen;
