
import React, { useState } from 'react';
import { generateLandingLayout } from '../../services/geminiService';
import { Layout, Copy, Check, Loader2 } from 'lucide-react';

const LandingLayoutGen: React.FC = () => {
  const [product, setProduct] = useState('');
  const [industry, setIndustry] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!product) return;
    setLoading(true);
    setResult('');
    try {
      const data = await generateLandingLayout(product, industry);
      setResult(data);
    } catch (err) {
      setResult("Lỗi kết nối AI.");
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
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Layout className="text-purple-600" /> Gợi Ý Layout Landing Page
        </h2>
        <p className="text-gray-600 mt-1">Xây dựng cấu trúc Landing Page (Sales Page) tỷ lệ chuyển đổi cao theo mô hình AIDA/PAS.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
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
              {loading ? 'Đang thiết kế...' : 'Tạo Layout'}
            </button>
           </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
           <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Cấu trúc Landing Page</h3>
              {result && (
                <button onClick={handleCopy} className="flex items-center gap-1 text-xs bg-white border px-2 py-1 rounded">
                   {copied ? <Check size={14} className="text-green-600"/> : <Copy size={14}/>} {copied ? 'Đã copy' : 'Copy'}
                </button>
              )}
           </div>
           <div className="flex-1 overflow-y-auto p-6 bg-white prose prose-purple max-w-none">
              {result ? (
                 <div className="whitespace-pre-wrap">{result}</div>
              ) : (
                 <div className="text-center text-gray-400 mt-20">
                    Bố cục sẽ hiển thị ở đây
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default LandingLayoutGen;
