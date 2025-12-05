
import React, { useState } from 'react';
import { generateAdsStructure } from '../../services/geminiService';
import { Network, Copy, Check, Loader2, AlertCircle } from 'lucide-react';

const AdsStructureGen: React.FC = () => {
  const [product, setProduct] = useState('');
  const [goal, setGoal] = useState('');
  const [platform, setPlatform] = useState<'Facebook' | 'Google'>('Facebook');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!product || !goal) return;
    setLoading(true);
    setResult('');
    try {
      const data = await generateAdsStructure(product, platform, goal);
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
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Network className="text-blue-600" /> Tạo Cấu Trúc Chiến Dịch Ads (Campaign Structure)
        </h2>
        <p className="text-gray-600 mt-1">Xây dựng sơ đồ Campaign, Ad Set và Ads tối ưu cho Facebook/Google.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
           <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nền tảng</label>
                <div className="flex gap-2">
                    <button 
                      onClick={() => setPlatform('Facebook')}
                      className={`flex-1 py-2 rounded text-sm ${platform === 'Facebook' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Facebook Ads
                    </button>
                    <button 
                      onClick={() => setPlatform('Google')}
                      className={`flex-1 py-2 rounded text-sm ${platform === 'Google' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Google Ads
                    </button>
                </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm / Dịch vụ</label>
               <input 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: Khóa học tiếng Anh online..."
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu chiến dịch</label>
               <input 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: Tìm kiếm khách hàng tiềm năng (Leads), Doanh số..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
               />
             </div>

             <button
              onClick={handleGenerate}
              disabled={loading || !product}
              className={`w-full py-3 rounded-lg font-bold text-white flex justify-center items-center gap-2 transition-all ${
                loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Network size={20} />}
              {loading ? 'Đang tạo cấu trúc...' : 'Tạo Cấu Trúc'}
            </button>
           </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
           <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Sơ đồ chiến dịch gợi ý</h3>
              {result && (
                <button onClick={handleCopy} className="flex items-center gap-1 text-xs bg-white border px-2 py-1 rounded">
                   {copied ? <Check size={14} className="text-green-600"/> : <Copy size={14}/>} {copied ? 'Đã copy' : 'Copy'}
                </button>
              )}
           </div>
           <div className="flex-1 overflow-y-auto p-6 bg-white prose prose-blue max-w-none">
              {result ? (
                 <div className="whitespace-pre-wrap">{result}</div>
              ) : (
                 <div className="text-center text-gray-400 mt-20">
                    Kết quả sẽ hiển thị ở đây
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdsStructureGen;
